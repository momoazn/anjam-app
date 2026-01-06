// Package main implements the Anjam application using PocketBase.
// It provides a web-based interface for managing projects, tasks, and users
// with role-based access control and embedded static assets.
package main

import (
	"bytes"
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
	"os/signal"
	"path"
	"strings"
	"syscall"
	"time"

	"anjam/config"
	"anjam/handlers"
	"anjam/helpers"
	"anjam/hooks"

	"github.com/google/uuid"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
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
	usersCollection, err := app.FindCollectionByNameOrId(config.CollectionUsers)
	if err != nil {
		// If collection doesn't exist yet, allow defaults
		return true
	}

	totalAdmins, err := app.CountRecords(usersCollection.Id, dbx.HashExp{"role": config.RoleAdmin})
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
	app.OnServe().BindFunc(applyProductionSettings)
	app.OnServe().BindFunc(backfillProjectMembersForOrgAdmins)
	app.OnServe().BindFunc(serveStaticFilesAndOpenBrowser)
	app.OnServe().BindFunc(registerAuditHooksHandler)
	app.OnServe().BindFunc(initializeAuditWorker)
	registerOrganizationEndpoints(app)
	registerInviteEndpoints(app)
	registerPermissionsEndpoint(app)
	registerBatchEndpoints(app)
	registerHealthEndpoints(app)

	// --- Bind Record Event Handlers ---
	app.OnRecordCreate("users").BindFunc(hooks.HandleUserCreation)
	app.OnRecordCreate("projects").BindFunc(hooks.HandleProjectCreation)
	app.OnRecordCreate("tasks").BindFunc(hooks.HandleTaskCreation)
	app.OnRecordValidate("tasks").BindFunc(validateTaskStatusTransition)
	app.OnRecordUpdateExecute("tasks").BindFunc(func(e *core.RecordEvent) error {
		setTaskStatusRef(e)
		return e.Next()
	})
	app.OnRecordAfterCreateSuccess("tasks").BindFunc(hooks.HandleTaskAssignmentNotification)
	app.OnRecordAfterUpdateSuccess("tasks").BindFunc(hooks.HandleTaskUpdateNotification)
	app.OnRecordAfterUpdateSuccess("projects").BindFunc(hooks.HandleProjectUpdateNotification)
	app.OnRecordAfterCreateSuccess("projects").BindFunc(handleProjectCreatedStatuses)
	app.OnRecordAfterCreateSuccess("projects").BindFunc(hooks.HandleProjectCreatedMember)
	app.OnRecordAfterDeleteSuccess("projects").BindFunc(func(e *core.RecordEvent) error {
		hooks.CleanupProjectMutex(e.Record.Id)
		return nil
	})
	app.OnRecordAfterCreateSuccess("comments").BindFunc(hooks.HandleCommentNotification)
	app.OnRecordAfterCreateSuccess("comments").BindFunc(handleCommentMentions)
	app.OnRecordAfterCreateSuccess("project_members").BindFunc(hooks.HandleProjectMembersCreatedNotify)
	app.OnRecordEnrich("audit_logs").BindFunc(handleAuditLogEnrich)
	app.OnRecordAfterCreateSuccess("time_entries").BindFunc(handleTimeEntryCreated)
	app.OnRecordAfterUpdateSuccess("time_entries").BindFunc(handleTimeEntryUpdated)
	app.OnRecordAfterDeleteSuccess("time_entries").BindFunc(handleTimeEntryDeleted)

	// Enforce product mode restrictions on time_entries
	app.OnRecordCreateExecute("time_entries").BindFunc(enforceTimeEntriesProductMode)
	app.OnRecordUpdateExecute("time_entries").BindFunc(enforceTimeEntriesProductMode)
	app.OnRecordDeleteExecute("time_entries").BindFunc(enforceTimeEntriesProductMode)

	// --- Bind Authentication Event Handlers ---
	app.OnRecordAuthWithPasswordRequest("users").BindFunc(hooks.HandleAuthRequest)

	// --- Custom API Endpoints ---
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.PATCH("/api/v1/users/{id}/toggle-active", handlers.HandleToggleUserActive)
		se.Router.PATCH("/api/v1/users/{id}/unblock", handlers.HandleUnblockUser)
		se.Router.GET("/api/v1/users/{id}/login-logs", handlers.HandleGetUserLoginLogs)
		se.Router.GET("/api/v1/search", handleGlobalSearch)

		return se.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Server.Handler = addRequestMetadataMiddleware(se.Server.Handler)
		return se.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Server.Handler = requestTimingMiddleware(se.Server.Handler)
		return se.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Server.Handler = trackAuthMiddleware(app, se.Server.Handler)
		return se.Next()
	})

	// Customize verification email template
	app.OnMailerRecordVerificationSend(CollectionUsers).BindFunc(func(e *core.MailerRecordEvent) error {
		// Access token and user data
		token := e.Meta["token"].(string)
		userEmail := e.Record.Email()
		appName := e.App.Settings().Meta.AppName
		if appName == "" {
			appName = "Anjam"
		}

		// Build custom magic link URL pointing to frontend
		appUrl := e.App.Settings().Meta.AppURL
		if appUrl == "" {
			appUrl = "http://localhost:5173"
		}
		magicLink := fmt.Sprintf("%s/verify-email?token=%s&email=%s", appUrl, token, userEmail)

		// Customize email content - keeping it simple as requested
		e.Message.Subject = fmt.Sprintf("Welcome to %s - Verify Your Email", appName)
		e.Message.HTML = fmt.Sprintf(`
			<html>
			<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="text-align: center; margin-bottom: 30px;">
					<h2 style="color: #333;">Welcome to %s!</h2>
				</div>
				<p>Thank you for registering. Please verify your email address by clicking the button below:</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="%s" style="background: #007bff; color: white; padding: 12px 24px; 
					   text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
						Verify Email Address
					</a>
				</div>
				<p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link:</p>
				<p style="word-break: break-all; color: #007bff; font-size: 12px;">%s</p>
				<p style="color: #666; font-size: 12px; margin-top: 20px;">
					This verification link will expire in 24 hours for security reasons.
				</p>
				<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
				<p style="color: #999; font-size: 12px; text-align: center;">
					This email was sent by %s. If you didn't create an account, you can safely ignore this email.
				</p>
			</body>
			</html>
		`, appName, magicLink, magicLink, appName)

		return e.Next()
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
		helpers.LogInfo("Default account creation is explicitly enabled (TM_ALLOW_DEFAULT_ACCOUNTS=true)")
		return
	}

	helpers.LogInfo("Default accounts will be created only when no admins exist. Set TM_ALLOW_DEFAULT_ACCOUNTS=true to permit creating additional defaults after admins exist.")
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
		helpers.LogError("Error opening index.html", helpers.WithError(err))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}
	defer indexFile.Close()

	seeker, ok := indexFile.(io.ReadSeeker)
	if !ok {
		helpers.LogError("index.html does not implement io.ReadSeeker")
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return fmt.Errorf("index.html is not seekable")
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	http.ServeContent(w, r, "index.html", time.Time{}, seeker)
	return nil
}

// handleGroupCreation validates manager assignment and ensures status defaults.
// NOTE: Tag creation now expects organization to be provided by the client.

func startApp(app *pocketbase.PocketBase) {
	// Set up signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Start app in a goroutine so we can handle shutdown signals
	errChan := make(chan error, 1)
	go func() {
		if app.IsDev() {
			log.Println("Starting app in development mode...")
			errChan <- app.Start()
		} else {
			log.Println("Starting app in production mode...")
			if err := app.Bootstrap(); err != nil {
				errChan <- err
				return
			}

			// Start HTTP server on 0.0.0.0:8090 for container environments
			log.Println("Starting HTTP server on 0.0.0.0:8090...")
			errChan <- apis.Serve(app, apis.ServeConfig{
				HttpAddr:        "0.0.0.0:8090",
				ShowStartBanner: true,
			})
		}
	}()

	// Wait for either an error or a shutdown signal
	select {
	case err := <-errChan:
		if err != nil {
			log.Fatalf("App error: %v", err)
		}
	case sig := <-sigChan:
		log.Printf("Received signal %v, shutting down gracefully...", sig)
		shutdownAuditWorker()
		// Give PocketBase time to clean up
		time.Sleep(1 * time.Second)
		log.Println("Shutdown complete")
	}
}

// --- Serve Event Handlers ---

func importSchema(e *core.ServeEvent) error {
	if len(schemaJSON) == 0 {
		log.Println("Warning: schema is empty. Skipping schema import.")
		return e.Next()
	}

	isLockedErr := func(err error) bool {
		if err == nil {
			return false
		}
		msg := strings.ToLower(err.Error())
		return strings.Contains(msg, "database is locked") ||
			strings.Contains(msg, "database is busy") ||
			strings.Contains(msg, "locked (517)") ||
			strings.Contains(msg, "busy (5)")
	}

	const maxAttempts = 10
	var lastErr error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		if err := e.App.ImportCollectionsByMarshaledJSON(schemaJSON, false); err != nil {
			lastErr = err
			if !isLockedErr(err) {
				log.Printf("Error importing collections from schema: %v", err)
				return err
			}

			backoff := time.Duration(attempt*200) * time.Millisecond
			log.Printf("Schema import blocked by sqlite lock; retrying (%d/%d) in %s: %v", attempt, maxAttempts, backoff, err)
			time.Sleep(backoff)
			continue
		}

		log.Println("Successfully imported collections from schema.")
		return e.Next()
	}

	log.Printf("Error importing collections from schema after %d attempts: %v", maxAttempts, lastErr)
	return lastErr
}

// backfillProjectMembersForOrgAdmins ensures organization owners/admins can create tasks in existing projects.
// It creates missing project_members rows for all projects and active organization owners/admins.
func backfillProjectMembersForOrgAdmins(e *core.ServeEvent) error {
	projectMembersCollection, err := e.App.FindCollectionByNameOrId(config.CollectionProjectMembers)
	if err != nil {
		log.Printf("Warning: failed to find project_members collection: %v", err)
		return e.Next()
	}

	createdCount := 0
	type projectRow struct {
		ID           string `db:"id"`
		Organization string `db:"organization"`
	}
	var projects []projectRow
	if err := e.App.RecordQuery(config.CollectionProjects).
		Select("id", "organization").
		All(&projects); err != nil {
		log.Printf("Warning: failed to list projects for backfill: %v", err)
		return e.Next()
	}
	log.Printf("Project members backfill: scanning %d project(s)", len(projects))

	for _, project := range projects {
		orgID := project.Organization
		if orgID == "" {
			continue
		}

		type orgMemberRow struct {
			User string `db:"user"`
			Role string `db:"role"`
		}
		var orgAdmins []orgMemberRow
		if err := e.App.RecordQuery(config.CollectionOrgMembers).
			Select("user", "role").
			Where(dbx.NewExp(
				"organization = {:org} AND status = 'active' AND (role = 'owner' OR role = 'admin')",
				dbx.Params{"org": orgID},
			)).
			All(&orgAdmins); err != nil {
			log.Printf("Warning: failed to list org members for backfill (org=%s): %v", orgID, err)
			continue
		}
		if len(orgAdmins) == 0 {
			continue
		}

		for _, member := range orgAdmins {
			userID := member.User
			if userID == "" {
				continue
			}

			var existing struct {
				ID string `db:"id"`
			}
			err := e.App.RecordQuery(config.CollectionProjectMembers).
				Select("id").
				Where(dbx.HashExp{"project": project.ID, "user": userID}).
				Limit(1).
				One(&existing)
			if err == nil {
				continue
			}
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				log.Printf("Warning: failed checking project member backfill (project=%s user=%s): %v", project.ID, userID, err)
				continue
			}

			projectRole := config.ProjectRoleAdmin
			if member.Role == config.OrgRoleOwner {
				projectRole = config.ProjectRoleOwner
			}

			record := core.NewRecord(projectMembersCollection)
			record.Set("project", project.ID)
			record.Set("user", userID)
			record.Set("role", projectRole)
			record.Set("added_at", time.Now().Format(time.RFC3339))
			if err := e.App.Save(record); err != nil {
				log.Printf("Warning: failed to backfill project member (project=%s user=%s): %v", project.ID, userID, err)
			} else {
				createdCount++
			}
		}
	}

	if createdCount > 0 {
		log.Printf("Project members backfill: created %d project_members record(s)", createdCount)
	} else {
		log.Printf("Project members backfill: no new records created")
	}

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
	adminCollection, err := e.App.FindCollectionByNameOrId(config.CollectionSuperusers)
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

	totalAdmins, err := e.App.CountRecords(usersCollection.Id, dbx.HashExp{"role": config.RoleAdmin})
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
		record.Set("role", config.RoleAdmin)
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

// --- Notification Handlers ---

type authRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

func isAuthWithPasswordRequest(r *http.Request) bool {
	return r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/auth-with-password")
}

func readRequestBody(r *http.Request) ([]byte, error) {
	return io.ReadAll(r.Body)
}

func resetRequestBody(r *http.Request, body []byte) {
	r.Body = io.NopCloser(bytes.NewReader(body))
}

func parseAuthRequest(body []byte) (authRequest, bool) {
	var authReq authRequest
	if err := json.Unmarshal(body, &authReq); err != nil {
		return authRequest{}, false
	}
	return authReq, true
}

func trackAuthAttempt(app core.App, authReq authRequest, req *http.Request, statusCode int) {
	if statusCode >= 200 && statusCode < 300 {
		handleSuccessfulAuth(app, authReq.Identity, req)
		return
	}
	handleFailedAuth(app, authReq.Identity, req)
}

func trackAuthMiddleware(app core.App, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only intercept auth endpoints
		if isAuthWithPasswordRequest(r) {
			// Create a response recorder to capture the response
			rec := &responseRecorder{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
			}

			// Store request body for later use (we need to parse it to get the identity)
			bodyBytes, err := readRequestBody(r)
			if err != nil {
				helpers.WriteJSONError(w, http.StatusBadRequest, "Failed to read request body")
				return
			}
			resetRequestBody(r, bodyBytes)

			// Parse the auth request
			authReq, ok := parseAuthRequest(bodyBytes)
			if !ok {
				// If JSON parsing fails, still allow the request to proceed
				// The actual auth handler will handle invalid JSON
				next.ServeHTTP(w, r)
				return
			}

			// Reset body for the actual handler
			resetRequestBody(r, bodyBytes)

			// Call the actual handler
			next.ServeHTTP(rec, r)

			// After the handler has run, track the auth attempt synchronously
			// This ensures tracking completes before response is sent
			trackAuthAttempt(app, authReq, r, rec.statusCode)

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
		config.CollectionUsers,
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
		config.CollectionUsers,
		"username = {:identity} || email = {:identity}",
		dbx.Params{"identity": identity},
	)

	if err != nil {
		// User not found - still log the attempt
		logUserLogin(app, "", req, false, config.ErrUserNotFound)
		return
	}

	// Increment failed attempts
	failedAttempts := user.GetInt("failed_login_attempts")
	failedAttempts++
	user.Set("failed_login_attempts", failedAttempts)

	// Check if we should block the user
	if failedAttempts >= config.MaxFailedLoginAttempts {
		user.Set("blocked", true)
		user.Set("blocked_at", time.Now().Format(time.RFC3339))
		user.Set("blocked_reason", fmt.Sprintf(config.MsgBlockedReason, config.MaxFailedLoginAttempts))
		log.Printf("User %s blocked after %d failed login attempts", user.Id, failedAttempts)
	}

	if err := app.Save(user); err != nil {
		log.Printf("Error updating failed login attempts for user %s: %v", user.Id, err)
	}

	// Log failed login
	logUserLogin(app, user.Id, req, false, config.ErrWrongPassword)
}

func logUserLogin(app core.App, userId string, req *http.Request, success bool, failureReason string) {
	collection, err := app.FindCollectionByNameOrId(config.CollectionUserLoginLogs)
	if err != nil {
		log.Printf("Error finding user_login_logs collection: %v", err)
		return
	}

	ipAddress := handlers.ExtractIPAddress(req)

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

// --- Authentication Handlers ---

// addRequestMetadataMiddleware injects request metadata (ID, IP, client) into context
// so it can be used for auditing and tracking across the application.
func addRequestMetadataMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := uuid.New().String()

		ipAddress := handlers.ExtractIPAddress(r)

		userAgent := r.Header.Get("User-Agent")
		client := deriveClientType(userAgent)

		ctx := r.Context()
		ctx = context.WithValue(ctx, contextKeyRequestID, requestID)
		ctx = context.WithValue(ctx, contextKeyIPAddress, ipAddress)
		ctx = context.WithValue(ctx, contextKeyClient, client)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

var staticAssetSuffixes = []string{".js", ".css", ".svg", ".woff2", ".ico"}

func isStaticAsset(path string) bool {
	if strings.HasPrefix(path, "/_/") {
		return true
	}
	for _, suffix := range staticAssetSuffixes {
		if strings.HasSuffix(path, suffix) {
			return true
		}
	}
	return false
}

// requestTimingMiddleware logs the duration of each HTTP request.
// Slow requests (>1s) are logged at WARN level, very slow requests (>5s) at ERROR level.
func requestTimingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		next.ServeHTTP(w, r)

		duration := time.Since(start)

		// Skip logging for static assets
		if isStaticAsset(r.URL.Path) {
			return
		}

		fields := helpers.Fields(
			"method", r.Method,
			"path", r.URL.Path,
			"duration_ms", duration.Milliseconds(),
		)

		if requestID, ok := r.Context().Value(contextKeyRequestID).(string); ok {
			fields["request_id"] = requestID
		}

		switch {
		case duration >= 5*time.Second:
			helpers.LogError("Very slow request", fields)
		case duration >= 1*time.Second:
			helpers.LogWarn("Slow request", fields)
		default:
			helpers.LogDebug("Request completed", fields)
		}
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

// registerAuditHooksHandler registers audit hooks for Phase 1 collections (tasks, projects).
// Called during OnServe() after schema import so collection names are available.
func registerAuditHooksHandler(e *core.ServeEvent) error {
	// Register immutability guards for audit_logs collection
	registerAuditLogsImmutabilityGuards(e.App)

	// Register audit hooks for Phase 1 collections
	registerAuditHooks(e.App, config.CollectionTasks)
	registerAuditHooks(e.App, config.CollectionProjects)

	log.Println("Audit logging enabled for tasks and projects")

	return e.Next()
}

// initializeAuditWorker initializes the async audit worker.
// Called during OnServe() after the app is fully bootstrapped.
func initializeAuditWorker(e *core.ServeEvent) error {
	initAuditWorker(e.App)
	return e.Next()
}

// enforceTimeEntriesProductMode validates time entries before create/update
//
// This function:
// 1. Validates that minutes are non-negative
// 2. Blocks time entry operations in product mode
//
// This is the final enforcement layer. Even if UI/routing checks fail,
// the API will reject the operation.
func enforceTimeEntriesProductMode(e *core.RecordEvent) error {
	// Validate that minutes are non-negative
	minutes := e.Record.GetInt("minutes")
	if minutes < 0 {
		return apis.NewApiError(
			400,
			"Time entry minutes cannot be negative.",
			map[string]any{
				"error":   "INVALID_FIELD",
				"field":   "minutes",
				"message": "Time entry minutes must be 0 or greater",
			},
		)
	}

	// Resolve the organization mode from the time entry record
	mode, err := ResolveOrgModeFromTimeEntry(e.App, e.Record)
	if err != nil {
		// On resolution error, log warning but allow operation
		// (safer to allow than to block on uncertain state)
		log.Printf("Warning: failed to resolve org mode for time entry: %v", err)
		return e.Next()
	}

	// Block if organization is in product mode
	if mode == OrgModeProduct {
		return apis.NewApiError(
			403,
			"Time tracking is not available in this workspace mode.",
			map[string]any{
				"error":   "FEATURE_DISABLED",
				"feature": "timesheet",
			},
		)
	}

	// Allow the operation
	return e.Next()
}
