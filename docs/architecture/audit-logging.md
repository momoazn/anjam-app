# Audit Logging & History System Plan

This plan details the implementation of a comprehensive audit logging system for the Anjam application. The goal is to track all significant data changes (create, update, delete) to core entities (Tasks, Projects, Users) to ensure accountability, recoverability, and compliance.

## 1. Architecture Choice: Convex Table (`audit_logs`)

We will store audit logs directly in a new Convex table named `audit_logs`.

- **Reasoning**:
  - **Simplicity**: Keeps to a unified backend architecture. No external logging service required.
  - **Queryability**: Allows the Admin UI (and future user-facing activity logs) to easily filter and search history using standard Convex queries.
  - **Performance**: Convex's optimized backend handles append-heavy workloads efficiently.
  - **Durability controls**: Access controls enforced at the function level ensures immutability.

## 2. Technical Implementation (Convex)

### 2.1 Database Schema (`audit_logs`)

New table `audit_logs` (system-managed, history-only):

- `created`: Number (Unix timestamp)
- `actor`: Id (Reference to `users`): Who performed the action (optional for system actions).
- `actor_role`: Text: Cached role at action time.
- `actor_type`: Text enum: `user`, `system`, `api_token`.
- `request_id`: Text: Correlates to incoming HTTP request (UUID generated per request; reused when multiple functions execute).
- `ip_address`: Text: IP address of the actor when available; `null` if not request-bound.
- `client`: Text enum: `web`, `cli`, `automation`, etc. for additional provenance.
- `resource`: Text: Table name (e.g., "tasks", "projects").
- `resource_id`: Id: ID of the affected record.
- `action`: Text enum: `create`, `update`, `delete`.
- `result`: Text enum: `success`, `failure` (future-proof if we log denied writes).
- `message`: Text: Optional free-form summary (e.g., "Status changed").
- `changes`: Object: Detailed diff `{ "field_name": { "old": any, "new": any } }` storing typed values only for modified fields.

_Access Control_:

- **List/View**: Admin-only for now; future scopes can loosen per requirement.
- **Create**: Only trusted Convex functions can insert audit logs.
- **Update/Delete**: Not allowed; functions will return error if attempted.

### 2.2 Convex Function Logic

We will implement audit logging as part of mutation functions in Convex:

1. **Create Mutations**: After successfully creating a record, write an audit log entry.
2. **Update Mutations**:
   - Fetch the existing record before updating.
   - Compare original vs new; skip log when diff is empty.
   - After update, write audit log if there were changes.
3. **Delete Mutations**:
   - Fetch the record before deleting.
   - After delete, write audit log with captured state.

Audit log entries will be enriched with:

- `actor` and `actor_role` extracted from auth context if available.
- `ip_address` from request metadata when available (for actions called from frontend).
- `request_id` generated per request to correlate multiple audit entries.
- `client` derived from user agent or context.

All audit inserts go through a dedicated helper `logAudit(ctx, entry)` that catches write errors, logs them, and never blocks the main mutation (fail-open) while emitting structured warnings for observability.

**Diff Calculation**:

- Iterate only over whitelisted field definitions to avoid logging transient or internal columns.
- Maintain a denylist for sensitive fields (`password`, `token`, `accessKey`, `oauth_secret`).
- Detect equality using type-aware comparisons for numbers, booleans, IDs, and arrays.
- Truncate large strings (>2 KB) and file names to avoid bloating records.

### 2.3 Integration Points

- **Tracked Tables (Phase 1)**: `tasks`, `projects`.
- **Phase 2 Additions**: `users`, `groups`, `comments`, `organization_members`, `project_members` once performance validated.
- **Location & Wiring**: `convex/audit.ts` defines helpers; audit logging functions are called from relevant mutation functions.
- **Context Management**: Each mutation function extracts request metadata (request ID, actor info, client) from Convex auth context.

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

- [ ] Add `audit_logs` table to Convex schema with new fields described above.
- [ ] Create `convex/audit.ts` housing diff helpers and `logAudit` function.
- [ ] Add helper functions to extract request metadata from auth context.
- [ ] Integrate audit logging into mutation functions for `tasks` and `projects`.

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

- **Retention & Archival**: Introduce `audit_retention_days` setting (default 365). Scheduled Convex action dumps logs older than retention to storage and then deletes them.
- **Tamper Detection**: Because logs live in the same database, consider periodic signed exports to object storage (future). Document manual verification steps.
- **Sensitive Field Policy**: Maintain central denylist plus per-table overrides (e.g., task `private_notes`). Unit tests ensure diffs never include banned keys.
- **Error Handling**: `logAudit` errors are logged with `request_id` correlation. Monitor audit log failures for health signals.
- **Performance**: Monitor `audit_logs` table size and ensure proper indexes on `(resource, resource_id, created)` and `(actor, created)`.
