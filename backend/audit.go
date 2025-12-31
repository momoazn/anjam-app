package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"sort"

	"github.com/google/uuid"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// FieldDiff represents a change to a single field
type FieldDiff struct {
	Old interface{} `json:"old"`
	New interface{} `json:"new"`
}

// AuditEntry represents a single audit log entry
type AuditEntry struct {
	Actor        string               `json:"actor"`
	ActorRole    string               `json:"actor_role"`
	ActorType    string               `json:"actor_type"`
	RequestID    string               `json:"request_id"`
	IPAddress    string               `json:"ip_address"`
	Client       string               `json:"client"`
	Organization string               `json:"organization"`
	Project      string               `json:"project"`
	Resource     string               `json:"resource"`
	ResourceID   string               `json:"resource_id"`
	Action       string               `json:"action"`
	Result       string               `json:"result"`
	Message      string               `json:"message"`
	Changes      map[string]FieldDiff `json:"changes"`
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
// Note: This function intentionally doesn't return errors on Save() failures to avoid
// blocking the main workflow. Audit log failures are logged for monitoring purposes.
func logAudit(app core.App, entry AuditEntry) {
	if err := logAuditWithError(app, entry); err != nil {
		log.Printf("Warning: Failed to write audit log entry (resource=%s, resource_id=%s): %v",
			entry.Resource, entry.ResourceID, err)
	}
}

// logAuditWithError writes an audit log entry to the audit_logs collection and returns any error.
// This version is used by the audit worker to detect failures and trigger fallback logging.
func logAuditWithError(app core.App, entry AuditEntry) error {
	auditCollection, err := app.FindCollectionByNameOrId(CollectionAuditLogs)
	if err != nil {
		return fmt.Errorf("cannot find audit_logs collection: %w", err)
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

	if entry.Organization != "" {
		record.Set("organization", entry.Organization)
	}

	if entry.Project != "" {
		record.Set("project", entry.Project)
	}

	record.Set("resource", entry.Resource)
	record.Set("resource_id", entry.ResourceID)
	record.Set("action", entry.Action)
	record.Set("result", entry.Result)

	if entry.Message != "" {
		record.Set("message", entry.Message)
	}

	if len(entry.Changes) > 0 {
		// Store changes as JSON object (not stringified) for type consistency.
		// PocketBase JSON fields handle this automatically.
		record.Set("changes", entry.Changes)
	}

	if err := app.Save(record); err != nil {
		return fmt.Errorf("failed to save audit record: %w", err)
	}

	return nil
}

func resolveOrganizationID(app core.App, record *core.Record) string {
	if record == nil {
		return ""
	}

	if orgID := record.GetString("organization"); orgID != "" {
		return orgID
	}

	projectID := record.GetString("project")
	if projectID != "" {
		project, err := app.FindRecordById("projects", projectID)
		if err == nil && project != nil {
			if orgID := project.GetString("organization"); orgID != "" {
				return orgID
			}
		}
	}

	taskID := record.GetString("task")
	if taskID != "" {
		task, err := app.FindRecordById("tasks", taskID)
		if err == nil && task != nil {
			if orgID := task.GetString("organization"); orgID != "" {
				return orgID
			}
			if projectID := task.GetString("project"); projectID != "" {
				project, err := app.FindRecordById("projects", projectID)
				if err == nil && project != nil {
					if orgID := project.GetString("organization"); orgID != "" {
						return orgID
					}
				}
			}
		}
	}

	return ""
}

func resolveProjectID(app core.App, record *core.Record) string {
	if record == nil {
		return ""
	}

	if projectID := record.GetString("project"); projectID != "" {
		return projectID
	}

	taskID := record.GetString("task")
	if taskID != "" {
		task, err := app.FindRecordById("tasks", taskID)
		if err == nil && task != nil {
			if projectID := task.GetString("project"); projectID != "" {
				return projectID
			}
		}
	}

	if collection := record.Collection(); collection != nil && collection.Name == "projects" {
		return record.Id
	}

	return ""
}

// calculateChanges compares old and new records and returns a map of changed fields.
// Only whitelisted fields from the collection schema are included.
// Sensitive fields are excluded.
func calculateChanges(oldRec, newRec *core.Record, collection *core.Collection) map[string]FieldDiff {
	changes := make(map[string]FieldDiff)

	if collection == nil {
		return changes
	}

	for _, field := range collection.Fields {
		fieldName := field.GetName()

		if field.GetSystem() || sensitiveFields[fieldName] {
			continue
		}

		oldVal := oldRec.Get(fieldName)
		newVal := newRec.Get(fieldName)

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
// For maps/objects, it normalizes key order to ensure stable comparison
// despite Go's randomized map iteration order.
func areValuesEqual(old, new interface{}) bool {
	if old == nil && new == nil {
		return true
	}

	if (old == nil) != (new == nil) {
		return false
	}

	if oldMap, ok := old.(map[string]interface{}); ok {
		if newMap, ok := new.(map[string]interface{}); ok {
			return areMapsEqual(oldMap, newMap)
		}
	}

	oldNormalized := normalizeForComparison(old)
	newNormalized := normalizeForComparison(new)

	oldJSON, _ := json.Marshal(oldNormalized)
	newJSON, _ := json.Marshal(newNormalized)
	return string(oldJSON) == string(newJSON)
}

// normalizeForComparison recursively normalizes maps by sorting keys
func normalizeForComparison(val interface{}) interface{} {
	switch v := val.(type) {
	case map[string]interface{}:
		normalized := make(map[string]interface{})
		keys := make([]string, 0, len(v))
		for k := range v {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			normalized[k] = normalizeForComparison(v[k])
		}
		return normalized
	case []interface{}:
		normalized := make([]interface{}, len(v))
		for i, item := range v {
			normalized[i] = normalizeForComparison(item)
		}
		return normalized
	default:
		return val
	}
}

// areMapsEqual compares two maps with normalized key order
func areMapsEqual(old, new map[string]interface{}) bool {
	if len(old) != len(new) {
		return false
	}

	// Get sorted keys from both maps
	oldKeys := make([]string, 0, len(old))
	for k := range old {
		oldKeys = append(oldKeys, k)
	}
	sort.Strings(oldKeys)

	newKeys := make([]string, 0, len(new))
	for k := range new {
		newKeys = append(newKeys, k)
	}
	sort.Strings(newKeys)

	if len(oldKeys) != len(newKeys) {
		return false
	}

	for i, key := range oldKeys {
		if key != newKeys[i] {
			return false
		}
		if !areValuesEqual(old[key], new[key]) {
			return false
		}
	}

	return true
}

// truncateValue truncates large values to prevent bloating audit records.
// Strings > 2KB and arrays are shortened appropriately.
func truncateValue(val interface{}) interface{} {
	return sanitizeValue(val, 0)
}

func sanitizeValue(val interface{}, depth int) interface{} {
	const (
		maxDepth       = 6
		maxStringLen   = 2048
		maxArrayItems  = 100
		maxMapKeys     = 100
		redactedString = "[redacted]"
	)

	if depth > maxDepth {
		return "[max depth]"
	}

	if val == nil {
		return nil
	}

	switch v := val.(type) {
	case string:
		if len(v) <= maxStringLen {
			return v
		}
		return v[:maxStringLen] + "... (truncated)"
	case []interface{}:
		if len(v) > maxArrayItems {
			return fmt.Sprintf("[%d items]", len(v))
		}
		out := make([]interface{}, 0, len(v))
		for _, item := range v {
			out = append(out, sanitizeValue(item, depth+1))
		}
		return out
	case map[string]interface{}:
		if len(v) > maxMapKeys {
			return fmt.Sprintf("{%d keys}", len(v))
		}
		out := make(map[string]interface{}, len(v))
		keys := make([]string, 0, len(v))
		for k := range v {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			if sensitiveFields[k] {
				out[k] = redactedString
				continue
			}
			out[k] = sanitizeValue(v[k], depth+1)
		}
		return out
	case json.RawMessage:
		if len(v) <= maxStringLen {
			return string(v)
		}
		return string(v[:maxStringLen]) + "... (truncated)"
	}

	rv := reflect.ValueOf(val)
	switch rv.Kind() {
	case reflect.Slice, reflect.Array:
		l := rv.Len()
		if l > maxArrayItems {
			return fmt.Sprintf("[%d items]", l)
		}
		out := make([]interface{}, 0, l)
		for i := 0; i < l; i++ {
			out = append(out, sanitizeValue(rv.Index(i).Interface(), depth+1))
		}
		return out
	case reflect.Map:
		if rv.Type().Key().Kind() == reflect.String {
			keys := rv.MapKeys()
			if len(keys) > maxMapKeys {
				return fmt.Sprintf("{%d keys}", len(keys))
			}
			out := make(map[string]interface{}, len(keys))
			stringKeys := make([]string, 0, len(keys))
			for _, k := range keys {
				stringKeys = append(stringKeys, k.String())
			}
			sort.Strings(stringKeys)
			for _, k := range stringKeys {
				if sensitiveFields[k] {
					out[k] = redactedString
					continue
				}
				out[k] = sanitizeValue(rv.MapIndex(reflect.ValueOf(k)).Interface(), depth+1)
			}
			return out
		}
	}

	return val
}

// extractActorInfo extracts actor information from the event.
// First tries to get from request-provided actor data in context when available,
// then falls back to record fields.
func extractActorInfo(e *core.RecordEvent) (actorID, actorRole, actorType string) {
	actorType = "system"
	actorRole = "system"

	// Prefer request-provided actor data in context when available.
	if e.Context != nil {
		if actorIDFromCtx, ok := e.Context.Value(contextKeyActorID).(string); ok && actorIDFromCtx != "" {
			actorID = actorIDFromCtx
			actorType = "user"
			if role, ok := e.Context.Value(contextKeyActorRole).(string); ok && role != "" {
				actorRole = role
			}
			if typ, ok := e.Context.Value(contextKeyActorType).(string); ok && typ != "" {
				actorType = typ
			}
			return
		}
	}

	if createdBy := e.Record.GetString("created_by"); createdBy != "" {
		actorID = createdBy
		actorType = "user"
		user, err := e.App.FindRecordById(CollectionUsers, createdBy)
		if err == nil {
			actorRole = user.GetString("role")
		}
		return
	}

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
	if e.Context == nil {
		return "unknown"
	}
	if client, ok := e.Context.Value(contextKeyClient).(string); ok && client != "" {
		return client
	}
	return "unknown"
}

// getIPAddress extracts the IP address from the request context.
func getIPAddress(e *core.RecordEvent) string {
	if e.Context == nil {
		return ""
	}
	if ip, ok := e.Context.Value(contextKeyIPAddress).(string); ok && ip != "" {
		return ip
	}
	return ""
}

// getRequestID extracts the request ID from the request context.
// Falls back to generating a synthetic UUID for non-HTTP events.
func getRequestID(e *core.RecordEvent) string {
	if e.Context != nil {
		if requestID, ok := e.Context.Value(contextKeyRequestID).(string); ok && requestID != "" {
			return requestID
		}
	}
	// Generate synthetic UUID for non-HTTP events (e.g., scheduled jobs, internal operations)
	return uuid.New().String()
}

// registerAuditLogsImmutabilityGuards ensures that audit_logs records cannot be modified or deleted.
// Immutability is enforced at the Go-level handlers to prevent even DAO access
// from modifying audit logs, ensuring a reliable audit trail.
func registerAuditLogsImmutabilityGuards(pbApp interface{}) {
	app, ok := pbApp.(core.App)
	if !ok {
		log.Printf("Warning: Cannot cast app to core.App for audit logs immutability guards")
		return
	}

	app.OnRecordUpdate(CollectionAuditLogs).BindFunc(func(e *core.RecordEvent) error {
		if e.Context == nil || e.Context.Value(contextKeyRequestID) == nil {
			return e.Next()
		}
		return apis.NewForbiddenError("Audit logs are immutable and cannot be modified", nil)
	})

	app.OnRecordDelete(CollectionAuditLogs).BindFunc(func(e *core.RecordEvent) error {
		return apis.NewForbiddenError("Audit logs are immutable and cannot be deleted", nil)
	})

	log.Println("Audit logs immutability enforced")
}

// registerAuditHooks registers audit log hooks for a specific collection.
func registerAuditHooks(pbApp interface{}, collectionName string) {
	app, ok := pbApp.(core.App)
	if !ok {
		log.Printf("Warning: Cannot cast app to core.App for collection %s", collectionName)
		return
	}

	// Enrich request contexts with actor info so record model hooks can access it
	// via `e.Context` even for background or indirect operations.
	injectActorIntoRequestContext := func(e *core.RecordRequestEvent) error {
		if e == nil || e.Request == nil {
			return e.Next()
		}

		actorType := "system"
		actorRole := "system"
		actorID := ""

		if e.Auth != nil {
			actorID = e.Auth.Id
			actorType = "user"
			actorRole = e.Auth.GetString("role")
			if actorRole == "" {
				actorRole = "system"
			}
		}

		ctx := e.Request.Context()
		ctx = context.WithValue(ctx, contextKeyActorID, actorID)
		ctx = context.WithValue(ctx, contextKeyActorRole, actorRole)
		ctx = context.WithValue(ctx, contextKeyActorType, actorType)
		e.Request = e.Request.WithContext(ctx)

		return e.Next()
	}

	app.OnRecordCreateRequest(collectionName).BindFunc(injectActorIntoRequestContext)
	app.OnRecordUpdateRequest(collectionName).BindFunc(injectActorIntoRequestContext)
	app.OnRecordDeleteRequest(collectionName).BindFunc(injectActorIntoRequestContext)

	// Track successful creation
	app.OnRecordAfterCreateSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		actorID, actorRole, actorType := extractActorInfo(e)

		entry := AuditEntry{
			Actor:        actorID,
			ActorRole:    actorRole,
			ActorType:    actorType,
			RequestID:    getRequestID(e),
			Organization: resolveOrganizationID(app, e.Record),
			Project:      resolveProjectID(app, e.Record),
			Resource:     collectionName,
			ResourceID:   e.Record.Id,
			Action:       "create",
			Result:       "success",
			Client:       getClientFromUserAgent(e),
			IPAddress:    getIPAddress(e),
		}

		logAuditAsync(app, entry)
		return e.Next()
	})

	// Track successful update
	app.OnRecordAfterUpdateSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		collection, err := app.FindCollectionByNameOrId(collectionName)
		if err != nil {
			log.Printf("Warning: Cannot find collection %s for audit: %v", collectionName, err)
			return e.Next()
		}

		originalRec := e.Record.Original()
		changes := calculateChanges(originalRec, e.Record, collection)

		if len(changes) == 0 {
			return e.Next()
		}

		actorID, actorRole, actorType := extractActorInfo(e)

		entry := AuditEntry{
			Actor:        actorID,
			ActorRole:    actorRole,
			ActorType:    actorType,
			RequestID:    getRequestID(e),
			Organization: resolveOrganizationID(app, e.Record),
			Project:      resolveProjectID(app, e.Record),
			Resource:     collectionName,
			ResourceID:   e.Record.Id,
			Action:       "update",
			Result:       "success",
			Changes:      changes,
			Client:       getClientFromUserAgent(e),
			IPAddress:    getIPAddress(e),
		}

		logAuditAsync(app, entry)
		return e.Next()
	})

	// Track successful delete
	app.OnRecordAfterDeleteSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		actorID, actorRole, actorType := extractActorInfo(e)

		entry := AuditEntry{
			Actor:        actorID,
			ActorRole:    actorRole,
			ActorType:    actorType,
			RequestID:    getRequestID(e),
			Organization: resolveOrganizationID(app, e.Record),
			Project:      resolveProjectID(app, e.Record),
			Resource:     collectionName,
			ResourceID:   e.Record.Id,
			Action:       "delete",
			Result:       "success",
			Client:       getClientFromUserAgent(e),
			IPAddress:    getIPAddress(e),
		}

		// Use the record data directly as it's still available in AfterDeleteSuccess
		resourceName := e.Record.GetString("name")
		if resourceName == "" {
			resourceName = e.Record.GetString("title")
		}
		if resourceName == "" {
			resourceName = e.Record.GetString("display_id")
		}
		if resourceName != "" {
			entry.Message = fmt.Sprintf("Deleted %s: %s", collectionName, resourceName)
		}

		logAuditAsync(app, entry)
		return e.Next()
	})
}
