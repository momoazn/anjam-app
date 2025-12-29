# Dual-Mode (Operations vs Product) — Task List (Implementation)

This is a **checklist** to implement dual-mode end-to-end. The full spec lives in `plans/dual-mode.md`.

Conventions:

- Use `organizations.mode` as the source of truth.
- Dual-mode must be enforced at **UI + routing + API**.
- When you finish changes, run `bun run check`.

---

## Phase 0 — Prep

- [ ] Confirm the v1 scope (Product disables: time tracking UI + `time_entries` writes + `/timesheet` + `/reports` + `/audit-logs`).
- [ ] Decide product-mode `calendar` behavior (enabled or disabled).
- [ ] Decide product-mode “Issues” sorting (keep current `order` sort vs introduce `updated`/`priority` sort without breaking board/reorder semantics).
  - [ ] If changing sort, ensure it doesn’t break drag/reorder which currently depends on `order`.
- [ ] Decide product-mode task default status (`todo` vs triage-first `pending`/“Backlog”).

---

## Phase 1 — Schema + Typegen

- [ ] Update `backend/pb_schema.json`: add `organizations.mode` (`select`, values `operations|product`, default `operations`).
- [ ] If you have existing data, consider a 2-step rollout:
  - [ ] Add `mode` as optional + default first
  - [ ] Backfill all orgs
  - [ ] Then mark the field required
- [ ] Run `bun run types:generate` and ensure `src/lib/pocketbase-types.ts` includes `mode` on `Organizations*` types.
- [ ] Backfill existing organizations (if any) so `mode` is set (recommended: set to `operations`):
  - [ ] Option A: PocketBase admin UI → organizations → set `mode` for existing records
  - [ ] Option B: write a small one-off script (only if needed)
- [ ] (Optional) Document how to toggle mode via PocketBase admin UI for local testing.

---

## Phase 2 — Frontend: mode/features foundation

- [ ] Add `src/lib/mode-features.ts`:
  - [ ] Define `OrgMode = "operations" | "product"` and `FeatureKey` union.
  - [ ] Implement `getOrgFeatures({ mode, settings? })` returning booleans for:
    - [ ] `timeTracking`, `timesheet`, `reports`, `auditLogs`, `loginLogs`, `calendar`, `taskBoard`
  - [ ] Provide helpers: `isFeatureEnabled(features, key)` and `getHomeRoute(mode)`.
- [ ] Add `src/lib/mode-labels.ts`:
  - [ ] Define label overrides for product mode (at least navigation + key headers): “Inbox”, “Issues”, “Insights”, “Views”, “Members”.
  - [ ] Keep operations labels unchanged (use existing `src/constants/*`).
- [ ] Add a small store for mode/features:
  - [ ] Option A: extend `src/store/auth-store.ts` to expose `currentOrgMode` and `currentOrgFeatures` derived from `currentOrganization`.
  - [ ] Option B: create `src/store/org-mode-store.ts` that reads from auth store and computes features.
- [ ] Standardize org context for API requests:
  - [ ] Update `src/lib/pocketbase.ts` to attach `X-Organization-ID` in `pb.beforeSend` when a current org exists.
    - [ ] Avoid circular imports (`auth-store` imports `pb`); read org id from persisted auth state in `localStorage` (`anjam-auth-storage`) or add a tiny non-react helper that both can use safely.
  - [ ] Confirm custom `fetch()` calls (e.g., invites) also include org context where needed (or leave as-is if endpoint path includes org id).

---

## Phase 3 — Frontend: routing + redirects

- [ ] Add route aliases in `src/router.tsx`:
  - [ ] `/inbox` → render existing `/my-tasks` page (or create a small wrapper page that reuses it).
  - [ ] `/issues` → render existing `/tasks` page (or wrapper).
- [ ] Add feature-aware route protection in `src/router.tsx`:
  - [ ] Implement `FeatureProtectedRoute` similar to `PermissionProtectedRoute`.
  - [ ] Add `feature?: FeatureKey` to route config and gate:
    - [ ] `/timesheet` (`timesheet`)
    - [ ] `/reports` (`reports`)
    - [ ] `/audit-logs` (`auditLogs`)
    - [ ] `/tasks/calendar` (`calendar`) (only if product disables calendar)
- [ ] Fix product-mode home routing:
  - [ ] `src/pages/select-organization.tsx`: after selecting org, navigate to `getHomeRoute(mode)` instead of always `/dashboard`.
  - [ ] `src/pages/onboarding.tsx`: success redirect respects org mode (to `/inbox` for product).
  - [ ] `src/router.tsx`: `PublicRoute` redirects logged-in users to `getHomeRoute(mode)` (not always `/dashboard`).

---

## Phase 4 — Frontend: sidebar presets + labeling

- [ ] Update `src/components/app-sidebar.tsx`:
  - [ ] Derive `mode/features` and pick a nav preset (`operations_v1` vs `product_v1`).
  - [ ] Product preset shows: Inbox, Issues, Projects, Views (TaskViews section), Insights, Settings.
  - [ ] Operations preset keeps current layout.
  - [ ] Hide entry points for disabled features in product mode (Timesheet/Reports/Audit Logs).
  - [ ] Header logo link goes to `/inbox` in product mode (keep `/dashboard` for operations).
- [ ] Apply product-mode labels in sidebar (use `src/lib/mode-labels.ts`) without rewriting global constants.
- [ ] Rename “Saved Filters” copy to “Views” in product mode:
  - [ ] Update sidebar section title in `src/components/sidebar/task-views.tsx` (or where the label is defined).
  - [ ] Update any Tasks page strings that mention saved filters (dropdown/dialog titles) when in product mode.
  - [ ] Ensure “Reports” nav becomes “Insights” in product mode (reports stay operations-only; leaderboard is implicitly disabled with reports).

---

## Phase 5 — Frontend: Product “Issues” behavior on `/issues`

- [ ] Add product-mode defaults to Tasks page (or wrapper around it):
  - [ ] Default “group by status” = OFF in product mode; keep current behavior in operations mode.
  - [ ] Add a UI toggle for grouping and persist locally (localStorage is fine).
  - [ ] Keep board as secondary action/tab (only if `features.taskBoard`).
- [ ] (Optional v1.1) Add keyboard shortcuts listed in spec and ensure they are mode-scoped.

---

## Phase 6 — Frontend: task details gating (time + audit)

- [ ] Update `src/components/task/task-details-content.tsx`:
  - [ ] If `features.timeTracking` is false: hide the “Total Time Spent” section and “Log time”/time entries UI.
  - [ ] If `features.auditLogs` is false: hide Activity Stream tab (or disable it with an explanatory empty state).
- [ ] Ensure any time entry dialogs/mutations are unreachable in product mode via UI.
  - [ ] Confirm create-task flow still sets a valid priority (priority is required; backend defaults to `medium` today).

---

## Phase 7 — Frontend: Product “Insights” page

- [ ] Add `src/pages/insights.tsx` (or similar) and route `/insights`:
  - [ ] Show: tasks created this week, completed this week, currently in progress.
  - [ ] Use existing hooks (tasks list) scoped to current org.
  - [ ] Gate route by product mode (or by `features.reports === false` and `mode === product`).
- [ ] Add nav entry in product preset for Insights.

---

## Phase 8 — Backend: hard enforcement for product mode

- [ ] Add helpers (new file or in an existing backend utility):
  - [ ] Resolve organization id for a time entry by traversing: `time_entries.task -> tasks.project -> projects.organization`.
  - [ ] Read `organizations.mode` and decide allow/block.
  - [ ] Implement a consistent error response for `FEATURE_DISABLED` (HTTP 403 + JSON).
- [ ] Register record hooks in `backend/main.go`:
  - [ ] `OnRecordCreateExecute("time_entries")` → block in product mode.
  - [ ] `OnRecordUpdateExecute("time_entries")` → block in product mode.
  - [ ] `OnRecordDeleteExecute("time_entries")` → block in product mode.
- [ ] (Optional) Gate `/api/v1/users/{id}/login-logs` by mode if the UI ever exposes it in product mode.

---

## Phase 9 — Backend: project status defaults by mode

- [ ] Update `backend/project_statuses.go`:
  - [ ] Resolve org mode from `projects.organization -> organizations.mode`.
  - [ ] Operations mode: keep existing default status set.
  - [ ] Product mode: seed a smaller set using existing keys (`pending` renamed “Backlog”, `todo`, `in_progress`, `done`, optional `canceled`).
- [ ] Confirm task validation still passes (`validateTaskStatusTransition`) with the product-mode status set.
- [ ] (If needed) Update `backend/hooks/tasks.go` task defaults by org mode:
  - [ ] Resolve org mode from `tasks.project -> projects.organization -> organizations.mode`.
  - [ ] Product mode: set default status to the chosen product default (`todo` or `pending`).
  - [ ] Operations mode: keep default status as-is.

---

## Phase 10 — QA / Regression

- [ ] Manual smoke test:
  - [ ] Switch an org to `product` and refresh; sidebar changes, home redirects to `/inbox`.
  - [ ] Direct-hit `/timesheet`, `/reports`, `/audit-logs` while in product mode → blocked/redirected.
  - [ ] Task details hides time tracking + activity stream in product mode.
  - [ ] Attempt to write a time entry (API) in product mode → `403 FEATURE_DISABLED`.
  - [ ] Switch org back to `operations` → everything returns.
- [ ] Run `bun run check`.

---

## Optional (from original spec; implement later)

- [ ] Add `GET /api/v1/organizations/{orgId}/context` returning org + viewer role + derived features + UI labels.
- [ ] Implement full “Inbox” multi-section feed (assigned/mentioned/recently-updated) with richer UI.
- [ ] Add `/views` page and optional `/saved-filters` alias.
- [ ] Add product-mode keyboard shortcuts for Issues/Inbox.
- [ ] Keep activity stream available but collapsed by default in product mode (instead of fully hiding).
