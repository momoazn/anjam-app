# System Architecture

This document describes the current architecture of the Anjam application, following the transition to a multi-tenant organization model.

## 1. Core Hierarchy

The application follows a strict hierarchical model:

```
Organization (Tenant Boundary)
  └── Organization Members (Users with Org Roles)
  └── Projects
       └── Project Members (Users with Project Roles)
       └── Tasks
            └── Subtasks
            └── Comments
            └── Time Entries
            └── Activities
```

### Key Entities

- **Organization**: The primary tenant boundary. All data (projects, tasks, tags) belongs to an organization. Users can belong to multiple organizations.
- **Project**: A container for work within an organization.
- **Task**: An individual unit of work.
- **User**: A global entity that can have memberships in multiple organizations and projects.

## 2. Authorization & Roles (RBAC)

Permission resolution follows a dual-layer approach: **Organization Role** + **Project Role**.

### Organization Roles

Defined in `organization_members` collection.

| Role       | Key      | Permissions                                                   |
| :--------- | :------- | :------------------------------------------------------------ |
| **Owner**  | `owner`  | Full control, billing, delete org, manage all users/projects. |
| **Admin**  | `admin`  | Manage users, projects, settings (cannot delete org).         |
| **Member** | `member` | Access is determined by their project-level memberships.      |

### Project Roles

Defined in `project_members` collection.

| Role       | Key      | Permissions                                  |
| :--------- | :------- | :------------------------------------------- |
| **Owner**  | `owner`  | Delete project, manage all settings/members. |
| **Admin**  | `admin`  | Manage members, settings, and all tasks.     |
| **Member** | `member` | Create/edit tasks, log time.                 |
| **Viewer** | `viewer` | Read-only access.                            |

### Permission Resolution Flow

When a user attempts an action on a resource (e.g., "Delete Task"):

1.  **Check Organization Context**: Determine which organization the resource belongs to.
2.  **Check Organization Role**:
    - If `Owner` or `Admin`: **ALLOW** (System admins have implicit access to everything in their org).
3.  **Check Project Membership** (if not Org Admin):
    - Retrieve user's role in the specific project.
    - Check if that role has the required permission (e.g., `task.delete`).

## 3. Database Schema (PocketBase)

### Core Collections

#### `organizations`

- `name`: Text
- `slug`: Text (Unique URL identifier)
- `logo`: File
- `settings`: JSON
- `plan`: Select (free/pro/enterprise)
- `active`: Bool

#### Organization Mode (Build-Time Configuration)

The organization mode is **not stored per-organization** - it is configured at build time for the entire deployment.

**Configuration Methods:**

| Layer    | Variable                               | Values                    | Default      |
| -------- | -------------------------------------- | ------------------------- | ------------ |
| Frontend | `VITE_ORG_MODE`                        | `operations` \| `product` | `operations` |
| Backend  | `TM_ORG_MODE` env var                  | `operations` \| `product` | `operations` |
| Backend  | ldflags `-X main.organizationMode=...` | `operations` \| `product` | `operations` |

**Mode Effects:**

| Feature       | Operations Mode | Product Mode |
| ------------- | --------------- | ------------ |
| Time Tracking | Enabled         | Disabled     |
| Timesheet     | Enabled         | Disabled     |
| Reports       | Enabled         | Disabled     |
| Audit Logs    | Enabled         | Disabled     |
| Calendar      | Enabled         | Optional     |
| Home Route    | `/dashboard`    | `/inbox`     |
| Task Labels   | "Tasks"         | "Issues"     |

#### `organization_members`

- `organization`: Relation -> organizations
- `user`: Relation -> users
- `role`: Select (owner, admin, member)
- `status`: Select (invited, active, suspended)

#### `projects`

- `organization`: Relation -> organizations
- `name`, `code`, `description`...
- `github_repo_*`: Fields for GitHub integration.

#### `project_members`

- `project`: Relation -> projects
- `user`: Relation -> users
- `role`: Select (owner, admin, member, viewer)

#### `project_statuses`

- `project`: Relation -> projects
- `key`, `label`, `color`, `order`: Custom statuses per project.

#### `tasks`

- `project`: Relation -> projects
- `title`, `description`...
- `status`: Text (matches a `project_statuses` key)
- `priority`: Select (low, medium, high, urgent)
- `assignee`: Relation -> users

#### `subtasks`

- `task`: Relation -> tasks
- `title`: Text
- `completed`: Bool

#### `time_entries`

- `task`: Relation -> tasks
- `user`: Relation -> users
- `minutes`: Number
- `date`: Date

#### `audit_logs`

- `organization`: Relation -> organizations
- `actor`: Relation -> users
- `action`, `resource`, `changes`: Tracking all mutations.

## 4. API & Security Patterns

### Access Rules (API Rules)

PocketBase API rules enforce the hierarchy at the database level.

- **Tenant Isolation**: All queries must filter by organization membership.
  ```
  @collection.organization_members.organization.id ?= organization.id &&
  @collection.organization_members.user.id ?= @request.auth.id
  ```
- **Soft Delete**: All relevant collections use a `deleted_at` field. Rules filter out deleted items:
  ```
  (deleted_at = '' || deleted_at = null)
  ```

### Backend Logic (Go)

- **Transactions**: Critical operations (e.g., creating an org + owner) run in transactions.
- **Hooks**:
  - `OnRecordCreate`: Auto-generate IDs, validate constraints.
  - `OnRecordUpdate`: Handle side-effects (notifications, audit logs).
- **Audit Logging**: A centralized system captures all creates, updates, and deletes into `audit_logs`.

## 5. Frontend Architecture

- **Auth Store**: Persists `currentOrganization` and `userOrganizations` to manage the active context.
- **Hooks**: React Query hooks are scoped to the `currentOrganization` or specific `projectId`.
- **Components**: UI components (like `OrgSwitcher`) are aware of the multi-tenant context.
