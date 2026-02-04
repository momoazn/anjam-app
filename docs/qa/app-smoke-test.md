# App Smoke Test (Features + Journeys)

Goal: a complete, repeatable manual smoke test for the Anjam app (React + Convex).

This checklist is built from the current route map (`src/router.tsx`) plus feature components and backend tables/functions.

---

## 0) Setup / Preconditions

- [ ] Use a clean browser profile (no cached sessions).
- [ ] Confirm `VITE_CONVEX_URL` points to the target environment.
- [ ] If testing invite links across users, prepare 2 accounts (Owner + Member) with access to the same environment.
- [ ] Start from a known org with at least:
  - [ ] 1 project
  - [ ] 3 tasks across multiple statuses
  - [ ] 2 tags
  - [ ] 1 task with a deadline (for Calendar)

### Roles used in this doc

- **Guest**: not logged in
- **Owner**: organization member with role `owner`
- **Member**: organization member with role `member`

---

## 1) Route Map (Page Load + Access Control)

Source: `src/router.tsx`.

For each route:

- [ ] Page loads (no infinite spinner / crash / blank screen).
- [ ] Correct redirect behavior for auth/org requirements.
- [ ] Expected permissions are enforced (Owner vs Member).

### Public routes (guest accessible)

- [ ] `/` Landing (theme toggle, CTA links to login)
- [ ] `/login`
- [ ] `/register`
- [ ] `/pending-activation`
- [ ] `/invite/:token` Invite accept flow
- [ ] `*` Not found page (unknown route)

### Authenticated routes (requires login)

#### Organization selection / onboarding

- [ ] `/select-organization` (only meaningful if user has 2+ orgs)
- [ ] `/onboarding` (org setup wizard; may create org/project/invite link)

#### Workspace

- [ ] `/inbox` (assigned / mentioned / recently updated)
- [ ] `/notifications` (notifications + mentions list)
- [ ] `/projects` (projects list)
- [ ] `/projects/:id/details` (project details + stats + links)
- [ ] `/projects/:id/tasks` (project task list + filters)
- [ ] `/projects/:id/board` (project board)
- [ ] `/tasks` (org-wide task list)
- [ ] `/tasks/new` (create task page)
- [ ] `/tasks/:id` (task details)
- [ ] `/tasks/board` (org-level board)
- [ ] `/tasks/calendar` (deadlines calendar)
- [ ] `/views` (saved filters “views” manager)
- [ ] `/saved-filters` (alias to `/views`)
- [ ] `/tags` (tag management)
- [ ] `/insights` (metrics dashboard)
- [ ] `/helps` (help content)
- [ ] `/settings` (user settings hub)
- [ ] `/settings/preferences` (preferences standalone page)

#### Org admin (permission-gated)

- [ ] `/settings/organization` (requires `org.update`)
- [ ] `/settings/members` (requires `org.manage_members`)
- [ ] `/members` (alias page; also gated by `org.manage_members`)

#### Aliases / legacy

- [ ] `/issues` (currently routes to Inbox)

---

## 2) Feature Inventory (What Exists)

Use this section to ensure coverage (each feature has at least one journey below).

### Authentication & session

- Email/password login (`/login`)
- Registration (`/register`)
- Pending activation page (`/pending-activation`)
- Logout (user menu)
- Invite accept by token (`/invite/:token`)
- Route guarding:
  - Protected routes redirect guests → `/login`
  - Org-required routes redirect to `/onboarding` or `/select-organization` as needed

### Organizations & membership

- Create org (via onboarding flow; also page exists under `src/pages/organizations/create.tsx`)
- Select/switch org (`/select-organization`, sidebar org switcher)
- Org settings (name/slug/description) (`/settings/organization`)
- Org members:
  - List members + status/role (`/settings/members`)
  - Invite member by email (dialog)
  - Invite links: create/copy/revoke + status tracking
  - Remove member

### Projects

- List projects (`/projects`)
- Create project (modal; page also exists in `src/pages/projects/create.tsx`)
- Edit project (modal + inline edit on details page)
- Project details + stats (`/projects/:id/details`)
- Project task list (`/projects/:id/tasks`)
- Project board (`/projects/:id/board`)

### Tasks

- Create task (modal; create page exists in `src/pages/tasks/create.tsx` and is routed at `/tasks/create` + `/tasks/new`)
- Task list (`/tasks`)
  - Pagination
  - Filters: search/status/priority/assignee/date-range/tag
  - Saved filters:
    - Save view
    - Set default view
    - Manage/delete views (`/views`)
  - Bulk selection mode + bulk actions (assign/status/priority/delete)
- Task board (`/tasks/board`)
  - Drag & drop reorder and status changes
- Task calendar (`/tasks/calendar`)
  - Deadlines calendar (Jalali date-fns usage)
- Task details (`/tasks/:id`)
  - View metadata (assignee, project, deadline)
  - Edit task (modal)
  - Delete task
  - Comments with reply
  - Mentions autocomplete (`@user`)
  - Subtasks / checklist (create/reorder/assign/mark done/delete)

### Tags

- Tag list (`/tags`)
- Create tag
- Edit tag
- Delete tag (Owner-only)
- Assign tags to tasks (task form / edit task)

### Inbox, Mentions, Notifications

- Inbox (`/inbox`)
  - Sections: Assigned to me / Mentioned / Recently updated
  - Filter toggle: all/active/done (via URL `?filter=...`)
- Notifications page (`/notifications`)
  - Filter: all/unread/read
  - Sort: newest/oldest
  - Mark read / mark all read
  - Bulk select + bulk actions
  - Clear read / clear all
  - Mentions list section
- Notification dropdown (header badge)

### Insights

- Insights dashboard (`/insights`)
  - Created/completed this week, in progress, cycle time trend, on-time rate, workload by assignee

### Settings (user-level)

- Settings hub (`/settings`) tabs:
  - Profile (update display name; avatar upload “coming soon”)
  - Appearance (theme light/dark/system)
  - Security (2FA “coming soon”; password change currently not implemented)
  - Preferences (UI + display preferences)
  - About (version/stack)

### Navigation & productivity

- Sidebar navigation + projects submenu + task views shortcuts
- Org switcher
- Command menu (Cmd/Ctrl+K) with global search + quick actions
- Keyboard shortcuts:
  - `g i` inbox, `g s` tasks, `g p` projects, `g n` insights, `g v` views
  - `c` create task (uses current project context when inside project routes)

### Error handling

- Not found page for unknown routes
- Lazy-route load fallback UI (PageLoadError)
- Global error boundary reload behavior

---

## 3) Journeys (End-to-End Smoke Scenarios)

Run these in order for best reuse of created data.

### J1 — Guest → Register → Onboarding → Inbox

- [ ] As Guest, open `/` and click “Get started” → `/login`
- [ ] Go to `/register`, create a new user
- [ ] Verify redirect to `/onboarding`
- [ ] Onboarding Step 1: set org name (creates org if none)
- [ ] Onboarding Step 2: optionally create a project
- [ ] Onboarding Step 3: optionally add invite emails (creates an invite link)
- [ ] Finish onboarding → redirected to `/inbox`
- [ ] Refresh page: still authenticated, still in org context

### J2 — Login → Route guards (auth + org)

- [ ] As Guest, try to open `/inbox` → redirected to `/login`
- [ ] Login with valid credentials → redirected into app (typically `/inbox`)
- [ ] If user has no org: verify redirect to `/onboarding`
- [ ] If user has multiple orgs and none selected: verify redirect to `/select-organization`

### J3 — Organization switching

Precondition: user belongs to 2+ orgs.

- [ ] Open org switcher in sidebar → select another org
- [ ] Verify redirect to `/inbox`
- [ ] Verify data scope changes (projects/tasks/tags reflect selected org)
- [ ] Switch back to original org

### J4 — Owner: Org settings + members + invite links

Requires Owner role.

- [ ] Open `/settings/organization`
  - [ ] Update name/slug/description, save, verify toast success
- [ ] Open `/settings/members`
  - [ ] Invite member by email (dialog)
  - [ ] Create invite link (choose role + max uses)
  - [ ] Copy invite link and verify clipboard copies a URL
  - [ ] Revoke an invite link and verify status updates
  - [ ] Remove another member (verify they disappear or status changes)

### J5 — Member: Admin pages blocked

Requires Member role.

- [ ] Try to open `/settings/organization` → redirected to `/inbox`
- [ ] Try to open `/settings/members` → redirected to `/inbox`

### J6 — Projects: Create → View → Edit → Navigate to tasks/board

- [ ] Open `/projects`
- [ ] Create a project (modal “create-project”)
- [ ] Open project details (`/projects/:id/details`)
- [ ] Edit project name/description (inline edit or edit modal)
- [ ] From project sidebar:
  - [ ] “View tasks” → `/projects/:id/tasks`
  - [ ] “View users” → `/members` (Owner-only; validate permission behavior)
- [ ] Open project board (`/projects/:id/board`) and confirm it loads

### J7 — Tasks: Create → Edit → Delete (with tags + deadline)

- [ ] Create a task (use “create-task” modal)
  - [ ] Set title, description
  - [ ] Set project
  - [ ] Set assignee (or leave unassigned)
  - [ ] Set status + priority
  - [ ] Set deadline
  - [ ] Add at least one tag
- [ ] Open task details (`/tasks/:id`)
  - [ ] Verify metadata renders (assignee/project/deadline)
  - [ ] Edit task (edit modal) and change:
    - [ ] status
    - [ ] priority
    - [ ] assignee
    - [ ] tags
    - [ ] deadline
- [ ] Delete the task from task details and verify it no longer appears in lists

### J8 — Tasks list: Filters + saved views + default view

- [ ] Open `/tasks`
- [ ] Apply filters:
  - [ ] Search term
  - [ ] Status
  - [ ] Priority
  - [ ] Assignee (including “me”)
  - [ ] Date range / due filter
  - [ ] Tag
- [ ] Verify URL query params update and list results match filters
- [ ] Save current filters as a view
- [ ] Set view as default
- [ ] Navigate away and back to `/tasks` and verify default view applies
- [ ] Open `/views` and:
  - [ ] Navigate to a view
  - [ ] Clear default
  - [ ] Delete a view

### J9 — Bulk actions (tasks list)

- [ ] On `/tasks`, enable selection mode
- [ ] Select 2+ tasks
- [ ] Bulk update:
  - [ ] Assign to user
  - [ ] Change status
  - [ ] Change priority
- [ ] Bulk delete selected tasks

### J10 — Board: Drag/drop reorder + status change

- [ ] Open `/tasks/board` (or `/projects/:id/board`)
- [ ] Drag a card within the same column (reorder)
- [ ] Drag a card to another status column (status change)
- [ ] Refresh and verify order/status persisted (Convex real-time should reflect updates)

### J11 — Calendar: Deadlines rendering + navigation

- [ ] Open `/tasks/calendar`
- [ ] Verify tasks with deadlines render on correct dates
- [ ] Navigate previous/next month and return to “Today”
- [ ] Click a calendar task card:
  - [ ] Verify it navigates to a valid task details route
  - [ ] If it 404s, capture the URL and compare to `src/router.tsx` routes

### J12 — Comments + mentions → Inbox/Notifications

Precondition: 2 users in same org.

- [ ] As User A, open a task and add a comment mentioning User B (`@...`)
- [ ] As User B (separate session/browser):
  - [ ] Open `/inbox` and verify task appears under “Mentioned” (if mentions are stored)
  - [ ] Open `/notifications` and verify mentions list reflects the mention
- [ ] Reply to a comment (threaded reply) and verify it renders correctly

### J13 — Subtasks: Create → assign → reorder → complete

- [ ] On task details, create 2+ subtasks
- [ ] Assign a subtask to a user (or set unassigned)
- [ ] Reorder subtasks via drag-and-drop
- [ ] Mark a subtask done, then reopen
- [ ] Delete a subtask

### J14 — Notifications: dropdown + page actions

- [ ] Open notification dropdown (badge) and:
  - [ ] Mark one notification as read
  - [ ] Mark all as read
  - [ ] Clear all
- [ ] Open `/notifications` page and:
  - [ ] Filter unread/read/all
  - [ ] Sort newest/oldest
  - [ ] Bulk select + bulk mark read
  - [ ] Bulk delete (queued delete + undo)
  - [ ] Clear read

### J15 — Insights dashboard

- [ ] Open `/insights`
- [ ] Verify metric cards render (not NaN / not crashing)
- [ ] Verify charts render with at least some data (or empty state is reasonable)

### J16 — Settings (profile + appearance + preferences)

- [ ] Open `/settings`
- [ ] Profile:
  - [ ] Update display name and verify it reflects in the header/user menu
  - [ ] “Avatar upload” shows “Coming soon”
- [ ] Appearance:
  - [ ] Switch theme light/dark/system and verify UI updates
- [ ] Preferences:
  - [ ] Toggle “activity feed” preference (persisted)
  - [ ] Update display preferences (theme/timezone/date format) and verify persisted
- [ ] Security:
  - [ ] Verify “2FA coming soon” renders
  - [ ] Password change shows “not implemented” toast (expected)

### J17 — Productivity: command menu + keyboard shortcuts

- [ ] Open command menu (Cmd/Ctrl+K)
  - [ ] Navigate to Inbox/Projects/Insights/Settings from commands
  - [ ] Create task/project via commands
  - [ ] Type 2+ characters and confirm search returns tasks/projects
- [ ] Keyboard shortcuts:
  - [ ] `g i` → inbox
  - [ ] `g s` → tasks
  - [ ] `g p` → projects
  - [ ] `g n` → insights
  - [ ] `g v` → views
  - [ ] `c` → create task (project-scoped when on project routes)

### J18 — Logout

- [ ] From user menu, log out
- [ ] Verify redirect to `/login`
- [ ] Back button does not reveal protected content

---

## 4) Backend Coverage (Convex)

Source of truth: `convex/schema.ts` + functions in `convex/*.ts`.

Smoke checks should implicitly exercise reads/writes for these tables:

- [ ] `users` (ensure profile, update profile)
- [ ] `organizations` (create, update, onboarding completion)
- [ ] `organizationMembers` (invite/accept/remove, role/status, onboardingCompleted)
- [ ] `projects` (create, update, list, search)
- [ ] `projectCounters` (task numbering)
- [ ] `tasks` (CRUD, search, board ordering, tags, deadlines)
- [ ] `tags` (CRUD)
- [ ] `comments` (create/list, replies, mentions parsing)
- [ ] `mentions` (mention records)
- [ ] `notifications` (create/list/read/clear/delete)
- [ ] `invites` (create link, validate, accept)
- [ ] `subtasks` (CRUD + ordering)

---

## 5) Known/Expected Limitations (Don’t Fail the Smoke)

These are currently “coming soon” or intentionally stubbed:

- Password change in Settings → Security shows a “not implemented in Convex” toast.
- Avatar uploads in Profile show “Coming soon”.
