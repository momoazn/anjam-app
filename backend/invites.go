package main

import (
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"

	"anjam/helpers"
)

// registerInviteEndpoints sets up invite-related API routes.
func registerInviteEndpoints(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// POST /api/v1/organizations/{id}/invites - Create invite link
		se.Router.POST("/api/v1/organizations/{id}/invites", handleCreateInvite)

		// GET /api/v1/organizations/{id}/invites - List org invites
		se.Router.GET("/api/v1/organizations/{id}/invites", handleListInvites)

		// DELETE /api/v1/organizations/{id}/invites/{inviteId} - Revoke invite
		se.Router.DELETE("/api/v1/organizations/{id}/invites/{inviteId}", handleRevokeInvite)

		// GET /api/v1/invites/{token} - Get invite info (public)
		se.Router.GET("/api/v1/invites/{token}", handleGetInviteByToken)

		// POST /api/v1/invites/{token}/accept - Register via invite
		se.Router.POST("/api/v1/invites/{token}/accept", handleAcceptInvite)

		// POST /api/v1/register - User registration (without org)
		se.Router.POST("/api/v1/register", handleRegister)

		return se.Next()
	})
}

// handleCreateInvite creates a new invite link for an organization
func handleCreateInvite(e *core.RequestEvent) error {
	user := e.Auth
	if user == nil {
		return e.UnauthorizedError("Authentication required", nil)
	}

	orgId := e.Request.PathValue("id")
	if orgId == "" {
		return e.BadRequestError("Organization ID required", nil)
	}

	// Check if user is org owner/admin
	if !isOrgAdmin(e.App, user.Id, orgId) {
		return e.ForbiddenError(ErrNotOrgAdmin, nil)
	}

	var body struct {
		Role    string `json:"role"`
		MaxUses int    `json:"max_uses"`
	}

	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid request body", err)
	}

	// Validate role
	role := body.Role
	if role == "" {
		role = OrgRoleMember
	}
	if role != OrgRoleAdmin && role != OrgRoleMember {
		return e.BadRequestError(ErrInvalidInviteRole, nil)
	}

	// Set max uses
	maxUses := body.MaxUses
	if maxUses <= 0 {
		maxUses = InviteDefaultMaxUses
	}

	// Generate token
	token := security.RandomString(InviteTokenLength)

	// Calculate expiry
	expiresAt := time.Now().AddDate(0, 0, InviteExpirationDays)

	// Create invite record
	invitesCollection, err := e.App.FindCollectionByNameOrId(CollectionOrgInvites)
	if err != nil {
		return e.InternalServerError("Failed to find invites collection", err)
	}

	invite := core.NewRecord(invitesCollection)
	invite.Set("token", token)
	invite.Set("organization", orgId)
	invite.Set("role", role)
	invite.Set("max_uses", maxUses)
	invite.Set("uses_count", 0)
	invite.Set("expires_at", expiresAt.Format(time.RFC3339))
	invite.Set("created_by", user.Id)
	invite.Set("revoked", false)

	if err := e.App.Save(invite); err != nil {
		return e.InternalServerError(ErrFailedToCreateInvite, err)
	}

	return e.JSON(201, map[string]any{
		"invite": invite,
		"meta": map[string]any{
			"message": MsgInviteCreated,
		},
	})
}

// handleListInvites lists all invites for an organization
func handleListInvites(e *core.RequestEvent) error {
	user := e.Auth
	if user == nil {
		return e.UnauthorizedError("Authentication required", nil)
	}

	orgId := e.Request.PathValue("id")
	if orgId == "" {
		return e.BadRequestError("Organization ID required", nil)
	}

	// Check if user is org owner/admin
	if !isOrgAdmin(e.App, user.Id, orgId) {
		return e.ForbiddenError(ErrNotOrgAdmin, nil)
	}

	// Parse pagination params with defaults
	limit := 50
	offset := 0
	if l := e.Request.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}
	if o := e.Request.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	invites, err := e.App.FindRecordsByFilter(
		CollectionOrgInvites,
		"organization = {:orgId}",
		"-created",
		limit,
		offset,
		dbx.Params{"orgId": orgId},
	)
	if err != nil {
		return e.InternalServerError("Failed to fetch invites", err)
	}

	return e.JSON(200, map[string]any{
		"invites": invites,
		"limit":   limit,
		"offset":  offset,
	})
}

// handleRevokeInvite revokes an invite link
func handleRevokeInvite(e *core.RequestEvent) error {
	user := e.Auth
	if user == nil {
		return e.UnauthorizedError("Authentication required", nil)
	}

	orgId := e.Request.PathValue("id")
	inviteId := e.Request.PathValue("inviteId")

	if orgId == "" || inviteId == "" {
		return e.BadRequestError("Organization ID and Invite ID required", nil)
	}

	// Check if user is org owner/admin
	if !isOrgAdmin(e.App, user.Id, orgId) {
		return e.ForbiddenError(ErrNotOrgAdmin, nil)
	}

	invite, err := e.App.FindRecordById(CollectionOrgInvites, inviteId)
	if err != nil {
		return e.NotFoundError(ErrInviteNotFound, nil)
	}

	// Verify invite belongs to the org
	if invite.GetString("organization") != orgId {
		return e.NotFoundError(ErrInviteNotFound, nil)
	}

	invite.Set("revoked", true)
	if err := e.App.Save(invite); err != nil {
		return e.InternalServerError("Failed to revoke invite", err)
	}

	return e.JSON(200, map[string]any{
		"meta": map[string]any{
			"message": MsgInviteRevoked,
		},
	})
}

// handleGetInviteByToken gets invite info by token (public endpoint)
func handleGetInviteByToken(e *core.RequestEvent) error {
	token := e.Request.PathValue("token")
	if token == "" {
		return e.BadRequestError("Token required", nil)
	}

	invite, err := findValidInvite(e.App, token)
	if err != nil {
		return err
	}

	// Get organization info
	org, err := e.App.FindRecordById(CollectionOrganizations, invite.GetString("organization"))
	if err != nil {
		return e.InternalServerError("Failed to find organization", err)
	}

	return e.JSON(200, map[string]any{
		"invite": map[string]any{
			"role":       invite.GetString("role"),
			"expires_at": invite.GetString("expires_at"),
		},
		"organization": map[string]any{
			"id":   org.Id,
			"name": org.GetString("name"),
			"logo": org.GetString("logo"),
		},
	})
}

// handleAcceptInvite registers a new user via invite link
func handleAcceptInvite(e *core.RequestEvent) error {
	token := e.Request.PathValue("token")
	if token == "" {
		return e.BadRequestError("Token required", nil)
	}

	invite, err := findValidInvite(e.App, token)
	if err != nil {
		return err
	}

	var body struct {
		Email           string `json:"email"`
		Password        string `json:"password"`
		PasswordConfirm string `json:"passwordConfirm"`
	}

	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid request body", err)
	}

	email := strings.TrimSpace(strings.ToLower(body.Email))
	if email == "" || body.Password == "" {
		return e.BadRequestError("Email and password required", nil)
	}

	// Validate password confirmation
	if body.Password != body.PasswordConfirm {
		return e.BadRequestError("Passwords do not match", nil)
	}

	// Validate password length
	if len(body.Password) < 8 {
		return e.BadRequestError("Password must be at least 8 characters", nil)
	}
	if len(body.Password) > 72 {
		return e.BadRequestError("Password must be at most 72 characters", nil)
	}

	// Validate email length
	if len(email) > 254 {
		return e.BadRequestError("Email address is too long", nil)
	}

	// Check if email already exists
	existingUser, err := e.App.FindFirstRecordByFilter(
		CollectionUsers,
		"email = {:email}",
		dbx.Params{"email": email},
	)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return e.InternalServerError("Failed to check existing user", err)
	}
	if existingUser != nil {
		return e.BadRequestError(ErrEmailAlreadyRegistered, nil)
	}

	// Get organization
	org, err := e.App.FindRecordById(CollectionOrganizations, invite.GetString("organization"))
	if err != nil {
		return e.InternalServerError("Failed to find organization", err)
	}

	var newUser *core.Record
	err = e.App.RunInTransaction(func(txApp core.App) error {
		// Create user
		usersCollection, err := txApp.FindCollectionByNameOrId(CollectionUsers)
		if err != nil {
			return err
		}

		// Generate unique username with collision handling
		baseUsername := helpers.DeriveUsername(email)
		username := baseUsername
		usernameFound := false
		for i := 0; i < 5; i++ {
			existingUser, _ := txApp.FindFirstRecordByFilter(
				CollectionUsers,
				"username = {:username}",
				dbx.Params{"username": username},
			)
			if existingUser == nil {
				usernameFound = true
				break
			}
			username = fmt.Sprintf("%s_%s", baseUsername, security.RandomString(5))
		}
		if !usernameFound {
			return fmt.Errorf("failed to generate unique username after 5 attempts")
		}

		newUser = core.NewRecord(usersCollection)
		newUser.Set("email", email)
		newUser.Set("username", username)
		newUser.Set("password", body.Password)
		newUser.Set("role", RoleEmployee)
		newUser.Set("active", true)

		if err := txApp.Save(newUser); err != nil {
			return fmt.Errorf("failed to create user: %w", err)
		}

		// Create membership
		memberCollection, err := txApp.FindCollectionByNameOrId(CollectionOrgMembers)
		if err != nil {
			return err
		}

		member := core.NewRecord(memberCollection)
		member.Set("organization", invite.GetString("organization"))
		member.Set("user", newUser.Id)
		member.Set("role", invite.GetString("role"))
		member.Set("status", MemberStatusActive)
		member.Set("joined_at", time.Now().Format(time.RFC3339))
		member.Set("onboarding_completed", true) // Invited users skip onboarding

		if err := txApp.Save(member); err != nil {
			return fmt.Errorf("failed to create membership: %w", err)
		}

		// Increment uses count
		usesCount := invite.GetInt("uses_count")
		invite.Set("uses_count", usesCount+1)
		if err := txApp.Save(invite); err != nil {
			return fmt.Errorf("failed to update invite: %w", err)
		}

		// Send welcome notification (non-critical - don't fail registration if this fails)
		notificationsCollection, err := txApp.FindCollectionByNameOrId(CollectionNotifications)
		if err == nil {
			notification := core.NewRecord(notificationsCollection)
			notification.Set("user", newUser.Id)
			notification.Set("type", "system")
			notification.Set("title", fmt.Sprintf(MsgWelcomeToOrg, org.GetString("name")))
			notification.Set("message", fmt.Sprintf(MsgWelcomeToOrgDesc, org.GetString("name")))
			notification.Set("data", map[string]any{
				"organizationId": org.Id,
			})
			// Notification is non-critical - log error but don't fail the transaction
			if saveErr := txApp.Save(notification); saveErr != nil {
				txApp.Logger().Warn("Failed to save welcome notification", "user", newUser.Id, "err", saveErr)
			}
		}

		return nil
	})

	if err != nil {
		return e.InternalServerError(ErrFailedToCreateUser, err)
	}

	// Auto-login the user
	authToken, err := newUser.NewAuthToken()
	if err != nil {
		// Still return success even if token generation fails
		return e.JSON(201, map[string]any{
			"user": newUser,
			"meta": map[string]any{
				"message": MsgRegistrationSuccess,
			},
		})
	}

	return e.JSON(201, map[string]any{
		"user":  newUser,
		"token": authToken,
		"meta": map[string]any{
			"message": MsgRegistrationSuccess,
		},
	})
}

// handleRegister handles user registration (without organization)
func handleRegister(e *core.RequestEvent) error {
	var body struct {
		Email           string `json:"email"`
		Username        string `json:"username"`
		Password        string `json:"password"`
		PasswordConfirm string `json:"passwordConfirm"`
	}

	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid request body", err)
	}

	email := strings.TrimSpace(strings.ToLower(body.Email))
	username := strings.TrimSpace(body.Username)

	if email == "" || body.Password == "" {
		return e.BadRequestError("Email and password required", nil)
	}

	if username == "" {
		return e.BadRequestError("Username is required", nil)
	}

	// Validate username format
	if !regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(username) {
		return e.BadRequestError("Username can only contain letters, numbers, and underscores", nil)
	}

	if len(username) < 3 {
		return e.BadRequestError("Username must be at least 3 characters", nil)
	}
	if len(username) > 30 {
		return e.BadRequestError("Username must be at most 30 characters", nil)
	}

	// Validate password confirmation
	if body.Password != body.PasswordConfirm {
		return e.BadRequestError("Passwords do not match", nil)
	}

	// Validate password length
	if len(body.Password) < 8 {
		return e.BadRequestError("Password must be at least 8 characters", nil)
	}
	if len(body.Password) > 72 {
		return e.BadRequestError("Password must be at most 72 characters", nil)
	}

	// Validate email length
	if len(email) > 254 {
		return e.BadRequestError("Email address is too long", nil)
	}

	// Check if email already exists
	existingUser, err := e.App.FindFirstRecordByFilter(
		CollectionUsers,
		"email = {:email}",
		dbx.Params{"email": email},
	)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return e.InternalServerError("Failed to check existing user", err)
	}
	if existingUser != nil {
		return e.BadRequestError(ErrEmailAlreadyRegistered, nil)
	}

	// Check if username already exists
	existingUsername, err := e.App.FindFirstRecordByFilter(
		CollectionUsers,
		"username = {:username}",
		dbx.Params{"username": username},
	)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return e.InternalServerError("Failed to check existing username", err)
	}
	if existingUsername != nil {
		return e.BadRequestError("Username is already taken", nil)
	}

	// Create user
	usersCollection, err := e.App.FindCollectionByNameOrId(CollectionUsers)
	if err != nil {
		return e.InternalServerError("Failed to find users collection", err)
	}

	newUser := core.NewRecord(usersCollection)
	newUser.Set("email", email)
	newUser.Set("username", username)
	newUser.Set("password", body.Password)
	newUser.Set("role", RoleEmployee)
	newUser.Set("active", true)

	if err := e.App.Save(newUser); err != nil {
		return e.InternalServerError(ErrFailedToCreateUser, err)
	}

	// Auto-login the user
	authToken, err := newUser.NewAuthToken()
	if err != nil {
		return e.JSON(201, map[string]any{
			"user": newUser,
			"meta": map[string]any{
				"message": MsgRegistrationSuccess,
			},
		})
	}

	return e.JSON(201, map[string]any{
		"user":  newUser,
		"token": authToken,
		"meta": map[string]any{
			"message": MsgRegistrationSuccess,
		},
	})
}

// findValidInvite finds an invite by token and validates it
func findValidInvite(app core.App, token string) (*core.Record, error) {
	invite, err := app.FindFirstRecordByFilter(
		CollectionOrgInvites,
		"token = {:token}",
		dbx.Params{"token": token},
	)
	if err != nil || invite == nil {
		return nil, apis.NewNotFoundError(ErrInviteNotFound, nil)
	}

	// Check if revoked
	if invite.GetBool("revoked") {
		return nil, apis.NewBadRequestError(ErrInviteRevoked, nil)
	}

	// Check if expired
	expiresAt := invite.GetDateTime("expires_at")
	if expiresAt.Time().Before(time.Now()) {
		return nil, apis.NewBadRequestError(ErrInviteExpired, nil)
	}

	// Check if exhausted
	maxUses := invite.GetInt("max_uses")
	usesCount := invite.GetInt("uses_count")
	if maxUses > 0 && usesCount >= maxUses {
		return nil, apis.NewBadRequestError(ErrInviteExhausted, nil)
	}

	return invite, nil
}

// isOrgAdmin checks if a user is an owner or admin of an organization
func isOrgAdmin(app core.App, userId, orgId string) bool {
	membership, err := app.FindFirstRecordByFilter(
		CollectionOrgMembers,
		"user = {:userId} && organization = {:orgId} && (role = 'owner' || role = 'admin')",
		dbx.Params{"userId": userId, "orgId": orgId},
	)
	return err == nil && membership != nil
}
