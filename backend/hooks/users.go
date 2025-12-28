// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
package hooks

import (
	"github.com/pocketbase/pocketbase/core"
)

// HandleUserCreation sets default values for new users and enforces admin-only mutations.
// This handler runs before record creation (OnRecordCreateExecute).
//
// RBAC validations are handled by schema rules:
// - Only admins can list/create/delete users (enforced by list/create/delete rules)
// - Users can update their own record (enforced by updateRule)
// - Organization membership controls visibility, so even org admins cannot read users from other tenants
// This handler focuses on setting defaults and data integrity.
func HandleUserCreation(e *core.RecordEvent) error {
	// Set new users as active by default
	if e.Record.Get("active") == nil {
		e.Record.Set("active", true)
	}
	// Initialize failed login attempts to 0
	if e.Record.Get("failed_login_attempts") == nil {
		e.Record.Set("failed_login_attempts", 0)
	}
	// Set blocked to false by default
	if e.Record.Get("blocked") == nil {
		e.Record.Set("blocked", false)
	}
	return e.Next()
}
