# Audit Logging & History System Plan

This plan details the implementation of a comprehensive audit logging system for the Task Manager application. The goal is to track all significant data changes (create, update, delete) to core entities (Tasks, Projects, Users) to ensure accountability, recoverability, and compliance.

## 1. Architecture Choice: SQLite Collection (`audit_logs`)

We will store audit logs directly in a new PocketBase collection named `audit_logs`.

- **Reasoning**:
  - **Simplicity**: Keeps the "Single Binary" architecture intact. No external logging service required.
  - **Queryability**: Allows the Admin UI (and future user-facing activity logs) to easily filter and search history using standard PocketBase APIs.
  - **Performance**: SQLite WAL mode in PocketBase handles append-heavy workloads efficiently.

## 2. Technical Implementation (Go Backend)

### 2.1 Database Schema (`audit_logs`)

New collection `audit_logs`:

- `id` (text, PK)
- `created` (date)
- `actor` (relation -> `users`): Who performed the action (nullable for system actions).
- `ip_address` (text): IP address of the actor.
- `resource` (text): Collection name (e.g., "tasks", "projects").
- `resource_id` (text): ID of the affected record.
- `action` (text): "create", "update", "delete".
- `changes` (json): Detailed diff of what changed from `old` to `new`.
  - Format: `{"field_name": {"old": "val", "new": "val"}}`

_ACL Rules_:

- **List/View**: Admin only (initially).
- **Create/Update/Delete**: System only (`null`). Immutable by design.

### 2.2 Go Hook Logic

We will implement a reusable Go function `registerAuditHooks(app, collectionName)` that binds to:

1.  **`OnRecordAfterCreateSuccess`**: Logs the initial state.
2.  **`OnRecordBeforeUpdate` & `OnRecordAfterUpdateSuccess`**:
    - _Before_: Capture the `Original()` record state.
    - _After_: Compare `Original()` vs `New` state to generate a diff.
    - Only log if there are actual changes.
3.  **`OnRecordAfterDeleteSuccess`**: Logs the final state before deletion.

**Diff Calculation logic**:

- Iterate over defined fields.
- Ignore specific system fields (e.g., `updated`, `tokenKey`).
- Store strictly typed values in the JSON blob.

### 2.3 Integration Points

- **Entities to Track**: `tasks`, `projects`, `users`, `groups`.
- **Location**: `backend/audit.go` (new file) called from `main.go`.

## 3. Frontend Implementation (React Admin UI)

### 3.1 Audit Log View (Admin Settings)

- **Table**:
  - Columns: Timestamp, Actor, Action, Resource (Type + ID), Changes (Expandable).
  - Filters: Date Range, Actor, Resource Type.

### 3.2 "History" Tab (Task/Project Details)

- **Task Detail Modal**: Add a "History" tab.
- **Fetch Logic**: Query `audit_logs` where `resource="tasks"` AND `resource_id={currentTaskId}`.
- **Display**: Activity stream UI (e.g., "Mohammad changed Status from 'Todo' to 'In Progress' - 2 hours ago").

## 4. Implementation Steps

### Phase 1: Backend Foundation

- [ ] Create `audit_logs` collection definition in `pb_schema.json`.
- [ ] Create `backend/audit.go`.
- [ ] Implement `calculateChanges(old, new)` helper.
- [ ] Implement `logAudit(app, event)` helper.
- [ ] Register hooks in `main.go` for `tasks` and `projects`.

### Phase 2: Frontend Visualization

- [ ] Create `AuditLogService` in frontend API client.
- [ ] Add `AuditLogTable` component for Admin Dashboard.
- [ ] Add `ActivityStream` component for Task/Project views.

### Phase 3: Refinement

- [ ] Track `users` and `groups` collections.
- [ ] Add "System" actor for automatic actions (e.g., GitHub Sync).
- [ ] Optimize JSON storage (store only changed fields).

## 5. Security & Performance

- **Retention**: Implement a cron job (future) to archive/delete logs older than 1 year to keep SQLite size manageable.
- **Privacy**: Ensure sensitive fields (like `password` hash) are **never** logged in the `changes` JSON. Explicitly exclude them in the diff logic.
