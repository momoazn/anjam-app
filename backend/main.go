package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
)

//go:embed dist
var staticFiles embed.FS

const SERVER_ADDR = "localhost:10000"

func main() {
	db := initDatabase()
	mux := setupHandlers(db)
	go openBrowser(SERVER_ADDR)

	fmt.Printf("Server starting on http://%s\n", SERVER_ADDR)
	log.Fatal(http.ListenAndServe(SERVER_ADDR, mux))
}
