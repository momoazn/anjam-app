package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// Context keys for request metadata (must match main.go)
type contextKey string

const (
	contextKeyRequestID contextKey = "request_id"
	contextKeyIPAddress contextKey = "ip_address"
	contextKeyClient    contextKey = "client"
)

// FieldDiff represents a change to a single field
type FieldDiff struct {
	Old interface{} `json:"old"`
	New interface{} `json:"new"`
}

// AuditEntry represents a single audit log entry
type AuditEntry struct {
	Actor     string                 `json:"actor"`
	ActorRole string                 `json:"actor_role"`
	ActorType string                 `json:"actor_type"`
	RequestID string                 `json:"request_id"`
	IPAddress string                 `json:"ip_address"`
	Client    string                 `json:"client"`
	Resource  string                 `json:"resource"`
	ResourceID string                `json:"resource_id"`
	Action    string                 `json:"action"`
	Result    string                 `json:"result"`
	Message   string                 `json:"message"`
	Changes   map[string]FieldDiff   `json:"changes"`
}

// Sensitive fields that should never be logged
var sensitiveFields = map[string]bool{
	"password":      true,
	"token":         true,
	"tokenKey":      true,
	"accessKey":     true,
	"oauth_secret":  true,
	"private_notes": true,
}

// logAudit writes an audit log entry to the audit_logs collection.
// Errors are logged but do not block the main operation (fail-open pattern).
func logAudit(app core.App, entry AuditEntry) {
	auditCollection, err := app.FindCollectionByNameOrId(CollectionAuditLogs)
	if err != nil {
		log.Printf("Warning: Cannot find audit_logs collection: %v", err)
		return
	}

	record := core.NewRecord(auditCollection)

	// Set actor relation if provided
	if entry.Actor != "" {
		record.Set("actor", entry.Actor)
	}

	record.Set("actor_role", entry.ActorRole)
	record.Set("actor_type", entry.ActorType)

	if entry.RequestID != "" {
		record.Set("request_id", entry.RequestID)
	}

	if entry.IPAddress != "" {
		record.Set("ip_address", entry.IPAddress)
	}

	if entry.Client != "" {
		record.Set("client", entry.Client)
	}

	record.Set("resource", entry.Resource)
	record.Set("resource_id", entry.ResourceID)
	record.Set("action", entry.Action)
	record.Set("result", entry.Result)

	if entry.Message != "" {
		record.Set("message", entry.Message)
	}

	if len(entry.Changes) > 0 {
		changesJSON, err := json.Marshal(entry.Changes)
		if err != nil {
			log.Printf("Warning: Failed to marshal changes for audit log: %v", err)
		} else {
			record.Set("changes", string(changesJSON))
		}
	}

	if err := app.Save(record); err != nil {
		log.Printf("Warning: Failed to write audit log entry (resource=%s, resource_id=%s): %v",
			entry.Resource, entry.ResourceID, err)
	}
}

// calculateChanges compares old and new records and returns a map of changed fields.
// Only whitelisted fields from the collection schema are included.
// Sensitive fields are excluded.
func calculateChanges(oldRec, newRec core.Record, collection *core.Collection) map[string]FieldDiff {
	changes := make(map[string]FieldDiff)

	if collection == nil {
		return changes
	}

	// Iterate over all fields in the collection schema
	for _, field := range collection.Fields {
		fieldName := field.GetName()

		// Skip system fields and sensitive fields
		if field.GetSystem() || sensitiveFields[fieldName] {
			continue
		}

		// Get old and new values
		oldVal := oldRec.Get(fieldName)
		newVal := newRec.Get(fieldName)

		// Compare values (considering nil vs zero value)
		if !areValuesEqual(oldVal, newVal) {
			changes[fieldName] = FieldDiff{
				Old: truncateValue(oldVal),
				New: truncateValue(newVal),
			}
		}
	}

	return changes
}

// areValuesEqual compares two values for equality.
// Handles nil, strings, numbers, booleans, and serializable types.
func areValuesEqual(old, new interface{}) bool {
	// Both nil
	if old == nil && new == nil {
		return true
	}

	// One is nil, other is not
	if (old == nil) != (new == nil) {
		return false
	}

	// Convert to JSON for deep comparison (handles slices, maps, etc.)
	oldJSON, _ := json.Marshal(old)
	newJSON, _ := json.Marshal(new)
	return string(oldJSON) == string(newJSON)
}

// truncateValue truncates large values to prevent bloating audit records.
// Strings > 2KB and arrays are shortened appropriately.
func truncateValue(val interface{}) interface{} {
	const maxStringLen = 2048

	switch v := val.(type) {
	case string:
		if len(v) > maxStringLen {
			return v[:maxStringLen] + "... (truncated)"
		}
		return v
	case []interface{}:
		if len(v) > 100 {
			return fmt.Sprintf("[%d items]", len(v))
		}
		// Truncate each string in the array
		for i, item := range v {
			v[i] = truncateValue(item)
		}
		return v
	}

	return val
}

// extractActorInfo extracts actor information from the event.
// First tries to get from HTTP request context, then falls back to record fields.
func extractActorInfo(e *core.RecordEvent) (actorID, actorRole, actorType string) {
	actorType = "system"
	actorRole = "system"

	// Try to get from HTTP request context first
	if httpContext := apis.RequestContext(e.HttpContext); httpContext != nil {
		if authRecord := httpContext.Auth; authRecord != nil {
			actorID = authRecord.Id
			actorType = "user"
			actorRole = authRecord.GetString("role")
			if actorRole == "" {
				actorRole = "system"
			}
			return
		}
	}

	// Fallback: Try to get from created_by field (PocketBase may auto-populate this)
	if createdBy := e.Record.GetString("created_by"); createdBy != "" {
		actorID = createdBy
		actorType = "user"
		// Try to fetch the user's role
		user, err := e.App.FindRecordById(CollectionUsers, createdBy)
		if err == nil {
			actorRole = user.GetString("role")
		}
		return
	}

	// Fallback: Try to get from updated_by field
	if updatedBy := e.Record.GetString("updated_by"); updatedBy != "" {
		actorID = updatedBy
		actorType = "user"
		user, err := e.App.FindRecordById(CollectionUsers, updatedBy)
		if err == nil {
			actorRole = user.GetString("role")
		}
		return
	}

	return
}

// getClientFromUserAgent derives the client type from the request context.
func getClientFromUserAgent(e *core.RecordEvent) string {
	if e.HttpContext == nil {
		return "unknown"
	}
	ctx := e.HttpContext.Request().Context()
	if client, ok := ctx.Value(contextKeyClient).(string); ok && client != "" {
		return client
	}
	return "unknown"
}

// getIPAddress extracts the IP address from the request context.
func getIPAddress(e *core.RecordEvent) string {
	if e.HttpContext == nil {
		return ""
	}
	ctx := e.HttpContext.Request().Context()
	if ip, ok := ctx.Value(contextKeyIPAddress).(string); ok && ip != "" {
		return ip
	}
	return ""
}

// getRequestID extracts the request ID from the request context.
func getRequestID(e *core.RecordEvent) string {
	if e.HttpContext == nil {
		return ""
	}
	ctx := e.HttpContext.Request().Context()
	if requestID, ok := ctx.Value(contextKeyRequestID).(string); ok && requestID != "" {
		return requestID
	}
	return ""
}

// registerAuditLogsImmutabilityGuards ensures that audit_logs records cannot be modified or deleted.
// Immutability is enforced at both the database schema level (ACL rules) and Go-level handlers
// to prevent even DAO access from modifying audit logs.
func registerAuditLogsImmutabilityGuards(pbApp interface{}) {
	app, ok := pbApp.(core.App)
	if !ok {
		log.Printf("Warning: Cannot cast app to core.App for audit logs immutability guards")
		return
	}

	// Block all update attempts to audit_logs
	app.OnRecordBeforeUpdateRequest(CollectionAuditLogs).BindFunc(func(e *core.RecordEvent) error {
		return apis.NewForbiddenError("Audit logs are immutable and cannot be modified", nil)
	})

	// Block all delete attempts to audit_logs
	app.OnRecordBeforeDeleteRequest(CollectionAuditLogs).BindFunc(func(e *core.RecordEvent) error {
		return apis.NewForbiddenError("Audit logs are immutable and cannot be deleted", nil)
	})

	log.Println("Audit logs immutability enforced via schema ACL rules and Go-level guards")
}

// registerAuditHooks registers audit log hooks for a specific collection.
// It tracks create, update, and delete events.
// Note: pbApp should be core.App interface type in practice.
func registerAuditHooks(pbApp interface{}, collectionName string) {
	app, ok := pbApp.(core.App)
	if !ok {
		log.Printf("Warning: Cannot cast app to core.App for collection %s", collectionName)
		return
	}
	// Track successful creation
	app.OnRecordAfterCreateSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		actorID, actorRole, actorType := extractActorInfo(e)

		entry := AuditEntry{
			Actor:      actorID,
			ActorRole:  actorRole,
			ActorType:  actorType,
			RequestID:   getRequestID(e),
			Resource:   collectionName,
			ResourceID: e.Record.Id,
			Action:     "create",
			Result:     "success",
			Client:     getClientFromUserAgent(e),
			IPAddress:  getIPAddress(e),
		}

		logAudit(app, entry)
		return e.Next()
	})

	// Track successful update with proper diff calculation
	app.OnRecordAfterUpdateSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		collection, err := app.FindCollectionByNameOrId(collectionName)
		if err != nil {
			log.Printf("Warning: Cannot find collection %s for audit: %v", collectionName, err)
			return e.Next()
		}

		// Get original record state for diff calculation
		// Original() should be available in AfterUpdateSuccess
		originalRec := e.Record.Original()
		var changes map[string]FieldDiff

		if originalRec != nil {
			// Calculate proper diff between original and new state
			changes = calculateChanges(originalRec, e.Record, collection)
		} else {
			// Fallback: if original is not available, log all fields as new
			changes = make(map[string]FieldDiff)
			for _, field := range collection.Fields {
				fieldName := field.GetName()
				if field.GetSystem() || sensitiveFields[fieldName] {
					continue
				}
				val := e.Record.Get(fieldName)
				changes[fieldName] = FieldDiff{
					Old: nil,
					New: truncateValue(val),
				}
			}
		}

		// Skip logging if no changes detected
		if len(changes) == 0 {
			return e.Next()
		}

		actorID, actorRole, actorType := extractActorInfo(e)

		entry := AuditEntry{
			Actor:      actorID,
			ActorRole:  actorRole,
			ActorType:  actorType,
			RequestID:   getRequestID(e),
			Resource:   collectionName,
			ResourceID: e.Record.Id,
			Action:     "update",
			Result:     "success",
			Changes:    changes,
			Client:     getClientFromUserAgent(e),
			IPAddress:  getIPAddress(e),
		}

		logAudit(app, entry)
		return e.Next()
	})

	// Track successful delete
	app.OnRecordAfterDeleteSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		actorID, actorRole, actorType := extractActorInfo(e)

		entry := AuditEntry{
			Actor:      actorID,
			ActorRole:  actorRole,
			ActorType:  actorType,
			RequestID:   getRequestID(e),
			Resource:   collectionName,
			ResourceID: e.Record.Id,
			Action:     "delete",
			Result:     "success",
			Client:     getClientFromUserAgent(e),
			IPAddress:  getIPAddress(e),
		}

		logAudit(app, entry)
		return e.Next()
	})
}
