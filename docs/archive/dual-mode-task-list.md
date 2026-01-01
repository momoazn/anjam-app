# Dual-Mode (Operations vs Product) — Task List (Implementation)

This is a **checklist** to implement dual-mode end-to-end. The full spec lives in `plans/dual-mode.md`.

Conventions:

- Use `organizations.mode` as the source of truth.
- Dual-mode must be enforced at **UI + routing + API**.
- When you finish changes, run `bun run check`.

---

## Phase 0 — Prep

- [x] Confirm the v1 scope (Product disables: time tracking UI + `time_entries` writes + `/timesheet` + `/reports` + `/audit-logs`).
- [x] Decide product-mode `calendar` behavior (enabled or disabled).
- [x] Decide product-mode "Issues" sorting (keep current `order` sort vs introduce `updated`/`priority` sort without breaking board/reorder semantics).
  - [x] If changing sort, ensure it doesn't break drag/reorder which currently depends on `order`.
- [x] Decide product-mode task default status (`todo` vs triage-first `pending`/"Backlog").

---

## Phase 1 — Schema + Typegen

- [x] Update `backend/pb_schema.json`: add `organizations.mode` (`select`, values `operations|product`, default `operations`).
- [x] If you have existing data, consider a 2-step rollout:
  - [x] Add `mode` as optional + default first
  - [x] Backfill all orgs
  - [x] Then mark the field required
- [x] Run `bun run types:generate` and ensure `src/lib/pocketbase-types.ts` includes `mode` on `Organizations*` types.
- [x] Backfill existing organizations (if any) so `mode` is set (recommended: set to `operations`):
  - [x] Option A: PocketBase admin UI → organizations → set `mode` for existing records
  - [x] Option B: write a small one-off script (only if needed)
- [x] (Optional) Document how to toggle mode via PocketBase admin UI for local testing.

---

## Phase 2 — Frontend: mode/features foundation

- [x] Add `src/lib/mode-features.ts`:
  - [x] Define `OrgMode = "operations" | "product"` and `FeatureKey` union.
  - [x] Implement `getOrgFeatures({ mode, settings? })` returning booleans for:
    - [x] `timeTracking`, `timesheet`, `reports`, `auditLogs`, `loginLogs`, `calendar`, `taskBoard`
  - [x] Provide helpers: `isFeatureEnabled(features, key)` and `getHomeRoute(mode)`.
- [x] Add `src/lib/mode-labels.ts`:
  - [x] Define label overrides for product mode (at least navigation + key headers): “Inbox”, “Issues”, “Insights”, “Views”, “Members”.
  - [x] Keep operations labels unchanged (use existing `src/constants/*`).
- [x] Add a small store for mode/features:
  - [x] Option A: extend `src/store/auth-store.ts` to expose `currentOrgMode` and `currentOrgFeatures` derived from `currentOrganization`.
  - [x] Option B: create `src/store/org-mode-store.ts` that reads from auth store and computes features.
- [x] Standardize org context for API requests:
  - [x] Update `src/lib/pocketbase.ts` to attach `X-Organization-ID` in `pb.beforeSend` when a current org exists.
    - [x] Avoid circular imports (`auth-store` imports `pb`); read org id from persisted auth state in `localStorage` (`anjam-auth-storage`) or add a tiny non-react helper that both can use safely.
  - [x] Confirm custom `fetch()` calls (e.g., invites) also include org context where needed (or leave as-is if endpoint path includes org id).

---

## Phase 3 — Frontend: routing + redirects

- [x] Add route aliases in `src/router.tsx`:
  - [x] `/inbox` → render existing `/my-tasks` page (or create a small wrapper page that reuses it).
  - [x] `/issues` → render existing `/tasks` page (or wrapper).
- [x] Add feature-aware route protection in `src/router.tsx`:
  - [x] Implement `FeatureProtectedRoute` similar to `PermissionProtectedRoute`.
  - [x] Add `feature?: FeatureKey` to route config and gate:
    - [x] `/timesheet` (`timesheet`)
    - [x] `/reports` (`reports`)
    - [x] `/audit-logs` (`auditLogs`)
    - [x] `/tasks/calendar` (`calendar`) (only if product disables calendar)
- [x] Fix product-mode home routing:
  - [x] `src/pages/select-organization.tsx`: after selecting org, navigate to `getHomeRoute(mode)` instead of always `/dashboard`.
  - [x] `src/pages/onboarding.tsx`: success redirect respects org mode (to `/inbox` for product).
  - [x] `src/router.tsx`: `PublicRoute` redirects logged-in users to `getHomeRoute(mode)` (not always `/dashboard`).

---

## Phase 4 — Frontend: sidebar presets + labeling

- [x] Update `src/components/app-sidebar.tsx`:
  - [x] Derive `mode/features` and pick a nav preset (`operations_v1` vs `product_v1`).
  - [x] Product preset shows: Inbox, Issues, Projects, Views (TaskViews section), Insights, Settings.
  - [x] Operations preset keeps current layout.
  - [x] Hide entry points for disabled features in product mode (Timesheet/Reports/Audit Logs).
  - [x] Header logo link goes to `/inbox` in product mode (keep `/dashboard` for operations).
- [x] Apply product-mode labels in sidebar (use `src/lib/mode-labels.ts`) without rewriting global constants.
- [x] Rename “Saved Filters” copy to “Views” in product mode:
  - [x] Update sidebar section title in `src/components/sidebar/task-views.tsx` (or where the label is defined).
  - [x] Update any Tasks page strings that mention saved filters (dropdown/dialog titles) when in product mode.
  - [x] Ensure “Reports” nav becomes “Insights” in product mode (reports stay operations-only; leaderboard is implicitly disabled with reports).

---

## Phase 5 — Frontend: Product “Issues” behavior on `/issues`

- [x] Add product-mode defaults to Tasks page (or wrapper around it):
  - [x] Default “group by status” = OFF in product mode; keep current behavior in operations mode.
  - [x] Add a UI toggle for grouping and persist locally (localStorage is fine).
  - [x] Keep board as secondary action/tab (only if `features.taskBoard`).
- [ ] (Optional v1.1) Add keyboard shortcuts listed in spec and ensure they are mode-scoped.

---

## Phase 6 — Frontend: task details gating (time + audit)

- [x] Update `src/components/task/task-details-content.tsx`:
  - [x] If `features.timeTracking` is false: hide the “Total Time Spent” section and “Log time”/time entries UI.
  - [x] If `features.auditLogs` is false: hide Activity Stream tab (or disable it with an explanatory empty state).
- [x] Ensure any time entry dialogs/mutations are unreachable in product mode via UI.
  - [x] Confirm create-task flow still sets a valid priority (priority is required; backend defaults to `medium` today).

---

## Phase 7 — Frontend: Product “Insights” page

- [x] Add `src/pages/insights.tsx` (or similar) and route `/insights`:
  - [x] Show: tasks created this week, completed this week, currently in progress.
  - [x] Use existing hooks (tasks list) scoped to current org.
  - [x] Gate route by product mode (or by `features.reports === false` and `mode === product`).
- [x] Add nav entry in product preset for Insights.

---

## Phase 8 — Backend: hard enforcement for product mode

- [x] Add helpers (new file or in an existing backend utility):
  - [x] Resolve organization id for a time entry by traversing: `time_entries.task -> tasks.project -> projects.organization`.
  - [x] Read `organizations.mode` and decide allow/block.
  - [x] Implement a consistent error response for `FEATURE_DISABLED` (HTTP 403 + JSON).
- [x] Register record hooks in `backend/main.go`:
  - [x] `OnRecordCreateExecute("time_entries")` → block in product mode.
  - [x] `OnRecordUpdateExecute("time_entries")` → block in product mode.
  - [x] `OnRecordDeleteExecute("time_entries")` → block in product mode.
- [ ] (Optional) Gate `/api/v1/users/{id}/login-logs` by mode if the UI ever exposes it in product mode.

---

## Phase 9 — Backend: project status defaults by mode

- [x] Update `backend/project_statuses.go`:
  - [x] Resolve org mode from `projects.organization -> organizations.mode`.
  - [x] Operations mode: keep existing default status set.
  - [x] Product mode: seed a smaller set using existing keys (`pending` renamed “Backlog”, `todo`, `in_progress`, `done`, optional `canceled`).
- [x] Confirm task validation still passes (`validateTaskStatusTransition`) with the product-mode status set.
- [x] (If needed) Update `backend/hooks/tasks.go` task defaults by org mode:
  - [x] Resolve org mode from `tasks.project -> projects.organization -> organizations.mode`.
  - [x] Product mode: set default status to the chosen product default (`todo` or `pending`).
  - [x] Operations mode: keep default status as-is.

---

## Phase 10 — QA / Regression

- [x] Manual smoke test:
  - [x] Switch an org to `product` and refresh; sidebar changes, home redirects to `/inbox`.
  - [x] Direct-hit `/timesheet`, `/reports`, `/audit-logs` while in product mode → blocked/redirected.
  - [x] Task details hides time tracking + activity stream in product mode.
  - [x] Attempt to write a time entry (API) in product mode → `403 FEATURE_DISABLED`.
  - [x] Switch org back to `operations` → everything returns.
- [x] Run `bun run check`.

---

## Optional (from original spec; implement later)

- [x] Add `GET /api/v1/organizations/{orgId}/context` returning org + viewer role + derived features + UI labels.
- [x] Implement full “Inbox” multi-section feed (assigned/mentioned/recently-updated) with richer UI.
- [x] Add `/views` page and optional `/saved-filters` alias.
- [x] Add product-mode keyboard shortcuts for Issues/Inbox.
- [x] Keep activity stream available but collapsed by default in product mode (instead of fully hiding).
