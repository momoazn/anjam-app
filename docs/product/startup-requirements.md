# Essentials for Small–Medium Startup Teams

This document captures which capabilities are truly essential for startups and small/medium teams (roughly 5–100 people) to successfully adopt and rely on Anjam in production.

## 1. Product‑Level Essentials

These are core to day‑to‑day usefulness; without them the app will feel incomplete.

- **Solid core model**
  - Projects with basic metadata (name, code, description, status).
  - Tasks with: assignee, status, priority, due dates, tags, rich description, time tracking, and comments.
  - Links between projects and tasks, and between tasks and comments.

**How to implement / validate**

1. **Backend model**
   - Verify Convex schema in `convex/schema.ts` defines:
     - `projects` with fields such as `name`, `description`, `code`, `group`, status fields as needed.
     - `tasks` with `project` relation, `assignee`, `creator`, `priority`, `status`, `deadline`, `tags`, `description`, `time_spent_minutes`, `estimated_hours`, `estimated_minutes` (already present).
     - `comments` with `task` relation, `content`, `created_by`.
   - Run `bunx convex dev` after any schema change to keep generated types in sync.

2. **Frontend usage**
   - Ensure the create/edit pages (`src/pages/create-project.tsx`, `create-task.tsx`, `edit-project.tsx`, `edit-task.tsx`) expose these fields clearly.
   - In `task-details.tsx` and `project-details.tsx`, show:
     - Links between tasks and their parent project.
     - Primary fields (title, status, priority, assignee, due date, time spent).
   - Add basic validation using `zod` + `react-hook-form` so required fields are enforced consistently.

- **Useful views & navigation**
  - Task list with powerful filtering (status, assignee, project, tags, date ranges).
  - Saved filters / “views” for common workflows (e.g. “My tasks”, “Overdue”, “This week”).
  - Project overview pages summarizing tasks, members, and key status indicators.
  - Calendar view for tasks by due date and a basic timesheet view (already implemented).

**How to implement / validate**

1. **Task list & filters**
   - Confirm `src/pages/tasks.tsx` uses the `task-filters` components and supports filtering by status, assignee, project, tags, and date.
   - Use `src/components/task/task-filters.tsx` and related components (`saved-filters-dropdown.tsx`, `manage-saved-filters-dialog.tsx`) to:
     - Provide “saved filters” for common views (e.g. “My tasks”, “Overdue tasks”).
2. **Project overview**
   - In `src/pages/project-details.tsx`, verify that:
     - The page shows project metadata and key aggregate info (task counts by status, members, recent activity).
   - If missing, add basic metrics using existing queries and `status-utils` helpers.
3. **Calendar and timesheet**
   - Confirm `src/pages/task-calendar.tsx` shows tasks by due date and supports basic navigation (previous/next/today).
   - Confirm `src/pages/timesheet.tsx` provides a weekly view per user with CSV export.
   - Add tests for the main data‑fetching hooks where practical (e.g. using React Query test utilities).

- **Notifications inside the app**
  - In‑app notifications when tasks are assigned, status changes, or comments are added (already implemented on top of the `notifications` collection).
  - Notification center with unread counts and bulk “mark as read” actions.

**How to implement / validate**

1. **Backend functions**
   - In `convex/` directory, confirm these functions are implemented:
     - `createTaskAssignmentNotification` for task assignment.
     - `createTaskUpdateNotification` for status changes.
     - `createProjectUpdateNotification` for project changes.
     - `createCommentNotification` for new comments.
2. **Notification creation**
   - Verify `createNotification` writes to the `notifications` collection safely (it already validates user existence and doesn’t fail the parent operation).
3. **Frontend UI**
   - Check `src/components/notification-badge.tsx` / `notification-dropdown.tsx` and `src/pages/notifications.tsx` to ensure:
     - Unread counts are displayed in the header/sidebar.
     - Users can mark notifications as read (individually and “mark all as read”).
4. **Smoke test**
   - Run the app locally, create a task assigned to another user, then log in as that user and ensure a notification appears.
   - Add a quick manual test checklist in a QA doc so others can repeat this easily.

## 2. Access Control & Security Essentials

Startups need sensible guardrails, not full enterprise IAM complexity.

- **Basic RBAC (fixed roles)**
  - A small set of roles (admin, manager, supervisor, employee) with clearly defined powers (as you already have in `src/lib/permissions.ts` and Convex auth rules).
  - Key boundaries:
    - Only admins/managers can create or deactivate users.
    - Only certain roles can create/update/delete projects.
    - Everyone can see and update their own tasks and profile.

**How to implement / validate**

1. **Permissions map**
   - Review `src/lib/permissions.ts` to ensure each `Permission` key matches actual usage across routes (`src/router.tsx`) and components.
   - Keep `permissions.test.ts` in sync with any changes to avoid regressions.
2. **Convex auth rules**
   - In `convex/` directory, confirm each query/mutation has proper authentication and authorization checks that align with the intended RBAC model.
   - Pay special attention to `users`, `organizations`, `projects`, `tasks`, and `organizationMembers` collections.
3. **Route protection**
   - Check `src/router.tsx`:
     - Routes that should be restricted by role use `PermissionProtectedRoute` with an appropriate `permission` key.
     - Routes like `/users`, `/groups` are correctly guarded.
4. **Manual QA**
   - Create test users with each role in dev.
   - Log in as each role and verify:
     - They can/cannot access pages according to expectations.
     - Unauthorized access redirects to a safe page (e.g. dashboard) without leaking data.

- **Account safety basics**
  - Strong password auth with server‑side validation.
  - Automatic blocking after a configurable number of failed logins (already implemented via `MaxFailedLoginAttempts` and login tracking).
  - Ability for admins to unblock users and toggle active/inactive status (already implemented via custom `/api/tm/users/*` endpoints).

**How to implement / validate**

1. **Login protection**
   - Review authentication middleware and related functions in `convex/auth.ts` to ensure:
   - Failed attempts increment `failed_login_attempts`.
   - After `MaxFailedLoginAttempts` the user is marked `blocked` with `blocked_at`/`blocked_reason` set.
   - Confirm `handleAuthRequest` (if present) or auth event handlers prevent login when `blocked` or `active=false`.
2. **Admin controls**
   - Verify the custom API endpoints:
     - `PATCH /api/tm/users/{id}/toggle-active` (`handleToggleUserActive`).
     - `PATCH /api/tm/users/{id}/unblock` (`handleUnblockUser`).
   - Ensure the frontend user management pages (`src/pages/users.tsx`, `edit-user.tsx`) expose these actions only to admins.
3. **Manual tests**
   - Intentionally log in with a wrong password until the account is blocked.
   - As an admin, unblock the user from the UI and confirm they can log in again.

- **Environment and defaults**
  - Clear separation between dev and production behavior for default credentials (you already have `allowDefaultCredentials` but should document and enforce best practices in deployment).
  - HTTPS and secure cookie/session configuration at the infrastructure level.

**How to implement / validate**

1. **Configuration**
   - Document in `README.md` and/or a deployment doc:
     - In development, default credentials are allowed for convenience.
     - In production, `TM_ALLOW_DEFAULT_ACCOUNTS` should be `false` (unless there is a specific reason).
2. **Deployment checklist**
   - Extend the Production Checklist in README to include:
     - “Change default admin passwords”.
     - “Disable default credential creation in production”.
   - For Docker or hosting providers, provide example env configuration snippets.

## 3. Collaboration & Productivity Essentials

These are the features that make the app pleasant and efficient for small teams.

- **Comments on tasks**
  - Rich comments with mention of context (even if you don’t yet support @mentions).
  - Notifications to assignees when comments are added (already in `handleCommentNotification`).

**How to implement / validate**

1. **Backend**
   - Confirm `comments` collection in `backend/pb_schema.json` has fields `task`, `content`, `created_by`, timestamps.
   - Ensure `createCommentNotification` is implemented in `convex/notifications.ts`.
2. **Frontend**
   - Verify `src/components/task/comments-list.tsx`, `comment-item.tsx`, and `comment-composer.tsx` are used in `task-details.tsx`.
   - Check that creating a comment calls the PocketBase `comments` collection, and the UI updates via React Query.
3. **Manual QA**
   - Add a comment on a task as User A and verify that User B (assignee) sees a notification.

- **Time tracking basics**
  - Per‑task time spent fields and a timesheet view per user per week (already implemented in `timesheet.tsx`).
  - Ability to export time data (CSV/Excel) for billing or payroll (already present via CSV export, with separate Excel utilities for reports).

**How to implement / validate**

1. **Backend**
   - Confirm `tasks` collection has `time_spent_minutes`, `estimated_hours`, `estimated_minutes` fields as numbers with appropriate `min`/`max`.
2. **Frontend**
   - Identify where time is captured (e.g. `time-entry-dialog.tsx` in `src/components/task/`).
   - Ensure that updating time uses PocketBase update calls and invalidates relevant queries.
3. **Timesheet**
   - In `src/pages/timesheet.tsx`, verify that:
     - The query filters by the logged‑in user and a week‑long interval.
     - Grouping by day and weekly totals are computed with `minutesToHoursAndMinutes` utility.
     - CSV export includes expected columns (date, task title, project, minutes spent).
4. **Manual QA**
   - Log time on multiple tasks over a few days, open the timesheet, and validate totals against manual calculations.

- **Reports & exports**
  - Basic reports: tasks by status, assignee, and project; time spent by user/project.
  - Export to CSV/Excel so teams can do ad‑hoc analysis in spreadsheets.

**How to implement / validate**

1. **Reports page**
   - Review `src/pages/reports.tsx` and `src/components/reports/` utilities (e.g. `reports-utils.ts`, `excel-export.ts`).
   - Ensure key reports exist:
     - Task distribution by status.
     - Tasks by assignee.
     - Time spent by user and project.
2. **Export behavior**
   - Confirm exports use reliable utilities (e.g. `xlsx`) and generate files with clear column names and safe formatting.
3. **Manual QA**
   - Generate each report with mock data and open the exported files in Excel/Sheets to verify content and formatting.

- **Search and filtering**
  - Strong in‑list filtering (already present) is essential.
  - A global search bar across tasks and projects quickly becomes highly valuable as data grows; it’s recommended as an early next step.

**How to implement / validate**

1. **Local filters**
   - Ensure each major listing page (tasks, projects, users) has:
     - A search box and/or filter controls mapped to query parameters (e.g. via `nuqs` hooks).
     - Integration with React Query so filters actually affect the backend query.
2. **Global search (v1)**
   - Start with a simple global search in the header that:
     - Searches tasks and projects by title/name and display ID.
     - Navigates to a dedicated search results page or inline dropdown results.
3. **Testing**
   - Add a small suite of UI tests (Vitest + Testing Library) around search components to ensure they call the right hooks with the right parameters.

## 4. Operational Essentials

These aspects matter to maintainability and team confidence.

- **Reliable tests and quality checks**
  - Unit tests for core logic (status utils, permissions, time utils, hooks) and UI smoke tests (already present).
  - A single `bun run quality:check` (already configured) used consistently in CI and before releases.

**How to implement / validate**

1. **Local usage**
   - Encourage developers to run `bun run check` before every commit.
2. **CI integration**
   - Add a CI pipeline (GitHub Actions, GitLab CI, etc.) that runs:
     - `bun run check`
     - `bun run test:run`
     - Optionally `bun run test:e2e` on main or release branches.
3. **Test coverage**
   - Periodically run `bun run test:coverage` and keep coverage thresholds reasonable (you already target ~60%). Adjust as the codebase grows.

- **Clear documentation for developers**
  - Accurate README instructions that match actual scripts (`test`, `test:e2e`, etc.).
  - A minimal “Project Overview” and “Development Guide” so new engineers can onboard quickly (currently referenced but missing).

**How to implement / validate**

1. **Align README**
   - Update README testing commands as described in `docs/CODEBASE_ISSUES.md`.
2. **Add core docs**
   - Create `docs/PROJECT_OVERVIEW.md` and `docs/DEVELOPMENT_GUIDE.md`:
     - Overview: target users, main features, high‑level architecture.
     - Dev guide: how to run dev servers, build, run tests, and coding conventions.
3. **Onboarding checklist**
   - Add a short “Onboarding steps” section to one of the docs so new team members know exactly what to read and which commands to run first.

- **Simple deployment story**
  - Single binary backend (PocketBase + embedded frontend) with clear instructions.
  - A straightforward Docker/docker‑compose setup (`Dockerfile` and `docker-compose.yml` in the root).

**How to implement / validate**

1. **Build and serve**
   - Ensure `bun run build` works end‑to‑end on a clean machine.
2. **Docker**
   - Test `docker compose up` in a clean environment and verify:
     - The app starts successfully.
     - The frontend and backend are reachable as documented.
3. **Production checklist**
   - Keep a short, actionable production deployment checklist in README (or a dedicated doc) and ensure it’s kept up to date with any infra changes.

## 5. “Nice‑to‑Have Soon” for Startups

Not strictly essential for launch, but high‑ROI improvements for small teams:

- Global search across tasks/projects/comments.
- A Kanban/board view with drag‑and‑drop between statuses.
- Basic custom fields on tasks (e.g. “Client”, “Environment”, “Channel”) beyond tags.
- Simple outbound integrations:
  - Email notifications for key events.
  - A generic webhook integration to connect with Slack/Teams via intermediate services (Zapier, custom bots, etc.).

Focusing on these essentials ensures the product is compelling and usable for small–medium teams without prematurely optimizing for full enterprise complexity.

For each of these “nice‑to‑haves”, prefer small, iterative slices (one view, one integration, one custom‑field type) that build on the existing PocketBase schema and React components, rather than large rewrites. This keeps the product shippable while steadily moving toward a richer feature set.

### Global search: detailed implementation guide

The goal is a single entry point that searches across tasks and projects (and later comments/users) without forcing users to “know the right page” first.

**Backend (Option A – dedicated search endpoint)**

1. **Design the API**
   - Endpoint: `GET /api/tm/search`.
   - Query params:
     - `q`: search term (required).
     - Optional filters later: `type=task|project`, `limit`, `page`.
   - Response shape (example):
     ```json
     {
       "tasks": [
         {
           "id": "...",
           "title": "...",
           "display_id": "...",
           "project": "...",
           "status": "..."
         }
       ],
       "projects": [
         { "id": "...", "name": "...", "code": "...", "group": "..." }
       ]
     }
     ```

2. **Register the route in Go**
   - In Convex functions, implement proper error handling and logging:
   - `se.Router.GET("/api/tm/search", handleGlobalSearch)`.
   - Implement `handleGlobalSearch(e *core.RequestEvent) error` near other request handlers:
     - Use `validateAuth(e)` to ensure the user is logged in.
     - Read `q := e.Request.URL.Query().Get("q")` and trim/validate.

3. **Query PocketBase for tasks and projects**
   - For tasks, use `RecordQuery("tasks")` with a filter like:
     - `title LIKE {:q} OR display_id LIKE {:q}` (wrap `%` around `q` for SQL LIKE).
   - For projects, query `projects` with a filter like:
     - `name LIKE {:q} OR code LIKE {:q}`.
   - Limit results (e.g. 20 tasks + 20 projects) for performance.

4. **Return a combined JSON payload**
   - Marshal tasks and projects into lightweight DTO structs (only fields you need in the UI).
   - Return `e.JSON(200, map[string]any{ "tasks": tasks, "projects": projects })`.

5. **Security and RBAC**
   - Ensure queries respect Convex auth rules or apply additional filters:
   - Filter projects/tasks by group/role if needed (e.g. only those the user can view).

**Frontend – search UI and data flow**

1. **Add a search input to the header**
   - In `src/components/site-header.tsx` (or equivalent):
     - Add a search input (or icon + input) that controls a local state `query`.
     - Use `useDebounce` (from `use-debounce`) to avoid firing on every keystroke.

2. **Create a global search hook**
   - In `src/hooks/global-search.ts` (new file):
     - Export `useGlobalSearch(query: string)` using React Query:
       - `queryKey: ["global-search", query]`.
       - `queryFn`: calls `pb.send("/api/tm/search", { params: { q: query } })` or a small wrapper around `fetch`.
       - `enabled: query.trim().length > 1`.

3. **Render search results**
   - Option A: inline dropdown under the header search input:
     - Show grouped results (“Tasks”, “Projects”) with links to `/tasks/:id` or `/projects/:id/details`.
   - Option B: dedicated page `/search`:
     - In `src/router.tsx`, add a route `/search` pointing to a new `SearchPage`.
     - Pass the query via URL (`?q=...`) using `nuqs` or `useSearchParams`.

4. **UX details**
   - Show a loading indicator while the query is running.
   - Handle empty states gracefully (“No matching tasks or projects found”).
   - Keyboard support:
     - `Enter` to submit search.
     - Up/Down arrows to navigate results in the dropdown.

5. **Tests**
   - Add unit tests for `useGlobalSearch` (mocking network calls).
   - Add a small integration test for the search UI (using Testing Library) to ensure typing a query triggers the hook and renders results.

**Backend (Option B – no custom endpoint)**

If you want to avoid a new endpoint initially:

1. From the frontend, issue parallel queries directly to PocketBase’s `tasks` and `projects` collections using `pb.collection(...).getList(...)` with filters based on `query`.
2. Combine the results client‑side into the same “tasks” and “projects” groupings.
3. Later, refactor into `/api/tm/search` if you need more control or server‑side RBAC logic.

### Kanban/board view: detailed implementation guide

The goal is a board view where tasks are grouped by status and can be dragged between columns to update their status (and optionally their order).

**Leverage existing data model**

- `tasks` already have a `status` field (with values like `todo`, `in_progress`, `pending`, etc.) and an `order` field for ordering within a column.
- `TASK_STATUS_ORDER` in `src/lib/status-utils.ts` defines a canonical workflow order. Reuse it to define board columns.

**Frontend – basic board layout**

1. **Decide the route**
   - Either:
     - Add a dedicated page `src/pages/task-board.tsx` with route `/tasks/board`, or
     - Add a board toggle to the existing `tasks.tsx` page (“List / Board” tabs).

2. **Create a board page component**
   - New file: `src/pages/task-board.tsx` (if you choose a new page).
   - Use React Query to fetch tasks:
     - E.g. `useQuery(["tasks", "board"], () => pb.collection("tasks").getList(...))` with appropriate filters (active project, assignee, etc.).
   - Group tasks by `status` using `TASK_STATUS_ORDER`:
     - Build a map: `{ statusKey: TasksResponse[] }`.

3. **Board UI structure**
   - In `src/components/task/`, add board‑specific components, for example:
     - `task-board-column.tsx` – renders a column for a single status (header + list of cards).
     - `task-board-card.tsx` – wraps the existing `task-list-item` styles for board context.
   - Use a responsive layout:
     - e.g. `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4` with horizontal scrolling on smaller screens.

**Drag & drop behavior**

1. **Pick a DnD library**
   - Add a dependency such as `@dnd-kit/core` (or your preferred library) in `package.json`.
   - Keep the implementation minimal at first: drag a card from one column to another to change its status.

2. **Set up DnD context**
   - In `task-board.tsx`, wrap columns in the library’s `DndContext` (or equivalent).
   - Mark each task card as a draggable item with an ID (task ID) and current status.

3. **Handle drop events**
   - On drop:
     - Determine the target column (status) from the droppable zone.
     - Optionally determine the new `order` by looking at the index in the target column.
   - Optimistically update local state:
     - Move the task to the new status/position in the React state.
   - Persist the change:
     - Call `pb.collection("tasks").update(task.id, { status: newStatus, order: newOrder })`.
   - Use React Query’s `onMutate`/`onSuccess` hooks to implement optimistic updates and invalidate the board query when needed.

4. **Ordering within columns**
   - Use the numeric `order` field:
     - When inserting a task at a given index, compute a new `order` value (e.g. between neighbors or simply reindex the column).
   - Optional: implement a batch API or multi‑update pattern if you want to avoid many single updates.

**Backend considerations**

1. **Ensure schema supports ordering**
   - Confirm `tasks.order` is a number field (already present) and can hold a reasonable range of values.
2. **Optional: add a dedicated reorder endpoint**
   - For more control, expose an endpoint like `POST /api/tm/tasks/reorder`:
     - Accepts a payload `{ updates: [{ id, status, order }] }`.
     - Updates multiple tasks in a single transaction.
   - This can reduce round‑trips vs many individual `update` calls from the frontend.

**UX and validation**

1. **Constraints**
   - Decide whether all statuses appear as columns, or only a subset (e.g. hide terminal statuses by default and show them in a “Done” / “Closed” lane).
2. **Visual feedback**
   - Highlight the target column when dragging over it.
   - Show a subtle animation when the task snaps into its new position.
3. **Permissions**
   - Respect RBAC: only users with `tasks.manage` or `tasks.own.update` should be allowed to drag tasks:
     - Disable drag for users without permission.
4. **Testing**
   - Manual: drag tasks between columns and refresh to ensure changes persist.
   - Automated: add a small integration test that simulates a drag and verifies the `update` mutation is called with the expected status.

Implementing global search and a Kanban board in these incremental steps gives startup teams powerful navigation and visualization tools without over‑complicating the underlying architecture.
