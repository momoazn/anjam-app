// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
package hooks

import (
	"anjam/config"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// HandleAuthRequest handles authentication requests and validates user status.
// This handler runs on authentication attempts (OnRecordAuthWithPasswordRequest).
func HandleAuthRequest(e *core.RecordAuthWithPasswordRequestEvent) error {
	user := e.Record
	if user == nil {
		return e.Next()
	}

	// Check if user is active
	if !user.GetBool("active") {
		return apis.NewBadRequestError(config.ErrUserInactive, nil)
	}

	// Check if user is blocked
	if user.GetBool("blocked") {
		blockedReason := user.GetString("blocked_reason")
		if blockedReason == "" {
			blockedReason = config.ErrUserBlocked
		}
		return apis.NewBadRequestError(blockedReason, nil)
	}

	// Check if user has verified their email
	if !user.GetBool("verified") {
		return apis.NewBadRequestError("Please verify your email first. Check your inbox for the verification email.", nil)
	}

	return e.Next()
}
