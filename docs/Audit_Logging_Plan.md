# Audit Logging & History System Plan

This plan details the implementation of a comprehensive audit logging system for the Task Manager application. The goal is to track all significant data changes (create, update, delete) to core entities (Tasks, Projects, Users) to ensure accountability, recoverability, and compliance.

## 1. Architecture Choice: SQLite Collection (`audit_logs`)

We will store audit logs directly in a new PocketBase collection named `audit_logs`.

- **Reasoning**:
  - **Simplicity**: Keeps the "Single Binary" architecture intact. No external logging service required.
  - **Queryability**: Allows the Admin UI (and future user-facing activity logs) to easily filter and search history using standard PocketBase APIs.
  - **Performance**: SQLite WAL mode in PocketBase handles append-heavy workloads efficiently.
  - **Durability controls**: Collection-level rule blocking user writes plus a `BeforeUpdate` guard in Go ensures immutability even for DAO access.

## 2. Technical Implementation (Go Backend)

### 2.1 Database Schema (`audit_logs`)

New collection `audit_logs` (system-managed, history-only):

- `id` (text, PK)
- `created` (date)
- `actor` (relation -> `users`): Who performed the action (nullable for system actions).
- `actor_role` (text): Cached role at action time.
- `actor_type` (text enum: `user`, `system`, `api_token`).
- `request_id` (text): Correlates to incoming HTTP request (UUID generated per request; reused when multiple hooks fire).
- `ip_address` (text): IP address of the actor when available; `null` if not request-bound.
- `client` (text enum: `web`, `cli`, `automation`, etc.) for additional provenance.
- `resource` (text): Collection name (e.g., "tasks", "projects").
- `resource_id` (text): ID of the affected record.
- `action` (text enum): `create`, `update`, `delete`.
- `result` (text enum): `success`, `failure` (future-proof if we log denied writes).
- `message` (text): Optional free-form summary (e.g., "Status changed").
- `changes` (json): Detailed diff `{ "field_name": { "old": any, "new": any } }` storing typed values only for modified fields.

_ACL & Immutability Rules_:

- **List/View**: Admin-only rule now; future scopes can loosen per requirement.
- **Create**: Blocked at rule level; only trusted Go service account uses DAO to insert.
- **Update/Delete**: Deny at rule level **and** register `OnRecordBeforeUpdateRequest("audit_logs")` and `OnRecordBeforeDeleteRequest("audit_logs")` handlers to abort with `apis.NewForbiddenError` to catch DAO misuse.

### 2.2 Go Hook Logic

We will implement a reusable helper `registerAuditHooks(app *pocketbase.PocketBase, collectionName string)` that binds to exact PocketBase events:

1. **`OnRecordAfterCreateSuccess(collection)`**: Capture the persisted record and write a log entry.
2. **`OnRecordBeforeUpdateRequest(collection)` / `OnRecordAfterUpdateSuccess(collection)`**:
   - _Before_: Clone `e.Record.Original()` so we have a snapshot even if multiple hooks mutate state.
   - _After_: Compare original vs new; skip log when diff is empty.
3. **`OnRecordBeforeDeleteRequest(collection)` / `OnRecordAfterDeleteSuccess(collection)`**:
   - _Before_: Copy the record for final-state logging since PocketBase empties record data after delete.
   - _After_: Persist the captured state with action `delete`.

`registerAuditHooks` will enrich each log entry with:

- `actor` and `actor_role` extracted from `apis.RequestContext(e.HttpContext)` if available; otherwise fall back to `e.Record.GetString("updated_by")` or a `system` actor id.
- `ip_address` from `e.HttpContext.RealIP()` when non-empty; `null` otherwise.
- `request_id` from context value set by middleware (`contextKeyRequestID`), generating one per HTTP request and defaulting to a synthetic UUID when hooks fire outside HTTP.
- `client` derived from `User-Agent` heuristics.

All audit inserts go through a dedicated helper `logAudit(ctx, app, entry)` that catches write errors, logs them, and never blocks the main mutation (fail-open) while emitting structured warnings for observability. A future enhancement may enqueue entries to a buffered channel so writes cannot slow user requests; helper is designed with that swap in mind.

**Diff Calculation** (`calculateChanges(oldRec, newRec core.Record) map[string]FieldDiff`):

- Iterate only over whitelisted, typed field definitions from PocketBase schema metadata to avoid logging transient or internal columns.
- Maintain a denylist for sensitive fields (`password`, `token`, `accessKey`, `oauth_secret`, attachments flagged `sensitive` in schema).
- Detect equality using type-aware comparisons for numbers, booleans, relations (serialize as IDs), and arrays (use deep-equal with ordering preserved).
- Truncate large strings (>2 KB) and file names to avoid bloating records.

### 2.3 Integration Points

- **Tracked Collections (Phase 1)**: `tasks`, `projects`.
- **Phase 2 Additions**: `users`, `groups`, `comments`, `users_projects` once performance validated.
- **Location & Wiring**: `backend/audit.go` defines helpers; `main.go` calls `registerAuditHooks` during `OnServe()` after schema import so collection names exist.
- **Context Middleware**: In `main.go`, add `app.OnServe().BindFunc(addRequestMetadataMiddleware)` that injects request ID, actor info, and client data into context for downstream hooks.

## 3. Frontend Implementation (React Admin UI)

### 3.1 Admin Audit Console

- **Permissions**: Restrict route to `role === 'admin'` for now; design component to accept an authorization predicate so we can later expose limited history to project managers.
- **Table**:
  - Columns: Timestamp, Actor (name + role), Action, Resource (type + ID), Client, Message.
  - Changes column collapsed by default with an accordion showing field-level diffs.
  - Built-in pagination (cursor-based) and TanStack Query caching; default page size 50.
- **Filters**: Date range picker, actor multi-select, resource type select, free-text search on message/request ID.
- **Redaction**: The API will already filter sensitive fields, but UI must also replace masked values with `••••` to avoid accidental exposure during rendering.

### 3.2 Entity "History" Tabs

- **Entry Point**: Tab label "History" with badge showing count of entries for quick discoverability; tab only rendered when user has access.
- **Task & Project Views**: Tab uses `AuditLogService.list({ resource: 'tasks', resourceId })` sorted descending and supports infinite scroll so users can scan long timelines.
- **Timeline UI**: Left-aligned vertical timeline with icons per action (`create`, `update`, `delete`). Each card surfaces actor avatar, clear summary sentence, relative time, and expands inline to show field-level diffs.
- **Empty State**: Friendly illustration + text "No history yet" plus hint about what triggers entries; never show spinner forever.
- **Row Rendering**: Natural-language template (`{{actor}} changed {{field}} from {{old}} to {{new}}`) with tooltip for exact timestamp; old/new values truncated with tooltip for long text.
- **Filters**: Local filters (e.g., action type dropdown, actor pill filters) scoped to the current resource so users can hone in on relevant changes without leaving the tab.
- **Permissions**: Reuse admin predicate or extend to project members once requirements finalized; component takes `canViewHistory` prop to guard fetch and conditionally render redacted values when viewer lacks full access.

## 4. Implementation Steps

### Phase 1: Backend Foundation

- [ ] Add `audit_logs` collection to `pb_schema.json` with new fields/ACL described above.
- [ ] Add immutability guards (`BeforeUpdate`/`BeforeDelete`) for `audit_logs` in Go.
- [ ] Create `backend/audit.go` housing diff helpers, request-metadata structs, and `logAudit`.
- [ ] Add middleware for request IDs + context metadata.
- [ ] Register hooks for `tasks` and `projects` inside `main.go` after schema import.

### Phase 2: Frontend Visualization

- [ ] Create `AuditLogService` with typed responses, pagination helpers, and sensitive-field masks.
- [ ] Build `AuditLogTable` admin component with filters, pagination, and redaction UI.
- [ ] Add `ActivityStream` tab to Task/Project detail modules guarded by `canViewHistory` prop.

### Phase 3: Refinement

- [ ] Expand hooks to `users`, `groups`, `comments`, and `users_projects` after monitoring DB growth.
- [ ] Add explicit `system` actor records for automation jobs (GitHub sync, cron cleanup).
- [ ] Switch `logAudit` to buffered channel + worker for async writes if latency measurements warrant it.
- [ ] Implement configurable retention (see §5) with archive export.

## 5. Security, Retention & Privacy

- **Retention & Archival**: Introduce `audit_retention_days` setting (default 365). Nightly scheduled job (Go cron) dumps logs older than retention to compressed NDJSON in `data/audit_archive/{year}/{month}.ndjson` and then deletes them. Deletions run via DAO with service account credentials to bypass UI rules but still respect immutability hooks (temporarily disable guards inside the job by flag).
- **Tamper Detection**: Because logs live next to mutable data, enable SQLite `auto_vacuum` and ship weekly signed exports to object storage (future). Document manual verification steps.
- **Sensitive Field Policy**: Maintain central denylist plus per-collection overrides (e.g., task `private_notes`). Unit tests in `backend/audit_test.go` ensure diffs never include banned keys.
- **Error Handling**: `logAudit` errors are logged with `request_id` correlation. Prometheus counter `audit_log_failures_total` exposes health signal.
- **Performance**: WAL mode already enabled; monitor `audit_logs` table size and add indexes on `(resource, resource_id, created)` and `(actor, created)`.
