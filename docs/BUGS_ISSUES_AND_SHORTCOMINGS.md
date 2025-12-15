# Bugs, Issues, and Obvious Shortcomings (Current State Snapshot)

This document captures concrete problems and notable gaps discovered during a quick codebase review. It is a working list, not an exhaustive audit.

## 1. Confirmed Bugs / Test Failures

- **`getTaskStatus` can return `undefined`**
  - File: `src/lib/status-utils.ts`
  - Function `getTaskStatus(task: TasksResponse)` simply does `TASK_STATUS_CONFIG[task.status]` without a fallback.
  - `bun run test:unit:run` currently fails in `src/lib/status-utils.test.ts` on: “should return default todo status when task status is undefined” because `result` is `undefined`.
  - Impact: Any task record with a missing/invalid `status` can cause runtime errors wherever `getTaskStatus` is used (e.g. accessing `result.key`, `result.isCompleted`, etc.).
  - Fix direction: Add a safe fallback (e.g. default to `todo` config) and keep test expectations aligned with that behavior.

**Step‑by‑step mitigation**

1. Open `src/lib/status-utils.ts` and locate `getTaskStatus(task: TasksResponse)`.
2. Change the implementation to:
   - Resolve `task.status` to a valid key if present.
   - Fallback to the `todo` configuration when `task.status` is missing or not in `TASK_STATUS_CONFIG`.
   - Keep the return type as `TaskStatusConfig` (never `undefined`).
3. Update `src/lib/status-utils.test.ts` only if needed so that:
   - The “undefined status” test expects a valid config with `.key === "todo"` and `.isCompleted === false`, `.isCanceled === false`.
4. Run `bun run test:unit:run` and ensure all tests pass.
5. Run `bun run quality:check` to confirm linting/formatting are still clean.

- **Duplicated return line in `isTerminalStatus`**
  - File: `src/lib/status-utils.ts`
  - Function `isTerminalStatus` contains two identical `return config.isCompleted || config.isCanceled` lines.
  - Impact: No functional bug, but signals a copy–paste mistake and hurts readability.
  - Fix direction: Remove the duplicate line and ensure there is a single, clean return statement.

**Step‑by‑step mitigation**

1. Open `src/lib/status-utils.ts` and find `isTerminalStatus(status: TasksStatusOptions)`.
2. Remove the extra duplicate `return` line so there is only one return statement.
3. Run `bun run test:unit:run` and confirm the status‑utils tests still pass.
4. Optionally run `bun run format:fix` to auto‑format the file if needed.

## 2. Documentation Inconsistencies

- **README test script names vs `package.json`**
  - README references scripts like `bun run test`, `bun run test:run`, `bun run test:ui`, `bun run test:coverage`.
  - `package.json` defines `test:unit`, `test:unit:run`, `test:unit:ui`, `test:unit:coverage` plus Playwright E2E scripts.
  - Impact: New contributors will run commands that don’t exist and may assume tests are broken.
  - Fix direction: Align README with `package.json` (or vice versa) and clearly distinguish unit vs E2E scripts.

**Step‑by‑step mitigation**

1. Open `package.json` and list the current scripts related to tests:
   - `test:unit`, `test:unit:run`, `test:unit:ui`, `test:unit:coverage`.
   - `test:e2e`, `test:e2e:ui`, `test:e2e:debug`, `test:all`.
2. Open `README.md` and find the “Testing” section.
3. Update the commands listed in README so that:
   - Unit tests reference `bun run test:unit` (watch) or `bun run test:unit:run` (single run).
   - E2E tests reference `bun run test:e2e`, `bun run test:e2e:ui`, etc.
4. Remove or adjust any references to scripts that don’t exist (`test`, `test:run`, etc.).
5. Optionally add a short explanation that:
   - Unit tests focus on logic and components.
   - E2E tests (Playwright) cover full flows.
6. Commit the changes together with any bug fixes so documentation and behavior stay in sync.

- **Missing docs referenced from README**
  - README links the following files which do not exist in `docs/`:
    - `docs/PROJECT_OVERVIEW.md`
    - `docs/DEVELOPMENT_GUIDE.md`
    - `docs/DEVELOPMENT_ROADMAP.md`
    - `docs/IMPLEMENTATION_STATUS.md`
    - `docs/QA_TESTING_GUIDE_SLIM.md`
  - Currently present: `docs/ROOT_STRUCTURE.md`, `docs/FULL_THESIS_PROPOSAL.md`, and the `GROUP_TASK_*` docs.
  - Impact: Broken expectations around documentation and onboarding; reviewers and new team members lack a canonical overview, roadmap, and implementation status.
  - Fix direction: Either (a) create these docs with at least minimal content, or (b) remove/update the links from README to reflect the current docs layout.

**Step‑by‑step mitigation**

Option A – **Create missing docs (recommended)**

1. In `docs/`, add minimal but accurate versions of:
   - `PROJECT_OVERVIEW.md` (high‑level purpose, main features, target users).
   - `DEVELOPMENT_GUIDE.md` (how to run app, tests, quality checks, coding style).
   - `DEVELOPMENT_ROADMAP.md` (short‑ to medium‑term feature roadmap).
   - `IMPLEMENTATION_STATUS.md` (what’s implemented vs planned; can link to this file).
   - `QA_TESTING_GUIDE_SLIM.md` (how to run tests locally, how to validate key flows).
2. Ensure each doc has:
   - A clear H1, short summary, and links to related docs.
3. Update `README.md` to:
   - Keep the links, but align their labels/descriptions with the actual content you just added.

Option B – **Tighten README (quick but less ideal)**

1. Remove links to non‑existent docs from `README.md`.
2. Replace them with links to the existing docs, like `ROOT_STRUCTURE.md` and any new high‑value docs you decide to add.
3. Re‑introduce further links when new docs are created.

## 3. Design / Implementation Shortcomings (Non‑Blocking, but Important)

These are not “bugs” in the strict sense, but they are structural or UX gaps that will matter as the product grows.

### 3.1. Status Handling Robustness

- The code assumes `task.status` is always a valid `TasksStatusOptions` value.
- There is no defensive handling for unknown/legacy statuses or corrupted data, neither in the backend nor in the status utilities.
- Improvement idea:
  - Backend: enforce status values at write time and consider a migration strategy if statuses ever change.
  - Frontend: treat unknown statuses as a safe default (`todo` or a special “unknown” status) instead of failing hard.

**Step‑by‑step mitigation**

Backend:

1. Review `backend/pb_schema.json` for the `tasks` collection and confirm the `status` field is a `select` with the allowed values you expect.
2. If you change or extend status values in the future, do it via schema migration and:
   - Add migration scripts to update existing records to valid statuses.
   - Consider an explicit “legacy” or “unknown” status if needed.
3. Ensure any custom API endpoints that manipulate tasks (if later added) validate incoming `status` against the allowed set before saving.

Frontend:

1. Implement a robust `getTaskStatus` as described earlier, with a safe fallback.
2. Consider adding a helper like `isValidStatus(status: string)` in `status-utils.ts` that checks membership in `TASK_STATUS_CONFIG`.
3. In any component that consumes raw `task.status`, prefer using `getTaskStatus(task)` so that the fallback path is centralized.
4. Add tests for:
   - Unknown string status.
   - Missing/undefined status.
   - Legacy values (if applicable in the future).

### 3.2. Notifications Are Internal‑Only

- File: `backend/main.go` (`createNotification` and related handlers)
  - Notifications are stored in the `notifications` collection and surfaced in the UI, but there are no outbound channels (email, Slack/Teams, webhooks).
  - Impact: Users must actively open the app to notice changes; for distributed teams this can be a big UX gap.
  - Improvement idea: add an integration layer for sending certain notification types to external channels, with user‑level preferences.

**Step‑by‑step mitigation (incremental)**

Phase 1 – **Email only**:

1. Decide on an email delivery mechanism (PocketBase built‑in mail config, or external service).
2. Extend `createNotification` or the calling handlers to:
   - Optionally enqueue a “send email” job (via a simple queue collection or a background process) when certain notification types are created (`task_assigned`, `comment`, etc.).
3. Add a user‑level setting (e.g. `email_notifications_enabled` boolean field on `users`) in `backend/pb_schema.json`.
4. When creating notifications, check this flag; only enqueue outbound emails when enabled.
5. Implement a lightweight worker (could be a Go routine that periodically polls a `notification_jobs` collection) to send pending emails.

Phase 2 – **Webhooks/Slack/Teams**:

1. Create a new collection (e.g. `integrations`) in `pb_schema.json`:
   - Fields: `type` (`webhook`, `slack`, `teams`), `endpoint`, `secret`, `enabled`, `organization`/`group`/`user` scope.
2. Add a minimal integration manager in the backend:
   - On notification creation, look up enabled integrations for the relevant scope.
   - Post a summarized payload (task id, title, link, action type) to the integration target.
3. For Slack/Teams, start with incoming webhooks before implementing full OAuth‑based bots.
4. Add UI controls in Settings for admins to configure integrations and test connectivity.

### 3.3. Static Permission Model

- File: `src/lib/permissions.ts`
  - Permissions are hard‑coded in a `PERMISSIONS` map and roles are limited to `admin`, `manager`, `supervisor`, `employee`.
  - Impact: Difficult to adapt to more nuanced access requirements without code changes (e.g. per‑project roles, custom roles per client).
  - Improvement idea: move toward a configurable permission model (stored in PocketBase) while keeping the current map as a sane default.

**Step‑by‑step mitigation (evolution path)**

Phase 1 – **Clean up and document existing model**:

1. Ensure `src/lib/permissions.ts` and PocketBase rules in `backend/pb_schema.json` are consistent.
2. Add a short comment block or a dedicated doc page explaining:
   - What each role can do.
   - Which `Permission` keys exist and where they are used in the UI/routes.
3. Add tests (if not already present) that assert:
   - Each role has expected permissions (you already have `permissions.test.ts`; keep it updated).

Phase 2 – **Introduce data‑driven overrides**:

1. Add a collection (e.g. `role_permissions`) to `pb_schema.json`:
   - Fields: `role`, `permission`, `allowed`, optional `organization`/`group` scope.
2. In `permissions.ts`, extend the `can` function to:
   - Check for overrides in `role_permissions` (fetched and cached at login, stored in state or a query cache).
   - Fallback to the static `PERMISSIONS` map when no overrides exist.
3. Add a simple admin UI (possibly under Settings) to:
   - View and edit role → permission mappings for the current tenant/group.

Phase 3 – **Per‑project permissions (optional)**:

1. If required, introduce project‑specific roles/ACLs in a `project_members` or `project_roles` collection.
2. Update policy logic so that project‑level rules can further restrict or extend base role permissions for that project.

### 3.4. No Global Search Across Entities

- While there are rich filters (and saved filters) on tasks and some pages, there is no single global search entry point across tasks, projects, comments, and users.
- Impact: As data volume grows, users must “know where to look” instead of simply searching from one place.

**Step‑by‑step implementation guide**

1. Decide on search scope for v1:
   - At minimum: tasks and projects by title/code and description.
2. Backend options:
   - Option A: implement a simple `/api/tm/search?q=...` endpoint that queries PocketBase collections (`tasks`, `projects`) using `LIKE` filters.
   - Option B: reuse PocketBase list endpoints directly from the frontend by issuing parallel queries and merging the results.
3. Frontend:
   - Add a global search input in a prominent location (header or command palette).
   - When the user types and submits, call the search endpoint or parallel queries.
   - Display results grouped by type (tasks vs projects) with links to the relevant detail pages.
4. Add debouncing and minimal loading states so search feels responsive.
5. Later iterations can introduce:
   - Comment and user search.
   - Full‑text search via an external engine if needed.

### 3.5. No First‑Class Subtasks / Epics / Dependencies

- The domain model currently supports projects and tasks (plus tags, comments, time tracking).
- There is no first‑class notion of:
  - Subtasks or checklists inside a task.
  - Epics/initiatives spanning multiple tasks/projects.
  - Explicit task dependencies (“blocked by”, “blocks”) beyond using the `blocked` status.
- Impact: Larger projects and engineering teams may find it hard to model complex work breakdown and cross‑task dependencies.

**Step‑by‑step implementation guide (incremental)**

Phase 1 – **Subtasks/checklists**:

1. Add a `subtasks` collection or a self‑relation in `tasks`:
   - Option A: `subtasks` collection with fields: `parent_task` (relation to `tasks`), `title`, `status`.
   - Option B: `parent_task` relation directly on `tasks` (self‑referential), plus a `type` field (`task` vs `subtask`).
2. Update `pb_schema.json` accordingly and regenerate types with `bun run types:generate`.
3. In `task-details.tsx`, add a subtask list and creation UI:
   - Display child tasks or checklist items.
   - Allow changing their status in place.
4. Decide how subtasks affect the parent status (if at all) and document it.

Phase 2 – **Dependencies**:

1. Add a `task_dependencies` collection with fields:
   - `task` (the dependent task).
   - `depends_on` (the prerequisite task).
   - Optional `type` or `note`.
2. Expose these relations in task details and optionally in task list tooltips.
3. Update business logic (optional) so that:
   - Changing a task to `done` is allowed even if dependencies are not done but shows a warning, or
   - Certain transitions are blocked until dependencies are satisfied (more complex).

Phase 3 – **Epics/initiatives**:

1. Introduce an `epics` or `initiatives` collection with links to multiple projects/tasks.
2. Add Epic view pages and high‑level status summaries.
3. Wire epics into reports so enterprise and large teams can use them for roadmapping.

### 3.6. Limited Auditing Beyond Logins

- You log login attempts (`user_login_logs`) and leverage PocketBase timestamps on records.
- There is no dedicated audit log stream for “who changed what, when, from where” on tasks/projects/comments (field‑level diffs, IP, user agent).
- Impact: Harder to debug data issues, and not sufficient for strict compliance environments.

**Step‑by‑step implementation guide**

1. Add an `audit_logs` collection to `backend/pb_schema.json` with fields:
   - `actor` (relation to `users`).
   - `entity_type` (e.g. `task`, `project`, `comment`, `user`).
   - `entity_id` (string or relation).
   - `action` (`create`, `update`, `delete`, `status_change`, etc.).
   - `metadata` (JSON/text to store field diffs or contextual info).
   - `ip_address`, `user_agent` (optional, but recommended).
2. In `backend/main.go`, hook into record events (`OnRecordAfterCreateSuccess`, `OnRecordAfterUpdateSuccess`, `OnRecordAfterDeleteSuccess`) for key collections and:
   - Build a small summary of the change (e.g. changed fields, old vs new values for a subset).
   - Insert a record into `audit_logs`.
3. Reuse the IP and user agent extraction logic from `logUserLogin` where possible.
4. Create a simple admin UI (maybe under Settings → Security) to:
   - Filter and view audit logs by date, actor, or entity.
5. Later, add export functionality (CSV or API endpoint) for audit logs to support external SIEM ingestion.

## 4. Known Architectural Constraints

These aren’t “bugs” but are important to call out explicitly.

- **Single‑tenant architecture**

  - There is no concept of organizations/tenants or tenant scoping in `backend/pb_schema.json`. All groups, users, and projects live in a single logical space.
  - This is fine for small deployments but becomes a limitation when serving multiple independent customers.

- **Synchronous side effects in HTTP requests**
  - Login tracking and notification creation happen synchronously in request handlers and middleware.
  - Under higher load or with heavy notification logic, this could impact response times.

These constraints should inform future architectural roadmap discussions (multi‑tenancy, background jobs, integrations, etc.).

**High‑level mitigation ideas**

- For multi‑tenant needs:

  - Introduce an `organizations` collection and associate key entities with an `organization` field.
  - Update access rules and queries to always filter by the current organization (derived from auth context).

- For synchronous side effects:
  - Introduce a simple job queue collection (e.g. `jobs` with type and payload).
  - Replace direct notification/email sending inside request handlers with job enqueuing.
  - Run a background worker process (or a scheduled job) that processes jobs out of band, improving request latency and reliability.
