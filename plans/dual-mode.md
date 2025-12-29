# Spec: Dual-Mode Experience in Anjam (Operations vs Product)

## Goals

1. Support **two distinct experiences** from a **single codebase**:
   - **Operations mode** (HR/ops-heavy, stakeholder needs)
   - **Product mode** (startup teams, Linear-inspired)

2. Mode controls:
   - What features are **visible**
   - Navigation structure and labels
   - Defaults (statuses, views, settings)

3. Mode is set at the **Organization level** and **toggled externally** (admin UI out of scope for v1).
   - For Anjam v1, “externally” means PocketBase admin UI or a direct DB update.
   - Optional later: add an owner-only toggle in org settings.

## Non-goals

- Building the external admin UI to toggle mode
- Creating separate databases or forks
- Changing core task/project data model (except adding mode + settings)

Implementation checklist: `plans/dual-mode-task-list.md`.

---

# v1 Scope (What we will implement first)

To keep implementation incremental and low-risk, v1 ships dual-mode with the following concrete decisions:

1. `organizations.mode` exists and is the source of truth (`operations | product`).
2. Product mode disables operational surfaces:
   - UI: hide time tracking/time entries, timesheet, reports, audit logs
   - Routes: block `/timesheet`, `/reports`, `/audit-logs` (and optionally `/tasks/calendar`)
   - API: block `time_entries` create/update/delete (return `403 FEATURE_DISABLED`)
3. Product mode “Inbox” starts as a **route alias** to existing `/my-tasks` (full Linear-like inbox can come later).
4. Product mode “Issues” starts as a **route alias** to existing `/tasks` with product-default UI behavior.
5. Product mode “Views” reuses existing saved filters + sidebar `TaskViews` (rename copy only).
6. Product mode adds `/insights` as a lightweight replacement for `/reports` in navigation.
7. Task defaults stay compatible with schema (priority required; default remains `medium`). Product default status is `todo` unless we explicitly switch to triage-first `pending`.

---

# 0) Fit to Anjam (current architecture)

Anjam today:

- **Backend**: Go + PocketBase (SQLite). Schema source-of-truth is `backend/pb_schema.json`, imported at startup via `importSchema()` in `backend/main.go`.
- **Frontend**: React + TypeScript (Vite), TanStack Query, Zustand auth store (`src/store/auth-store.ts`).
- **Routing**: `src/router.tsx` defines the route table + guards (`ProtectedRoute`, `RequireOrganization`, and permission protection).
- **Navigation**: `src/components/app-sidebar.tsx` renders the sidebar; permissions come from `usePermissions()` and `src/lib/permissions.ts`.

This plan adapts “dual-mode” to those realities so it’s implementable without forking or major refactors.

---

# 1) Data Model & Configuration

## 1.1 Organization.mode (required)

Add a PocketBase `select` field to `organizations`:

- `organizations.mode`: `select` (maxSelect=1), values: `operations | product`, default: `operations`

Behavior:

- Mode is read on every request requiring organization context.
- Mode changes apply immediately for all users in org.

Notes (Anjam-specific):

- The `organizations` collection already has a `settings` JSON field, so we can store per-mode settings there (no need for a separate JSON field unless we want it).
- When modifying `backend/pb_schema.json`, **always** regenerate TypeScript types: `bun run types:generate` (never edit `src/lib/pocketbase-types.ts` manually).
- Existing organizations created before this field existed should be backfilled to `operations` (via PocketBase admin UI or a one-time script) so mode resolution is deterministic.
- Safer rollout (if you have existing production data): add the field as non-required first, backfill, then mark it required.

## 1.2 Organization.settings.modeSettings (recommended)

Store per-mode configuration in the existing JSON field:

- `organizations.settings.modeSettings`: object (optional)

Example structure:

```json
{
  "modeSettings": {
    "navPreset": "product_v1",
    "features": {
      "calendar": false,
      "taskBoard": true,
      "timeTracking": false,
      "timesheet": false,
      "reports": false,
      "auditLogs": false,
      "loginLogs": false
    },
    "defaults": {
      "activityFeedCollapsed": true
    }
  }
}
```

If you don’t want JSON now, you can hardcode defaults by mode and add this later.

---

# 2) Mode Fetching & App Bootstrapping

## 2.1 Current org context source-of-truth (required)

Ensure the frontend has a single source of truth for the current org:

- v1 (recommended): extend the existing org context already stored in `src/store/auth-store.ts`.
  - The store already fetches `GET /api/v1/organizations` (`backend/organizations.go`) and stores `currentOrganization` + `currentOrgRole`.
  - Once `organizations.mode` exists in schema, it will be included in the returned org record. The frontend can derive `features` from it.
- v1.1 (optional): add `GET /api/v1/organizations/{orgId}/context` if we want the server to compute features/UI labels in one place.

Response example:

```json
{
  "org": { "id": "...", "name": "...", "mode": "product" },
  "viewer": { "id": "...", "orgRole": "member" },
  "features": {
    "timeTracking": false,
    "timesheet": false,
    "reports": false,
    "auditLogs": false,
    "calendar": false,
    "taskBoard": true
  },
  "ui": {
    "navPreset": "product_v1",
    "labels": { "tasks": "Issues" }
  }
}
```

## 2.2 Client initialization (required)

On app load and on org-switch:

- Ensure org mode is available (`currentOrganization.mode`)
- Store derived `mode/features` in a global state (Zustand recommended)
- Use it to:
  - Render correct sidebar/nav
  - Hide/disable routes
  - Drive wording (“Members” vs “Employees”)

Implementation notes (Anjam):

- Prefer adding `currentOrgMode` + `currentOrgFeatures` to `src/store/auth-store.ts`, or add a small dedicated store like `src/store/org-mode-store.ts`.
- Consider attaching `X-Organization-ID` automatically via PocketBase JS SDK (`pb.beforeSend` in `src/lib/pocketbase.ts`) so backend enforcement can reliably know “current org” for collection requests.
  - Note: be careful about circular imports (`auth-store` imports `pb`). A safe approach is to read the org id from the persisted auth state in `localStorage` (key `anjam-auth-storage`) inside `beforeSend`.

---

# 3) Feature Gating Strategy (Required)

## 3.1 Single feature gate module

Implement a shared module:

- `src/lib/mode-features.ts`
  - Inputs: `org.mode`, optional `organizations.settings.modeSettings`, `viewer.orgRole`
  - Outputs: boolean flags + route access rules

Example:

```ts
export function getFeatures(ctx): Features {
  if (ctx.org.mode === "product") {
    return {
      timeTracking: false,
      timesheet: false,
      reports: false,
      auditLogs: false,
      loginLogs: false,
      calendar: ctx.org.settings?.modeSettings?.features?.calendar ?? false,
      taskBoard: true,
    };
  }
  return {
    timeTracking: true,
    timesheet: true,
    reports: true,
    auditLogs: true,
    loginLogs: true,
    calendar: true,
    taskBoard: true,
  };
}
```

Notes:

- The “Leaderboard” is a component inside Reports; v1 doesn’t need a separate feature flag for it because `/reports` is product-disabled.

## 3.2 Enforcement layers (must do all)

1. **UI**: hide navigation + buttons
2. **Routing**: block route access (redirect to safe page)
3. **API**: protect endpoints (return `403 FEATURE_DISABLED` when not allowed)

Anjam-specific details:

- Routing: add a `FeatureProtectedRoute` (similar to `PermissionProtectedRoute`) and annotate routes in `src/router.tsx` with `feature?: FeatureKey`.
- API: PocketBase exposes collections directly; enforce operations-only collections via record hooks (create/update/delete) and optionally request-level hooks (list/view) if we want a hard block.

---

# 4) Navigation & Information Architecture

We will ship **two sidebar presets**, implemented in `src/components/app-sidebar.tsx`, reusing the existing sidebar architecture (`NavMain`, `ProjectsSubmenu`, `TaskViews`).

## 4.1 Product mode navigation (Linear-inspired)

Sidebar:

1. **Inbox**
2. **Issues**
3. **Projects**
4. **Views** (Saved Filters renamed)
5. **Insights**
6. **Settings**

### Route mapping

- Inbox: `/inbox` (v1: alias to current `/my-tasks` to reduce work)
- Issues: `/issues` (alias of `/tasks`)
- Projects: `/projects`
- Views: (v1) keep the existing saved filters / `TaskViews` section; optional `/views` page later
- Insights: `/insights`
- Settings: use existing settings routes (`/settings/organization`, `/settings/members`)

### UX rules

- Default landing page (after login/org select): **Inbox**
- Default primary work screen: **Issues**
- Keep “Board” as a secondary tab inside Issues (not a nav item)

Anjam implementation notes:

- `src/components/app-sidebar.tsx` logo currently links to `/dashboard`; in product mode it should link to `/inbox`.

## 4.2 Operations mode navigation

Sidebar:

Keep current Anjam navigation (what exists today), including:

1. Dashboard (`/dashboard`)
2. Tasks (`/tasks`)
3. Projects (`/projects`)
4. Calendar (`/tasks/calendar`)
5. Timesheet (`/timesheet`)
6. Reports (`/reports`)
7. Audit Logs (`/audit-logs`)
8. Settings (`/settings/organization`, `/settings/members`)

Route mapping can reuse your existing ones.

---

# 5) UI/UX Changes by Mode (What to implement, what to remove/hide)

## 5.1 Global labels & terminology

Add a mode-based label dictionary:

### Product mode labels

Anjam uses centralized constants (mostly under `src/constants/*`), so in v1 keep label overrides scoped to navigation + page headers:

- “Tasks” → “Issues”
- “My Tasks” → “Inbox”
- “Reports” → “Insights”
- “Timesheet” → never shown (feature hidden)
- Avoid surfacing “Supervisor”/“Manager” language in product mode UI (even if underlying data still supports it)

### Operations mode labels

Keep current labels as-is.

Implementation:

- `src/lib/mode-labels.ts` exports `getModeLabels(mode)`
- Update `src/components/app-sidebar.tsx` + key page headers to use mode labels (don’t rewrite all constants in v1)

---

## 5.2 Product Mode: New screens & modifications

### A) Inbox (NEW) — `/inbox`

**v1 implementation:** `/inbox` is an alias to the existing `/my-tasks` page to ship dual-mode quickly.

**v1.1+ purpose:** a focused feed of what needs attention, built from existing task data.

**Content sections (top-to-bottom):**

1. **Assigned to me (open)**
   Filter: `assignee = me AND status != done`
2. **Mentioned (unread)** (optional if you track mentions as notifications)
   If mention notifications exist: show unresolved mention notifications linked to tasks
3. **Recently updated**
   Filter: tasks where `updated last 7 days` AND user is participant (assignee, creator, commenter)

**UI layout**

- Left: list (like Linear)
- Right: task detail panel (optional) OR navigates to task detail page
- Sorting:
  - Assigned: priority desc, updated desc
  - Mentioned: newest first
  - Updated: newest first

**Actions**

- `N` new task
- Quick status change
- Quick assign to me

**Implementation notes**

- Inbox is primarily a set of predefined queries rendered as grouped lists.
- If you already have notifications, reuse them for Mentioned.

---

### B) Issues (MODIFY existing Tasks) — `/issues`

This is your existing task list, but opinionated.

**Default view**

- A single list (not grouped sections by status by default)
- Columns: ID, Title, Status, Assignee, Priority (optional), Due date (optional), Tags (optional)
- Default sorting: `-updated` or `priority desc then -updated` (pick one; Linear uses “recency + priority feel”)

**Secondary tab inside Issues**

- `List` (default)
- `Board` (optional, enabled by `features.taskBoard`)

**Status grouping**

- Product mode: grouping is a user toggle (“Group by status”), off by default
- Operations mode: keep current grouping behavior

**Keyboard shortcuts (Product mode priority)**

- `N`: new task
- `/`: focus search in list
- `Cmd/Ctrl+K`: global search
- `E`: edit selected task
- `A`: assign
- `S`: change status
- `P`: change priority

---

### C) Views (rename Saved Filters) — `/views`

Anjam status:

- “Saved filters” exist inside the Tasks page UI and the sidebar `TaskViews` section (no dedicated `/views` page yet).

v1 changes:

- Rename UI from “Saved Filters” → “Views” (product mode only)
- Keep using localStorage for v1 (already the case)
- Option A (lowest effort): rename the `TaskViews` section label and any “saved filters” copy to “Views” in product mode
- Option B (later): add a `/views` page for managing saved filters (can reuse the existing manage dialog logic)

**Storage**

- Current implementation uses localStorage. Keep it for v1.
- Make it clear it is device-local (small note).

---

### D) Insights (NEW minimalist) — `/insights`

**Product mode only**. Replace heavy HR reports.

Show only:

- Tasks completed this week (count)
- Tasks created this week (count)
- Tasks currently in progress (count)
- Optional later: median cycle time (requires state timestamps)

**UX**

- Simple cards + trend delta vs last week (optional)
- No rankings, no employee comparisons

**Data**

- Use existing task data hooks (same source as `src/pages/tasks.tsx`), filtered to the current org and optionally to a selected project.

---

### E) Settings adjustments

In product mode settings:

- Hide:
  - Timesheet settings
  - Reports settings
  - Employee role management screens (if present)
  - Login logs (if present)

- Keep:
  - Profile
  - Organization details
  - Members (invite & roles: admin/member)
  - Preferences (theme, timezone, date format)

---

## 5.3 Operations Mode: Keep current behavior, plus ensure consistency

Operations mode remains “full feature.”
However, add:

- Mode-aware navigation and labels (still may say Users/Employees etc.)
- No new Inbox/Insights required (optional)

---

# 6) Roles & Permissions Simplification in Product Mode

## 6.1 Org roles displayed in UI

Anjam has two role concepts today:

- Organization membership role (`organization_members.role`): `owner | admin | member`
- Global user role (`users.role`): `admin | manager | supervisor | employee` (some UI still checks this)

Product mode UI should only show: `Admin` and `Member`.
Mapping (UI-only, v1):

- org role `owner | admin` → Admin
- org role `member` → Member

If any screens still depend on `users.role` (e.g. supervisor selection on projects), product mode should avoid surfacing that complexity in UI (hide/rename/auto-default), but does not require a data migration.

No data migration required—this is a display + permission mapping layer.

## 6.2 Permission checks (backend)

Backend permission enforcement should continue to use existing rules (org membership + project membership + existing collection rules/hooks).

v1 expectation:

- Do not change permission semantics; only change what the user can _see/reach_ in product mode.
- Add explicit “feature disabled” enforcement for operations-only actions (notably time entries).

---

# 7) Feature Removal/Disable Matrix

## 7.1 Must be hidden/disabled in Product mode

### Hide in navigation and remove entry points

- Timesheet (`/timesheet`)
- Reports (`/reports`) (replaced by `/insights`)
- Audit logs (`/audit-logs`) and per-task Activity Stream (audit history UI)
- User login logs surfaces (if any) and the API entry point used by UI (`/api/v1/users/{id}/login-logs`)
- Time entry UI in task details (`src/components/task/task-details-content.tsx`)

### API behavior

At minimum for v1:

- Block creating/updating/deleting `time_entries` in product mode (return `403 FEATURE_DISABLED`).
- Optional (recommended): block listing/viewing `audit_logs` in product mode unless we explicitly decide “audit remains admin-only even in product mode”.

### UI behavior

- If user lands on those routes via old bookmark:
  - Show a friendly “Not available in this workspace” empty state + link to Issues
  - OR hard redirect to `/issues`

## 7.2 Optional in Product mode (behind feature flags)

- Calendar: default off
- Task board: on (but secondary)
- Activity stream: collapsed by default

---

# 8) Statuses & Defaults by Mode

## 8.1 Project creation defaults

When a project is created:

- If org.mode = product:
  - Seed a simpler status set (Anjam uses `project_statuses`, seeded in `backend/project_statuses.go`):
    - `pending` → “Backlog”
    - `todo` → “Todo” (default)
    - `in_progress` → “In Progress”
    - `done` → “Done” (done)
    - (optional) `canceled` → “Canceled” (done)

- If org.mode = operations:
  - Keep your existing defaults (todo, in_progress, review, etc.)

If statuses are org-wide instead of project-wide, apply similarly.

## 8.2 Task creation defaults

Product mode:

- Default status: `todo` (or `pending` if you prefer triage-first “Backlog”)
- Default priority: keep current backend default (`medium`) because `tasks.priority` is required in schema
- Default assignee: none

Operations mode:

- Keep current defaults

---

# 9) Routing & Backward Compatibility

## 9.1 Route aliases (to avoid breaking existing links)

- `/tasks` remains valid
- Add `/issues` → renders the same page as tasks but in product mode configuration
- `/my-tasks` remains valid
- Add `/inbox` → alias of `/my-tasks` (product mode landing)

## 9.2 Mode-based home route

After login and org select:

- Product mode: redirect to `/inbox`
- Operations mode: redirect to `/dashboard` (or your current home)

Anjam touchpoints to update:

- `PublicRoute` redirect behavior (currently sends logged-in users to `/dashboard`)
- Onboarding success redirect (`src/pages/onboarding.tsx` currently navigates to `/dashboard`)

---

# 10) API Requirements & Server Enforcement

## 10.1 Mode resolver (backend helper + optional middleware)

Every request with org context must resolve:

- orgId
- org.mode
- viewer role
- features

Anjam-specific resolution strategy:

- For record hooks (e.g., time entries), resolve org by traversing relations (`time_entries.task -> tasks.project -> projects.organization`) and then read `organizations.mode`.
- For request-level enforcement (if we add it), standardize on `X-Organization-ID` and attach it from the frontend (e.g., PocketBase SDK `pb.beforeSend`).

Attach to request context (if middleware is used):

- `req.orgMode`
- `req.features`

## 10.2 Feature-disabled error contract

Standardize:

```json
{
  "error": "FEATURE_DISABLED",
  "feature": "timesheet",
  "message": "Timesheets are not available in this workspace mode."
}
```

Frontend uses this to show “not available” UI.

## 10.3 PocketBase enforcement points (Anjam v1)

Minimum hard enforcement (recommended):

- `time_entries` collection:
  - Block create/update/delete in **product** mode via record hooks in `backend/main.go` (e.g., `OnRecordCreateExecute("time_entries")`, `OnRecordUpdateExecute("time_entries")`, `OnRecordDeleteExecute("time_entries")`).
  - Resolve org mode by traversing relations: `time_entries.task -> tasks.project -> projects.organization -> organizations.mode`.
  - Return `403 FEATURE_DISABLED` (consistent contract) when blocked.

Optional (if we decide audit logs must be fully inaccessible in product mode):

- `audit_logs` collection:
  - Prefer UI + route blocking in v1 (fastest).
  - If we need hard API blocking for list/view, standardize `X-Organization-ID` and enforce in a server-side request hook/middleware for audit log endpoints.

---

# 11) UI Components: Where each change goes

## 11.1 Sidebar component

- Primary file: `src/components/app-sidebar.tsx`
- Replace static nav items with `getNavPreset(mode, features)`
- Use labels dictionary for text
- Hide nav links to disabled features

## 11.2 Tasks list page

- Primary file: `src/pages/tasks.tsx`
- Add product mode config:
  - default view = list (ungrouped)
  - grouping toggle
  - board as secondary tab

- Add keyboard shortcuts & selection model improvements if needed

## 11.3 Task detail page

- Product mode:
  - hide time tracking + time entries UI (`src/components/task/task-details-content.tsx`)
  - hide Activity Stream tab (or make it feature-gated) to avoid surfacing audit history in product mode

- Operations mode:
  - keep as-is

## 11.4 Saved filters page

- Anjam currently has saved filters embedded in the Tasks page; v1 is mostly label + sidebar tweaks:
  - Rename UI copy to “Views” in product mode
  - Ensure `TaskViews` section behaves like a first-class “Views” concept in product mode

## 11.5 New pages

- `/inbox` page (v1 can alias existing `/my-tasks` page)
- `/insights` page

---

# 12) Implementation Plan (developer-ready task breakdown)

## Phase 1 — Foundation (Mode & gating)

1. Schema: add `organizations.mode` to `backend/pb_schema.json` (select values `operations|product`, default `operations`)
2. Types: run `bun run types:generate`
3. Frontend: add `src/lib/mode-features.ts` and store current org mode/features (Zustand)
4. Frontend: add route guard by feature in `src/router.tsx` (e.g., `FeatureProtectedRoute`)
5. Frontend: update `src/components/app-sidebar.tsx` to render nav preset per mode
6. Backend: add enforcement for operations-only actions (v1: block `time_entries` writes in product mode via record hooks)

## Phase 2 — Product navigation & labels

1. Add nav presets: `product_v1`, `operations_v1`
2. Replace sidebar with preset-driven renderer
3. Implement label dictionary + replace key strings

## Phase 3 — Product UX (Inbox, Issues tweaks, Views rename, Insights)

1. Add `/inbox` route (v1 can alias the existing `/my-tasks` page)
2. Modify tasks list to behave as Issues in product mode
3. Rename Saved Filters → Views in product mode (mostly copy + sidebar section title)
4. Build Insights minimal page

## Phase 4 — Hide/disable HR features in Product mode

1. Remove UI entry points + tabs for time tracking/timesheet/reports
2. Add route redirects for disabled routes
3. Backend: return `FEATURE_DISABLED` for disabled actions/endpoints (custom endpoints + PocketBase collection hooks)

## Phase 5 — Defaults

1. Project creation status templates by mode
2. Task default status rules by mode

## Phase 6 — QA + regression

1. Mode switch behavior tests
2. Access control tests
3. Route guard tests
4. Visual regression for nav changes

---

# 13) Acceptance Criteria & Test Plan

## 13.1 Mode switching (core)

- Given org is switched to `product` in admin UI:
  - Sidebar switches to product nav on next reload
  - User is redirected to `/inbox` on login
  - Time tracking/reports/timesheet are not visible
  - Direct visiting `/reports` shows “not available” or redirects

- Given org is switched back to `operations`:
  - Full nav returns
  - Time tracking/reports/timesheet return
  - No data loss

## 13.2 Feature enforcement

- Product mode:
  - Creating/updating/deleting `time_entries` returns 403 FEATURE_DISABLED
  - Operations-only routes (`/timesheet`, `/reports`, `/audit-logs`) are blocked/redirected

- Operations mode:
  - APIs work as before

## 13.3 UX behavior

- Product mode Issues page:
  - Default is ungrouped list
  - Group-by toggle works
  - Board exists as secondary tab

- Inbox:
  - Assigned-to-me list matches tasks
  - Mentioned uses notifications (if available)
  - Recently updated is correct

---

# 14) Notes / Decisions Needed (but you can implement now)

These aren’t blockers, but pick defaults:

1. Product mode default home:
   - Recommend: `/inbox`

2. Product mode default status:
   - Recommend: `Todo` (or `Backlog` if you want triage-first)

3. Inbox “Mentioned” implementation:
   - If you already have @mention notifications: use them
   - Otherwise: start with just Assigned + Updated (still valuable)

---

## Deliverables Summary (What the dev team will ship)

- Organization-level **mode**
- Mode-aware **features gating** (UI + routes + API)
- Two **navigation presets**
- Product-mode UX: **Inbox, Issues, Views, Insights**
- HR features hidden/disabled in Product mode without deleting code
- Defaults/templates by mode
- Full test coverage for mode behavior
