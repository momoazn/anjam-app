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
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/cmd"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed dist
var staticFiles embed.FS

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
		staticFS, err := fs.Sub(staticFiles, "dist")
		if err != nil {
			log.Fatal(err)
		}

		e.Router.GET("/{path...}", func(e *core.RequestEvent) error {
			return staticHandler(staticFS, e.Response, e.Request)
		})

		openBrowser("127.0.0.1:8090")

		return e.Next()
	})

	// if err := app.Start(); err != nil {
	// 	log.Fatal(err)
	// }

	app.Bootstrap()
	serveCmd := cmd.NewServeCommand(app, true)
	serveCmd.Execute()
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
