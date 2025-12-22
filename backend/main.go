// Package main implements the Anjam application using PocketBase.
// It provides a web-based interface for managing projects, tasks, and users
// with role-based access control and embedded static assets.
package main

import (
	"context"
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

	"github.com/google/uuid"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
	"task-manager/helpers"
)

//go:embed dist
var staticFiles embed.FS

//go:embed pb_schema.json
var schemaJSON []byte

func allowDefaultCredentials(app core.App) bool {
	if app.IsDev() {
		return true
	}

	// In production, allow defaults on initial bootstrap (no admins exist).
	// If admins already exist, respect TM_ALLOW_DEFAULT_ACCOUNTS for any further defaults.
	usersCollection, err := app.FindCollectionByNameOrId(CollectionUsers)
	if err != nil {
		// If collection doesn't exist yet, allow defaults
		return true
	}

	totalAdmins, err := app.CountRecords(usersCollection.Id, dbx.HashExp{"role": RoleAdmin})
	if err != nil {
		// On error, allow defaults (safer for first run)
		return true
	}

	// If no admins exist, allow creation of default admin
	if totalAdmins == 0 {
		return true
	}

	// If admins exist, only allow when explicitly enabled
	return strings.EqualFold(os.Getenv("TM_ALLOW_DEFAULT_ACCOUNTS"), "true")
}

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "./data",
	})

	logDefaultCredentialWarning(app)

	// --- Bind Serve Event Handlers ---
	app.OnServe().BindFunc(importSchema)
	app.OnServe().BindFunc(ensureSuperuserExists)
	app.OnServe().BindFunc(serveStaticFilesAndOpenBrowser)
	app.OnServe().BindFunc(registerAuditHooksHandler)

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

	// Tag creation handler to set group
	app.OnRecordCreateExecute("tags").BindFunc(handleTagCreation)

	// --- Bind Authentication Event Handlers ---
	app.OnRecordAuthWithPasswordRequest("users").BindFunc(handleAuthRequest)

	// --- Custom API Endpoints ---
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.PATCH("/api/v1/users/{id}/toggle-active", handleToggleUserActive)
		se.Router.PATCH("/api/v1/users/{id}/unblock", handleUnblockUser)
		se.Router.GET("/api/v1/users/{id}/login-logs", handleGetUserLoginLogs)
		se.Router.GET("/api/v1/search", handleGlobalSearch)
		se.Router.POST("/api/v1/groups/create-with-manager", handleCreateGroupWithManager)

		return se.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Server.Handler = addRequestMetadataMiddleware(se.Server.Handler)
		return se.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Server.Handler = trackAuthMiddleware(app, se.Server.Handler)
		return se.Next()
	})

	// --- Start Application ---
	startApp(app)
}

// logDefaultCredentialWarning surfaces an early warning about default account creation behavior in production.
func logDefaultCredentialWarning(app core.App) {
	if app.IsDev() {
		return
	}

	allowEnv := strings.EqualFold(os.Getenv("TM_ALLOW_DEFAULT_ACCOUNTS"), "true")
	if allowEnv {
		log.Println("Default account creation is explicitly enabled (TM_ALLOW_DEFAULT_ACCOUNTS=true).")
		return
	}

	log.Println("Default accounts will be created only when no admins exist. Set TM_ALLOW_DEFAULT_ACCOUNTS=true to permit creating additional defaults after admins exist.")
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
	return security.RandomStringWithAlphabet(CodeLength, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
}

// handleGroupCreation validates manager assignment and ensures status defaults.
func handleGroupCreation(e *core.RecordEvent) error {
	record := e.Record

	// Validate that only managers or admins can be assigned as group managers
	managerId := record.GetString("manager")
	if managerId != "" {
		manager, err := e.App.FindRecordById(CollectionUsers, managerId)
		if err != nil {
			return fmt.Errorf("manager not found: %w", err)
		}

		managerRole := manager.GetString("role")
		if managerRole != RoleManager && managerRole != RoleAdmin {
			return errors.New(ErrOnlyManagersCanBeGroupManagers)
		}
	}

	// Set default active status
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
	supervisor, err := e.App.FindRecordById(CollectionUsers, supervisorId)
	if err != nil {
		return fmt.Errorf("supervisor not found: %w", err)
	}

	// Check if supervisor belongs to the same group
	supervisorGroupId := supervisor.GetString("group")
	if supervisorGroupId != groupId {
		return errors.New(ErrSupervisorMustBeInSameGroup)
	}

	return e.Next()
}

// handleTagCreation sets the group for new tags based on the creator's group
func handleTagCreation(e *core.RecordEvent) error {
	// Get the creator's user ID from the record
	creatorId := e.Record.GetString("creator")
	if creatorId == "" {
		return errors.New("creator is required")
	}

	// Fetch the creator's user record to get their group
	creator, err := e.App.FindRecordById(CollectionUsers, creatorId)
	if err != nil {
		return fmt.Errorf("failed to find creator: %w", err)
	}

	// Get the creator's group
	creatorGroupId := creator.GetString("group")
	if creatorGroupId == "" {
		return errors.New("creator must belong to a group")
	}

	// Set the group on the tag
	e.Record.Set("group", creatorGroupId)

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
	user, err := e.App.FindRecordById(CollectionUsers, userId)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Fetch project record
	project, err := e.App.FindRecordById(CollectionProjects, projectId)
	if err != nil {
		return fmt.Errorf("project not found: %w", err)
	}

	// Validate both belong to the same group
	userGroupId := user.GetString("group")
	projectGroupId := project.GetString("group")

	if userGroupId != projectGroupId {
		return errors.New(ErrUserAndProjectMustBeInSameGroup)
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

	groupName := record.GetString("name")
	return createNotification(e.App, managerId, "system",
		MsgGroupCreated,
		fmt.Sprintf(MsgAssignedToGroup, groupName),
		map[string]interface{}{
			"group_id":   record.Id,
			"group_name": groupName,
		})
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

	projectName := getProjectName(e.App, projectId)
	return createNotification(e.App, userId, "system",
		fmt.Sprintf(MsgAddedToProject, projectName),
		fmt.Sprintf(MsgAddedToProjectDesc, projectName),
		map[string]interface{}{
			"projectId": projectId,
		})
}

// getProjectName retrieves project name by ID, returns fallback if not found
func getProjectName(app core.App, projectId string) string {
	project, err := app.FindRecordById(CollectionProjects, projectId)
	if err != nil {
		return "project"
	}
	if name := project.GetString("name"); name != "" {
		return name
	}
	return "project"
}

// --- Serve Event Handlers ---

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
	adminCollection, err := e.App.FindCollectionByNameOrId(CollectionSuperusers)
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

	totalAdmins, err := e.App.CountRecords(usersCollection.Id, dbx.HashExp{"role": RoleAdmin})
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
		record.Set("role", RoleAdmin)
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

	return e.Next()
}

// --- Record Event Handlers ---

func handleUserCreation(e *core.RecordEvent) error {
	newUserRole := e.Record.GetString("role")

	// RBAC validations are handled by schema rules:
	// - Only admin and managers can create users (enforced by createRule)
	// - Managers cannot create admin/manager roles (enforced by createRule)
	// - Managers can only create users in groups they manage (enforced by createRule)
	// - Supervisors cannot create users (enforced by createRule)
	// This handler focuses on setting defaults and data integrity.

	// Set new users as inactive by default, except admins
	if e.Record.Get("active") == nil {
		if newUserRole == RoleAdmin {
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
	for attempt := 0; attempt < MaxCodeGenerationAttempts; attempt++ {
		projectCode := generateRandomCode()

		// Validate format before checking collision
		if len(projectCode) != CodeLength {
			return "", fmt.Errorf("generated code has invalid length %d (expected %d)", len(projectCode), CodeLength)
		}

		exists, err := app.FindFirstRecordByData(CollectionProjects, "code", projectCode)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return "", fmt.Errorf("database error checking code collision for %q: %w", projectCode, err)
		}
		if exists == nil {
			return projectCode, nil
		}
		log.Printf("Project code collision for %q, generating a new one (attempt %d/%d).", projectCode, attempt+1, MaxCodeGenerationAttempts)
	}
	return "", fmt.Errorf("failed to generate unique project code after %d attempts (possible collision rate too high)", MaxCodeGenerationAttempts)
}

func handleTaskCreation(e *core.RecordEvent) error {
	log.Printf("Task creation attempt by user %s for project %s", e.Record.GetString("creator"), e.Record.GetString("project"))
	if err := setTaskDisplayID(e); err != nil {
		log.Printf("Error setting task display ID: %v", err)
		return err
	}
	setTaskDefaults(e)

	// Validate that all tags belong to the same group as the project
	if err := validateTaskTags(e); err != nil {
		log.Printf("Error validating task tags: %v", err)
		return err
	}

	log.Printf("Task creation successful, display_id: %s", e.Record.GetString("display_id"))
	return e.Next()
}

func setTaskDisplayID(e *core.RecordEvent) error {
	if e.Record.GetString("display_id") != "" {
		return nil
	}

	projectId := e.Record.GetString("project")
	project, err := e.App.FindRecordById(CollectionProjects, projectId)
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
		return 0, fmt.Errorf("invalid display_id format %q: expected format 'CODE-NUMBER'", lastTask.DisplayID)
	}

	lastNum, parseErr := strconv.Atoi(parts[1])
	if parseErr != nil {
		return 0, fmt.Errorf("invalid task number in display_id %q: %w", lastTask.DisplayID, parseErr)
	}

	return lastNum + 1, nil
}

func setTaskDefaults(e *core.RecordEvent) {
	// Set default status
	if e.Record.GetString("status") == "" {
		e.Record.Set("status", TaskStatusTodo)
	}
	if e.Record.GetString("priority") == "" {
		e.Record.Set("priority", PriorityMedium)
	}
}

func validateTaskTags(e *core.RecordEvent) error {
	projectId := e.Record.GetString("project")
	if projectId == "" {
		return nil // No project, skip validation
	}

	// Get project to find its group
	project, err := e.App.FindRecordById(CollectionProjects, projectId)
	if err != nil {
		return fmt.Errorf("failed to find project: %w", err)
	}

	projectGroupId := project.GetString("group")
	if projectGroupId == "" {
		return nil // Project has no group, skip validation
	}

	// Get tags from the task
	tagIds := e.Record.GetStringSlice("tags")
	if len(tagIds) == 0 {
		return nil // No tags, nothing to validate
	}

	// Check each tag belongs to the same group
	for _, tagId := range tagIds {
		tag, err := e.App.FindRecordById(CollectionTags, tagId)
		if err != nil {
			return fmt.Errorf("failed to find tag %s: %w", tagId, err)
		}

		tagGroupId := tag.GetString("group")
		if tagGroupId != projectGroupId {
			return errors.New(ErrTagsMustBeInSameGroup)
		}
	}

	return nil
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

	project, err := e.App.FindRecordById(CollectionProjects, projectId)
	if err != nil {
		log.Printf("Error fetching project for notification: %v", err)
		return e.Next()
	}

	projectName := project.GetString("name")

	return NewNotification(e.App).
		User(assigneeId).
		Type("task_assigned").
		Title(fmt.Sprintf(MsgTaskAssigned, taskTitle)).
		Message(fmt.Sprintf(MsgTaskAssignedDesc, taskTitle, projectName)).
		Data(map[string]interface{}{
			"taskId":    e.Record.Id,
			"projectId": projectId,
		}).
		Send()
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

	return NewNotification(e.App).
		User(assigneeId).
		Type("task_assigned").
		Title(fmt.Sprintf(MsgTaskUpdated, taskTitle)).
		Message(fmt.Sprintf(MsgTaskStatusChanged, taskTitle, translateStatus(oldStatus), translateStatus(newStatus))).
		Data(map[string]interface{}{
			"taskId": e.Record.Id,
		}).
		Send()
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

		err := NewNotification(e.App).
			User(pu.UserId).
			Type("project_updated").
			Title(fmt.Sprintf(MsgProjectUpdated, projectName)).
			Message(fmt.Sprintf(MsgProjectUpdatedDesc, projectName)).
			Data(map[string]interface{}{
				"projectId": e.Record.Id,
			}).
			Send()
		if err != nil {
			// Log the error but don't fail the parent operation
			log.Printf("Warning: failed to create project update notification for user %s: %v", pu.UserId, err)
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
	task, err := e.App.FindRecordById(CollectionTasks, taskId)
	if err != nil {
		log.Printf("Error fetching task for comment notification: %v", err)
		return e.Next()
	}

	taskTitle := task.GetString("title")
	assigneeId := task.GetString("assignee")

	if assigneeId == "" || assigneeId == e.Record.GetString("created_by") {
		return e.Next() // No assignee or self-comment
	}

	return NewNotification(e.App).
		User(assigneeId).
		Type("comment").
		Title(fmt.Sprintf(MsgNewComment, taskTitle)).
		Message(fmt.Sprintf(MsgNewCommentDesc, taskTitle, truncateString(commentText, 100))).
		Data(map[string]interface{}{
			"taskId":    taskId,
			"commentId": e.Record.Id,
		}).
		Send()
}

type NotificationBuilder struct {
	app              core.App
	userID           string
	notificationType string
	title            string
	message          string
	data             map[string]interface{}
}

func NewNotification(app core.App) *NotificationBuilder {
	return &NotificationBuilder{app: app}
}

func (b *NotificationBuilder) User(userID string) *NotificationBuilder {
	b.userID = userID
	return b
}

func (b *NotificationBuilder) Type(notificationType string) *NotificationBuilder {
	b.notificationType = notificationType
	return b
}

func (b *NotificationBuilder) Title(title string) *NotificationBuilder {
	b.title = title
	return b
}

func (b *NotificationBuilder) Message(message string) *NotificationBuilder {
	b.message = message
	return b
}

func (b *NotificationBuilder) Data(data map[string]interface{}) *NotificationBuilder {
	b.data = data
	return b
}

func (b *NotificationBuilder) Send() error {
	return createNotification(b.app, b.userID, b.notificationType, b.title, b.message, b.data)
}

func createNotification(app core.App, userId, notificationType, title, message string, data map[string]interface{}) error {
	// Validate that the user exists before creating notification
	if userId == "" {
		return fmt.Errorf("cannot create notification: empty user ID")
	}

	notificationsCollection, err := app.FindCollectionByNameOrId(CollectionNotifications)
	if err != nil {
		return fmt.Errorf("cannot create notification: notifications collection not found: %w", err)
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
		return fmt.Errorf("cannot create notification for user %s: %w", userId, err)
	}

	return nil
}

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

// validateAuth is a helper that validates authentication for API handlers.
// Returns the authenticated user record or an error response.
func validateAuth(e *core.RequestEvent) (*core.Record, error) {
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return nil, e.BadRequestError("Invalid request", err)
	}
	authRecord := requestInfo.Auth
	if authRecord == nil {
		return nil, e.JSON(401, map[string]string{"error": ErrAuthRequired})
	}
	return authRecord, nil
}

// translateStatus translates English status to Persian
func translateStatus(status string) string {
	switch status {
	case TaskStatusTodo:
		return StatusTodo
	case TaskStatusInProgress:
		return StatusInProgress
	case TaskStatusDone:
		return StatusDone
	case TaskStatusCanceled:
		return StatusCanceled
	default:
		return status
	}
}

// --- Authentication Handlers ---

func handleAuthRequest(e *core.RecordAuthWithPasswordRequestEvent) error {
	user := e.Record
	if user == nil {
		return e.Next()
	}

	// Check if user is active
	if !user.GetBool("active") {
		return apis.NewBadRequestError(ErrUserInactive, nil)
	}

	// Check if user is blocked
	if user.GetBool("blocked") {
		blockedReason := user.GetString("blocked_reason")
		if blockedReason == "" {
			blockedReason = ErrUserBlocked
		}
		return apis.NewBadRequestError(blockedReason, nil)
	}

	return e.Next()
}

// addRequestMetadataMiddleware injects request metadata (ID, IP, client) into context
// so it can be used for auditing and tracking across the application.
func addRequestMetadataMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := uuid.New().String()

		ipAddress := extractIPAddress(r)

		userAgent := r.Header.Get("User-Agent")
		client := deriveClientType(userAgent)

		ctx := r.Context()
		ctx = context.WithValue(ctx, contextKeyRequestID, requestID)
		ctx = context.WithValue(ctx, contextKeyIPAddress, ipAddress)
		ctx = context.WithValue(ctx, contextKeyClient, client)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func deriveClientType(userAgent string) string {
	ua := strings.ToLower(userAgent)
	if strings.Contains(ua, "curl") || strings.Contains(ua, "wget") {
		return "cli"
	}
	if strings.Contains(ua, "mozilla") || strings.Contains(ua, "chrome") || strings.Contains(ua, "safari") || strings.Contains(ua, "firefox") || strings.Contains(ua, "edge") {
		return "web"
	}
	if strings.Contains(ua, "postman") || strings.Contains(ua, "insomnia") || strings.Contains(ua, "httpie") {
		return "automation"
	}
	return "unknown"
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
		CollectionUsers,
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
		CollectionUsers,
		"username = {:identity} || email = {:identity}",
		dbx.Params{"identity": identity},
	)

	if err != nil {
		// User not found - still log the attempt
		logUserLogin(app, "", req, false, ErrUserNotFoundForLogin)
		return
	}

	// Increment failed attempts
	failedAttempts := user.GetInt("failed_login_attempts")
	failedAttempts++
	user.Set("failed_login_attempts", failedAttempts)

	// Check if we should block the user
	if failedAttempts >= MaxFailedLoginAttempts {
		user.Set("blocked", true)
		user.Set("blocked_at", time.Now().Format(time.RFC3339))
		user.Set("blocked_reason", fmt.Sprintf(MsgBlockedReason, MaxFailedLoginAttempts))
		log.Printf("User %s blocked after %d failed login attempts", user.Id, failedAttempts)
	}

	if err := app.Save(user); err != nil {
		log.Printf("Error updating failed login attempts for user %s: %v", user.Id, err)
	}

	// Log failed login
	logUserLogin(app, user.Id, req, false, ErrWrongPassword)
}

func logUserLogin(app core.App, userId string, req *http.Request, success bool, failureReason string) {
	collection, err := app.FindCollectionByNameOrId(CollectionUserLoginLogs)
	if err != nil {
		log.Printf("Error finding user_login_logs collection: %v", err)
		return
	}

	ipAddress := extractIPAddress(req)

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

	authRecord, err := requireAdmin(e)
	if err != nil {
		return err
	}

	// Prevent admin from deactivating themselves
	if authRecord.Id == userId {
		return e.JSON(400, map[string]string{"error": ErrCannotDeactivateSelf})
	}

	user, err := helpers.FindRecordByIDOrJSON(e, CollectionUsers, userId, ErrUserNotFound)
	if err != nil {
		return err
	}

	// Prevent deactivating admin users
	if user.GetString("role") == RoleAdmin {
		return e.JSON(400, map[string]string{"error": ErrCannotDeactivateAdmin})
	}

	// Toggle active status
	currentActive := user.GetBool("active")
	newActive := !currentActive
	user.Set("active", newActive)

	if err := e.App.Save(user); err != nil {
		helpers.LogRecordError("toggling user active status", CollectionUsers, userId, err)
		return e.JSON(500, map[string]string{"error": ErrFailedToUpdateUserStatus})
	}

	return e.JSON(200, map[string]interface{}{
		"data": map[string]interface{}{
			"active": newActive,
		},
		"meta": map[string]interface{}{
			"message": func() string {
				if newActive {
					return MsgUserActivated
				}
				return MsgUserDeactivated
			}(),
		},
	})
}

func handleUnblockUser(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	_, err := requireAdmin(e)
	if err != nil {
		return err
	}

	user, err := helpers.FindRecordByIDOrJSON(e, CollectionUsers, userId, ErrUserNotFound)
	if err != nil {
		return err
	}

	// Unblock the user
	user.Set("blocked", false)
	user.Set("blocked_at", "")
	user.Set("blocked_reason", "")
	user.Set("failed_login_attempts", 0)

	if err := e.App.Save(user); err != nil {
		helpers.LogRecordError("unblocking user", CollectionUsers, userId, err)
		return e.JSON(500, map[string]string{"error": ErrFailedToUnblockUser})
	}

	return e.JSON(200, map[string]interface{}{
		"data": map[string]interface{}{},
		"meta": map[string]interface{}{
			"message": MsgUserUnblocked,
		},
	})
}

func handleGetUserLoginLogs(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	// Validate authentication
	authRecord, err := validateAuth(e)
	if err != nil {
		return err
	}

	// Check permissions: admin can view any user's logs, users can only view their own
	role := authRecord.GetString("role")
	if role != RoleAdmin && authRecord.Id != userId {
		return e.JSON(403, map[string]string{"error": ErrCannotViewOtherUserLogs})
	}

	pagination := parsePagination(e.Request)

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

	offset := (pagination.Page - 1) * pagination.PerPage
	err = e.App.DB().NewQuery(`
		SELECT id, user, ip_address, user_agent, success, failure_reason, created
		FROM user_login_logs
		WHERE user = {:userId}
		ORDER BY created DESC
		LIMIT {:limit} OFFSET {:offset}
	`).Bind(dbx.Params{
		"userId": userId,
		"limit":  pagination.PerPage,
		"offset": offset,
	}).All(&logs)

	if err != nil {
		log.Printf("Error fetching login logs for user %q: %v", userId, err)
		return e.JSON(500, map[string]string{"error": ErrFailedToGetLoginLogs})
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
		"data": map[string]interface{}{
			"items": logs,
		},
		"meta": map[string]interface{}{
			"page":       pagination.Page,
			"perPage":    pagination.PerPage,
			"totalItems": totalCount,
			"totalPages": (totalCount + pagination.PerPage - 1) / pagination.PerPage,
		},
	})
}

// registerAuditHooksHandler registers audit hooks for Phase 1 collections (tasks, projects).
// Called during OnServe() after schema import so collection names are available.
func registerAuditHooksHandler(e *core.ServeEvent) error {
	// Register immutability guards for audit_logs collection
	registerAuditLogsImmutabilityGuards(e.App)

	// Register audit hooks for Phase 1 collections
	registerAuditHooks(e.App, CollectionTasks)
	registerAuditHooks(e.App, CollectionProjects)

	log.Println("Audit logging enabled for tasks and projects")

	return e.Next()
}
