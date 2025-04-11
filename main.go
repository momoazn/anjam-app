package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"os/exec"
	"runtime"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/cmd"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed dist
var staticFiles embed.FS

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "./pb_data",
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		staticFS, err := fs.Sub(staticFiles, "dist")
		if err != nil {
			log.Fatal(err)
		}

		se.Router.GET("/{path...}", apis.Static(staticFS, false))

		openBrowser("http://localhost:8090")

		return se.Next()
	})

	// if err := app.Start(); err != nil {
	// 	log.Fatal(err)
	// }

	app.Bootstrap()
	serveCmd := cmd.NewServeCommand(app, false)
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
