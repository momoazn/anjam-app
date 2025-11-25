# Task 03 – Frontend Permissions & Text

## Goal

Update the frontend permission system and text constants to support the new `group` concept and the `manager` role.

## Scope

- `src/lib/permissions.ts`
- `src/constants/text/fa.ts`
- No changes to components, pages, or hooks in this task.

## Prerequisites

- Task 01 (schema & rules) and Task 02 (backend handlers) are complete or in progress.

## Steps

### 1. Update `PERMISSIONS` in `src/lib/permissions.ts`

1. Open `src/lib/permissions.ts`.
2. Replace the existing `PERMISSIONS` constant with the new version that includes:
   - Group permissions:
     - `"groups.view"` – `["admin"]`
     - `"groups.manage"` – `["admin"]`
     - `"group.view"` – `["admin", "manager", "supervisor", "employee"]`
     - `"group.users.view"` – `["admin", "manager", "supervisor", "employee"]`
     - `"group.users.manage"` – `["admin", "manager"]`
   - Project permissions:
     - `"projects.view"` – `["admin", "manager", "supervisor", "employee"]`
     - `"projects.manage"` – `["admin", "manager", "supervisor"]`
     - `"projects.create"` – `["admin", "manager"]`
   - Task permissions:
     - `"tasks.view"` – `["admin", "manager", "supervisor", "employee"]`
     - `"tasks.manage"` – `["admin", "manager", "supervisor"]`
     - `"tasks.create"` – `["admin", "manager", "supervisor"]`
     - `"tasks.own.update"` – `["admin", "manager", "supervisor", "employee"]`
   - User management:
     - `"users.view"` – `["admin", "manager", "supervisor"]`
     - `"users.manage"` – `["admin", "manager"]`
     - `"users.create"` – `["admin", "manager"]`
   - Reports & system:
     - `"reports.view"` – `["admin", "manager", "supervisor"]`
     - `"notifications.view"` – `["admin", "manager", "supervisor", "employee"]`
     - `"helps.view"` – `["admin", "manager", "supervisor", "employee"]`

Use the exact object from the main implementation guide to avoid typos.

### 2. Add helper functions for the `manager` role

In `src/lib/permissions.ts`, after existing role helpers like `isAdmin`, add:

```ts
export function isManager(userRole: UsersRoleOptions | null): boolean {
  return userRole === "manager";
}

export function canManageUsers(userRole: UsersRoleOptions | null): boolean {
  return isAdmin(userRole) || isManager(userRole);
}

export function canCreateProjects(userRole: UsersRoleOptions | null): boolean {
  return isAdmin(userRole) || isManager(userRole);
}
```

These will be used by later tasks when updating pages and components.

### 3. Add text constants for groups

In `src/constants/text/fa.ts`:

1. Add a new `groups` section (near other sections like `projects`, `tasks`):

```ts
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

2. In `sidebar`, add:

```ts
groups: "گروه‌ها",
```

3. In `projects.form`, add:

```ts
group: "گروه",
selectGroup: "انتخاب گروه",
```

4. In `users.form`, add similar keys for `group` and `selectGroup` if they do not already exist.

### 4. Verify types and build

Run:

```bash
bun run type:check
```

Fix any type errors that appear (for example, if `UsersRoleOptions` doesn’t include `"manager"`, go back to Task 01).

This task is complete when:

- `PERMISSIONS` includes all group-related entries.
- Helper functions compile with no errors.
- All new text constants are defined and used in later tasks without missing-key issues.
