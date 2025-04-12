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

const (
	adminAccessRule                    = `@request.auth.role = "admin"`
	accessOnlyParticipatedProjectsRule = `@collection.projects.id = @collection.users_projects.project.id && @request.auth.id = @collection.users_projects.user.id`
	supervisorAccessRule               = `@request.auth.role = "supervisor"`
	accessOnlyParticipatedTasksRule    = `@collection.tasks.project = @collection.projects.id && @collection.projects.id = @collection.users_projects.project.id && @collection.tasks.id = @collection.projects.id`
)

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "./pb_data",
	})

	// --- Bind Serve Event Handlers ---
	app.OnServe().BindFunc(importSchema)
	app.OnServe().BindFunc(ensureSuperuserExists)
	app.OnServe().BindFunc(configureCollectionRules)
	app.OnServe().BindFunc(serveStaticFilesAndOpenBrowser)

	// --- Bind Record Event Handlers ---
	app.OnRecordCreateExecute("projects").BindFunc(handleProjectCreation)
	app.OnRecordCreateExecute("tasks").BindFunc(handleTaskCreation)

	// --- Start Application ---
	startApp(app)
}

// --- Helper Functions ---

func openBrowser(serverAddr string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", serverAddr).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", serverAddr).Start()
	case "darwin":
		err = exec.Command("open", serverAddr).Start()
	default:
		fmt.Printf("Unsupported OS %q for automatic browser opening. Please open %s manually.", runtime.GOOS, serverAddr)
		return
	}
	if err != nil {
		fmt.Printf("Error opening browser: %v", err)
	}
}

func staticHandler(staticFS fs.FS, w http.ResponseWriter, r *http.Request) error {
	// Prevent API access through the static handler
	if strings.HasPrefix(r.URL.Path, "/api/") {
		return apis.NewNotFoundError("", nil) // Let PocketBase handle API routing
	}

	// Check if the requested file exists in the embedded FS
	filePath := strings.TrimPrefix(r.URL.Path, "/")
	f, err := staticFS.Open(filePath)
	if err != nil {
		// If the file doesn't exist and it's a route (no extension), serve index.html
		if os.IsNotExist(err) && path.Ext(filePath) == "" {
			indexFile, indexErr := staticFS.Open("index.html")
			if indexErr != nil {
				log.Printf("Error opening index.html: %v", indexErr)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return indexErr // Return the error from opening index.html
			}
			defer indexFile.Close()

			// Explicitly cast to io.ReadSeeker for ServeContent
			seeker, ok := indexFile.(io.ReadSeeker)
			if !ok {
				log.Printf("index.html does not implement io.ReadSeeker")
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return fmt.Errorf("index.html is not seekable")
			}

			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			http.ServeContent(w, r, "index.html", time.Time{}, seeker)
			return nil // Successfully served index.html
		}
		// For other errors or files with extensions that don't exist, let the FileServer handle it (will likely 404)
	} else {
		// File exists, close it and let the FileServer handle serving
		f.Close()
	}

	// Use http.FileServer to serve the static file
	http.FileServer(http.FS(staticFS)).ServeHTTP(w, r)
	return nil // Let the FileServer handle the response
}

func generateRandomCode() string {
	return security.RandomStringWithAlphabet(3, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
}

func startApp(app *pocketbase.PocketBase) {
	if app.IsDev() {
		log.Println("Starting PocketBase in development mode...")
		if err := app.Start(); err != nil {
			log.Fatalf("Failed to start PocketBase in dev mode: %v", err)
		}
	} else {
		log.Println("Starting PocketBase in production mode...")
		if err := app.Bootstrap(); err != nil {
			log.Fatalf("Failed to bootstrap PocketBase: %v", err)
		}
		serveCmd := cmd.NewServeCommand(app, true) // Assuming true means daemonize=false
		if err := serveCmd.Execute(); err != nil {
			log.Fatalf("Failed to execute serve command: %v", err)
		}
	}
}

// --- Serve Event Handlers ---

func importSchema(e *core.ServeEvent) error {
	schemaContent, err := os.ReadFile("./pb_schema.json")
	if err != nil {
		// If schema doesn't exist, maybe it's the first run, log but continue
		if os.IsNotExist(err) {
			log.Println("pb_schema.json not found, skipping import. Collections might be created manually or on subsequent runs.")
			return nil // Continue without importing
		}
		log.Printf("Error reading pb_schema.json: %v", err)
		return err // Return fatal error for other read issues
	}

	if err := e.App.ImportCollectionsByMarshaledJSON(schemaContent, false); err != nil {
		log.Printf("Error importing collections from pb_schema.json: %v", err)
		return err
	}
	log.Println("Successfully imported collections from pb_schema.json.")
	return e.Next()

}

func ensureSuperuserExists(e *core.ServeEvent) error {
	adminCollection, err := e.App.FindCollectionByNameOrId("_superusers")
	if err != nil {
		log.Printf("Error finding admin collection: %v", err)
		return err
	}

	// Use TotalAdmins for a more direct check
	totalAdmins, err := e.App.CountRecords(adminCollection.Id)
	if err != nil {
		log.Printf("Error counting admins: %v", err)
		return err
	}

	if totalAdmins > 0 {
		log.Println("Superuser(s) already exist.")
		return e.Next() // Superuser exists, nothing more to do
	}

	record := core.NewRecord(adminCollection)
	record.Set("email", "admin@example.com")
	record.Set("password", "admin12345")

	if err := e.App.Save(record); err != nil {
		log.Printf("Error saving default admin: %v", err)
		return err
	}

	log.Println("Default superuser created successfully (admin@example.com / admin12345).")
	return e.Next()

}

func configureCollectionRules(e *core.ServeEvent) error {
	log.Println("Configuring collection API rules...")

	// Configure Projects Collection
	projectsCollection, err := e.App.FindCollectionByNameOrId("projects")
	if err != nil {
		log.Printf("Error finding 'projects' collection: %v", err)
		return err // Collection must exist
	}

	projectsCollection.ListRule = types.Pointer(fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedProjectsRule))
	projectsCollection.ViewRule = types.Pointer(fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedProjectsRule))
	projectsCollection.CreateRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedProjectsRule, supervisorAccessRule))
	projectsCollection.UpdateRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedProjectsRule, supervisorAccessRule))
	projectsCollection.DeleteRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedProjectsRule, supervisorAccessRule))

	if err := e.App.Save(projectsCollection); err != nil {
		log.Printf("Error saving 'projects' collection rules: %v", err)
		return err
	}

	// Configure Tasks Collection
	tasksCollection, err := e.App.FindCollectionByNameOrId("tasks")
	if err != nil {
		log.Printf("Error finding 'tasks' collection: %v", err)
		return err // Collection must exist
	}

	tasksCollection.ListRule = types.Pointer(fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedTasksRule))
	tasksCollection.ViewRule = types.Pointer(fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedTasksRule))
	tasksCollection.CreateRule = types.Pointer(fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedTasksRule)) // Assuming anyone participating can create tasks
	tasksCollection.UpdateRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedTasksRule, supervisorAccessRule))
	tasksCollection.DeleteRule = types.Pointer(fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedTasksRule, supervisorAccessRule))

	if err := e.App.Save(tasksCollection); err != nil {
		log.Printf("Error saving 'tasks' collection rules: %v", err)
		return err
	}

	log.Println("Collection API rules configured successfully.")
	return e.Next()
}

func serveStaticFilesAndOpenBrowser(e *core.ServeEvent) error {
	staticFS, err := fs.Sub(staticFiles, "dist")
	if err != nil {
		log.Fatalf("Failed to create sub FS for static files: %v", err)
		return err
	}

	// Register the fallback route handler for static files
	e.Router.GET("/{path...}", func(e *core.RequestEvent) error {
		return staticHandler(staticFS, e.Response, e.Request)
	})

	// Open browser only in production mode after server starts
	if !e.App.IsDev() {
		openBrowser(e.App.Settings().Meta.AppURL)
	}

	return e.Next()
}

// --- Record Event Handlers ---

func handleProjectCreation(e *core.RecordEvent) error {
	// Check if code is already set (e.g., via API request)
	if e.Record.GetString("code") != "" {
		return nil // Code already provided, do nothing
	}

	var projectCode string
	for {
		projectCode = generateRandomCode()
		// Use Exists to check efficiently
		exists, err := e.App.FindFirstRecordByData("projects", "code", projectCode)
		if err != nil && err.Error() != "sql: no rows in result set" {
			log.Printf("Error checking for existing project code %q: %v", projectCode, err)
			return err // Propagate DB errors
		}

		if exists == nil {
			break // Found a unique code
		}
		// Log if a collision happens, though it's unlikely with 3 letters
		log.Printf("Project code collision for %q, generating a new one.", projectCode)
	}

	e.Record.Set("code", projectCode)
	log.Printf("Generated unique project code %q for new project.", projectCode)
	return e.Next() // No need to save, hook modifies the record before creation
}

func handleTaskCreation(e *core.RecordEvent) error {
	// Set display_id if not provided
	if e.Record.GetString("display_id") == "" {
		projectId := e.Record.GetString("project") // Relation field stores the ID

		// Fetch the related project record to get its code
		project, err := e.App.FindRecordById("projects", projectId)
		if err != nil {
			log.Printf("Error fetching project %q for task creation: %v", projectId, err)
			return err
		}
		projectCode := project.GetString("code")

		// Find the task with the highest display_id for this project
		// This requires a custom query as FindFirstRecordByData sorts by created DESC by default
		var lastTask struct {
			DisplayID string `db:"display_id"`
		}
		err = e.App.RecordQuery("tasks").
			Select("display_id").
			Where(dbx.HashExp{"project": projectId}).
			OrderBy("display_id DESC"). // Sort by the ID itself
			Limit(1).
			One(&lastTask)

		newTaskNumber := 1                                           // Default if no tasks exist yet
		if err != nil && !strings.Contains(err.Error(), "no rows") { // Check for actual DB errors
			log.Printf("Error finding last task for project %q: %v", projectId, err)
			return err
		} else if err == nil { // A task was found
			parts := strings.Split(lastTask.DisplayID, "-")
			if len(parts) == 2 {
				lastNum, parseErr := strconv.Atoi(parts[1])
				if parseErr == nil {
					newTaskNumber = lastNum + 1
				} else {
					log.Printf("Warning: Could not parse task number from display_id %q: %v. Defaulting to 1.", lastTask.DisplayID, parseErr)
					// Decide on fallback: error out or default to 1? Defaulting seems safer.
					newTaskNumber = 1 // Or maybe query count(*) + 1? Let's stick to parsing for now.
				}
			} else {
				log.Printf("Warning: Unexpected display_id format %q. Defaulting task number to 1.", lastTask.DisplayID)
				newTaskNumber = 1
			}
		}
		// If err contains "no rows", newTaskNumber remains 1, which is correct.

		displayID := fmt.Sprintf("%s-%03d", projectCode, newTaskNumber)
		e.Record.Set("display_id", displayID)
		log.Printf("Generated task display_id %q for project %q.", displayID, projectCode)
	}

	// Set default values if not provided in the request
	if e.Record.GetString("status") == "" {
		e.Record.Set("status", "todo")
	}
	if e.Record.GetString("priority") == "" {
		e.Record.Set("priority", "medium")
	}

	return e.Next() // Modifications are applied before saving
}
