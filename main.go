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
)

//go:embed dist
var staticFiles embed.FS

func main() {
	// Create a file system from the embedded static directory

	http.Handle("/", spaHandler())

	// Define the server address
	serverAddr := "localhost:10000"
	fmt.Printf("Server starting on http://%s\n", serverAddr)

	// Open browser automatically
	go func() {
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
	}()

	// Start the server
	log.Fatal(http.ListenAndServe(serverAddr, nil))
}

func spaHandler() http.HandlerFunc {
	staticFS, err := fs.Sub(staticFiles, "dist")
	if err != nil {
		log.Fatal(err)
	}
	fileHandler := http.FileServer(http.FS(staticFS))

	return func(w http.ResponseWriter, r *http.Request) {
		if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
			http.NotFound(w, r)
			return
		}

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
					return
				}
				defer indexFile.Close()
				w.Header().Set("Content-Type", "text/html; charset=utf-8")
				http.ServeContent(w, r, "index.html", time.Time{}, indexFile.(io.ReadSeeker))
				return
			}
		}

		fileHandler.ServeHTTP(w, r)
	}
}
