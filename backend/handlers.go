package main

import (
	"encoding/json"
	"io"
	"io/fs"
	"log"
	"net/http"
	"path"
	"time"

	"gorm.io/gorm"
)

func setupHandlers(db *gorm.DB) http.Handler {
	mux := http.NewServeMux()

	mux.Handle("POST /auth/login", handleLogin(db))
	mux.Handle("POST /auth/register", handleRegister(db))

	mux.Handle("/", spaHandler())

	return mux
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

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func handleLogin(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}

		var loginRequest LoginRequest
		if err := json.Unmarshal(body, &loginRequest); err != nil {
			http.Error(w, "Failed to parse request body", http.StatusBadRequest)
			return
		}

		hashedPassword, err := hashPassword(loginRequest.Password)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		var user User
		if err := db.Where("username = ? AND password = ?", loginRequest.Username, hashedPassword).First(&user).Error; err != nil {
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func handleRegister(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}

		var registerRequest RegisterRequest
		if err := json.Unmarshal(body, &registerRequest); err != nil {
			http.Error(w, "Failed to parse request body", http.StatusBadRequest)
			return
		}

		var user User
		if err := db.Where("username = ?", registerRequest.Username).First(&user).Error; err != nil {
			http.Error(w, "User already exists", http.StatusBadRequest)
			return
		}

		if user.ID != 0 {
			http.Error(w, "User already exists", http.StatusBadRequest)
			return
		}

		hashedPassword, err := hashPassword(registerRequest.Password)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		user = User{
			Username: registerRequest.Username,
			Password: string(hashedPassword),
			Role:     registerRequest.Role,
		}

		if err := db.Create(&user).Error; err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
