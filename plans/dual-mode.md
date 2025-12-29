# Spec: Dual-Mode Experience in Anjam (Operations vs Product)

## Goals

1. Support **two distinct experiences** from a **single codebase**:
   - **Operations mode** (HR/ops-heavy, stakeholder needs)
   - **Product mode** (startup teams, Linear-inspired)

2. Mode controls:
   - What features are **visible**
   - Navigation structure and labels
   - Defaults (statuses, views, settings)

3. Mode is set at the **Organization level** and **toggled externally** (admin UI out of scope).

## Non-goals

- Building the external admin UI to toggle mode
- Creating separate databases or forks
- Changing core task/project data model (except adding mode + settings)

---

# 1) Data Model & Configuration

## 1.1 Organization.mode (required)

Add an enum field to organizations:

- `organizations.mode` : `ENUM('operations','product') NOT NULL DEFAULT 'operations'`

Behavior:

- Mode is read on every request requiring organization context.
- Mode changes apply immediately for all users in org.

## 1.2 Organization.mode_settings (recommended)

Add a JSON field to store per-mode configuration & future-proofing:

- `organizations.mode_settings` : `JSONB NOT NULL DEFAULT {}`

Example structure:

```json
{
  "product": {
    "nav": "product_v1",
    "defaults": {
      "statuses": ["Backlog", "Todo", "In Progress", "Done"],
      "activityFeedCollapsed": true,
      "priorityEnabled": true,
      "boardEnabled": true,
      "calendarEnabled": false,
      "timeTrackingEnabled": false,
      "reportsEnabled": false,
      "auditLogsEnabled": false
    }
  },
  "operations": {
    "nav": "operations_v1",
    "defaults": {
      "timeTrackingEnabled": true,
      "timesheetsEnabled": true,
      "reportsEnabled": true,
      "auditLogsEnabled": true
    }
  }
}
```

If you don’t want JSON now, you can hardcode defaults by mode and add this later.

---

# 2) Mode Fetching & App Bootstrapping

## 2.1 Organization context endpoint (required)

Ensure the frontend has a single source of truth for the current org:

- `GET /api/orgs/:orgId/context`
  - Returns: org info + mode + feature flags derived from mode + user’s org role.

Response example:

```json
{
  "org": { "id": "...", "name": "...", "mode": "product" },
  "viewer": { "id": "...", "orgRole": "member" },
  "features": {
    "timeTracking": false,
    "timesheets": false,
    "reports": false,
    "auditLogs": false,
    "calendar": false,
    "board": true,
    "views": true
  },
  "ui": {
    "navPreset": "product_v1",
    "labels": { "users": "Members" }
  }
}
```

## 2.2 Client initialization (required)

On app load and on org-switch:

- Fetch context
- Store in a global state (e.g., Zustand/Redux/React Context)
- Use it to:
  - Render correct sidebar/nav
  - Hide/disable routes
  - Drive wording (“Members” vs “Employees”)

---

# 3) Feature Gating Strategy (Required)

## 3.1 Single feature gate module

Implement a shared module:

- `featureGate.ts`
  - Inputs: `org.mode`, `org.mode_settings`, `viewer.orgRole`
  - Outputs: boolean flags + route access rules

Example:

```ts
export function getFeatures(ctx): Features {
  if (ctx.org.mode === "product") {
    return {
      timeTracking: false,
      timesheets: false,
      reports: false,
      leaderboard: false,
      auditLogs: false,
      loginLogs: false,
      calendar:
        ctx.org.mode_settings?.product?.defaults?.calendarEnabled ?? false,
      board: true,
      views: true,
    };
  }
  return {
    timeTracking: true,
    timesheets: true,
    reports: true,
    leaderboard: true,
    auditLogs: true,
    loginLogs: true,
    calendar: true,
    board: true,
    views: true,
  };
}
```

## 3.2 Enforcement layers (must do all)

1. **UI**: hide navigation + buttons
2. **Routing**: block route access (redirect to safe page)
3. **API**: protect endpoints (return `403 FEATURE_DISABLED` when not allowed)

---

# 4) Navigation & Information Architecture

You will ship **two sidebar presets**.

## 4.1 Product mode navigation (Linear-inspired)

Sidebar:

1. **Inbox**
2. **Issues**
3. **Projects**
4. **Views** (Saved Filters renamed)
5. **Insights**
6. **Settings**

### Route mapping

- Inbox: `/inbox`
- Issues: `/issues` (alias of `/tasks`)
- Projects: `/projects`
- Views: `/views` (alias of saved filters)
- Insights: `/insights`
- Settings: `/settings`

### UX rules

- Default landing page (after login/org select): **Inbox**
- Default primary work screen: **Issues**
- Keep “Board” as a secondary tab inside Issues (not a nav item)

## 4.2 Operations mode navigation

Sidebar:

1. Dashboard
2. Tasks
3. Projects
4. Calendar
5. Timesheet
6. Reports
7. Users
8. Audit Logs
9. Settings

Route mapping can reuse your existing ones.

---

# 5) UI/UX Changes by Mode (What to implement, what to remove/hide)

## 5.1 Global labels & terminology

Add a mode-based label dictionary:

### Product mode labels

- “Users” → “Members”
- “Employee” → “Member”
- “Supervisor/Manager” → removed from UI; treat as admin/member
- “Productivity” → “Progress”
- “Timesheet” → never shown

### Operations mode labels

Keep current labels as-is.

Implementation:

- `labels.ts` exports `getUILabels(mode)`
- Replace hardcoded strings in nav + key screens

---

## 5.2 Product Mode: New screens & modifications

### A) Inbox (NEW) — `/inbox`

**Purpose:** a focused feed of what needs attention, built from existing task data.

**Content sections (top-to-bottom):**

1. **Assigned to me (open)**
   Filter: `assignee = me AND status != done`
2. **Mentioned (unread)** (optional if you track mentions as notifications)
   If mention notifications exist: show unresolved mention notifications linked to tasks
3. **Recently updated**
   Filter: tasks where `updated_at last 7 days` AND user is participant (assignee, creator, commenter)

**UI layout**

- Left: list (like Linear)
- Right: task detail panel (optional) OR navigates to task detail page
- Sorting:
  - Assigned: priority desc, updated_at desc
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
- Default sorting: `updated_at desc` or `priority desc then updated_at desc` (pick one; Linear uses “recency + priority feel”)

**Secondary tab inside Issues**

- `List` (default)
- `Board` (optional, enabled by features.board)

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

Use your existing saved filter system. Changes:

- Rename UI from “Saved Filters” → “Views”
- In product mode, move it into sidebar as a top-level nav item
- Views list shows:
  - Name
  - Query summary chips
  - Shortcut key (optional later)

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

- Use existing tasks table filtered by org & optionally by project

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

- Product mode UI should only show: `Admin` and `Member`
- If your DB already has more roles, map them:
  - owner/admin/supervisor/manager → Admin
  - employee/member → Member

No data migration required—this is a display + permission mapping layer.

## 6.2 Permission checks (backend)

Backend should continue to enforce existing roles, but in product mode:

- Treat supervisor/manager as admin-equivalent
- Prevent UI from creating those roles

---

# 7) Feature Removal/Disable Matrix

## 7.1 Must be hidden/disabled in Product mode

### Hide in navigation and remove entry points

- Timesheets (`/timesheet`)
- Reports (`/reports`)
- Leaderboards (component inside reports)
- Audit logs (`/audit-logs`) (can remain admin-only and not linked)
- Login logs (`/login-logs`)
- Time entry UI in task details
- Manual time editing UI

### API behavior

- Any time-tracking endpoints:
  - Return `403 FEATURE_DISABLED` in product mode

- Reports endpoints:
  - `403 FEATURE_DISABLED`

### UI behavior

- If user lands on those routes via old bookmark:
  - Show a friendly “Not available in this workspace” empty state + link to Issues
  - OR hard redirect to `/issues`

## 7.2 Optional in Product mode (behind feature flags)

- Calendar: default off
- Board: on (but secondary)
- Activity stream: collapsed by default

---

# 8) Statuses & Defaults by Mode

## 8.1 Project creation defaults

When a project is created:

- If org.mode = product:
  - Create statuses: Backlog, Todo, In Progress, Done

- If org.mode = operations:
  - Keep your existing defaults (todo, in_progress, review, etc.)

If statuses are org-wide instead of project-wide, apply similarly.

## 8.2 Task creation defaults

Product mode:

- Default status: Todo (or Backlog if you prefer triage first)
- Default priority: None (or Medium) — decide based on your current usage
- Default assignee: none

Operations mode:

- Keep current defaults

---

# 9) Routing & Backward Compatibility

## 9.1 Route aliases (to avoid breaking existing links)

- `/tasks` remains valid
- Add `/issues` → renders the same page as tasks but in product mode configuration
- `/saved-filters` remains valid
- Add `/views` → alias

## 9.2 Mode-based home route

After login and org select:

- Product mode: redirect to `/inbox`
- Operations mode: redirect to `/dashboard` (or your current home)

---

# 10) API Requirements & Server Enforcement

## 10.1 Middleware: org mode resolver

Every request with org context must resolve:

- orgId
- org.mode
- viewer role
- features

Attach to request context:

- `req.orgMode`
- `req.features`

## 10.2 Feature-disabled error contract

Standardize:

```json
{
  "error": "FEATURE_DISABLED",
  "feature": "timesheets",
  "message": "Timesheets are not available in this workspace mode."
}
```

Frontend uses this to show “not available” UI.

---

# 11) UI Components: Where each change goes

## 11.1 Sidebar component

- Replace static nav items with `getNavPreset(mode, features)`
- Use labels dictionary for text
- Hide nav links to disabled features

## 11.2 Tasks list page

- Add product mode config:
  - default view = list (ungrouped)
  - grouping toggle
  - board as secondary tab

- Add keyboard shortcuts & selection model improvements if needed

## 11.3 Task detail page

- Product mode:
  - hide Time Entries tab entirely
  - hide manual time editing
  - collapse activity feed by default (but available via toggle)

- Operations mode:
  - keep as-is

## 11.4 Saved filters page

- Rename UI to Views in product mode
- Add nav entry for product mode

## 11.5 New pages

- `/inbox` page
- `/insights` page

---

# 12) Implementation Plan (developer-ready task breakdown)

## Phase 1 — Foundation (Mode & gating)

1. DB migration: add `organizations.mode`, `organizations.mode_settings`
2. Backend: add org context endpoint returning mode + features
3. Frontend: global context store for org mode + features
4. Implement feature gate module
5. Route guard + nav gating

## Phase 2 — Product navigation & labels

1. Add nav presets: `product_v1`, `operations_v1`
2. Replace sidebar with preset-driven renderer
3. Implement label dictionary + replace key strings

## Phase 3 — Product UX (Inbox, Issues tweaks, Views rename, Insights)

1. Build Inbox page (queries + grouped lists)
2. Modify tasks list to behave as Issues in product mode
3. Rename Saved Filters → Views in product mode
4. Build Insights minimal page

## Phase 4 — Hide/disable HR features in Product mode

1. Remove UI entry points + tabs for time tracking/timesheets/reports
2. Add route redirects for disabled routes
3. Backend: return `FEATURE_DISABLED` for disabled endpoints

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
  - All time tracking APIs return 403 FEATURE_DISABLED
  - Reports APIs return 403 FEATURE_DISABLED

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
