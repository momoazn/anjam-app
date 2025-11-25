# Task 01 – Schema & Access Rules

## Goal

Introduce the `groups` concept into PocketBase by updating `pb_schema.json` and regenerating types, so that all other tasks can build on a consistent **group → project → task** hierarchy.

## Scope

- Only edit `pb_schema.json`.
- Regenerate TypeScript types with the existing script.
- Do **not** change any Go or frontend code in this task.

## Requirements & Constraints

- Hierarchy: `group → project → task`.
- Roles: `admin`, `manager`, `supervisor`, `employee`.
- Each user belongs to **exactly one group** (via `users.group` relation).
- Projects belong to a single group.
- Tasks belong to a project, which in turn belongs to a group.
- Access control should rely on PocketBase collection rules as much as possible.

## Steps

### 1. Add `groups` collection

In `pb_schema.json`, add a new `groups` collection:

- `name`: `"groups"`
- `type`: `"base"`
- Fields:
  - `name`: `text`, required, max 200.
  - `code`: `text`, required, max 10, unique.
  - `description`: `editor`, optional.
  - `manager`: `relation` → `_pb_users_auth_`, `maxSelect: 1`, required.
  - `active`: `bool`, default `true`.
  - `created`: `autodate`, `onCreate: true`.
  - `updated`: `autodate`, `onCreate: true`, `onUpdate: true`.

Access rules:

- `listRule` / `viewRule`:
  - `admin` can see all.
  - `manager` can see groups where they are the `manager`.
- `createRule`:
  - Only `admin`.
- `updateRule`:
  - `admin`, or `manager` of that group.
- `deleteRule`:
  - Only `admin`.

You can take the exact JSON snippet from the main `GROUP_ORGANIZATION_IMPLEMENTATION.md` document.

### 2. Update `users` collection

In the `users` collection definition:

1. **Add `group` relation field**
   - `name`: `"group"`
   - `type`: `"relation"`
   - `collectionId`: `"groups"` (the new collection)
   - `maxSelect`: `1`
   - `required`: `false` (PocketBase-level; logical requirement will be enforced later)

2. **Add `"manager"` to role values**
   - Extend the `role` select field values to:
     - `"admin"`, `"manager"`, `"supervisor"`, `"employee"`.

3. **Update access rules** to reflect the new hierarchy and roles:
   - `admin`: can list/view all users.
   - `manager`: can list/view users in their group and manage them (except creating other admins/managers).
   - `supervisor`: can list/view users in their group.
   - Every user can view and update their own profile.

Use the concrete rules from `GROUP_ORGANIZATION_IMPLEMENTATION.md` as the source of truth.

### 3. Update `projects` collection

In the `projects` collection definition:

1. **Add `group` relation field**
   - `name`: `"group"`
   - `type`: `"relation"`
   - `collectionId`: `"groups"`
   - `maxSelect`: `1`
   - `required`: `true`.

2. **Update access rules** so that:
   - `admin`: full access.
   - `manager`: access to projects in their group (where `group.manager.id = @request.auth.id`).
   - `supervisor`: access to projects where they are the `supervisor`.
   - Employees: access through `users_projects` membership.

### 4. Update `tasks` collection rules

Update `tasks` collection rules to enforce:

- `admin`: full access.
- `manager`: access to tasks where the project’s group is managed by them.
- `supervisor`: access to tasks in their supervised projects.
- `employee`:
  - Can view tasks in their projects.
  - Can update **only** their own tasks’ `status`.

Use `project.group.manager.id`, `project.supervisor.id`, and `assignee.id` in the rules, as already specified in the main doc.

### 5. Update `users_projects` collection rules

Update the `users_projects` collection rules so that:

- `admin`: full access.
- `manager`: can manage user–project assignments **only** when the project belongs to their group.
- Users can see their own `users_projects` memberships.

### 6. Regenerate TypeScript types

After updating `pb_schema.json`:

1. Run:

```bash
bun run gen:type
```

2. Verify in `src/lib/pocketbase-types.ts`:
   - `GroupsResponse` type exists.
   - `UsersResponse` includes the `group` relation.
   - `UsersRoleOptions` includes `"manager"`.

### 7. Quick sanity checks

- PocketBase admin UI shows the new `groups` collection with the correct fields and rules.
- Users, projects, tasks, and users_projects collections all save correctly with the new relations.

Once this task is complete and types are regenerated, the next tasks (backend handlers and frontend changes) can safely assume the new schema is in place.

