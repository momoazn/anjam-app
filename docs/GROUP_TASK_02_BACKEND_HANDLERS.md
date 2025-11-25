# Task 02 – Backend Group Handlers (Go)

## Goal

Extend the Go backend so that:

- Groups get auto‑generated codes.
- Projects enforce supervisor–group consistency.
- User–project assignments enforce group consistency.
- Managers receive a notification when they are assigned to a new group.

## Scope

- Only edit `main.go`.
- Do **not** add any new HTTP routes.
- Rely on PocketBase’s built‑in CRUD endpoints and collection rules for access control.

## Prerequisites

- Task 01 (schema & rules) is complete and `pb_schema.json` is updated.
- `bun run gen:type` has been run successfully.
- The existing app builds with `go build`.

## Steps

### 1. Register new record event handlers

In `main.go`, find the section where existing record event handlers are registered (the `app.OnRecord...` calls near the top of `main()`).

Add registrations for the new handlers **after** the existing ones:

```go
// Group management handlers
app.OnRecordCreateExecute("groups").BindFunc(handleGroupCreation)
app.OnRecordAfterCreateSuccess("groups").BindFunc(handleGroupCreatedNotification)

// Group-aware project creation validation
app.OnRecordCreateExecute("projects").BindFunc(handleProjectCreationWithGroup)

// Group-aware user-project assignment validation
app.OnRecordCreateExecute("users_projects").BindFunc(handleUsersProjectsValidation)
```

Ensure that any existing `projects` create handler logic (for project codes) is invoked from inside `handleProjectCreationWithGroup` (see next step).

### 2. Implement `handleGroupCreation`

Add this function **before** `main()` (near existing helper functions):

- Purpose:
  - Auto-generate unique 3-letter uppercase codes for groups (similar to project codes).
  - Set `active` to `true` by default.
- Behavior:
  - Generate a code using your existing random helper (e.g., `generateRandomCode()`).
  - Check for collisions in the `groups` collection; retry up to 100 times.
  - If no unique code can be generated, return an error.
  - Set `record.Set("code", code)` and `record.Set("active", true)`.

You can copy the detailed implementation from the main `GROUP_ORGANIZATION_IMPLEMENTATION.md` document.

### 3. Implement `handleProjectCreationWithGroup`

Add this function before `main()`:

- Purpose:
  - Wrap the existing project creation logic (`handleProjectCreation`) and add a group constraint.
- Behavior:
  1. Call the existing `handleProjectCreation(e)` to keep project code generation intact.
  2. Read `groupId` from `record.GetString("group")`.
  3. Read `supervisorId` from `record.GetString("supervisor")`.
  4. If either is empty, skip additional validation and call `e.Next()`.
  5. Fetch the supervisor user record from `users`.
  6. Compare `supervisor.GetString("group")` with `groupId`.
  7. If they differ, return an error (message in Farsi) indicating the supervisor must belong to the same group.

### 4. Implement `handleUsersProjectsValidation`

Add this function before `main()`:

- Purpose:
  - Enforce that a user can only be assigned to a project in the same group.
- Behavior:
  1. Read `userId` and `projectId` from the `users_projects` record.
  2. If either is empty, call `e.Next()`.
  3. Fetch the user record (`users`) and project record (`projects`).
  4. Compare `user.GetString("group")` with `project.GetString("group")`.
  5. If they differ, return an error (Farsi message) indicating the user and project must be in the same group.

### 5. Implement `handleGroupCreatedNotification`

Add this function before `main()`:

- Purpose:
  - Notify the group manager when they are assigned to manage a new group.
- Behavior:
  1. Read `managerId` from `record.GetString("manager")`.
  2. If empty, simply call `e.Next()`.
  3. Create a new `notifications` record:
     - `user`: `managerId`
     - `type`: `"system"`
     - `title`: Farsi text for “New group created”
     - `message`: Farsi text indicating they have been assigned as manager for the group name.
     - `read`: `false`
     - `data`: JSON with `group_id`, `group_name`.
  4. Save the notification with `e.App.Save(notification)`.
  5. If saving fails, log the error but do **not** fail the group creation (`return e.Next()`).

Follow the existing notification creation patterns used elsewhere in `main.go`.

### 6. Build and fix compile errors

Run:

```bash
go build
```

Fix any:

- Missing imports (e.g., `errors`, `fmt`, `log`, `dbx`, `models`, `core`).
- Typo or type errors in handler function signatures.

The task is complete when:

- `go build` succeeds with no errors.
- No unused imports remain.
