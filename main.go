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
	"os/exec"
	"path"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/cmd"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/pocketbase/pocketbase/tools/types"
)

//go:embed dist
var staticFiles embed.FS

//go:embed pb_schema.json
var schemaJSON []byte

const (
	// Base role rules
	adminAccessRule    = `@request.auth.role = "admin"`
	supervisorRoleRule = `@request.auth.role = "supervisor"`

	// Project access rules
	projectSupervisorRule         = `supervisor.id = @request.auth.id`
	projectParticipantRule        = `@collection.projects.id = @collection.users_projects.project.id && @request.auth.id = @collection.users_projects.user.id`
	projectCreateAsSupervisorRule = `@request.body.supervisor = @request.auth.id`

	// Task access rules
	taskProjectSupervisorRule  = `@collection.tasks.project.supervisor.id = @request.auth.id`
	taskProjectParticipantRule = `@collection.tasks.project.id = @collection.users_projects.project.id && @request.auth.id = @collection.users_projects.user.id`
	taskCreateInProjectRule    = `@collection.projects.id = @request.body.project && (@collection.projects.supervisor.id = @request.auth.id || (@collection.projects.id = @collection.users_projects.project.id && @request.auth.id = @collection.users_projects.user.id))`

	// User access rules
	userSelfAccessRule          = `@request.auth.id = id`
	userAdminAccessRule         = `@request.auth.role = "admin"`
	userSharedProjectAccessRule = `@collection.users.id = @collection.users_projects.user.id && @collection.users_projects.project.id = @collection.projects.id && (@collection.projects.supervisor.id = @request.auth.id || (@collection.projects.id = @collection.users_projects.project.id && @request.auth.id = @collection.users_projects.user.id))`
)

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
	return strings.EqualFold(os.Getenv("TM_ALLOW_DEFAULT_ACCOUNTS"), "true")
}

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "./data",
	})

	if !allowDefaultCredentials(app) {
		log.Println("Default credential bootstrap disabled; provision admin accounts manually or via initial setup.")
	}

	// --- Bind Serve Event Handlers ---
	app.OnServe().BindFunc(importSchema)
	app.OnServe().BindFunc(ensureSuperuserExists)
	app.OnServe().BindFunc(configureCollectionRules)
	app.OnServe().BindFunc(serveStaticFilesAndOpenBrowser)

	// --- Bind Record Event Handlers ---
	app.OnRecordCreateExecute("projects").BindFunc(handleProjectCreation)
	app.OnRecordCreateExecute("tasks").BindFunc(handleTaskCreation)

	// --- Custom API Endpoints ---
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/tm/is-initial", handleCheckInitialAdmin)
		se.Router.POST("/api/tm/create-initial-admin", handleCreateInitialAdmin)
		se.Router.GET("/api/tm/projects/{id}/users", handleGetProjectUsers)
		return se.Next()
	})

	// --- Start Application ---
	startApp(app)
}

// --- Helper Functions ---

func openBrowser(serverAddr string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "linux":
		cmd = exec.Command("xdg-open", serverAddr)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", serverAddr)
	case "darwin":
		cmd = exec.Command("open", serverAddr)
	default:
		log.Printf("Unsupported OS %q for automatic browser opening. Please open %s manually.", runtime.GOOS, serverAddr)
		return
	}

	if err := cmd.Start(); err != nil {
		log.Printf("Error opening browser: %v", err)
	}
}

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
		if err := serveCmd.Execute(); err != nil {
			log.Fatalf("Failed to execute serve command: %v", err)
		}
	}
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

		log.Println("Default PocketBase superuser created for development use.")
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

		log.Println("Default application admin user created for development use.")
	} else {
		log.Println("Admin user(s) already exist; no defaults created.")
	}

	return nil
}

func configureCollectionRules(e *core.ServeEvent) error {
	log.Println("Configuring collection API rules...")

	if err := configureProjectsRules(e); err != nil {
		return err
	}
	if err := configureTasksRules(e); err != nil {
		return err
	}
	if err := configureUsersProjectsRules(e); err != nil {
		return err
	}
	if err := configureUsersRules(e); err != nil {
		return err
	}

	log.Println("Collection API rules configured successfully.")
	return e.Next()
}

func configureProjectsRules(e *core.ServeEvent) error {
	projectsCollection, err := e.App.FindCollectionByNameOrId("projects")
	if err != nil {
		log.Printf("Error finding 'projects' collection: %v", err)
		return err
	}

	// Project rules
	projectsCollection.ListRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s) || %s`, adminAccessRule, supervisorRoleRule, projectSupervisorRule, projectParticipantRule))
	projectsCollection.ViewRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s) || %s`, adminAccessRule, supervisorRoleRule, projectSupervisorRule, projectParticipantRule))
	projectsCollection.CreateRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, supervisorRoleRule, projectCreateAsSupervisorRule))
	projectsCollection.UpdateRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, supervisorRoleRule, projectSupervisorRule))
	projectsCollection.DeleteRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, supervisorRoleRule, projectSupervisorRule))

	if err := e.App.Save(projectsCollection); err != nil {
		log.Printf("Error saving 'projects' collection rules: %v", err)
		return err
	}

	return nil
}

func configureTasksRules(e *core.ServeEvent) error {
	tasksCollection, err := e.App.FindCollectionByNameOrId("tasks")
	if err != nil {
		log.Printf("Error finding 'tasks' collection: %v", err)
		return err
	}

	// Task rules
	tasksCollection.ListRule = types.Pointer(fmt.Sprintf(`%s || %s || %s`, adminAccessRule, taskProjectSupervisorRule, taskProjectParticipantRule))
	tasksCollection.ViewRule = types.Pointer(fmt.Sprintf(`%s || %s || %s`, adminAccessRule, taskProjectSupervisorRule, taskProjectParticipantRule))
	tasksCollection.CreateRule = types.Pointer(fmt.Sprintf(`%s || %s`, adminAccessRule, taskCreateInProjectRule))
	tasksCollection.UpdateRule = types.Pointer(fmt.Sprintf(`%s || %s || %s`, adminAccessRule, taskProjectSupervisorRule, taskProjectParticipantRule))
	tasksCollection.DeleteRule = types.Pointer(fmt.Sprintf(`%s || %s`, adminAccessRule, taskProjectSupervisorRule))

	if err := e.App.Save(tasksCollection); err != nil {
		log.Printf("Error saving 'tasks' collection rules: %v", err)
		return err
	}

	return nil
}

func configureUsersProjectsRules(e *core.ServeEvent) error {
	usersProjectsCollection, err := e.App.FindCollectionByNameOrId("users_projects")
	if err != nil {
		log.Printf("Error finding 'users_projects' collection: %v", err)
		return err
	}

	// Users_Projects rules
	usersProjectsCollection.ListRule = types.Pointer(fmt.Sprintf(`%s || project.supervisor.id = @request.auth.id || (@collection.users_projects.project.id = project.id && @request.auth.id = @collection.users_projects.user.id)`, adminAccessRule))
	usersProjectsCollection.ViewRule = types.Pointer(fmt.Sprintf(`%s || project.supervisor.id = @request.auth.id || (@collection.users_projects.project.id = project.id && @request.auth.id = @collection.users_projects.user.id)`, adminAccessRule))
	usersProjectsCollection.CreateRule = types.Pointer(fmt.Sprintf(`%s || (@collection.projects.id = @request.body.project && @collection.projects.supervisor.id = @request.auth.id)`, adminAccessRule))
	usersProjectsCollection.UpdateRule = types.Pointer(fmt.Sprintf(`%s || project.supervisor.id = @request.auth.id`, adminAccessRule))
	usersProjectsCollection.DeleteRule = types.Pointer(fmt.Sprintf(`%s || project.supervisor.id = @request.auth.id`, adminAccessRule))

	if err := e.App.Save(usersProjectsCollection); err != nil {
		log.Printf("Error saving 'users_projects' collection rules: %v", err)
		return err
	}

	return nil
}

func configureUsersRules(e *core.ServeEvent) error {
	usersCollection, err := e.App.FindCollectionByNameOrId("users")
	if err != nil {
		log.Printf("Error finding 'users' collection: %v", err)
		return err
	}

	usersCollection.ListRule = types.Pointer(fmt.Sprintf(`%s || %s || %s || %s`, adminAccessRule, supervisorRoleRule, userSelfAccessRule, userSharedProjectAccessRule))
	usersCollection.ViewRule = types.Pointer(fmt.Sprintf(`%s || %s || %s || %s`, adminAccessRule, supervisorRoleRule, userSelfAccessRule, userSharedProjectAccessRule))
	usersCollection.CreateRule = types.Pointer("") // Allow public registration
	usersCollection.UpdateRule = types.Pointer(fmt.Sprintf(`%s || %s`, adminAccessRule, userSelfAccessRule))
	usersCollection.DeleteRule = types.Pointer(fmt.Sprintf(`%s || %s`, adminAccessRule, supervisorRoleRule))

	if err := e.App.Save(usersCollection); err != nil {
		log.Printf("Error saving 'users' collection rules: %v", err)
		return err
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

	if !e.App.IsDev() {
		openBrowser(e.App.Settings().Meta.AppURL)
	}

	return e.Next()
}

// --- Record Event Handlers ---

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
	if err := setTaskDisplayID(e); err != nil {
		return err
	}
	setTaskDefaults(e)
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
