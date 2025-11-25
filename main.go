// Package main implements a task manager application using PocketBase.
// It provides a web-based interface for managing projects, tasks, and users
// with role-based access control and embedded static assets.
package main

import (
	"database/sql"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

//go:embed dist
var staticFiles embed.FS

//go:embed pb_schema.json
var schemaJSON []byte

func allowDefaultCredentials(app core.App) bool {
	if app.IsDev() {
		return true
	}

	// On initial run, always allow default credentials to be created
	usersCollection, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		// If collection doesn't exist yet, allow defaults
		return true
	}

	totalAdmins, err := app.CountRecords(usersCollection.Id, dbx.HashExp{"role": "admin"})
	if err != nil {
		// On error, allow defaults (safer for first run)
		return true
	}

	// If no admins exist, allow creation of default admin
	if totalAdmins == 0 {
		return true
	}

	// If admins exist and not in dev mode, check environment variable
	return strings.EqualFold(os.Getenv("TM_ALLOW_DEFAULT_ACCOUNTS"), "true")
}

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "./data",
	})

	// --- Bind Serve Event Handlers ---
	app.OnServe().BindFunc(importSchema)
	app.OnServe().BindFunc(ensureSuperuserExists)
	app.OnServe().BindFunc(serveStaticFilesAndOpenBrowser)

	// --- Bind Record Event Handlers ---
	app.OnRecordCreateExecute("users").BindFunc(handleUserCreation)
	app.OnRecordCreateExecute("tasks").BindFunc(handleTaskCreation)
	app.OnRecordAfterCreateSuccess("tasks").BindFunc(handleTaskAssignmentNotification)
	app.OnRecordAfterUpdateSuccess("tasks").BindFunc(handleTaskUpdateNotification)
	app.OnRecordAfterUpdateSuccess("projects").BindFunc(handleProjectUpdateNotification)
	app.OnRecordAfterCreateSuccess("comments").BindFunc(handleCommentNotification)
	app.OnRecordAfterCreateSuccess("users_projects").BindFunc(handleUsersProjectsCreatedNotify)

	// Group management handlers
	app.OnRecordCreateExecute("groups").BindFunc(handleGroupCreation)
	app.OnRecordAfterCreateSuccess("groups").BindFunc(handleGroupCreatedNotification)

	// Group-aware project creation validation
	app.OnRecordCreateExecute("projects").BindFunc(handleProjectCreationWithGroup)

	// Group-aware user-project assignment validation
	app.OnRecordCreateExecute("users_projects").BindFunc(handleUsersProjectsValidation)

	// --- Bind Authentication Event Handlers ---
	app.OnRecordAuthWithPasswordRequest("users").BindFunc(handleAuthRequest)

	// --- Custom API Endpoints ---
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.PATCH("/api/tm/status-configs/{id}/toggle", handleToggleStatusConfig)
		se.Router.PATCH("/api/tm/users/{id}/toggle-active", handleToggleUserActive)
		se.Router.PATCH("/api/tm/users/{id}/unblock", handleUnblockUser)
		se.Router.GET("/api/tm/users/{id}/login-logs", handleGetUserLoginLogs)

		return se.Next()
	})

	// --- Add Authentication Tracking Middleware ---
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Wrap the HTTP server to intercept auth requests
		se.Server.Handler = trackAuthMiddleware(app, se.Server.Handler)
		return se.Next()
	})

	// --- Start Application ---
	startApp(app)
}

// --- Helper Functions ---

func staticHandler(staticFS fs.FS, w http.ResponseWriter, r *http.Request) error {
	// Prevent API access through the static handler
	if strings.HasPrefix(r.URL.Path, "/api/") {
		return apis.NewNotFoundError("", nil)
	}

	filePath := strings.TrimPrefix(r.URL.Path, "/")

	// If the path has no extension (i.e., it's a route), serve index.html
	if path.Ext(filePath) == "" {
		return serveIndexHTML(staticFS, w, r)
	}

	// Otherwise, serve the static file
	http.FileServer(http.FS(staticFS)).ServeHTTP(w, r)
	return nil
}

func serveIndexHTML(staticFS fs.FS, w http.ResponseWriter, r *http.Request) error {
	indexFile, err := staticFS.Open("index.html")
	if err != nil {
		log.Printf("Error opening index.html: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}
	defer indexFile.Close()

	seeker, ok := indexFile.(io.ReadSeeker)
	if !ok {
		log.Printf("index.html does not implement io.ReadSeeker")
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return fmt.Errorf("index.html is not seekable")
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	http.ServeContent(w, r, "index.html", time.Time{}, seeker)
	return nil
}

func generateRandomCode() string {
	return security.RandomStringWithAlphabet(3, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
}

// handleGroupCreation auto-generates unique 3-letter group codes
// Similar to project code generation
func handleGroupCreation(e *core.RecordEvent) error {
	record := e.Record

	// Generate unique group code (3 uppercase letters)
	code := generateRandomCode()
	maxAttempts := 100
	attempts := 0

	// Check for collisions and retry if needed
	for attempts < maxAttempts {
		exists, err := e.App.FindFirstRecordByData("groups", "code", code)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		// No collision found, use this code
		if exists == nil {
			break
		}

		// Collision found, generate new code
		code = generateRandomCode()
		attempts++
	}

	// Failed to find unique code after max attempts
	if attempts >= maxAttempts {
		return errors.New("failed to generate unique group code after 100 attempts")
	}

	// Set the generated code and default active status
	record.Set("code", code)
	record.Set("active", true)

	return e.Next()
}

// handleProjectCreationWithGroup validates that the project's supervisor
// belongs to the same group as the project
func handleProjectCreationWithGroup(e *core.RecordEvent) error {
	record := e.Record

	// FIRST: Run the existing project creation logic (generates project code)
	if err := handleProjectCreation(e); err != nil {
		return err
	}

	// Get the group and supervisor IDs from the new project
	groupId := record.GetString("group")
	supervisorId := record.GetString("supervisor")

	// Skip validation if either is missing (will be caught by required field validation)
	if groupId == "" || supervisorId == "" {
		return e.Next()
	}

	// Fetch the supervisor user record
	supervisor, err := e.App.FindRecordById("users", supervisorId)
	if err != nil {
		return fmt.Errorf("supervisor not found: %w", err)
	}

	// Check if supervisor belongs to the same group
	supervisorGroupId := supervisor.GetString("group")
	if supervisorGroupId != groupId {
		return errors.New("منتور (supervisor) باید عضو همان گروه پروژه باشد")
	}

	return e.Next()
}

// handleUsersProjectsValidation ensures that when adding a user to a project,
// both the user and project belong to the same group
func handleUsersProjectsValidation(e *core.RecordEvent) error {
	record := e.Record

	userId := record.GetString("user")
	projectId := record.GetString("project")

	// Skip if either field is missing
	if userId == "" || projectId == "" {
		return e.Next()
	}

	// Fetch user record
	user, err := e.App.FindRecordById("users", userId)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Fetch project record
	project, err := e.App.FindRecordById("projects", projectId)
	if err != nil {
		return fmt.Errorf("project not found: %w", err)
	}

	// Validate both belong to the same group
	userGroupId := user.GetString("group")
	projectGroupId := project.GetString("group")

	if userGroupId != projectGroupId {
		return errors.New("کاربر و پروژه باید در یک گروه باشند")
	}

	return e.Next()
}

// handleGroupCreatedNotification sends a notification to the manager
// when they are assigned to manage a new group
func handleGroupCreatedNotification(e *core.RecordEvent) error {
	record := e.Record
	managerId := record.GetString("manager")

	if managerId == "" {
		return e.Next()
	}

	// Create notification record
	notificationsCollection, err := e.App.FindCollectionByNameOrId("notifications")
	if err != nil {
		log.Printf("Error finding notifications collection: %v", err)
		return e.Next()
	}

	notification := core.NewRecord(notificationsCollection)
	notification.Set("user", managerId)
	notification.Set("type", "system")
	notification.Set("title", "گروه جدید ایجاد شد")
	notification.Set("message", fmt.Sprintf("شما به عنوان مدیر گروه %s منصوب شدید", record.GetString("name")))
	notification.Set("read", false)
	notification.Set("data", map[string]interface{}{
		"group_id":   record.Id,
		"group_name": record.GetString("name"),
	})

	// Save notification (log error but don't fail the operation)
	if err := e.App.Save(notification); err != nil {
		log.Printf("Failed to create group notification: %v", err)
	}

	return e.Next()
}

func startApp(app *pocketbase.PocketBase) {
	if app.IsDev() {
		log.Println("Starting app in development mode...")
		if err := app.Start(); err != nil {
			log.Fatalf("Failed to start app in dev mode: %v", err)
		}
	} else {
		log.Println("Starting app in production mode...")
		if err := app.Bootstrap(); err != nil {
			log.Fatalf("Failed to bootstrap app: %v", err)
		}

		// Start HTTP server on 0.0.0.0:8090 for container environments
		log.Println("Starting HTTP server on 0.0.0.0:8090...")
		if err := apis.Serve(app, apis.ServeConfig{
			HttpAddr:        "0.0.0.0:8090",
			ShowStartBanner: true,
		}); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}
}

func handleUsersProjectsCreatedNotify(e *core.RecordEvent) error {
	userId := e.Record.GetString("user")
	projectId := e.Record.GetString("project")
	if userId == "" || projectId == "" {
		return e.Next()
	}

	projectName := "project"
	if project, err := e.App.FindRecordById("projects", projectId); err == nil {
		if n := project.GetString("name"); n != "" {
			projectName = n
		}
	}

	return createNotification(e.App, userId, "system",
		fmt.Sprintf("افزوده شدن به پروژه: %s", projectName),
		fmt.Sprintf("شما به پروژه '%s' اضافه شدید", projectName),
		map[string]interface{}{
			"projectId": projectId,
		})
}

// --- Serve Event Handlers ---

// cleanServeArgs removes the literal subcommand token "serve" so the
// ServeCommand doesn't treat it as a positional domain argument.
func cleanServeArgs(args []string) []string {
	cleaned := make([]string, 0, len(args))
	for _, a := range args {
		if a == "serve" {
			continue
		}
		cleaned = append(cleaned, a)
	}
	return cleaned
}

func hasFlag(args []string, name string) bool {
	for _, a := range args {
		if strings.HasPrefix(a, name) { // matches --https or --https=
			return true
		}
	}
	return false
}

func importSchema(e *core.ServeEvent) error {
	if len(schemaJSON) == 0 {
		log.Println("Warning: schema is empty. Skipping schema import.")
		return e.Next()
	}

	if err := e.App.ImportCollectionsByMarshaledJSON(schemaJSON, false); err != nil {
		log.Printf("Error importing collections from schema: %v", err)
		return err
	}
	log.Println("Successfully imported collections from schema.")
	return e.Next()
}

func ensureSuperuserExists(e *core.ServeEvent) error {
	if err := ensurePocketBaseSuperuser(e); err != nil {
		return err
	}
	if err := ensureAppAdminUser(e); err != nil {
		return err
	}
	return e.Next()
}

func ensurePocketBaseSuperuser(e *core.ServeEvent) error {
	adminCollection, err := e.App.FindCollectionByNameOrId("_superusers")
	if err != nil {
		log.Printf("Error finding _superusers collection: %v", err)
		return err
	}

	totalSuperusers, err := e.App.CountRecords(adminCollection.Id)
	if err != nil {
		log.Printf("Error counting superusers: %v", err)
		return err
	}

	if totalSuperusers == 0 {
		if !allowDefaultCredentials(e.App) {
			log.Println("PocketBase superuser missing; default credential creation skipped (disabled by configuration).")
			return nil
		}

		record := core.NewRecord(adminCollection)
		record.Set("email", "admin@example.com")
		record.Set("password", "admin12345")

		if err := e.App.Save(record); err != nil {
			log.Printf("Error saving default superuser: %v", err)
			return err
		}

		log.Println("Default PocketBase superuser created (email: admin@example.com, password: admin12345)")
	} else {
		log.Println("PocketBase superuser(s) already exist; no defaults created.")
	}

	return nil
}

func ensureAppAdminUser(e *core.ServeEvent) error {
	usersCollection, err := e.App.FindCollectionByNameOrId("users")
	if err != nil {
		log.Printf("Error finding users collection: %v", err)
		return err
	}

	totalAdmins, err := e.App.CountRecords(usersCollection.Id, dbx.HashExp{"role": "admin"})
	if err != nil {
		log.Printf("Error counting admin users: %v", err)
		return err
	}

	if totalAdmins == 0 {
		if !allowDefaultCredentials(e.App) {
			log.Println("Application admin missing; default credential creation skipped (disabled by configuration).")
			return nil
		}

		record := core.NewRecord(usersCollection)
		record.Set("username", "admin")
		record.Set("password", "admin12345")
		record.Set("role", "admin")
		record.Set("active", true) // Set admin as active by default

		if err := e.App.Save(record); err != nil {
			log.Printf("Error saving default admin: %v", err)
			return err
		}

		log.Println("Default application admin user created (username: admin, password: admin12345)")
	} else {
		log.Println("Admin user(s) already exist; no defaults created.")
	}

	return nil
}

func serveStaticFilesAndOpenBrowser(e *core.ServeEvent) error {
	var staticFS fs.FS
	var err error

	if e.App.IsDev() {
		// In dev mode, serve from the dist directory on disk
		staticFS = os.DirFS("dist")
	} else {
		// In production, use embedded files
		staticFS, err = fs.Sub(staticFiles, "dist")
		if err != nil {
			log.Fatalf("Failed to create sub FS for static files: %v", err)
			return err
		}
	}

	e.Router.GET("/{path...}", func(e *core.RequestEvent) error {
		return staticHandler(staticFS, e.Response, e.Request)
	})

	// if !e.App.IsDev() {
	// 	openBrowser(e.App.Settings().Meta.AppURL)
	// }

	return e.Next()
}

// --- Record Event Handlers ---

func handleUserCreation(e *core.RecordEvent) error {
	// Set new users as inactive by default, except admins
	if e.Record.Get("active") == nil {
		role := e.Record.GetString("role")
		if role == "admin" {
			e.Record.Set("active", true) // Admins are always active
		} else {
			e.Record.Set("active", false) // Regular users start inactive
		}
	}
	// Initialize failed login attempts to 0
	if e.Record.Get("failed_login_attempts") == nil {
		e.Record.Set("failed_login_attempts", 0)
	}
	// Set blocked to false by default
	if e.Record.Get("blocked") == nil {
		e.Record.Set("blocked", false)
	}
	return e.Next()
}

func handleProjectCreation(e *core.RecordEvent) error {
	if e.Record.GetString("code") != "" {
		log.Printf("Project code (%q) already set for %q, skipping code generation.", e.Record.GetString("code"), e.Record.GetString("name"))
		return e.Next()
	}

	projectCode, err := generateUniqueProjectCode(e.App)
	if err != nil {
		log.Printf("Error generating unique project code: %v", err)
		return err
	}

	e.Record.Set("code", projectCode)
	log.Printf("Generated unique project code %q for new project.", projectCode)
	return e.Next()
}

func generateUniqueProjectCode(app core.App) (string, error) {
	const maxAttempts = 100
	for attempt := 0; attempt < maxAttempts; attempt++ {
		projectCode := generateRandomCode()
		exists, err := app.FindFirstRecordByData("projects", "code", projectCode)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return "", err
		}
		if exists == nil {
			return projectCode, nil
		}
		log.Printf("Project code collision for %q, generating a new one (attempt %d/%d).", projectCode, attempt+1, maxAttempts)
	}
	return "", fmt.Errorf("failed to generate unique project code after %d attempts", maxAttempts)
}

func handleTaskCreation(e *core.RecordEvent) error {
	log.Printf("Task creation attempt by user %s for project %s", e.Record.GetString("creator"), e.Record.GetString("project"))
	if err := setTaskDisplayID(e); err != nil {
		log.Printf("Error setting task display ID: %v", err)
		return err
	}
	setTaskDefaults(e)
	log.Printf("Task creation successful, display_id: %s", e.Record.GetString("display_id"))
	return e.Next()
}

func setTaskDisplayID(e *core.RecordEvent) error {
	if e.Record.GetString("display_id") != "" {
		return nil
	}

	projectId := e.Record.GetString("project")
	project, err := e.App.FindRecordById("projects", projectId)
	if err != nil {
		log.Printf("Error fetching project %q for task creation: %v", projectId, err)
		return err
	}
	projectCode := project.GetString("code")

	newTaskNumber, err := getNextTaskNumber(e.App, projectId)
	if err != nil {
		log.Printf("Error getting next task number for project %q: %v", projectId, err)
		return err
	}

	displayID := fmt.Sprintf("%s-%03d", projectCode, newTaskNumber)
	e.Record.Set("display_id", displayID)
	log.Printf("Generated task display_id %q for project %q.", displayID, projectCode)
	return nil
}

func getNextTaskNumber(app core.App, projectId string) (int, error) {
	var lastTask struct {
		DisplayID string `db:"display_id"`
	}
	err := app.RecordQuery("tasks").
		Select("display_id").
		Where(dbx.HashExp{"project": projectId}).
		OrderBy("display_id DESC").
		Limit(1).
		One(&lastTask)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 1, nil // No tasks exist yet
		}
		return 0, err
	}

	parts := strings.Split(lastTask.DisplayID, "-")
	if len(parts) != 2 {
		log.Printf("Warning: Unexpected display_id format %q. Defaulting to 1.", lastTask.DisplayID)
		return 1, nil
	}

	lastNum, parseErr := strconv.Atoi(parts[1])
	if parseErr != nil {
		log.Printf("Warning: Could not parse task number from display_id %q: %v. Defaulting to 1.", lastTask.DisplayID, parseErr)
		return 1, nil
	}

	return lastNum + 1, nil
}

func setTaskDefaults(e *core.RecordEvent) {
	// Set default status_config if not provided
	if e.Record.GetString("status_config") == "" {
		projectId := e.Record.GetString("project")
		if projectId != "" {
			// Get the default "todo" status config for this project
			var statusConfig struct {
				ID string `db:"id"`
			}
			err := e.App.DB().NewQuery(`
				SELECT id FROM status_configs
				WHERE project = {:projectId} AND key = 'todo'
				LIMIT 1
			`).Bind(dbx.Params{"projectId": projectId}).One(&statusConfig)

			if err == nil && statusConfig.ID != "" {
				e.Record.Set("status_config", statusConfig.ID)
				log.Printf("Set default status_config for task: %s", statusConfig.ID)
			} else {
				log.Printf("Warning: Could not find default 'todo' status config for project %s: %v", projectId, err)
			}
		}
	}

	// Keep the old status field for backward compatibility
	if e.Record.GetString("status") == "" {
		e.Record.Set("status", "todo")
	}
	if e.Record.GetString("priority") == "" {
		e.Record.Set("priority", "medium")
	}
}

func handleToggleStatusConfig(e *core.RequestEvent) error {
	statusConfigId := e.Request.PathValue("id")

	// Ensure the requester is authenticated and authorized
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return e.BadRequestError("Invalid request", err)
	}
	authRecord := requestInfo.Auth
	if authRecord == nil {
		return e.JSON(401, map[string]string{"error": "احراز هویت انجام نشده است"})
	}

	role := authRecord.GetString("role")
	if role != "admin" && role != "supervisor" {
		return e.JSON(403, map[string]string{"error": "مجوز تغییر وضعیت را ندارید"})
	}

	// Fetch the status config
	statusConfig, err := e.App.FindRecordById("status_configs", statusConfigId)
	if err != nil {
		log.Printf("Error finding status config %q: %v", statusConfigId, err)
		return e.JSON(404, map[string]string{"error": "Status config not found"})
	}

	projectId := statusConfig.GetString("project")
	if role == "supervisor" {
		projectRecord, err := e.App.FindRecordById("projects", projectId)
		if err != nil {
			log.Printf("Error verifying supervisor for project %q: %v", projectId, err)
			return e.JSON(403, map[string]string{"error": "دسترسی لازم برای این پروژه را ندارید"})
		}

		if projectRecord.GetString("supervisor") != authRecord.Id {
			return e.JSON(403, map[string]string{"error": "فقط سرپرست پروژه می‌تواند وضعیت‌ها را تغییر دهد"})
		}
	}

	currentEnabled := statusConfig.GetBool("enabled")
	newEnabled := !currentEnabled

	// If disabling, check if any tasks are using this status
	if !newEnabled {
		var taskCount int
		err := e.App.DB().NewQuery(`
			SELECT COUNT(*) FROM tasks WHERE status_config = {:statusConfigId}
		`).Bind(dbx.Params{"statusConfigId": statusConfigId}).Row(&taskCount)

		if err != nil {
			log.Printf("Error checking tasks for status config %q: %v", statusConfigId, err)
			return e.JSON(500, map[string]string{"error": "Failed to check task usage"})
		}

		var legacyCount int
		statusKey := statusConfig.GetString("key")
		if projectId != "" && statusKey != "" {
			legacyErr := e.App.DB().NewQuery(`
				SELECT COUNT(*) FROM tasks
				WHERE project = {:projectId} AND status = {:statusKey}
			`).Bind(dbx.Params{"projectId": projectId, "statusKey": statusKey}).Row(&legacyCount)

			if legacyErr != nil {
				log.Printf("Error checking legacy status usage for %q: %v", statusConfigId, legacyErr)
				return e.JSON(500, map[string]string{"error": "Failed to check legacy task usage"})
			}
		}

		totalUsage := taskCount + legacyCount
		if totalUsage > 0 {
			return e.JSON(400, map[string]interface{}{
				"error":      "امکان غیرفعال‌سازی وضعیتی که در حال استفاده است وجود ندارد",
				"task_count": totalUsage,
			})
		}
	}

	// Toggle the enabled field
	statusConfig.Set("enabled", newEnabled)
	if err := e.App.Save(statusConfig); err != nil {
		log.Printf("Error toggling status config %q: %v", statusConfigId, err)
		return e.JSON(500, map[string]string{"error": "Failed to update status"})
	}

	return e.JSON(200, map[string]bool{"enabled": newEnabled})
}

// --- Notification Handlers ---

func handleTaskAssignmentNotification(e *core.RecordEvent) error {
	assigneeId := e.Record.GetString("assignee")
	if assigneeId == "" {
		return e.Next() // No assignee, skip notification
	}

	// Don't notify if the assignee is the same as the creator/updater
	if e.Record.GetString("creator") == assigneeId {
		return e.Next()
	}

	taskTitle := e.Record.GetString("title")
	projectId := e.Record.GetString("project")

	project, err := e.App.FindRecordById("projects", projectId)
	if err != nil {
		log.Printf("Error fetching project for notification: %v", err)
		return e.Next()
	}

	projectName := project.GetString("name")

	return createNotification(e.App, assigneeId, "task_assigned",
		fmt.Sprintf("تخصیص تسک: %s", taskTitle),
		fmt.Sprintf("تسک '%s' در پروژه '%s' به شما اختصاص داده شد", taskTitle, projectName),
		map[string]interface{}{
			"taskId":    e.Record.Id,
			"projectId": projectId,
		})
}

func handleTaskUpdateNotification(e *core.RecordEvent) error {
	// Only notify on status changes or important updates
	oldStatus := e.Record.Original().GetString("status")
	newStatus := e.Record.GetString("status")

	if oldStatus == newStatus {
		return e.Next()
	}

	assigneeId := e.Record.GetString("assignee")
	if assigneeId == "" {
		return e.Next()
	}

	taskTitle := e.Record.GetString("title")

	return createNotification(e.App, assigneeId, "task_assigned",
		fmt.Sprintf("به‌روزرسانی تسک: %s", taskTitle),
		fmt.Sprintf("وضعیت تسک '%s' از %s به %s تغییر یافت", taskTitle, translateStatus(oldStatus), translateStatus(newStatus)),
		map[string]interface{}{
			"taskId": e.Record.Id,
		})
}

func handleProjectUpdateNotification(e *core.RecordEvent) error {
	projectName := e.Record.GetString("name")

	// Get all users in this project
	var projectUsers []struct {
		UserId string `db:"user"`
	}
	err := e.App.DB().NewQuery(`
		SELECT user FROM users_projects WHERE project = {:projectId}
	`).Bind(dbx.Params{"projectId": e.Record.Id}).All(&projectUsers)

	if err != nil {
		log.Printf("Error fetching project users for notification: %v", err)
		return e.Next()
	}

	// Create notifications for all project members
	for _, pu := range projectUsers {
		if pu.UserId == e.Record.GetString("updated_by") {
			continue // Don't notify the updater
		}

		err := createNotification(e.App, pu.UserId, "project_updated",
			fmt.Sprintf("به‌روزرسانی پروژه: %s", projectName),
			fmt.Sprintf("پروژه '%s' به‌روزرسانی شد", projectName),
			map[string]interface{}{
				"projectId": e.Record.Id,
			})
		if err != nil {
			log.Printf("Error creating project update notification: %v", err)
		}
	}

	return e.Next()
}

func handleCommentNotification(e *core.RecordEvent) error {
	commentText := e.Record.GetString("content")
	if commentText == "" {
		return e.Next()
	}

	taskId := e.Record.GetString("task")
	if taskId == "" {
		return e.Next()
	}

	// Get task details
	task, err := e.App.FindRecordById("tasks", taskId)
	if err != nil {
		log.Printf("Error fetching task for comment notification: %v", err)
		return e.Next()
	}

	taskTitle := task.GetString("title")
	assigneeId := task.GetString("assignee")

	if assigneeId == "" || assigneeId == e.Record.GetString("created_by") {
		return e.Next() // No assignee or self-comment
	}

	return createNotification(e.App, assigneeId, "comment",
		fmt.Sprintf("نظر جدید روی: %s", taskTitle),
		fmt.Sprintf("نظر جدید روی تسک '%s': %s", taskTitle, truncateString(commentText, 100)),
		map[string]interface{}{
			"taskId":    taskId,
			"commentId": e.Record.Id,
		})
}

func createNotification(app core.App, userId, notificationType, title, message string, data map[string]interface{}) error {
	// Validate that the user exists before creating notification
	if userId == "" {
		log.Printf("Warning: Attempted to create notification with empty user ID")
		return nil
	}

	// Check if user exists
	_, err := app.FindRecordById("users", userId)
	if err != nil {
		log.Printf("Warning: User %s not found, skipping notification creation: %v", userId, err)
		return nil // Don't fail the parent operation
	}

	notificationsCollection, err := app.FindCollectionByNameOrId("notifications")
	if err != nil {
		log.Printf("Error finding notifications collection: %v", err)
		return nil // Don't fail the parent operation
	}

	record := core.NewRecord(notificationsCollection)
	record.Set("user", userId)
	record.Set("type", notificationType)
	record.Set("title", title)
	record.Set("message", message)
	if data != nil {
		record.Set("data", data)
	}

	if err := app.Save(record); err != nil {
		log.Printf("Error creating notification for user %s: %v", userId, err)
		return nil // Don't fail the parent operation
	}

	return nil
}

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

// translateStatus translates English status to Persian
func translateStatus(status string) string {
	switch status {
	case "todo":
		return "برای انجام"
	case "in_progress":
		return "در حال انجام"
	case "done":
		return "انجام‌شده"
	case "canceled":
		return "لغوشده"
	default:
		return status
	}
}

// --- Authentication Handlers ---

const maxFailedLoginAttempts = 5

func handleAuthRequest(e *core.RecordAuthWithPasswordRequestEvent) error {
	user := e.Record
	if user == nil {
		return e.Next()
	}

	// Check if user is active
	if !user.GetBool("active") {
		return apis.NewBadRequestError("حساب کاربری غیرفعال است", nil)
	}

	// Check if user is blocked
	if user.GetBool("blocked") {
		blockedReason := user.GetString("blocked_reason")
		if blockedReason == "" {
			blockedReason = "حساب کاربری مسدود شده است"
		}
		return apis.NewBadRequestError(blockedReason, nil)
	}

	return e.Next()
}

func trackAuthMiddleware(app core.App, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only intercept auth endpoints
		if r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/auth-with-password") {
			// Create a response recorder to capture the response
			rec := &responseRecorder{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
			}

			// Store request body for later use (we need to parse it to get the identity)
			bodyBytes, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "Failed to read request body", http.StatusBadRequest)
				return
			}
			r.Body = io.NopCloser(strings.NewReader(string(bodyBytes)))

			// Parse the auth request
			var authReq struct {
				Identity string `json:"identity"`
				Password string `json:"password"`
			}
			if err := json.Unmarshal(bodyBytes, &authReq); err != nil {
				// If JSON parsing fails, still allow the request to proceed
				// The actual auth handler will handle invalid JSON
				next.ServeHTTP(w, r)
				return
			}

			// Reset body for the actual handler
			r.Body = io.NopCloser(strings.NewReader(string(bodyBytes)))

			// Call the actual handler
			next.ServeHTTP(rec, r)

			// After the handler has run, track the auth attempt synchronously
			// This ensures tracking completes before response is sent
			if rec.statusCode >= 200 && rec.statusCode < 300 {
				// Success - try to find the user and reset failed attempts
				handleSuccessfulAuth(app, authReq.Identity, r)
			} else {
				// Failed - increment failed attempts
				handleFailedAuth(app, authReq.Identity, r)
			}

			return
		}

		// For all other requests, just pass through
		next.ServeHTTP(w, r)
	})
}

// responseRecorder captures the response status code
type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *responseRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func handleSuccessfulAuth(app core.App, identity string, req *http.Request) {
	// Find user by identity (username or email)
	user, err := app.FindFirstRecordByFilter(
		"users",
		"username = {:identity} || email = {:identity}",
		dbx.Params{"identity": identity},
	)

	if err != nil {
		log.Printf("Error finding user for successful auth: %v", err)
		return
	}

	// Reset failed login attempts
	user.Set("failed_login_attempts", 0)
	if err := app.Save(user); err != nil {
		log.Printf("Error resetting failed login attempts for user %s: %v", user.Id, err)
	}

	// Log successful login
	logUserLogin(app, user.Id, req, true, "")
}

func handleFailedAuth(app core.App, identity string, req *http.Request) {
	// Try to find user by identity
	user, err := app.FindFirstRecordByFilter(
		"users",
		"username = {:identity} || email = {:identity}",
		dbx.Params{"identity": identity},
	)

	if err != nil {
		// User not found - still log the attempt
		logUserLogin(app, "", req, false, "کاربر یافت نشد")
		return
	}

	// Increment failed attempts
	failedAttempts := user.GetInt("failed_login_attempts")
	failedAttempts++
	user.Set("failed_login_attempts", failedAttempts)

	// Check if we should block the user
	if failedAttempts >= maxFailedLoginAttempts {
		user.Set("blocked", true)
		user.Set("blocked_at", time.Now().Format(time.RFC3339))
		user.Set("blocked_reason", fmt.Sprintf("حساب به دلیل %d تلاش ناموفق برای ورود مسدود شد", maxFailedLoginAttempts))
		log.Printf("User %s blocked after %d failed login attempts", user.Id, failedAttempts)
	}

	if err := app.Save(user); err != nil {
		log.Printf("Error updating failed login attempts for user %s: %v", user.Id, err)
	}

	// Log failed login
	logUserLogin(app, user.Id, req, false, "رمز عبور اشتباه")
}

func logUserLogin(app core.App, userId string, req *http.Request, success bool, failureReason string) {
	collection, err := app.FindCollectionByNameOrId("user_login_logs")
	if err != nil {
		log.Printf("Error finding user_login_logs collection: %v", err)
		return
	}

	// Get IP address
	ipAddress := req.Header.Get("X-Forwarded-For")
	if ipAddress == "" {
		ipAddress = req.Header.Get("X-Real-IP")
	}
	if ipAddress == "" {
		ipAddress = req.RemoteAddr
	}

	// Get user agent
	userAgent := req.Header.Get("User-Agent")

	record := core.NewRecord(collection)
	if userId != "" {
		record.Set("user", userId)
	}
	record.Set("ip_address", ipAddress)
	record.Set("user_agent", userAgent)
	record.Set("success", success)
	if !success {
		record.Set("failure_reason", failureReason)
	}

	if err := app.Save(record); err != nil {
		log.Printf("Error logging user login: %v", err)
	}
}

// --- User Management API Handlers ---

func handleToggleUserActive(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	// Ensure the requester is authenticated and is an admin
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return e.BadRequestError("Invalid request", err)
	}
	authRecord := requestInfo.Auth
	if authRecord == nil {
		return e.JSON(401, map[string]string{"error": "احراز هویت انجام نشده است"})
	}

	role := authRecord.GetString("role")
	if role != "admin" {
		return e.JSON(403, map[string]string{"error": "فقط ادمین می‌تواند وضعیت فعال/غیرفعال کاربران را تغییر دهد"})
	}

	// Prevent admin from deactivating themselves
	if authRecord.Id == userId {
		return e.JSON(400, map[string]string{"error": "نمی‌توانید حساب کاربری خود را غیرفعال کنید"})
	}

	// Fetch the user
	user, err := e.App.FindRecordById("users", userId)
	if err != nil {
		log.Printf("Error finding user %q: %v", userId, err)
		return e.JSON(404, map[string]string{"error": "کاربر یافت نشد"})
	}

	// Prevent deactivating admin users
	if user.GetString("role") == "admin" {
		return e.JSON(400, map[string]string{"error": "نمی‌توان حساب کاربری ادمین را غیرفعال کرد"})
	}

	// Toggle active status
	currentActive := user.GetBool("active")
	newActive := !currentActive
	user.Set("active", newActive)

	if err := e.App.Save(user); err != nil {
		log.Printf("Error toggling user active status %q: %v", userId, err)
		return e.JSON(500, map[string]string{"error": "خطا در به‌روزرسانی وضعیت کاربر"})
	}

	return e.JSON(200, map[string]interface{}{
		"active": newActive,
		"message": func() string {
			if newActive {
				return "حساب کاربری فعال شد"
			}
			return "حساب کاربری غیرفعال شد"
		}(),
	})
}

func handleUnblockUser(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	// Ensure the requester is authenticated and is an admin
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return e.BadRequestError("Invalid request", err)
	}
	authRecord := requestInfo.Auth
	if authRecord == nil {
		return e.JSON(401, map[string]string{"error": "احراز هویت انجام نشده است"})
	}

	role := authRecord.GetString("role")
	if role != "admin" {
		return e.JSON(403, map[string]string{"error": "فقط ادمین می‌تواند کاربران را رفع مسدودی کند"})
	}

	// Fetch the user
	user, err := e.App.FindRecordById("users", userId)
	if err != nil {
		log.Printf("Error finding user %q: %v", userId, err)
		return e.JSON(404, map[string]string{"error": "کاربر یافت نشد"})
	}

	// Unblock the user
	user.Set("blocked", false)
	user.Set("blocked_at", "")
	user.Set("blocked_reason", "")
	user.Set("failed_login_attempts", 0)

	if err := e.App.Save(user); err != nil {
		log.Printf("Error unblocking user %q: %v", userId, err)
		return e.JSON(500, map[string]string{"error": "خطا در رفع مسدودی کاربر"})
	}

	return e.JSON(200, map[string]string{
		"message": "مسدودی کاربر با موفقیت برداشته شد",
	})
}

func handleGetUserLoginLogs(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	// Ensure the requester is authenticated
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return e.BadRequestError("Invalid request", err)
	}
	authRecord := requestInfo.Auth
	if authRecord == nil {
		return e.JSON(401, map[string]string{"error": "احراز هویت انجام نشده است"})
	}

	// Check permissions: admin can view any user's logs, users can only view their own
	role := authRecord.GetString("role")
	if role != "admin" && authRecord.Id != userId {
		return e.JSON(403, map[string]string{"error": "شما مجاز به مشاهده سوابق ورود این کاربر نیستید"})
	}

	// Get pagination parameters
	page := 1
	perPage := 50
	if pageStr := e.Request.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if perPageStr := e.Request.URL.Query().Get("perPage"); perPageStr != "" {
		if pp, err := strconv.Atoi(perPageStr); err == nil && pp > 0 && pp <= 100 {
			perPage = pp
		}
	}

	// Fetch login logs
	var logs []struct {
		ID            string `db:"id" json:"id"`
		User          string `db:"user" json:"user"`
		IPAddress     string `db:"ip_address" json:"ip_address"`
		UserAgent     string `db:"user_agent" json:"user_agent"`
		Success       bool   `db:"success" json:"success"`
		FailureReason string `db:"failure_reason" json:"failure_reason"`
		Created       string `db:"created" json:"created"`
	}

	offset := (page - 1) * perPage
	err = e.App.DB().NewQuery(`
		SELECT id, user, ip_address, user_agent, success, failure_reason, created
		FROM user_login_logs
		WHERE user = {:userId}
		ORDER BY created DESC
		LIMIT {:limit} OFFSET {:offset}
	`).Bind(dbx.Params{
		"userId": userId,
		"limit":  perPage,
		"offset": offset,
	}).All(&logs)

	if err != nil {
		log.Printf("Error fetching login logs for user %q: %v", userId, err)
		return e.JSON(500, map[string]string{"error": "خطا در دریافت سوابق ورود"})
	}

	// Get total count
	var totalCount int
	err = e.App.DB().NewQuery(`
		SELECT COUNT(*) FROM user_login_logs WHERE user = {:userId}
	`).Bind(dbx.Params{"userId": userId}).Row(&totalCount)

	if err != nil {
		log.Printf("Error counting login logs for user %q: %v", userId, err)
		totalCount = len(logs)
	}

	return e.JSON(200, map[string]interface{}{
		"items":      logs,
		"page":       page,
		"perPage":    perPage,
		"totalItems": totalCount,
		"totalPages": (totalCount + perPage - 1) / perPage,
	})
}
