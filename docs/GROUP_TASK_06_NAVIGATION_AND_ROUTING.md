# Task 06 – Navigation & Routing

## Goal

Expose the new group pages through the sidebar and router, with appropriate permission protection.

## Scope

- `src/components/sidebar.tsx`
- `src/router.tsx`

## Prerequisites

- Tasks 03–05 are complete (permissions, text, hooks, and pages exist).

## Steps

### 1. Sidebar – add Groups menu item

**File**: `src/components/sidebar.tsx`

1. Import `Building2` from `lucide-react` if not already present.
2. In the sidebar items configuration (the array defining entries for the main navigation), add:

```ts
{
  title: fa.sidebar.groups,
  icon: Building2,
  url: "/groups",
  roles: [UsersRoleOptions.admin],
},
```

- Place it after the Dashboard item and before Projects for better discoverability.
- This ensures only `admin` users see the Groups menu.

### 2. Router – add group routes

**File**: `src/router.tsx`

1. Import the new pages at the top:

```ts
import Groups from "./pages/groups";
import CreateGroup from "./pages/create-group";
import GroupDetails from "./pages/group-details";
import EditGroup from "./pages/edit-group";
```

2. In the routes array (where other app routes are defined), add group-related routes after project routes:

```tsx
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

- `Groups` and `CreateGroup` are permission-protected using the `"groups.view"` and `"groups.manage"` permissions defined in Task 03.
- `GroupDetails` is just behind `ProtectedRoute` so that any authenticated user with collection-level permission can load it.
- `EditGroup` is restricted to users with `"groups.manage"` (admins).

### 3. Verify routing works

Run the app in dev mode:

```bash
bun run dev
```

Check:

- As `admin`:
  - `Groups` page is accessible at `/groups`.
  - `CreateGroup` page at `/groups/new`.
  - Details and edit pages are reachable via the UI.
- As `manager` / `supervisor` / `employee`:
  - Groups sidebar item is **hidden**.
  - Direct navigation to `/groups` should be blocked by permissions.

Task is complete when:

- Navigation works without runtime errors.
- Routes behave according to the permission model.

