// Package handlers provides HTTP request handlers for the Anjam API.
package handlers

import (
	"log"

	"anjam/config"
	"anjam/helpers"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

const (
	// ErrUserNotFound is returned when a user is not found
	ErrUserNotFound = "کاربر یافت نشد"
)

// userLoginLogRow represents a single login log entry
type userLoginLogRow struct {
	ID            string `db:"id" json:"id"`
	User          string `db:"user" json:"user"`
	IPAddress     string `db:"ip_address" json:"ip_address"`
	UserAgent     string `db:"user_agent" json:"user_agent"`
	Success       bool   `db:"success" json:"success"`
	FailureReason string `db:"failure_reason" json:"failure_reason"`
	Created       string `db:"created" json:"created"`
}

// HandleToggleUserActive toggles the active status of a user.
// Only admins can access this endpoint, and they cannot deactivate themselves or other admins.
func HandleToggleUserActive(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	authRecord, err := requireAdmin(e)
	if err != nil {
		return err
	}

	// Prevent admin from deactivating themselves
	if authRecord.Id == userId {
		return e.JSON(400, map[string]string{"error": config.ErrCannotDeactivateSelf})
	}

	user, err := helpers.FindRecordByIDOrJSON(e, config.CollectionUsers, userId, ErrUserNotFound)
	if err != nil {
		return err
	}

	// Prevent deactivating admin users
	if user.GetString("role") == config.RoleAdmin {
		return e.JSON(400, map[string]string{"error": config.ErrCannotDeactivateAdmin})
	}

	// Toggle active status
	currentActive := user.GetBool("active")
	newActive := !currentActive
	user.Set("active", newActive)

	if err := e.App.Save(user); err != nil {
		helpers.LogRecordError("toggling user active status", config.CollectionUsers, userId, err)
		return e.JSON(500, map[string]string{"error": config.ErrFailedToUpdateUserStatus})
	}

	return e.JSON(200, map[string]interface{}{
		"data": map[string]interface{}{
			"active": newActive,
		},
		"meta": map[string]interface{}{
			"message": func() string {
				if newActive {
					return config.MsgUserActivated
				}
				return config.MsgUserDeactivated
			}(),
		},
	})
}

// HandleUnblockUser unblocks a user who was blocked due to failed login attempts.
// Only admins can access this endpoint.
func HandleUnblockUser(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	_, err := requireAdmin(e)
	if err != nil {
		return err
	}

	user, err := helpers.FindRecordByIDOrJSON(e, config.CollectionUsers, userId, ErrUserNotFound)
	if err != nil {
		return err
	}

	// Unblock the user
	user.Set("blocked", false)
	user.Set("blocked_at", "")
	user.Set("blocked_reason", "")
	user.Set("failed_login_attempts", 0)

	if err := e.App.Save(user); err != nil {
		helpers.LogRecordError("unblocking user", config.CollectionUsers, userId, err)
		return e.JSON(500, map[string]string{"error": config.ErrFailedToUnblockUser})
	}

	return e.JSON(200, map[string]interface{}{
		"data": map[string]interface{}{},
		"meta": map[string]interface{}{
			"message": config.MsgUserUnblocked,
		},
	})
}

// HandleGetUserLoginLogs retrieves the login history for a user.
// Admins can view any user's logs, while regular users can only view their own.
func HandleGetUserLoginLogs(e *core.RequestEvent) error {
	userId := e.Request.PathValue("id")

	// Validate authentication
	authRecord, err := ValidateAuth(e)
	if err != nil {
		return err
	}

	// Check permissions: admin can view any user's logs, users can only view their own
	if !canViewLoginLogs(authRecord, userId) {
		return e.JSON(403, map[string]string{"error": config.ErrCannotViewOtherUserLogs})
	}

	pagination := parsePagination(e.Request)

	logs, totalCount, err := fetchUserLoginLogs(e.App, userId, pagination)
	if err != nil {
		log.Printf("Error fetching login logs for user %q: %v", userId, err)
		return e.JSON(500, map[string]string{"error": config.ErrFailedToGetLoginLogs})
	}

	return e.JSON(200, map[string]interface{}{
		"data": map[string]interface{}{
			"items": logs,
		},
		"meta": map[string]interface{}{
			"page":       pagination.Page,
			"perPage":    pagination.PerPage,
			"totalItems": totalCount,
			"totalPages": (totalCount + pagination.PerPage - 1) / pagination.PerPage,
		},
	})
}

// canViewLoginLogs checks if the authenticated user can view the login logs
// for the given user ID. Admins can view any user's logs, while regular users
// can only view their own.
func canViewLoginLogs(authRecord *core.Record, userId string) bool {
	role := authRecord.GetString("role")
	return role == config.RoleAdmin || authRecord.Id == userId
}

// fetchUserLoginLogs retrieves login logs for a user with pagination.
func fetchUserLoginLogs(app core.App, userId string, pagination PaginationParams) ([]userLoginLogRow, int, error) {
	var logs []userLoginLogRow
	offset := (pagination.Page - 1) * pagination.PerPage
	err := app.DB().NewQuery(`
		SELECT id, user, ip_address, user_agent, success, failure_reason, created
		FROM user_login_logs
		WHERE user = {:userId}
		ORDER BY created DESC
		LIMIT {:limit} OFFSET {:offset}
	`).Bind(dbx.Params{
		"userId": userId,
		"limit":  pagination.PerPage,
		"offset": offset,
	}).All(&logs)

	if err != nil {
		return nil, 0, err
	}

	var totalCount int
	err = app.DB().NewQuery(`
		SELECT COUNT(*) FROM user_login_logs WHERE user = {:userId}
	`).Bind(dbx.Params{"userId": userId}).Row(&totalCount)
	if err != nil {
		log.Printf("Error counting login logs for user %q: %v", userId, err)
		return nil, 0, err
	}

	return logs, totalCount, nil
}
