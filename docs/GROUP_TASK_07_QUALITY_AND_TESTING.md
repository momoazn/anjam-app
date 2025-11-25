# Task 07 – Quality Checks & Manual Testing

## Goal

Validate the new group/organization feature end-to-end by running automated checks and performing manual role-based testing.

## Scope

- No code changes unless needed to fix discovered issues.
- Commands and manual test flows only.

## Prerequisites

- Tasks 01–06 are complete and the app builds.

## Steps

### 1. Run automated checks

From the project root:

```bash
bun run check
```

This runs type checking, linting, and formatting checks.

If there are any errors:

- Fix them in the relevant files.
- Re-run `bun run check` until it passes.

Optionally, also run:

```bash
bun run build
```

to ensure the full build (frontend + backend) succeeds.

### 2. Reset database for a clean test

Follow the project’s pattern for resetting data:

1. Stop any running dev server.
2. Delete `data/data.db`.
3. Start the backend (or full dev stack):

```bash
bun run dev:server
```

4. The server should bootstrap a new database with the updated schema.

### 3. Seed basic test data (via UI)

Using the PocketBase admin UI and/or the app’s UI:

1. Log in as default admin (`admin` / `admin12345` or configured credentials).
2. Create at least 2 groups, with different managers.
3. For each group:
   - Create supervisors and employees (ensuring their `group` is set).
   - Create several projects assigned to supervisors.
   - Create tasks within those projects and assign them to employees.

### 4. Manual role-based testing

#### Admin

- Can:
  - View all groups in `/groups`.
  - Create a new group and assign a manager.
  - Toggle group `active` status.
  - Delete a group when suitable.
  - View all projects and tasks across all groups (per existing behavior).

#### Manager

- Log in as a manager assigned to a specific group.
- Verify:
  - They can see only their group’s data where appropriate.
  - They can create projects in their own group.
  - Group select is fixed/disabled to their group where required.
  - They can create users (supervisors/employees) in their group.
  - They **cannot** create admins or other managers.

#### Supervisor

- Log in as a supervisor in a group.
- Verify:
  - They can see group info relevant to them.
  - They can create tasks only in their assigned projects.
  - They cannot create projects or users.
  - They can view all users in their group (if allowed by rules).

#### Employee

- Log in as an employee.
- Verify:
  - They can see tasks assigned to them.
  - They can update the status of their own tasks.
  - They cannot create tasks, projects, or users.

### 5. Permission boundary checks

Test cross-group isolation:

- Try assigning a supervisor from Group A to a project in Group B:
  - Expected: backend validation (`handleProjectCreationWithGroup`) rejects it.
- Try assigning a user from Group A to a project in Group B:
  - Expected: backend validation (`handleUsersProjectsValidation`) rejects it.
- Verify managers:
  - Cannot see or manipulate groups where they are not the manager (check `groups` collection rules).

### 6. Final checklist

- `bun run check` passes.
- `bun run build` succeeds.
- `go build` succeeds.
- All role workflows behave as described above.
- No unexpected cross-group access is possible.

If any issues are found, create a focused follow-up task document describing the bug and the required fix.
