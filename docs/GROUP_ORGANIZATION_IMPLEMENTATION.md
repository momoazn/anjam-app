# Group/Organization Feature Implementation Guide

## Overview

This document outlines the comprehensive implementation of a group/organization concept for the Task Manager application. The new hierarchy will be: **Group → Project → Task**, with a refined permission system that supports multi-tenant organization management.

## Current Architecture Analysis

### Existing Structure

- **Users**: Roles include `admin`, `supervisor`, `employee`
- **Projects**: Have a supervisor relationship
- **Tasks**: Belong to projects with assignees/creators
- **Permissions**: Role-based but not hierarchical
- **Access Control**: PocketBase rules with role checks

### Current Hierarchy

```
admin/supervisor → projects → tasks
```

## Proposed Architecture

### New Hierarchy Structure

```
group → project → task
```

### Design Decisions

1. **One group per user**: Users belong to exactly one group via `users.group` relation (no junction table)
2. **Granular project access**: Keep `users_projects` junction table for explicit project membership within a group
3. **Supervisor validation**: Supervisors must belong to the same group as their assigned project
4. **No migration needed**: Database will be reset during implementation

### Role Definitions

| Role           | Scope         | Permissions                                                 |
| -------------- | ------------- | ----------------------------------------------------------- |
| **admin**      | Global        | Access to all groups, can create groups and assign managers |
| **manager**    | Group-level   | Create projects, supervisors, employees within their group  |
| **supervisor** | Project-level | Create tasks in their assigned projects                     |
| **employee**   | Task-level    | View and update only their assigned tasks                   |

## Database Schema Changes

### 1. New Collections

#### `groups` Collection

```json
{
  "name": "groups",
  "type": "base",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "required": true,
      "max": 200
    },
    {
      "name": "code",
      "type": "text",
      "required": true,
      "max": 10,
      "unique": true
    },
    {
      "name": "description",
      "type": "editor",
      "required": false
    },
    {
      "name": "manager",
      "type": "relation",
      "collectionId": "_pb_users_auth_",
      "maxSelect": 1,
      "required": true
    },
    {
      "name": "active",
      "type": "bool",
      "required": false,
      "default": true
    },
    {
      "name": "created",
      "type": "autodate",
      "onCreate": true
    },
    {
      "name": "updated",
      "type": "autodate",
      "onCreate": true,
      "onUpdate": true
    }
  ],
  "listRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && manager.id = @request.auth.id)",
  "viewRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && manager.id = @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\"",
  "updateRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && manager.id = @request.auth.id)",
  "deleteRule": "@request.auth.role = \"admin\""
}
```

**Note**: Group membership is now managed through the `users.group` field. Users belong to exactly one group.

### 2. Updated Collections

#### `users` Collection Changes

Add the following field (after existing fields):

```json
{
  "name": "group",
  "type": "relation",
  "collectionId": "groups",
  "maxSelect": 1,
  "required": false
}
```

Update role field values to include "manager":

```json
{
  "name": "role",
  "type": "select",
  "values": ["admin", "manager", "supervisor", "employee"]
}
```

Update access rules:

```json
{
  "listRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && group.id = @request.auth.group.id) || @request.auth.id = id",
  "viewRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && group.id = @request.auth.group.id) || @request.auth.id = id",
  "createRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && @request.data.group = @request.auth.group.id && @request.data.role != \"admin\" && @request.data.role != \"manager\")",
  "updateRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id && id != @request.auth.id) || @request.auth.id = id",
  "deleteRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id)"
}
```

#### `projects` Collection Changes

Add the following field (required):

```json
{
  "name": "group",
  "type": "relation",
  "collectionId": "groups",
  "maxSelect": 1,
  "required": true
}
```

Update access rules:

```json
{
  "listRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && supervisor.id = @request.auth.id) || (@collection.users_projects.project.id ?= id && @collection.users_projects.user.id ?= @request.auth.id)",
  "viewRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && supervisor.id = @request.auth.id) || (@collection.users_projects.project.id ?= id && @collection.users_projects.user.id ?= @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && @request.data.group = @request.auth.group.id)",
  "updateRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && supervisor.id = @request.auth.id)",
  "deleteRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && group.manager.id = @request.auth.id)"
}
```

#### `tasks` Collection Changes

Update access rules:

```json
{
  "listRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && project.supervisor.id = @request.auth.id) || assignee.id = @request.auth.id || (@collection.users_projects.project.id ?= project && @collection.users_projects.user.id ?= @request.auth.id)",
  "viewRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && project.supervisor.id = @request.auth.id) || assignee.id = @request.auth.id || (@collection.users_projects.project.id ?= project && @collection.users_projects.user.id ?= @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && project.supervisor.id = @request.auth.id)",
  "updateRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && project.supervisor.id = @request.auth.id) || (assignee.id = @request.auth.id && @request.data.status:isset = true)",
  "deleteRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id) || (@request.auth.role = \"supervisor\" && project.supervisor.id = @request.auth.id)"
}
```

#### `users_projects` Collection Changes

Update access rules:

```json
{
  "listRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id) || user.id = @request.auth.id",
  "viewRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id) || user.id = @request.auth.id",
  "createRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id)",
  "updateRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id)",
  "deleteRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && project.group.manager.id = @request.auth.id)"
}
```

## Permission System Updates

### New Permission Matrix

```typescript
const PERMISSIONS = {
  // Global permissions
  "groups.view": ["admin"],
  "groups.manage": ["admin"],

  // Group-level permissions
  "group.view": ["admin", "manager", "supervisor", "employee"],
  "group.manage": ["admin", "manager"],
  "group.users.view": ["admin", "manager", "supervisor", "employee"],
  "group.users.manage": ["admin", "manager"],

  // Project-level permissions
  "projects.view": ["admin", "manager", "supervisor", "employee"],
  "projects.manage": ["admin", "manager", "supervisor"],
  "projects.create": ["admin", "manager"],

  // Task-level permissions
  "tasks.view": ["admin", "manager", "supervisor", "employee"],
  "tasks.manage": ["admin", "manager", "supervisor"],
  "tasks.create": ["admin", "manager", "supervisor"],
  "tasks.own.update": ["admin", "manager", "supervisor", "employee"],

  // User management
  "users.view": ["admin", "manager", "supervisor"],
  "users.manage": ["admin", "manager"],
  "users.create": ["admin", "manager"],

  // Reports and analytics
  "reports.view": ["admin", "manager", "supervisor"],

  // System permissions
  "notifications.view": ["admin", "manager", "supervisor", "employee"],
  "helps.view": ["admin", "manager", "supervisor", "employee"],
} as const;
```

### Updated Permission Functions

```typescript
// Add new role checks
export function isManager(userRole: UsersRoleOptions | null): boolean {
  return userRole === "manager";
}

// Group-aware permission checking
export function canAccessGroup(
  userRole: UsersRoleOptions | null,
  userGroup: string | null,
  targetGroup: string | null,
  permission: Permission,
): boolean {
  if (!userRole) return false;

  // Admins can access everything
  if (userRole === "admin") return true;

  // Managers can only access their own group
  if (userRole === "manager") {
    return (
      userGroup === targetGroup && PERMISSIONS[permission].includes(userRole)
    );
  }

  // Supervisors and employees can access their group
  if (userRole === "supervisor" || userRole === "employee") {
    return (
      userGroup === targetGroup && PERMISSIONS[permission].includes(userRole)
    );
  }

  return false;
}
```

## Backend Implementation Changes

### File: `main.go`

#### Step 1: Register New Event Handlers

**Location**: After line 80 (after existing event handler registrations)

**Action**: Add these lines exactly as shown:

```go
// Group management handlers
app.OnRecordCreateExecute("groups").BindFunc(handleGroupCreation)
app.OnRecordAfterCreateSuccess("groups").BindFunc(handleGroupCreatedNotification)

// Group-aware project creation validation
app.OnRecordCreateExecute("projects").BindFunc(handleProjectCreationWithGroup)

// Group-aware user-project assignment validation
app.OnRecordCreateExecute("users_projects").BindFunc(handleUsersProjectsValidation)
```

**Important**: The existing `handleProjectCreation` handler will be called INSIDE the new `handleProjectCreationWithGroup` handler.

#### Step 2: No Custom API Endpoints Needed

**Important**: We will use PocketBase's built-in CRUD operations for groups instead of custom endpoints.

**What this means**:

- No need to add custom routes for listing, creating, updating, or deleting groups
- PocketBase automatically provides these operations through its SDK
- Frontend will use `pb.collection("groups")` directly
- Access control is handled by the collection rules in `pb_schema.json`

**Operations available out-of-the-box**:

- List groups: `pb.collection("groups").getFullList()`
- Get group: `pb.collection("groups").getOne(id)`
- Create group: `pb.collection("groups").create(data)`
- Update group: `pb.collection("groups").update(id, data)`
- Delete group: `pb.collection("groups").delete(id)`

**Why this is better**:

- Less code to maintain
- Consistent with how projects and tasks are handled
- PocketBase rules automatically enforce permissions
- No need for custom authorization logic

#### Step 3: Implement Event Handlers

**Location**: Add BEFORE the `main()` function

**Handler 1: Generate unique group codes**

```go
// handleGroupCreation auto-generates unique 3-letter group codes
// Similar to project code generation
func handleGroupCreation(e *core.RecordCreateEvent) error {
	record := e.Record

	// Generate unique group code (3 uppercase letters)
	code := generateRandomCode()
	maxAttempts := 100
	attempts := 0

	// Check for collisions and retry if needed
	for attempts < maxAttempts {
		exists, err := e.App.FindRecordsByFilter(
			"groups",
			"code = {:code}",
			"-created",
			1,
			0,
			dbx.Params{"code": code},
		)
		if err != nil {
			return err
		}

		// No collision found, use this code
		if len(exists) == 0 {
			break
		}

		// Collision found, generate new code
		code = generateRandomCode()
		attempts++
	}

	// Failed to find unique code after max attempts
	if attempts >= maxAttempts {
		return errors.New("failed to generate unique group code after 100 attempts")
	}

	// Set the generated code and default active status
	record.Set("code", code)
	record.Set("active", true)

	return e.Next()
}
```

**Why this handler**: Auto-generates unique 3-letter codes for groups (like "ABC", "XYZ") similar to how project codes work.

**Handler 2: Validate project supervisor belongs to same group**

```go
// handleProjectCreationWithGroup validates that the project's supervisor
// belongs to the same group as the project
func handleProjectCreationWithGroup(e *core.RecordCreateEvent) error {
	record := e.Record

	// FIRST: Run the existing project creation logic (generates project code)
	if err := handleProjectCreation(e); err != nil {
		return err
	}

	// Get the group and supervisor IDs from the new project
	groupId := record.GetString("group")
	supervisorId := record.GetString("supervisor")

	// Skip validation if either is missing (will be caught by required field validation)
	if groupId == "" || supervisorId == "" {
		return e.Next()
	}

	// Fetch the supervisor user record
	supervisor, err := e.App.FindRecordById("users", supervisorId)
	if err != nil {
		return fmt.Errorf("supervisor not found: %w", err)
	}

	// Check if supervisor belongs to the same group
	supervisorGroupId := supervisor.GetString("group")
	if supervisorGroupId != groupId {
		return errors.New("منتور (supervisor) باید عضو همان گروه پروژه باشد")
	}

	return e.Next()
}
```

**Why this handler**: Ensures supervisors can only be assigned to projects in their own group. Prevents cross-group assignments.

**Handler 3: Validate user-project assignments are within same group**

```go
// handleUsersProjectsValidation ensures that when adding a user to a project,
// both the user and project belong to the same group
func handleUsersProjectsValidation(e *core.RecordCreateEvent) error {
	record := e.Record

	userId := record.GetString("user")
	projectId := record.GetString("project")

	// Skip if either field is missing
	if userId == "" || projectId == "" {
		return e.Next()
	}

	// Fetch user record
	user, err := e.App.FindRecordById("users", userId)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Fetch project record
	project, err := e.App.FindRecordById("projects", projectId)
	if err != nil {
		return fmt.Errorf("project not found: %w", err)
	}

	// Validate both belong to the same group
	userGroupId := user.GetString("group")
	projectGroupId := project.GetString("group")

	if userGroupId != projectGroupId {
		return errors.New("کاربر و پروژه باید در یک گروه باشند")
	}

	return e.Next()
}
```

**Why this handler**: Prevents adding users to projects outside their group. Maintains group isolation.

**Handler 4: Send notification when group is created**

```go
// handleGroupCreatedNotification sends a notification to the manager
// when they are assigned to manage a new group
func handleGroupCreatedNotification(e *core.RecordEvent) error {
	record := e.Record
	managerId := record.GetString("manager")

	if managerId == "" {
		return e.Next()
	}

	// Create notification record
	notification := models.NewRecord(e.App.FindCollectionByNameOrId("notifications"))
	notification.Set("user", managerId)
	notification.Set("type", "system")
	notification.Set("title", "گروه جدید ایجاد شد")
	notification.Set("message", fmt.Sprintf("شما به عنوان مدیر گروه %s منصوب شدید", record.GetString("name")))
	notification.Set("read", false)
	notification.Set("data", map[string]any{
		"group_id":   record.Id,
		"group_name": record.GetString("name"),
	})

	// Save notification (log error but don't fail the operation)
	if err := e.App.Save(notification); err != nil {
		log.Println("Failed to create group notification:", err)
	}

	return e.Next()
}
```

**Why this handler**: Notifies the manager when they're assigned to a group, following the existing notification pattern.

#### Step 4: Validation Checklist for Backend Changes

After implementing all backend changes, verify:

- [ ] All event handlers are registered in the correct order
- [ ] All API endpoints are registered with correct paths (use `:id` not `{id}`)
- [ ] Code compiles without errors: `go build`
- [ ] No unused imports or variables
- [ ] All error messages are in Persian (Farsi)
- [ ] Functions follow the existing naming conventions

## Frontend Implementation

### STEP 1: Update Permission System

#### File: `src/lib/permissions.ts`

**Action 1: Update the `PERMISSIONS` constant**

Replace the entire `PERMISSIONS` constant with:

```typescript
const PERMISSIONS = {
  // Group permissions
  "groups.view": ["admin"],
  "groups.manage": ["admin"],
  "group.view": ["admin", "manager", "supervisor", "employee"],
  "group.users.view": ["admin", "manager", "supervisor", "employee"],
  "group.users.manage": ["admin", "manager"],

  // Project permissions
  "projects.view": ["admin", "manager", "supervisor", "employee"],
  "projects.manage": ["admin", "manager", "supervisor"],
  "projects.create": ["admin", "manager"],

  // Task permissions
  "tasks.view": ["admin", "manager", "supervisor", "employee"],
  "tasks.manage": ["admin", "manager", "supervisor"],
  "tasks.create": ["admin", "manager", "supervisor"],
  "tasks.own.update": ["admin", "manager", "supervisor", "employee"],

  // User management
  "users.view": ["admin", "manager", "supervisor"],
  "users.manage": ["admin", "manager"],
  "users.create": ["admin", "manager"],

  // Reports and system
  "reports.view": ["admin", "manager", "supervisor"],
  "notifications.view": ["admin", "manager", "supervisor", "employee"],
  "helps.view": ["admin", "manager", "supervisor", "employee"],
} as const;
```

**Why**: Adds group-related permissions and updates project/user permissions to include managers.

**Action 2: Add new helper functions**

Add these three new functions after the existing role helpers (for example, after `isAdmin`):

```typescript
/**
 * Check if user has manager role
 */
export function isManager(userRole: UsersRoleOptions | null): boolean {
  return userRole === "manager";
}

/**
 * Check if user can manage users (admin or manager)
 */
export function canManageUsers(userRole: UsersRoleOptions | null): boolean {
  return isAdmin(userRole) || isManager(userRole);
}

/**
 * Check if user can create projects (admin or manager)
 */
export function canCreateProjects(userRole: UsersRoleOptions | null): boolean {
  return isAdmin(userRole) || isManager(userRole);
}
```

**Why**: Provides convenient functions for checking manager permissions throughout the app.

---

### STEP 2: Create Group State Management

#### File: `src/store/group-store.ts` (NEW FILE)

**Action**: Create this new file with the following content:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GroupsResponse } from "@/lib/pocketbase-types";

interface GroupState {
  currentGroup: GroupsResponse | null;
  setCurrentGroup: (group: GroupsResponse | null) => void;
  clearGroup: () => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      currentGroup: null,
      setCurrentGroup: (group) => set({ currentGroup: group }),
      clearGroup: () => set({ currentGroup: null }),
    }),
    {
      name: "group-storage",
    },
  ),
);

// Selector hooks for optimized re-renders
export const useCurrentGroup = () =>
  useGroupStore((state) => state.currentGroup);
export const useSetCurrentGroup = () =>
  useGroupStore((state) => state.setCurrentGroup);
export const useClearGroup = () => useGroupStore((state) => state.clearGroup);
```

**Why**: Manages current group state similar to auth-store. Uses Zustand with persistence to localStorage.

**Pattern**: This follows the same pattern as `src/store/auth-store.ts` - check that file for reference.

---

### STEP 3: Update Query Keys

#### File: `src/hooks/query-keys.ts`

**Action**: Add groups section after the `tasks` key (around line 10)

Add this block:

```typescript
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    list: () => [...queryKeys.groups.lists()] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
    users: (groupId: string) => [...queryKeys.groups.detail(groupId), "users"] as const,
    projects: (groupId: string) => [...queryKeys.groups.detail(groupId), "projects"] as const,
    stats: (groupId: string) => [...queryKeys.groups.detail(groupId), "stats"] as const,
  },
```

**Why**: Centralizes cache keys for TanStack Query. This pattern ensures consistent cache invalidation.

---

### STEP 4: Create Group Hooks

#### File: `src/hooks/groups.ts` (NEW FILE)

**Action**: Create this new file. Reference `src/hooks/projects.ts` for the pattern.

**Important patterns to follow**:

1. Import `pb` from `@/lib/pocketbase`
2. Use `queryKeys` for all query keys
3. Implement optimistic updates in mutations where it matches existing patterns
4. Use `UseMutationOptions` for type-safe mutation options
5. Invalidate related queries on success

The file should include these hooks (all using PocketBase collections, no custom API endpoints):

- `useGroups()` - Fetch all groups (for admins, returns groups they can see)
- `useGroup({ id })` - Fetch single group
- `useGroupUsers({ groupId })` - Fetch users filtered by `group.id = "{groupId}"`
- `useGroupProjects({ groupId })` - Fetch projects filtered by `group.id = "{groupId}"`
- `useCreateGroup()` - Create new group
- `useUpdateGroup()` - Update existing group
- `useDeleteGroup()` - Delete group
- `useToggleGroupActive()` - Toggle `active` field on a group record

**Example structure** (fetch hooks):

```typescript
export function useGroups(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.groups.list(),
    queryFn: () =>
      pb.collection("groups").getFullList<GroupsResponse>({
        sort: "-created",
        expand: "manager",
      }),
    enabled,
  });
}
```

For `useGroupUsers` and `useGroupProjects`, follow the same pattern as existing hooks (for example, `useProjectUsers`), but:

- Use `pb.collection("users").getFullList<UsersResponse>({ filter: 'group.id = "{groupId}"' })` for users
- Use `pb.collection("projects").getFullList<ProjectsResponse>({ filter: 'group.id = "{groupId}"' })` for projects

For `useToggleGroupActive`, follow the mutation pattern from an existing “toggle active” hook (for example, `useToggleUserActive`), but call:

```ts
pb.collection("groups").update(id, { active: !group.active });
```

---

### STEP 5: Export Group Hooks

#### File: `src/hooks/index.ts`

**Action**: Add this line to the exports section:

```typescript
export * from "./groups";
```

**Why**: Makes group hooks available throughout the app via `import { useGroups } from "@/hooks"`.

---

### STEP 6: Add Persian Text Constants

#### File: `src/constants/text/fa.ts`

**Action**: Add this section (location: with other section objects like `projects`, `tasks`)

```typescript
  groups: {
    title: "گروه‌ها",
    code: "کد گروه",
    create: {
      title: "ایجاد گروه جدید",
      button: "ایجاد گروه",
    },
    edit: {
      title: "ویرایش گروه",
      button: "ذخیره تغییرات",
    },
    delete: {
      title: "حذف گروه",
      description: "آیا از حذف گروه {name} اطمینان دارید؟ این عمل قابل بازگشت نیست.",
    },
    list: {
      count: "{count} گروه",
      empty: "هیچ گروهی یافت نشد",
    },
    form: {
      name: "نام گروه",
      description: "توضیحات",
      manager: "مدیر گروه",
      selectManager: "انتخاب مدیر",
    },
    status: {
      active: "فعال",
      inactive: "غیرفعال",
    },
    actions: {
      activate: "فعال‌سازی",
      deactivate: "غیرفعال‌سازی",
    },
    stats: {
      users: "کاربر",
      projects: "پروژه",
      tasks: "وظیفه",
    },
  },
```

**Why**: All UI text must be in Persian. This follows the existing pattern in the codebase.

---

### STEP 7: Create Group Components

#### Component 1: Group List Card

**File**: `src/components/group/group-list-card.tsx` (NEW FILE)

**Purpose**: Display a single group in a card format with actions

**Pattern**: Similar to project cards. Should include:

- Group name, code, and status badge
- Description (rendered as HTML)
- Statistics (users, projects counts)
- Action buttons (Edit, Toggle Active, Delete)

**Props**:

```typescript
interface GroupListCardProps {
  group: GroupsResponse;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  stats?: { users: number; projects: number; tasks: number };
}
```

**Components to use**:

- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`
- Icons: `Building2`, `Users`, `Target`, `CheckCircle2`, `XCircle` from `lucide-react`

#### Component 2: Delete Group Dialog

**File**: `src/components/group/delete-group-dialog.tsx` (NEW FILE)

**Purpose**: Confirmation dialog for deleting a group

**Pattern**: Exactly like `src/components/project/delete-project-dialog.tsx`

**Key points**:

- Use `AlertDialog` components from `@/components/ui/alert-dialog`
- Call `useDeleteGroup` hook for mutation
- Show loading spinner during deletion
- Close dialog on success

---

### STEP 8: Create Group Pages

#### Page 1: Groups List

**File**: `src/pages/groups.tsx` (NEW FILE)

**Purpose**: Main page for listing all groups (admin only)

**Pattern**: Follow `src/pages/projects.tsx` structure

**Key features**:

- Page header with title, count badge, and "Create Group" button
- Loading state with spinner
- Grid layout of group cards (3 columns on large screens)
- Delete confirmation dialog

**Required hooks**:

- `useAuthUser()` - Get current user
- `useNavigate()` - Navigation
- `useGroups()` - Fetch groups
- `useToggleGroupActive()` - Toggle active status
- State for delete dialog

#### Page 2: Create Group

**File**: `src/pages/create-group.tsx` (NEW FILE)

**Purpose**: Form to create a new group

**Pattern**: Follow `src/pages/create-project.tsx` structure

**Key features**:

- Form with react-hook-form + zod validation
- Fields: name (required), description (optional), manager (required, dropdown)
- Manager dropdown shows only users without a group
- Redirects to `/groups` on success

**Form schema**:

```typescript
const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  manager: z.string().min(1),
});
```

---

### STEP 9: Update Existing Pages

#### Page: Create Project (`src/pages/create-project.tsx`)

**Action 1**: Add group field to form schema

Find the `formSchema` definition and add:

```typescript
group: z.string().min(1, { message: fa.validation.required }),
```

**Action 2**: Add group to default values

In `useForm` defaultValues, add:

```typescript
group: isManager && user?.group ? user.group : "",
```

**Why**: Pre-fill group for managers so they can only create in their group.

**Action 3**: Add group field to the form

After the supervisor field, add this form field:

```typescript
<FormField
  control={form.control}
  name="group"
  render={({ field }) => (
    <FormItem>
      <FormLabel>{fa.projects.form.group}</FormLabel>
      <Select
        onValueChange={field.onChange}
        value={field.value}
        disabled={isManager} // Managers can only create in their group
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={fa.projects.form.selectGroup} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {groups?.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Action 4**: Fetch groups for dropdown

Add at top of component:

```typescript
const { data: groups } = useGroups();
```

**Action 5**: Add text constants

In `src/constants/text/fa.ts`, add to `projects.form`:

```typescript
group: "گروه",
selectGroup: "انتخاب گروه",
```

#### Page: Create User (`src/pages/create-user.tsx`)

**Similar changes**: Add group field following the same pattern as create-project.

**Additional change**: Filter available roles for managers

```typescript
const availableRoles = isManager
  ? [UsersRoleOptions.supervisor, UsersRoleOptions.employee]
  : [
      UsersRoleOptions.manager,
      UsersRoleOptions.supervisor,
      UsersRoleOptions.employee,
    ];
```

**Why**: Managers cannot create admins or other managers.

---

### STEP 10: Update Navigation

#### File: `src/components/sidebar.tsx`

**Action**: Add Groups menu item

Find the sidebar menu items array (around line 50) and add:

```typescript
{
  title: fa.sidebar.groups,
  icon: Building2,
  url: "/groups",
  roles: [UsersRoleOptions.admin],
},
```

**Position**: Add after Dashboard, before Projects

**Why**: Only admins can access the groups list page.

**Don't forget**: Import `Building2` from `lucide-react` at the top.

**Add text constant**: In `src/constants/text/fa.ts`, add to `sidebar`:

```typescript
groups: "گروه‌ها",
```

---

### STEP 11: Update Routing

#### File: `src/router.tsx`

**Action**: Add group routes

Find the routes array and add these routes (after projects routes):

```typescript
// Group management routes (admin only)
{
  path: "/groups",
  element: (
    <ProtectedRoute>
      <PermissionProtectedRoute permission="groups.view">
        <Groups />
      </PermissionProtectedRoute>
    </ProtectedRoute>
  ),
},
{
  path: "/groups/new",
  element: (
    <ProtectedRoute>
      <PermissionProtectedRoute permission="groups.manage">
        <CreateGroup />
      </PermissionProtectedRoute>
    </ProtectedRoute>
  ),
},
{
  path: "/groups/:id",
  element: (
    <ProtectedRoute>
      <GroupDetails />
    </ProtectedRoute>
  ),
},
{
  path: "/groups/:id/edit",
  element: (
    <ProtectedRoute>
      <PermissionProtectedRoute permission="groups.manage">
        <EditGroup />
      </PermissionProtectedRoute>
    </ProtectedRoute>
  ),
},
```

**Don't forget**: Import the page components at the top:

```typescript
import Groups from "./pages/groups";
import CreateGroup from "./pages/create-group";
import GroupDetails from "./pages/group-details";
import EditGroup from "./pages/edit-group";
```

---

### STEP 12: Validation Checklist for Frontend

After implementing all frontend changes, verify:

- [ ] No TypeScript errors: `bun run type:check`
- [ ] No linting errors: `bun run lint:check`
- [ ] All files formatted: `bun run fmt`
- [ ] All imports are correct
- [ ] All Persian text constants are added
- [ ] All query keys follow the established pattern
- [ ] Components use existing UI components from `@/components/ui`
- [ ] Forms use react-hook-form + zod validation
- [ ] All mutations include optimistic updates
- [ ] Routes are properly protected with permissions

## Step-by-Step Implementation Order

Follow these steps in exact order. Complete each step before moving to the next.

### Phase 1: Database Schema (30-60 minutes)

**Step 1.1**: Update `pb_schema.json`

- [ ] Add `groups` collection (see "Database Schema Changes" section above)
- [ ] Update `users` collection: Add `group` field and `manager` to roles
- [ ] Update `projects` collection: Add required `group` field
- [ ] Update `tasks` collection: Update access rules
- [ ] Update `users_projects` collection: Update access rules

**Step 1.2**: Regenerate TypeScript types

- [ ] Run: `bun run gen:type`
- [ ] Verify: Check `src/lib/pocketbase-types.ts` for `GroupsResponse` type
- [ ] Verify: `UsersRoleOptions` includes "manager"

**Checkpoint**: No TypeScript errors should exist at this point.

---

### Phase 2: Backend Implementation (2-3 hours)

**Step 2.1**: Implement event handlers (4 handlers)

- [ ] Add `handleGroupCreation()` - Auto-generate group codes
- [ ] Add `handleProjectCreationWithGroup()` - Validate supervisor in same group
- [ ] Add `handleUsersProjectsValidation()` - Validate user-project in same group
- [ ] Add `handleGroupCreatedNotification()` - Notify manager on group creation
- [ ] Location: Before `main()` function

**Step 2.2**: Register event handlers

- [ ] Add handler registrations after line 80 in `main.go`
- [ ] Register in this order:
  1. `groups` create → `handleGroupCreation`
  2. `groups` after create → `handleGroupCreatedNotification`
  3. `projects` create → `handleProjectCreationWithGroup` (replaces old handler)
  4. `users_projects` create → `handleUsersProjectsValidation`
  5. Ensure any previous `projects` create handler logic is called from inside `handleProjectCreationWithGroup` (as described earlier)

**Step 2.3**: Verify backend compiles

- [ ] Run: `go build`
- [ ] Fix any compilation errors
- [ ] Verify no unused imports

**Checkpoint**: Backend should compile without errors.

---

### Phase 3: Frontend Permission System (30 minutes)

**Step 3.1**: Update `src/lib/permissions.ts`

- [ ] Replace `PERMISSIONS` constant with group-aware permissions
- [ ] Add `isManager()` helper function
- [ ] Add `canManageUsers()` helper function
- [ ] Add `canCreateProjects()` helper function

**Step 3.2**: Verify types

- [ ] Run: `bun run type:check`
- [ ] Fix any type errors

**Checkpoint**: No TypeScript errors in permission system.

---

### Phase 4: Frontend State & Hooks (1 hour)

**Step 4.1**: Create group store

- [ ] Create file: `src/store/group-store.ts`
- [ ] Implement using Zustand + persist (follow `auth-store.ts` pattern)
- [ ] Export selector hooks

**Step 4.2**: Update query keys

- [ ] Edit `src/hooks/query-keys.ts`
- [ ] Add `groups` section with all query key factories

**Step 4.3**: Create group hooks

- [ ] Create file: `src/hooks/groups.ts`
- [ ] Implement group hooks (follow `projects.ts` pattern):
  - `useGroups()`, `useGroup()`, `useGroupUsers()`, `useGroupProjects()`
  - `useCreateGroup()`, `useUpdateGroup()`, `useDeleteGroup()`, `useToggleGroupActive()`
- [ ] Use optimistic updates in mutations where appropriate
- [ ] Use PocketBase collection queries and updates for all hooks (no custom API endpoints)

**Step 4.4**: Export hooks

- [ ] Edit `src/hooks/index.ts`
- [ ] Add: `export * from "./groups";`

**Step 4.5**: Verify types

- [ ] Run: `bun run type:check`
- [ ] Fix any type errors

**Checkpoint**: All hooks should be type-safe and compile cleanly.

---

### Phase 5: Frontend Text Constants (15 minutes)

**Step 5.1**: Add Persian text

- [ ] Edit `src/constants/text/fa.ts`
- [ ] Add complete `groups` section with all text constants
- [ ] Add to `sidebar`: `groups: "گروه‌ها"`
- [ ] Add to `projects.form`: `group`, `selectGroup`
- [ ] Add to `users.form`: `group`, `selectGroup`

**Checkpoint**: All text constants in place for UI implementation.

---

### Phase 6: Frontend Components (2-3 hours)

**Step 6.1**: Create group components directory

- [ ] Create directory: `src/components/group/`

**Step 6.2**: Implement GroupListCard

- [ ] Create file: `src/components/group/group-list-card.tsx`
- [ ] Follow Card pattern from project components
- [ ] Include: name, code, status badge, description, stats, action buttons

**Step 6.3**: Implement DeleteGroupDialog

- [ ] Create file: `src/components/group/delete-group-dialog.tsx`
- [ ] Follow `delete-project-dialog.tsx` pattern exactly
- [ ] Use `AlertDialog` components

**Step 6.4**: Verify components compile

- [ ] Run: `bun run type:check`
- [ ] Fix any type errors

**Checkpoint**: Components should compile without errors.

---

### Phase 7: Frontend Pages (2-3 hours)

**Step 7.1**: Implement Groups list page

- [ ] Create file: `src/pages/groups.tsx`
- [ ] Follow `projects.tsx` pattern
- [ ] Features: header, loading state, grid layout, delete dialog

**Step 7.2**: Implement Create Group page

- [ ] Create file: `src/pages/create-group.tsx`
- [ ] Follow `create-project.tsx` pattern
- [ ] Form fields: name (required), description (optional), manager (required)
- [ ] Manager dropdown: Show only users without a group

**Step 7.3**: Stub out additional pages

- [ ] Create stub: `src/pages/group-details.tsx` (optional, can implement later)
- [ ] Create stub: `src/pages/edit-group.tsx` (optional, can implement later)

**Step 7.4**: Verify pages compile

- [ ] Run: `bun run type:check`
- [ ] Fix any type errors

**Checkpoint**: All pages should compile without errors.

---

### Phase 8: Update Existing Pages (1-2 hours)

**Step 8.1**: Update Create Project page

- [ ] Edit `src/pages/create-project.tsx`
- [ ] Add `group` to form schema (required)
- [ ] Add `group` to default values (pre-fill for managers)
- [ ] Add group dropdown field (disabled for managers)
- [ ] Fetch groups with `useGroups()`

**Step 8.2**: Update Create User page

- [ ] Edit `src/pages/create-user.tsx`
- [ ] Add `group` to form schema (required)
- [ ] Add `group` to default values (pre-fill for managers)
- [ ] Add group dropdown field (disabled for managers)
- [ ] Filter available roles (managers can't create admins/managers)

**Step 8.3**: Verify updates

- [ ] Run: `bun run type:check`
- [ ] Fix any type errors

**Checkpoint**: Existing pages updated to be group-aware.

---

### Phase 9: Navigation & Routing (30 minutes)

**Step 9.1**: Update sidebar

- [ ] Edit `src/components/sidebar.tsx`
- [ ] Add Groups menu item (admin only)
- [ ] Import `Building2` icon
- [ ] Position after Dashboard

**Step 9.2**: Update router

- [ ] Edit `src/router.tsx`
- [ ] Import new page components
- [ ] Add 4 group routes with proper permission guards

**Step 9.3**: Verify routing

- [ ] Run: `bun run type:check`
- [ ] Fix any type errors

**Checkpoint**: All routes configured with proper permissions.

---

### Phase 10: Quality Checks (30 minutes)

**Step 10.1**: Run all checks

- [ ] Run: `bun run check` (type + lint + format)
- [ ] Fix all errors and warnings
- [ ] Run: `bun run fmt` to auto-format

**Step 10.2**: Verify build succeeds

- [ ] Run: `bun run build`
- [ ] Fix any build errors

**Checkpoint**: Clean build with no errors.

---

### Phase 11: Database Reset & Test Data (30 minutes)

**Step 11.1**: Reset database

- [ ] Stop server if running
- [ ] Delete `data/data.db` file
- [ ] Start server: `bun run dev:server`
- [ ] Server will create new DB with updated schema

**Step 11.2**: Create test data manually via UI

- [ ] Login as admin (default: `admin` / `admin12345`)
- [ ] Create 2 groups with different managers
- [ ] Create users in each group (supervisors and employees)
- [ ] Create projects in each group
- [ ] Create tasks in projects
- [ ] Assign tasks to employees

**Checkpoint**: Test data in place for manual testing.

---

### Phase 12: Manual Testing (1-2 hours)

**Test Admin Role**:

- [ ] Can view all groups in `/groups`
- [ ] Can create new group
- [ ] Can assign manager to group
- [ ] Can toggle group active/inactive
- [ ] Can delete group
- [ ] Can see all projects across all groups

**Test Manager Role**:

- [ ] Can see only their own group
- [ ] Can create projects in their group
- [ ] Cannot select different group (dropdown disabled)
- [ ] Can create users (supervisors/employees) in their group
- [ ] Cannot create admins or other managers
- [ ] Can view all projects in their group

**Test Supervisor Role**:

- [ ] Can see their group info
- [ ] Can create tasks in assigned projects only
- [ ] Cannot create projects
- [ ] Cannot create users
- [ ] Can view all users in their group

**Test Employee Role**:

- [ ] Can see their group info
- [ ] Can view only assigned tasks
- [ ] Can update only their own tasks' status
- [ ] Cannot create tasks
- [ ] Cannot create projects or users

**Test Permission Boundaries**:

- [ ] Supervisor cannot be assigned to project in different group (backend validation)
- [ ] User cannot be added to project in different group (backend validation)
- [ ] Manager cannot see other groups' data
- [ ] Cross-group data access is prevented

**Checkpoint**: All role workflows work correctly, permissions enforced.

---

## Summary Checklist

Before considering implementation complete, verify:

**Backend**:

- [ ] Groups collection created with unique code index
- [ ] All event handlers registered and working
- [ ] All API endpoints registered and returning correct data
- [ ] Group codes auto-generated (3 uppercase letters)
- [ ] Validation prevents cross-group assignments
- [ ] Notifications sent when group created

**Frontend**:

- [ ] Permission system includes all group permissions
- [ ] Group store persists to localStorage
- [ ] All group hooks implemented with optimistic updates
- [ ] All Persian text constants added
- [ ] Group components render correctly
- [ ] Group pages navigate properly
- [ ] Existing pages updated with group fields
- [ ] Sidebar shows Groups menu (admin only)
- [ ] All routes protected with correct permissions

**Quality**:

- [ ] No TypeScript errors: `bun run type:check`
- [ ] No linting errors: `bun run lint:check`
- [ ] All files formatted: `bun run fmt`
- [ ] Build succeeds: `bun run build`
- [ ] Backend compiles: `go build`

**Functionality**:

- [ ] Admin can manage groups
- [ ] Manager can manage their group
- [ ] Supervisor can create tasks in their projects
- [ ] Employee can update their own tasks
- [ ] Cross-group access prevented
- [ ] All validations working

---

## Task Files

The implementation has been broken down into small, focused tasks. Each task is documented in a separate markdown file under `docs/`:

- `docs/GROUP_TASK_01_SCHEMA_AND_RULES.md` – PocketBase schema and access rules.
- `docs/GROUP_TASK_02_BACKEND_HANDLERS.md` – Go backend event handlers for groups.
- `docs/GROUP_TASK_03_FRONTEND_PERMISSIONS_AND_TEXT.md` – Frontend permissions and text constants.
- `docs/GROUP_TASK_04_FRONTEND_STATE_AND_HOOKS.md` – Group Zustand store and React Query hooks.
- `docs/GROUP_TASK_05_COMPONENTS_AND_PAGES.md` – Group UI components and pages, plus project/user form updates.
- `docs/GROUP_TASK_06_NAVIGATION_AND_ROUTING.md` – Sidebar and router integration for group pages.
- `docs/GROUP_TASK_07_QUALITY_AND_TESTING.md` – Automated checks and manual role-based testing.

Each task file is self-contained and can be implemented independently, in order, by a smaller model or individual contributor.

## Troubleshooting Common Issues

**Issue**: "Cannot find module '@/hooks/groups'"

- **Fix**: Ensure `src/hooks/index.ts` exports groups: `export * from "./groups";`

**Issue**: Backend compile error "undefined: handleProjectCreation"

- **Fix**: The new `handleProjectCreationWithGroup` should call the existing `handleProjectCreation` inside it

**Issue**: TypeScript error "Property 'group' does not exist on type 'UsersRecord'"

- **Fix**: Run `bun run gen:type` to regenerate types after schema changes

**Issue**: "Cannot read property 'manager' of undefined" in frontend

- **Fix**: Check that group has `expand: "manager"` in the query

**Issue**: Backend route returns 404

- **Fix**: Verify you used `:id` (colon) not `{id}` (curly braces) in route registration

**Issue**: Manager can see other groups

- **Fix**: Check collection rules for `groups` ensure managers only see groups where they are the `manager`

**Issue**: Cannot assign supervisor to project

- **Fix**: Ensure supervisor has a group assigned first (supervisors need group before project assignment)

## Testing Strategy

### 1. Unit Tests

- Permission system functions
- Group management logic
- API endpoint handlers
- Component rendering

### 2. Integration Tests

- Group creation and management
- User assignment to groups
- Project creation within groups
- Task creation with group constraints

### 3. E2E Tests

- Complete user workflows
- Permission boundary testing
- Cross-group access prevention
- Data migration validation

### 4. Security Tests

- Permission escalation attempts
- Cross-group data access
- API endpoint security
- Authentication and authorization

## Migration Strategy

### 1. Data Migration Steps

1. Create default "General" group
2. Assign all existing users to default group
3. Update all existing projects to belong to default group
4. Preserve existing supervisor relationships
5. Update user roles where necessary

### 2. Backward Compatibility

- Maintain existing API endpoints where possible
- Provide fallback logic for ungrouped data
- Gradual rollout of new features

### 3. Rollback Plan

- Database backup before migration
- Revert script if issues arise
- Feature flags for gradual rollout

## Performance Considerations

### 1. Database Optimization

- Add indexes for group-related queries
- Optimize permission checks
- Cache group membership data

### 2. Frontend Optimization

- Lazy load group data
- Implement virtual scrolling for large lists
- Cache group permissions

### 3. API Optimization

- Batch group membership checks
- Implement pagination for group data
- Optimize permission queries

## Security Considerations

### 1. Access Control

- Strict group isolation
- Permission validation at all levels
- Audit logging for group operations

### 2. Data Protection

- Encrypt sensitive group data
- Implement data retention policies
- Secure group member management

### 3. Authentication

- Group-based authentication contexts
- Session management with group awareness
- Multi-factor authentication for managers

## Monitoring & Analytics

### 1. Group Metrics

- Group creation and deletion rates
- User activity per group
- Project and task completion by group

### 2. Performance Monitoring

- API response times for group operations
- Database query performance
- Frontend rendering performance

### 3. Security Monitoring

- Failed access attempts
- Cross-group access violations
- Permission escalation attempts

## Conclusion

This comprehensive implementation plan provides a structured approach to adding group/organization functionality to the Task Manager application. The new hierarchy will enable multi-tenant usage while maintaining security and performance standards.

The phased approach allows for incremental development and testing, ensuring a smooth transition from the current architecture to the new group-based system.

Key benefits of this implementation:

- **Multi-tenant support**: Multiple organizations can use the same instance
- **Clear hierarchy**: Group → Project → Task structure
- **Granular permissions**: Role-based access at each level
- **Scalability**: Designed to grow with organizational needs
- **Security**: Strict isolation between groups
- **Flexibility**: Configurable roles and permissions

The implementation maintains backward compatibility while providing a foundation for future enhancements and additional features.
