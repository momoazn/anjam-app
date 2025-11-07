// Package main implements a task manager application using PocketBase.
// It provides a web-based interface for managing projects, tasks, and users
// with role-based access control and embedded static assets.
package main

import (
	"embed"
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
	"github.com/pocketbase/pocketbase/cmd"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

//go:embed dist
var staticFiles embed.FS

//go:embed pb_schema.json
var schemaJSON []byte

type BasicUser struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

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
	app.OnServe().BindFunc(migrateProjectStatusConfigs)
	app.OnServe().BindFunc(serveStaticFilesAndOpenBrowser)

	// --- Bind Record Event Handlers ---
	app.OnRecordCreateExecute("projects").BindFunc(handleProjectCreation)
	app.OnRecordAfterCreateSuccess("projects").BindFunc(handleProjectStatusConfigsCreation)
	app.OnRecordCreateExecute("tasks").BindFunc(handleTaskCreation)
	app.OnRecordAfterCreateSuccess("tasks").BindFunc(handleTaskAssignmentNotification)
	app.OnRecordAfterUpdateSuccess("tasks").BindFunc(handleTaskUpdateNotification)
	app.OnRecordAfterUpdateSuccess("projects").BindFunc(handleProjectUpdateNotification)
	app.OnRecordAfterCreateSuccess("comments").BindFunc(handleCommentNotification)
	app.OnRecordAfterCreateSuccess("users_projects").BindFunc(handleUsersProjectsCreatedNotify)

	// --- Custom API Endpoints ---
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/tm/is-initial", handleCheckInitialAdmin)
		se.Router.POST("/api/tm/create-initial-admin", handleCreateInitialAdmin)
		se.Router.GET("/api/tm/projects/{id}/users", handleGetProjectUsers)
		se.Router.PATCH("/api/tm/status-configs/{id}/toggle", handleToggleStatusConfig)

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
	f, err := staticFS.Open(filePath)
	if err != nil {
		// If file doesn't exist and it's a route (no extension), serve index.html
		if os.IsNotExist(err) && path.Ext(filePath) == "" {
			return serveIndexHTML(staticFS, w, r)
		}
		// For other errors or files with extensions that don't exist, let FileServer handle it
	} else {
		f.Close()
	}

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
		serveCmd := cmd.NewServeCommand(app, false)
		// Avoid treating the literal token "serve" as a domain arg
		serveCmd.SetArgs(cleanServeArgs(os.Args[1:]))
		// If user didn't pass --https, default it to empty to prevent redirects
		if !hasFlag(os.Args[1:], "--https") {
			_ = serveCmd.Flags().Set("https", "")
		}
		if err := serveCmd.Execute(); err != nil {
			log.Fatalf("Failed to execute serve command: %v", err)
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
	staticFS, err := fs.Sub(staticFiles, "dist")
	if err != nil {
		log.Fatalf("Failed to create sub FS for static files: %v", err)
		return err
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

// PredefinedStatusConfig represents a predefined status configuration
type PredefinedStatusConfig struct {
	Key         string
	Name        string
	Color       string
	Icon        string
	Order       int
	IsCompleted bool
	IsCanceled  bool
	IsDefault   bool // Default statuses are enabled by default
}

// getPredefinedStatusConfigs returns all predefined status configurations
func getPredefinedStatusConfigs() []PredefinedStatusConfig {
	return []PredefinedStatusConfig{
		{
			Key:         "todo",
			Name:        "انجام نشده",
			Color:       "gray",
			Icon:        "IconCircle",
			Order:       1,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   true,
		},
		{
			Key:         "in_progress",
			Name:        "در حال انجام",
			Color:       "yellow",
			Icon:        "IconCircleHalf2",
			Order:       2,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   true,
		},
		{
			Key:         "pending",
			Name:        "در انتظار",
			Color:       "orange",
			Icon:        "IconClock",
			Order:       3,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   true,
		},
		{
			Key:         "done",
			Name:        "انجام شده",
			Color:       "green",
			Icon:        "IconCircleCheck",
			Order:       4,
			IsCompleted: true,
			IsCanceled:  false,
			IsDefault:   true,
		},
		{
			Key:         "canceled",
			Name:        "لغو شده",
			Color:       "red",
			Icon:        "IconCircleX",
			Order:       5,
			IsCompleted: false,
			IsCanceled:  true,
			IsDefault:   true,
		},
		{
			Key:         "blocked",
			Name:        "مسدود شده",
			Color:       "red",
			Icon:        "IconAlertCircle",
			Order:       6,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   false,
		},
		{
			Key:         "review",
			Name:        "در حال بررسی",
			Color:       "blue",
			Icon:        "IconEye",
			Order:       7,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   false,
		},
		{
			Key:         "testing",
			Name:        "در حال تست",
			Color:       "purple",
			Icon:        "IconTestPipe",
			Order:       8,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   false,
		},
		{
			Key:         "ready",
			Name:        "آماده",
			Color:       "green",
			Icon:        "IconCircleCheck",
			Order:       9,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   false,
		},
		{
			Key:         "on_hold",
			Name:        "متوقف شده",
			Color:       "gray",
			Icon:        "IconPlayerPause",
			Order:       10,
			IsCompleted: false,
			IsCanceled:  false,
			IsDefault:   false,
		},
	}
}

// createPredefinedStatusConfigsForProject creates all predefined status configs for a project
func createPredefinedStatusConfigsForProject(app core.App, projectId string) error {
	statusConfigsCollection, err := app.FindCollectionByNameOrId("status_configs")
	if err != nil {
		log.Printf("Error finding status_configs collection: %v", err)
		return err
	}

	predefinedStatuses := getPredefinedStatusConfigs()
	for _, status := range predefinedStatuses {
		record := core.NewRecord(statusConfigsCollection)
		record.Set("project", projectId)
		record.Set("key", status.Key)
		record.Set("name", status.Name)
		record.Set("color", status.Color)
		record.Set("icon", status.Icon)
		record.Set("order", status.Order)
		record.Set("is_completed", status.IsCompleted)
		record.Set("is_canceled", status.IsCanceled)
		record.Set("enabled", status.IsDefault) // Enable default statuses, disable others

		if err := app.Save(record); err != nil {
			log.Printf("Error creating status config %s for project %s: %v", status.Key, projectId, err)
			return err
		}
	}

	log.Printf("Created all predefined status configs for project %s", projectId)
	return nil
}

// migrateProjectStatusConfigs creates status configs for existing projects that don't have them
func migrateProjectStatusConfigs(e *core.ServeEvent) error {
	log.Println("Starting status configs migration for existing projects...")

	// Get all projects
	var projects []struct {
		ID string `db:"id"`
	}
	err := e.App.DB().NewQuery("SELECT id FROM projects").All(&projects)
	if err != nil && !strings.Contains(err.Error(), "no such table") {
		log.Printf("Error fetching projects for migration: %v", err)
		return e.Next()
	}

	if len(projects) == 0 {
		log.Println("No projects found for status configs migration.")
		return e.Next()
	}

	// For each project, check if it has status configs
	for _, project := range projects {
		var statusConfigCount int
		err := e.App.DB().NewQuery(`
			SELECT COUNT(*) FROM status_configs WHERE project = {:projectId}
		`).Bind(dbx.Params{"projectId": project.ID}).Row(&statusConfigCount)

		if err != nil && !strings.Contains(err.Error(), "no such table") {
			log.Printf("Error checking status configs for project %s: %v", project.ID, err)
			continue
		}

		if statusConfigCount == 0 {
			if err := createPredefinedStatusConfigsForProject(e.App, project.ID); err != nil {
				log.Printf("Error creating predefined status configs for project %s: %v", project.ID, err)
				continue
			}

			// Migrate existing tasks to use status_config
			if err := migrateTasksToStatusConfig(e.App, project.ID); err != nil {
				log.Printf("Error migrating tasks for project %s: %v", project.ID, err)
			}
		}
	}

	log.Println("Status configs migration completed.")
	return e.Next()
}

// migrateTasksToStatusConfig updates tasks to use status_config based on their status field
func migrateTasksToStatusConfig(app core.App, projectId string) error {
	// Get status config mappings for this project
	var statusConfigs []struct {
		ID  string `db:"id"`
		Key string `db:"key"`
	}
	err := app.DB().NewQuery(`
		SELECT id, key FROM status_configs WHERE project = {:projectId}
	`).Bind(dbx.Params{"projectId": projectId}).All(&statusConfigs)

	if err != nil {
		return err
	}

	// Create a map of key -> status_config_id
	statusConfigMap := make(map[string]string)
	for _, sc := range statusConfigs {
		statusConfigMap[sc.Key] = sc.ID
	}

	// Get all tasks for this project that don't have a status_config
	var tasks []struct {
		ID     string `db:"id"`
		Status string `db:"status"`
	}
	err = app.DB().NewQuery(`
		SELECT id, status FROM tasks
		WHERE project = {:projectId} AND (status_config IS NULL OR status_config = '')
	`).Bind(dbx.Params{"projectId": projectId}).All(&tasks)

	if err != nil && !strings.Contains(err.Error(), "no such column") {
		return err
	}

	// Update each task with the appropriate status_config
	tasksCollection, err := app.FindCollectionByNameOrId("tasks")
	if err != nil {
		return err
	}

	for _, task := range tasks {
		statusConfigId, exists := statusConfigMap[task.Status]
		if !exists {
			log.Printf("Warning: No status config found for status %s, using 'todo' as default", task.Status)
			statusConfigId = statusConfigMap["todo"]
		}

		taskRecord, err := app.FindRecordById(tasksCollection.Id, task.ID)
		if err != nil {
			log.Printf("Error finding task %s: %v", task.ID, err)
			continue
		}

		taskRecord.Set("status_config", statusConfigId)
		if err := app.Save(taskRecord); err != nil {
			log.Printf("Error updating task %s with status_config: %v", task.ID, err)
		}
	}

	log.Printf("Migrated %d tasks to use status_config for project %s", len(tasks), projectId)
	return nil
}

// handleProjectStatusConfigsCreation creates predefined status configs after a project is created
func handleProjectStatusConfigsCreation(e *core.RecordEvent) error {
	projectId := e.Record.Id
	if err := createPredefinedStatusConfigsForProject(e.App, projectId); err != nil {
		log.Printf("Error creating predefined status configs for new project %s: %v", projectId, err)
		// Don't fail project creation if status config creation fails
		return e.Next()
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
	for {
		projectCode := generateRandomCode()
		exists, err := app.FindFirstRecordByData("projects", "code", projectCode)
		if err != nil && err.Error() != "sql: no rows in result set" {
			return "", err
		}
		if exists == nil {
			return projectCode, nil
		}
		log.Printf("Project code collision for %q, generating a new one.", projectCode)
	}
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

	if err != nil && !strings.Contains(err.Error(), "no rows") {
		return 0, err
	}

	if err != nil {
		return 1, nil // No tasks exist yet
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

func handleCheckInitialAdmin(e *core.RequestEvent) error {
	_, err := e.App.FindCollectionByNameOrId("users")
	if err != nil {
		log.Printf("Error finding users collection: %v", err)
		return e.JSON(400, err.Error())
	}

	var anyUserExists BasicUser
	err = e.App.DB().NewQuery("SELECT * FROM users LIMIT 1").One(&anyUserExists)
	if err != nil {
		log.Printf("Error finding any user: %v", err)
		return e.JSON(204, map[string]bool{"exists": false})
	}

	return e.JSON(200, map[string]bool{"exists": anyUserExists.ID != ""})
}

func handleCreateInitialAdmin(e *core.RequestEvent) error {
	usersCollection, err := e.App.FindCollectionByNameOrId("users")
	if err != nil {
		log.Printf("Error finding users collection: %v", err)
		return e.JSON(400, err.Error())
	}

	var anyUserExists BasicUser
	err = e.App.DB().NewQuery("SELECT * FROM users LIMIT 1").One(&anyUserExists)
	if err != nil && err.Error() != "sql: no rows in result set" {
		log.Printf("Error finding any user: %v", err)
		return e.JSON(400, err.Error())
	}

	if anyUserExists.ID != "" {
		log.Println("Admin already exists, skipping creation.")
		return e.JSON(200, "Admin already exists")
	}

	body := struct {
		Username string `json:"username" form:"username"`
		Password string `json:"password" form:"password"`
	}{}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Failed to read request data", err)
	}

	record := core.NewRecord(usersCollection)
	record.Set("username", body.Username)
	record.Set("password", body.Password)
	record.Set("role", "admin")

	log.Printf("Creating initial admin user: %s", body.Username)

	return e.App.Save(record)
}

func handleGetProjectUsers(e *core.RequestEvent) error {
	projectId := e.Request.PathValue("id")
	var users []BasicUser
	query := `
		SELECT * FROM users
		WHERE id IN (
			SELECT user FROM users_projects
			WHERE project = {:projectId}
		)
	`
	err := e.App.DB().NewQuery(query).Bind(dbx.Params{"projectId": projectId}).All(&users)
	if err != nil {
		log.Printf("Error fetching project users for project %q: %v", projectId, err)
		return e.JSON(400, err.Error())
	}
	return e.JSON(200, users)
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
