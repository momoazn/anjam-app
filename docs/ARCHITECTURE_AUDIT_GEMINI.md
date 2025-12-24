# Architectural Audit & Redesign Roadmap

## Executive Summary

This document outlines the architectural transition of the Task Manager App from a concept "Group-based" model to a scalable, multi-tenant B2B SaaS platform suitable for startup teams. The proposed design introduces a robust hierarchy (Organization > Workspace > Project), a granular RBAC system, and scalable task modeling to support growth up to and beyond 20 users per tenant.

---

## 1. Hierarchy & Multi-Tenancy Analysis

### Current State

- **Model**: `Group > Project > Task`.
- **User Relation**: Users are directly tied to a single `Group` via a `group` field in the user record.
- **Limitations**:
  - **Rigid Isolation**: A user belongs to only one "Group". Cross-collaboration between groups is impossible without account duplication.
  - **Scalability**: "Group" is overloaded. It acts as both the Tenant (Billing Unit) and the Team (Functional Unit), which breaks down as teams grow.

### Proposed Model: Organization > Workspace > Project

- **Organization (Tenant)**: The billing entity and security boundary. Owns all data.
  - _Example_: "Acme Corp".
- **Workspace (Functional Context)**: Sub-units for departments or cross-functional squads.
  - _Example_: "Engineering", "Marketing", "Q1 Sprint".
- **Project (Work Container)**: Specific initiatives with defined goals and tasks.
  - _Example_: "Website Redesign", "Mobile App Launch".

### Rationale for Change

| Feature            | Current "Group" Model                                 | Proposed "Org > Workspace" Model                                                                                |
| :----------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **Multi-Tenancy**  | Weak. Users are locked to one group.                  | Strong. Users can belong to multiple Organizations using the same identity (if global) or distinct identities.  |
| **Data Isolation** | Simple but rigid.                                     | Flexible. Workspace-level isolation allows "Guest" access to specific projects without exposing the entire Org. |
| **Reporting**      | Limited to Group scope.                               | Cross-workspace reporting (e.g., "All tasks assigned to me across Engineering and Product") becomes possible.   |
| **Growth**         | Hard limit. Splitting a team requires migrating data. | Fluid. A Project can move between Workspaces; Workspaces can grow within an Org.                                |

**Recommendation**: **Adopt the Hierarchical Model.** It is essential for B2B SaaS where "teams of teams" usage patterns emerge rapidly (e.g., a 20-person startup has ~3 distinct sub-teams).

---

## 2. Database Schema Redesign (PocketBase)

### 2.1 Multi-Tenancy & RBAC

**Problem**: Current roles (`admin`, `manager`, `supervisor`, `employee`) are hardcoded enum values. This is brittle and mocks production reality where custom granular permissions are needed.

**Proposed Schema**:

1.  **`organizations`**: `id`, `name`, `owner_id`, `plan_tier`.
2.  **`workspaces`**: `id`, `org_id`, `name`.
3.  **`roles`** (Global or Org-scoped): `id`, `name`, `permissions` (JSON: `{"task.create": true, "project.delete": false}`).
4.  **`memberships`** (The Pivot Table):
    - `user_id`
    - `entity_id` (Polymorphic: OrgID or WorkspaceID)
    - `entity_type` ("organization", "workspace")
    - `role_id`

**Access Control Logic**:

- **Owner**: Full access to Organization.
- **Admin**: High-level Org access management.
- **Member**: Standard access (can create tasks/projects).
- **Guest**: Restricted access (read-only or specific project write).

### 2.2 Scalable Task Modeling

**Problem**: Hardcoded statuses (`todo`, `in_progress`) and lack of subtasks.

**Proposed Schema**:

1.  **`task_statuses`**:
    - `id`, `project_id` (or `workspace_id` for shared templates), `name`, `color`, `order`, `category` (Category maps to: TODO, DOING, DONE for reporting).
2.  **`tasks`**:
    - `...basic_fields`
    - `parent_id`: Self-reference for infinite subtask depth.
    - `path`: Materialized path string (e.g., `/root/child/grandchild`) for efficient tree queries.
    - `custom_fields`: JSON field for dynamic attributes (e.g., "Story Points", "Due Date" if not standard).
    - `tags`: JSON array of strings or relation to a `tags` collection.
3.  **`tags`**:
    - `id`, `workspace_id`, `name`, `color`.

### 2.3 Collaboration Engine

**Feature Requirements**:

- **Audit Logs**: "Who did what and when".
- **Activity Stream**: "User X commented on Task Y".
- **Notifications**: Real-time alerts.

**Proposed Schema**:

1.  **`activities`** (Polymorphic Log):
    - `id`, `actor_id`, `action` (e.g., "created", "commented", "moved"), `entity_type` ("task", "project"), `entity_id`, `payload` (JSON: `{"old_status": "todo", "new_status": "done"}`), `created_at`.
2.  **`comments`**:
    - `id`, `task_id`, `author_id`, `content` (Rich Text), `mentions` (JSON Array of user_ids), `parent_id` (Thread support).
3.  **`notifications`**:
    - `id`, `recipient_id`, `actor_id`, `type`, `entity_id`, `read_at`.

### 2.4 Performance & Integrity

- **Latency**: The "single-user" logic likely fetches all tasks in one go.
  - _Fix_: Implement **Keyset Pagination** (Cursor-based) for task lists.
- **Integrity**:
  - _Fix_: Use **Soft Deletes** (`deleted_at` timestamp) for all core entities (`tasks`, `projects`) to allow recovery and maintain audit history.
  - _Fix_: Ensure transactional integrity for complex actions (e.g., moving a task affecting sort order of others).

---

## 3. Structural Solutions for Common Weaknesses

| Weakness                 | Solution                                                                                                                                                                                             |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rigid State Machines** | Do not hardcode "ToDo -> Done". Use `category` (Open, Active, Closed) for business logic, but allow users to define `statuses` within those categories.                                              |
| **Notification Spam**    | Implement a **Notification Dispatcher** service/worker. It aggregates events (e.g., "User X made 5 updates") into a single digestive notification if they happen within a short window (Debouncing). |
| **Lack of Batch Ops**    | Design API endpoints for bulk actions (`tasks/batch-update`, `tasks/batch-delete`). This is critical for productivity.                                                                               |
| **Slow Search**          | Offload search to a dedicated full-text index if SQLite struggles, or usage specialized FTS5 virtual tables in SQLite for tasks and comments.                                                        |

---

## 4. Technical Roadmap

### Phase 1: Foundation (Weeks 1-2)

- [ ] **Refactor Database**: Migrate to the new "Org > Workspace" schema.
- [ ] **Data Migration**: Write scripts to move existing "Group" data to "Organization" structure.
- [ ] **Auth Update**: Update JWT/Session logic to handle Organization Context switching.

### Phase 2: core Power (Weeks 3-4)

- [ ] **Dynamic Statuses**: Implement the `task_statuses` management API.
- [ ] **Subtasks**: Update UI and Backend to handle recursive task structures.
- [ ] **Activity Log**: Implement the `activities` logger middleware to capture all write operations.

### Phase 3: Collaboration (Weeks 5-6)

- [ ] **Comments & Mentions**: Build the commenting system with rich text and user tagging.
- [ ] **Real-time**: Hook into PocketBase's real-time subscriptions for instant UI updates on task changes.

### Phase 4: Enterprise Ready (Weeks 7+)

- [ ] **Advanced RBAC**: Build UI for managing Roles and Permissions.
- [ ] **Audit & Compliance**: Build "Audit Log" views for Admins.
- [ ] **Performance Tuning**: Add indices on `project_id`, `assignee_id`, `status` and `ordering` fields.

---

**Next Steps**: Review this roadmap and approve the Phase 1 schema migration plan.
