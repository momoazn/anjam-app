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

## 3. Database Schema (Convex)

The schema is defined in `convex/schema.ts`. Convex automatically regenerates TypeScript types in `convex/_generated/` whenever the schema changes.

### Core Collections

#### `organizations`

- `name`: Text
- `slug`: Text (Unique URL identifier)
- `logo`: File (stored in Convex storage)
- `settings`: JSON
- `plan`: Text (free/pro/enterprise)
- `active`: Bool

#### `organization_members`

- `organization`: Id (Reference to organizations)
- `user`: Id (Reference to users)
- `role`: Text (owner, admin, member)
- `status`: Text (invited, active, suspended)

#### `projects`

- `organization`: Id (Reference to organizations)
- `name`, `code`, `description`...
- `github_repo_*`: Fields for GitHub integration

#### `project_members`

- `project`: Id (Reference to projects)
- `user`: Id (Reference to users)
- `role`: Text (owner, admin, member, viewer)

#### `project_statuses`

- `project`: Id (Reference to projects)
- `key`, `label`, `color`, `order`: Custom statuses per project

#### `tasks`

- `project`: Id (Reference to projects)
- `title`, `description`...
- `status`: Text (matches a `project_statuses` key)
- `priority`: Text (low, medium, high, urgent)
- `assignee`: Id (Reference to users)

#### `subtasks`

- `task`: Id (Reference to tasks)
- `title`: Text
- `completed`: Bool

#### `time_entries`

- `task`: Id (Reference to tasks)
- `user`: Id (Reference to users)
- `minutes`: Number
- `date`: Number (Unix timestamp)

#### `audit_logs`

- `organization`: Id (Reference to organizations)
- `actor`: Id (Reference to users)
- `action`, `resource`, `changes`: Tracking all mutations

## 4. API & Security Patterns

### Access Control (Convex)

Convex enforces access control at the function level through query, mutation, and action functions.

- **Tenant Isolation**: All queries must filter by organization membership.
  ```typescript
  // In queries, check that user is a member of the organization
  const membership = await ctx.db
    .query("organization_members")
    .withIndex("by_org_user", (q) =>
      q.eq("organization", organizationId).eq("user", userId),
    )
    .first();
  ```
- **Soft Delete**: All relevant collections use a `deleted_at` field. Query filters exclude deleted items:
  ```typescript
  q.eq("deleted_at", undefined);
  ```

### Backend Logic (Convex)

- **Transactions**: Critical operations (e.g., creating an org + owner) run in Convex transactions.
- **Function Types**:
  - **Queries**: Read-only data fetching, automatically optimized for caching
  - **Mutations**: Data modifications with automatic reactivity
  - **Actions**: Complex operations that can call external APIs
- **Audit Logging**: A centralized system captures all creates, updates, and deletes into `audit_logs` via mutation functions.

## 5. Frontend Architecture

- **Auth Store**: Persists `currentOrganization` and `userOrganizations` to manage the active context.
- **Hooks**: React Query hooks are scoped to the `currentOrganization` or specific `projectId`.
- **Components**: UI components (like `OrgSwitcher`) are aware of the multi-tenant context.
