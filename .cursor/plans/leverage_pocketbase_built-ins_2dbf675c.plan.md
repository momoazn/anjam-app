---
name: Leverage PocketBase Built-ins
overview: Refactor custom code to use PocketBase's built-in capabilities for validation, unique constraints, and realtime features. Focus on practical improvements that reduce maintenance without breaking existing functionality.
todos:
  - id: add-unique-indexes
    content: Add unique indexes for projects.code and tasks.display_id in schema
    status: completed
  - id: simplify-audit-snapshots
    content: Remove redundant sync.Map snapshots, use Record.Original() consistently
    status: completed
  - id: add-realtime-broadcast
    content: Add NotifyRecord() calls after notification creation for instant delivery
    status: completed
  - id: simplify-notification-validation
    content: Remove redundant user existence check (relation validation handles it)
    status: completed
  - id: use-requestinfo-auth
    content: Replace custom actor extraction with RequestInfo().Auth where possible
    status: cancelled
---

# Leverage PocketBase Built-in Capabilities (Validated Plan)

After validation, this plan focuses on **practical, low-risk improvements** that leverage PocketBase built-ins without breaking existing functionality.

## Validation Findings

### What Works Well (Keep As-Is)

1. **Custom Audit Logging** - Required for business compliance; PocketBase's `_logs` is for system/debug logs, not field-level audit trails
2. **Login Blocking Logic** - Business requirement; `onlyVerified` serves a different purpose (email verification)
3. **Task Display ID Generation** - Requires project-specific prefix (`ABC-001`); cannot use `autogeneratePattern`
4. **Custom Search Endpoint** - Multi-collection search with unified response; frontend already uses it
5. **Realtime Subscriptions** - Already implemented in [`src/hooks/notifications.ts`](src/hooks/notifications.ts) lines 31-56

### What Can Be Improved

---

## 1. Add Unique Indexes (High Impact, Low Risk)

**Current State**: No unique indexes on `projects.code` or `tasks.display_id`

- Manual collision detection with 100-retry loop in Go
- No database-level guarantee of uniqueness

**Schema Change** in [`backend/pb_schema.json`](backend/pb_schema.json):

```json
// For projects collection (around line 1340):
"indexes": [
  "CREATE UNIQUE INDEX idx_projects_code ON projects (code)"
]

// For tasks collection (around line 1660):
"indexes": [
  "CREATE UNIQUE INDEX idx_tasks_display_id ON tasks (display_id)"
]
```

**Benefit**: Database enforces uniqueness; simplifies Go code; prevents race conditions

---

## 2. Simplify Audit Snapshot Logic (Medium Impact, Low Risk)

**Current State** in [`backend/audit.go`](backend/audit.go):

- Uses `sync.Map` for update/delete snapshots (lines 490-514, 573-587)
- Captures snapshots in both `OnRecordUpdate` AND `OnRecordUpdateExecute`
- Complex key generation with request ID

**Improvement**: PocketBase's `Record.Original()` already provides pre-update state

```go
// Current (redundant):
app.OnRecordUpdate(collectionName).BindFunc(captureUpdateSnapshot)
app.OnRecordUpdateExecute(collectionName).BindFunc(captureUpdateSnapshot)

// Simplified:
app.OnRecordAfterUpdateSuccess(collectionName).BindFunc(func(e *core.RecordEvent) error {
    original := e.Record.Original() // Built-in, no sync.Map needed
    changes := calculateChanges(original, e.Record, collection)
    // ...
})
```

**Files**: [`backend/audit.go`](backend/audit.go) - Remove ~60 lines of snapshot management

---

## 3. Add Realtime Notification Broadcasting (Medium Impact, Low Risk)

**Current State**: Notifications saved to DB, frontend polls via realtime subscription

- [`src/hooks/notifications.ts`](src/hooks/notifications.ts) already subscribes to changes
- Backend creates records but doesn't explicitly broadcast

**Enhancement** in [`backend/main.go`](backend/main.go) `createNotification()`:

```go
func createNotification(app core.App, userId, notificationType, title, message string, data map[string]interface{}) error {
    // ... existing record creation ...

    if err := app.Save(record); err != nil {
        return fmt.Errorf("cannot create notification: %w", err)
    }

    // NEW: Explicitly notify subscribers for instant delivery
    app.RealtimeServer().NotifyRecord(record)

    return nil
}
```

**Benefit**: Instant notification delivery without waiting for SSE reconnection

---

## 4. Simplify Notification User Validation (Low Impact, Low Risk)

**Current State** in [`backend/main.go`](backend/main.go) lines 746-756:

```go
// Redundant check - relation field validation handles this
_, err := app.FindRecordById(CollectionUsers, userId)
if err != nil {
    return fmt.Errorf("cannot create notification: user %s not found: %w", userId, err)
}
```

**Improvement**: The `user` relation field in notifications collection already validates that the user exists. Remove manual check.

---

## 5. Use RequestInfo for Actor Extraction (Low Impact, Medium Risk)

**Current State** in [`backend/audit.go`](backend/audit.go) `extractActorInfo()`:

- Custom context keys for actor ID/role/type
- Falls back to record fields (`created_by`, `updated_by`)

**Improvement**: Use `e.RequestInfo()` directly in hooks where available:

```go
// Instead of custom context injection:
func extractActorInfo(e *core.RecordEvent) (actorID, actorRole, actorType string) {
    if e.RequestInfo != nil && e.RequestInfo.Auth != nil {
        return e.RequestInfo.Auth.Id,
               e.RequestInfo.Auth.GetString("role"),
               "user"
    }
    // ... fallback logic ...
}
```

**Note**: Keep custom context keys for non-HTTP operations (cron jobs, internal calls)

---

## What NOT to Change (Validated Decisions)

| Feature | Reason to Keep |

|---------|----------------|

| Project code generation | `autogeneratePattern` only supports random patterns, not 3-letter uppercase codes with collision retry |

| Task display_id generation | Requires project prefix lookup (`ABC-001` format) |

| Login attempt tracking | Business requirement; PocketBase's `onlyVerified` is for email verification, not blocking |

| Custom `user_login_logs` | Separate from PocketBase's `_logs`; stores structured login history |

| Custom `audit_logs` | Field-level change tracking not available in PocketBase's built-in logs |

| Search endpoint | Multi-collection unified search; frontend depends on current API shape |

| Request metadata middleware | Needed for audit correlation; `request_id` is business requirement |

---

## Implementation Order

1. **Phase 1 (Safe)**: Add unique indexes to schema
2. **Phase 2 (Safe)**: Add `NotifyRecord()` call for instant notifications
3. **Phase 3 (Safe)**: Remove redundant user validation in `createNotification`
4. **Phase 4 (Careful)**: Simplify audit snapshot logic
5. **Phase 5 (Optional)**: Refactor actor extraction to use RequestInfo

---

## Files to Modify

| File | Changes |

|------|---------|

| [`backend/pb_schema.json`](backend/pb_schema.json) | Add unique indexes for `projects.code`, `tasks.display_id` |

| [`backend/main.go`](backend/main.go) | Add `NotifyRecord()`, remove user validation check |

| [`backend/audit.go`](backend/audit.go) | Remove sync.Map snapshots, use `Record.Original()` |

---

## Expected Benefits

- **~80 lines removed** from audit.go (snapshot management)
- **~10 lines removed** from main.go (redundant validation)
- **Instant notifications** via realtime broadcast
- **Database-level uniqueness** for codes/IDs (prevents race conditions)
- **No breaking changes** to frontend or API contracts
