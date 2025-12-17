package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"sort"
	"sync"

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

func auditSnapshotKey(collectionName, recordID string, ctx context.Context) string {
	if ctx == nil {
		return fmt.Sprintf("%s:%s", collectionName, recordID)
	}
	if requestID, ok := ctx.Value(contextKeyRequestID).(string); ok && requestID != "" {
		return fmt.Sprintf("%s:%s:%s", collectionName, recordID, requestID)
	}
	return fmt.Sprintf("%s:%s", collectionName, recordID)
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
		// Store changes as JSON object (not stringified) for type consistency
		// PocketBase JSON fields handle this automatically
		record.Set("changes", entry.Changes)
	}

	if err := app.Save(record); err != nil {
		log.Printf("Warning: Failed to write audit log entry (resource=%s, resource_id=%s): %v",
			entry.Resource, entry.ResourceID, err)
	}
}

// calculateChanges compares old and new records and returns a map of changed fields.
// Only whitelisted fields from the collection schema are included.
// Sensitive fields are excluded.
func calculateChanges(oldRec, newRec *core.Record, collection *core.Collection) map[string]FieldDiff {
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
// For maps/objects, normalizes key order to ensure stable comparison.
func areValuesEqual(old, new interface{}) bool {
	// Both nil
	if old == nil && new == nil {
		return true
	}

	// One is nil, other is not
	if (old == nil) != (new == nil) {
		return false
	}

	// For maps, normalize key order before comparison to avoid false positives
	// due to Go's randomized map iteration order
	if oldMap, ok := old.(map[string]interface{}); ok {
		if newMap, ok := new.(map[string]interface{}); ok {
			return areMapsEqual(oldMap, newMap)
		}
	}

	// Convert to JSON for deep comparison (handles slices, maps, etc.)
	// For maps, we normalize first to ensure deterministic ordering
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
// First tries to get from HTTP request context, then falls back to record fields.
func extractActorInfo(e *core.RecordEvent) (actorID, actorRole, actorType string) {
	actorType = "system"
	actorRole = "system"

	// Prefer request-provided actor data when available.
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
// Immutability is enforced at both the database schema level (ACL rules) and Go-level handlers
// to prevent even DAO access from modifying audit logs.
func registerAuditLogsImmutabilityGuards(pbApp interface{}) {
	app, ok := pbApp.(core.App)
	if !ok {
		log.Printf("Warning: Cannot cast app to core.App for audit logs immutability guards")
		return
	}

	// Block all update attempts to audit_logs (both request and DAO paths).
	app.OnRecordUpdate(CollectionAuditLogs).BindFunc(func(e *core.RecordEvent) error {
		return apis.NewForbiddenError("Audit logs are immutable and cannot be modified", nil)
	})

	// Block all delete attempts to audit_logs (both request and DAO paths).
	app.OnRecordDelete(CollectionAuditLogs).BindFunc(func(e *core.RecordEvent) error {
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

	// Enrich request contexts with actor info so record model hooks can access it via `e.Context`.
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

	// Capture original record state before update for reliable diff calculation
	// Use sync.Map for thread-safe access across concurrent requests
	var updateSnapshots sync.Map

	captureUpdateSnapshot := func(e *core.RecordEvent) error {
		// Capture record state BEFORE any modifications (as per plan)
		// In OnRecordUpdate/OnRecordUpdateExecute, e.Record contains NEW values, Original() contains OLD values
		// We capture the OLD state (via Original()) for diff calculation in AfterUpdateSuccess
		// Store by collection+id to avoid collisions
		key := auditSnapshotKey(collectionName, e.Record.Id, e.Context)
		// Get the original state before this update
		originalRec := e.Record.Original()
		if originalRec != nil {
			// Create a deep copy via JSON serialization to avoid reference issues
			// This captures the "before" state that will be compared in AfterUpdateSuccess
			beforeJSON, err := originalRec.MarshalJSON()
			if err == nil {
				updateSnapshots.Store(key, beforeJSON)
			}
		} else {
			// Fallback: if Original() is not available, serialize current record
			// (though this should rarely happen in BeforeUpdateRequest)
			beforeJSON, err := e.Record.MarshalJSON()
			if err == nil {
				updateSnapshots.Store(key, beforeJSON)
			}
		}
		return e.Next()
	}

	// Capture snapshots for both API requests and internal/DAO updates.
	app.OnRecordUpdate(collectionName).BindFunc(captureUpdateSnapshot)
	app.OnRecordUpdateExecute(collectionName).BindFunc(captureUpdateSnapshot)

	// Track successful update with proper diff calculation
	app.OnRecordAfterUpdateSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		collection, err := app.FindCollectionByNameOrId(collectionName)
		if err != nil {
			log.Printf("Warning: Cannot find collection %s for audit: %v", collectionName, err)
			return e.Next()
		}

		// Retrieve the snapshot captured before update
		key := auditSnapshotKey(collectionName, e.Record.Id, e.Context)
		snapshotValue, hadSnapshot := updateSnapshots.LoadAndDelete(key)
		
		var changes map[string]FieldDiff
		var originalRec *core.Record

		if hadSnapshot {
			if originalJSON, ok := snapshotValue.([]byte); ok {
				// Deserialize the snapshot to recreate the original record
				snapshotRecord := core.NewRecord(collection)
				if err := snapshotRecord.UnmarshalJSON(originalJSON); err == nil {
					originalRec = snapshotRecord
				}
			}
		}

		// Only use snapshot - don't fall back to Original() here.
		// If snapshot is unavailable, log the update without field-level changes.
		if originalRec == nil {
			log.Printf("Warning: No snapshot available for update audit of %s:%s, skipping diff", collectionName, e.Record.Id)
			// Still log the update but without field-level changes.
			changes = make(map[string]FieldDiff)
		} else {
			// Calculate proper diff between original and new state
			changes = calculateChanges(originalRec, e.Record, collection)
		}

		// Skip logging only when we have a reliable snapshot and the diff is empty.
		// When snapshot is missing we still record the update for traceability.
		if originalRec != nil && len(changes) == 0 {
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

		if originalRec == nil {
			entry.Message = "Updated (diff unavailable)"
		}

		logAudit(app, entry)
		return e.Next()
	})

	// Capture record state before delete (PocketBase clears record data after delete)
	// Use sync.Map for thread-safe access across concurrent requests
	var deleteSnapshots sync.Map
	
	// Capture for both request and non-request delete paths
	captureDeleteSnapshot := func(e *core.RecordEvent) error {
		// Serialize the record to create a deep copy for audit logging
		// Store by collection+id to avoid collisions
		key := auditSnapshotKey(collectionName, e.Record.Id, e.Context)
		recordJSON, err := e.Record.MarshalJSON()
		if err == nil {
			deleteSnapshots.Store(key, recordJSON)
		}
		return e.Next()
	}
	
	app.OnRecordDelete(collectionName).BindFunc(captureDeleteSnapshot)
	app.OnRecordDeleteExecute(collectionName).BindFunc(captureDeleteSnapshot)

	// Track successful delete
	app.OnRecordAfterDeleteSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
		actorID, actorRole, actorType := extractActorInfo(e)

		// Retrieve the snapshot captured before delete
		key := auditSnapshotKey(collectionName, e.Record.Id, e.Context)
		snapshotValue, hadSnapshot := deleteSnapshots.LoadAndDelete(key)
		
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

		// Use snapshot to include resource identifier in message
		if hadSnapshot {
			if snapshotJSON, ok := snapshotValue.([]byte); ok {
				// Deserialize snapshot to extract resource name/identifier
				collection, err := app.FindCollectionByNameOrId(collectionName)
				if err == nil {
					snapshotRecord := core.NewRecord(collection)
					if err := snapshotRecord.UnmarshalJSON(snapshotJSON); err == nil {
						// Extract resource name/identifier for message
						resourceName := snapshotRecord.GetString("name")
						if resourceName == "" {
							resourceName = snapshotRecord.GetString("title")
						}
						if resourceName == "" {
							resourceName = snapshotRecord.GetString("display_id")
						}
						if resourceName != "" {
							entry.Message = fmt.Sprintf("Deleted %s: %s", collectionName, resourceName)
						}
					}
				}
			}
		}

		logAudit(app, entry)
		return e.Next()
	})
}
