package main

import (
	"embed"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os/exec"
	"path"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/pocketbase/pocketbase"
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

	// app.OnServe().BindFunc(func(e *core.ServeEvent) error {
	// 	json, err := os.ReadFile("./pb_schema.json")
	// 	if err != nil {
	// 		log.Default().Println(err)
	// 		return err
	// 	}

	// 	if err := app.ImportCollectionsByMarshaledJSON(json, true); err != nil {
	// 		log.Default().Println(err)
	// 		return err
	// 	}

	// 	return e.Next()
	// })

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		collection, err := app.FindCollectionByNameOrId("_superusers")
		if err != nil {
			return err
		}

		count, err := app.CountRecords(collection.Id)
		if err != nil {
			return err
		}

		if count != 0 {
			return e.Next()
		}

		record := core.NewRecord(collection)
		record.Set("email", "admin@example.com")
		record.Set("password", "admin12345")

		err = app.Save(record)
		if err != nil {
			return err
		}

		return e.Next()
	})

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		projectsCollection, err := app.FindCollectionByNameOrId("projects")
		if err != nil {
			return err
		}

		projectsCollection.ListRule = types.Pointer(
			fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedProjectsRule),
		)
		projectsCollection.ViewRule = types.Pointer(
			fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedProjectsRule),
		)
		projectsCollection.CreateRule = types.Pointer(
			fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedProjectsRule, supervisorAccessRule),
		)
		projectsCollection.UpdateRule = types.Pointer(
			fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedProjectsRule, supervisorAccessRule),
		)
		projectsCollection.DeleteRule = types.Pointer(
			fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedProjectsRule, supervisorAccessRule),
		)

		tasksCollection, err := app.FindCollectionByNameOrId("tasks")
		if err != nil {
			return err
		}

		tasksCollection.ListRule = types.Pointer(
			fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedTasksRule),
		)
		tasksCollection.ViewRule = types.Pointer(
			fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedTasksRule),
		)
		tasksCollection.CreateRule = types.Pointer(
			fmt.Sprintf(`%s || (%s)`, adminAccessRule, accessOnlyParticipatedTasksRule),
		)
		tasksCollection.UpdateRule = types.Pointer(
			fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedTasksRule, supervisorAccessRule),
		)
		tasksCollection.DeleteRule = types.Pointer(
			fmt.Sprintf(`%s || (%s && %s)`, adminAccessRule, accessOnlyParticipatedTasksRule, supervisorAccessRule),
		)

		err = app.Save(projectsCollection)
		if err != nil {
			return err
		}

		err = app.Save(tasksCollection)
		if err != nil {
			return err
		}

		return e.Next()
	})

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		staticFS, err := fs.Sub(staticFiles, "dist")
		if err != nil {
			log.Fatal(err)
		}

		e.Router.GET("/{path...}", func(e *core.RequestEvent) error {
			return staticHandler(staticFS, e.Response, e.Request)
		})

		if !app.IsDev() {
			openBrowser("127.0.0.1:8090")
		}

		return e.Next()
	})

	app.OnRecordCreateExecute("projects").BindFunc(func(e *core.RecordEvent) error {
		projectCode := e.Record.Get("code").(string)
		if projectCode != "" {
			return e.Next()
		}

		for {
			projectCode = generateRandomCode()
			projectCodeExists, err := app.FindFirstRecordByData("projects", "code", projectCode)
			if err != nil && err.Error() != "sql: no rows in result set" {
				return err
			}

			if projectCodeExists == nil {
				break
			}
		}

		e.Record.Set("code", projectCode)

		return e.Next()
	})

	app.OnRecordCreateExecute("tasks").BindFunc(func(e *core.RecordEvent) error {
		if e.Record.Get("display_id").(string) == "" {
			projectId := e.Record.Get("project").(string)
			project, err := app.FindRecordById("projects", projectId)
			if err != nil {
				return err
			}

			lastTask, err := app.FindFirstRecordByData("tasks", "project", projectId)
			if err != nil && err.Error() != "sql: no rows in result set" {
				return err
			}

			if lastTask == nil {
				e.Record.Set("display_id", fmt.Sprintf("%s-001", project.Get("code").(string)))
				return e.Next()
			}

			lastTaskDisplayID := lastTask.Get("display_id").(string)
			lastTaskNumber, err := strconv.Atoi(strings.Split(lastTaskDisplayID, "-")[1])
			if err != nil {
				return err
			}

			e.Record.Set("display_id", fmt.Sprintf("%s-%03d", project.Get("code").(string), lastTaskNumber+1))
		}

		// Set default values if not set
		if e.Record.Get("status").(string) == "" {
			e.Record.Set("status", "todo")
		}
		if e.Record.Get("priority").(string) == "" {
			e.Record.Set("priority", "medium")
		}
		return e.Next()
	})

	if app.IsDev() {
		if err := app.Start(); err != nil {
			log.Fatal(err)
		}
	} else {
		app.Bootstrap()
		serveCmd := cmd.NewServeCommand(app, true)
		err := serveCmd.Execute()
		if err != nil {
			log.Fatal(err)
		}
	}

}

func openBrowser(serverAddr string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", fmt.Sprintf("http://%s", serverAddr)).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", fmt.Sprintf("http://%s", serverAddr)).Start()
	case "darwin":
		err = exec.Command("open", fmt.Sprintf("http://%s", serverAddr)).Start()
	default:
		fmt.Println("Unsupported OS for automatic browser opening")
		return
	}
	if err != nil {
		fmt.Printf("Error opening browser: %v\n", err)
	}
}

func staticHandler(staticFS fs.FS, w http.ResponseWriter, r *http.Request) error {
	// if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
	// 	http.NotFound(w, r)
	// 	return
	// }

	// First try to serve the file directly
	err := func() error {
		f, err := staticFS.Open(r.URL.Path)
		if err != nil {
			return err
		}
		defer f.Close()
		return nil
	}()

	// If file doesn't exist, check if this is a route (no file extension)
	if err != nil {
		// Check if the path has a file extension
		if path.Ext(r.URL.Path) == "" {
			indexFile, err := staticFS.Open("index.html")
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return err
			}
			defer indexFile.Close()
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			http.ServeContent(w, r, "index.html", time.Time{}, indexFile.(io.ReadSeeker))
			return nil
		}
	}

	http.FileServer(http.FS(staticFS)).ServeHTTP(w, r)
	return nil
}

func generateRandomCode() string {
	return security.RandomStringWithAlphabet(3, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
}
