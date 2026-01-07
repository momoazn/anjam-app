# Plan: Remove Operations Mode and “Dual Mode” Concept

## Goal

Remove all Operations-mode-exclusive features and code paths, then remove the “mode” concept entirely so the app runs in a single, Product-only mode.

This plan is written so a developer unfamiliar with prior decisions can execute it end-to-end.

## Why We’re Doing This

- **Focus:** The main product is Product mode (greenfield, no legacy users to support).
- **Velocity:** Dual-mode doubles surface area for every feature, UI, and permission change.
- **Simplification:** Removes conditional UI, duplicated pages/routes, and config flags that complicate reasoning and testing.
- **Migration readiness:** The Convex migration becomes cleaner when only one product surface is supported.

## Definitions

- **Operations mode:** The legacy/alternate UI/feature set previously enabled by an org “mode” switch or feature flag.
- **Product mode:** The intended v1 product experience (organization → projects → tasks → inbox, insights/reports, notifications, invites, comments/tags/board).
- **Dual-mode concept:** Any of:
  - `mode === "product"` / `mode === "operations"` checks
  - org-level “mode” persisted in backend or store
  - any “switch mode” UI
  - navigation/routes/pages that diverge by mode

## High-Level Approach

1. **Inventory and classify** all Operations-only code and all “mode” checks.
2. **Decide the canonical Product-only behavior** for each conditional branch.
3. **Remove Operations-only routes/pages/components** and simplify shared components.
4. **Delete the “mode” concept** from store/state, hooks, router, constants, and backend schema (Convex).
5. **Validate** via `bun run check`, targeted manual sanity checks, and grep-based checks ensuring no “mode” remains.

---

## Phase 0 — Preconditions and Guardrails

### Branching

- Work must happen on a feature branch (e.g., `feat/remove-operations-mode` branched from current mainline branch for product work).
- Do not merge Operations branch back into main (Operations remains separate for bugfixes only).

### Non-goals

- Do not add new features.
- Do not change UX beyond removing Operations-only UI and mode switching.
- Skip Resend/email sending integration work (already deferred).

### Definition of Done (DoD)

- `bun run check` passes.
- No runtime concept of org/app “mode” remains.
- No Operations-mode pages/routes/menus remain.
- UI works for Product-only flow: org selection/creation → projects → tasks (list/board/details) → tags → members/invites → notifications/inbox → insights/reports.

---

## Phase 1 — Inventory (Codebase Audit)

### 1.1 Find mode usage

Run searches and collect results into a short checklist:

- Search for mode strings and helpers:
  - `"operations"` / `"product"`
  - `useCurrentOrgMode`, `useCurrentOrgFeatures`
  - `OrgMode`, `mode`, `isProductMode`
- Search router/menu branching:
  - conditional navigation items
  - conditional routes
  - conditional page layouts

Deliverable:

- A list of all files containing mode conditionals, grouped by:
  - Router/navigation
  - Store/state
  - Page-level conditionals
  - Component-level conditionals
  - Backend schema + Convex functions

### 1.2 Identify Operations-only features and surface area

Typical candidates:

- Operations-only pages (e.g., users/admin system pages, special dashboards, “views”, time entries, global roles, etc.)
- Operations-only permissions/roles
- Operations-only UI variants (different sizes, density, layout)

Deliverable:

- A table: `Feature / Route / Component / Data dependencies / Remove? / Replace with?`

---

## Phase 2 — Decide Canonical Product Behavior (Per Conditional)

For each `if (isProductMode) { ... } else { ... }`:

- Choose which branch becomes the default Product-only behavior.
- Ensure the chosen branch is consistent with v1 requirements:
  - org roles: `owner`, `member`
  - org projects visible to all org members
  - inbox replaces issues
  - notifications, invites, comments, tags, task board required
  - simple fuzzy search for now

Deliverable:

- A list of decisions for each conditional block (keep A, delete B).

Risk mitigation:

- If both branches contain unique desired behavior, extract the desired pieces before deleting the rest.

---

## Phase 3 — Remove Operations-only Routes, Pages, and Navigation

### 3.1 Router cleanup

- Remove any routes that exist only for Operations mode.
- Remove any mode-based route gating logic.
- Ensure Product-only routes are accessible without mode checks.

Acceptance criteria:

- No route depends on a `mode` value.
- No “redirect based on mode” logic remains.

### 3.2 Navigation cleanup

- Remove Operations-only menu items and submenus.
- Remove any “mode switcher” UI and related settings entries.

Acceptance criteria:

- Sidebar/top nav contains only Product navigation.
- No UI control for switching org/app mode exists.

### 3.3 Components cleanup (UI density variants)

If components change style/size by mode (e.g., `size={isProductMode ? "xs" : "sm"}`):

- Normalize to a single Product style.
- Prefer the Product branch for sizing and layout.

Acceptance criteria:

- No `isProductMode` boolean is used for layout decisions.

---

## Phase 4 — Remove Operations-only Data/Permissions Concepts

### 4.1 Permissions and roles

- Remove global roles and any global permission strings that are only relevant to Operations.
- Ensure only org-level roles remain (`owner`, `member`).
- Remove any “admin/manager/supervisor/employee” semantics if they are Operations-only.

Acceptance criteria:

- Store/state and UI do not reference global roles.
- Authorization checks (Convex) use org membership and org role only.

### 4.2 Organization features/flags tied to Operations

- Remove org-level “features” toggles that only exist to enable Operations.
- If a feature is still desired in Product, keep it as a normal Product feature flag (optional), but do not tie it to mode.

Acceptance criteria:

- No feature depends on “mode” to be enabled.

---

## Phase 5 — Remove the “Mode” Concept End-to-End

### 5.1 Frontend store/state

- Delete mode from:
  - Zustand auth/org store state
  - any persistence layer (localStorage)
  - selectors/hooks (e.g., `useCurrentOrgMode`)
- Replace with:
  - nothing (Product-only default), or
  - explicit feature flags that are not “mode” (only if needed for Product).

Acceptance criteria:

- `useCurrentOrgMode` (and similar) no longer exists.
- No component reads “mode” from store.

### 5.2 Backend (Convex) schema and functions

- Remove mode field from organizations (if present).
- Remove any Convex mutations/queries that:
  - read or write org mode
  - compute features based on mode

Data migration note:

- If existing data has a mode field, either:
  - ignore it going forward (field can remain but unused), or
  - remove it via a one-time migration script/mutation (preferred if we control environment).

Acceptance criteria:

- No Convex function expects a mode argument.
- No org document field is required for “mode”.

### 5.3 Constants and copy

- Remove strings and labels referring to Operations mode and switching modes.
- Ensure UI copy is Product-only.

Acceptance criteria:

- No “operations” string appears in `src/` user-facing text.

---

## Phase 6 — Validation and “No Mode Left” Checks

### 6.1 Automated checks

- Run `bun run check` until green.

### 6.2 Grep-based assertions

Add a final verification checklist:

- `rg -n "\\boperations\\b|\\bproduct\\b" src convex` should only match:
  - legitimate prose/docs, or
  - constants that are not “mode” (ideally none).
- `rg -n "useCurrentOrgMode|OrgMode|isProductMode|mode ===" src convex` returns zero.

### 6.3 Manual sanity checks (minimal)

- Login/register (as currently implemented).
- Create org, select org.
- Create project, view projects list.
- Create task, view task list and board, open task details.
- Tags page: create/edit/delete.
- Members page: invite link create/copy/revoke, remove member.
- Notifications/inbox pages load without mode branching.

---

## Risks and Mitigations

- **Risk:** A hidden dependency on mode controls access or layout in a subtle way.
  - Mitigation: systematic `rg` inventory + remove-by-category; run `bun run check` and minimal manual flows.
- **Risk:** Operations-only code includes utility functions still used in Product.
  - Mitigation: delete in small slices; when removing a feature, confirm imports are not shared.
- **Risk:** Removing schema fields breaks existing data assumptions.
  - Mitigation: treat schema field removal as separate step; keep field optional for one iteration if needed, then remove after deploy.

---

## Deliverables

- PR 1 (recommended): Remove Operations-only pages/routes/nav, keep mode but unused (optional intermediate checkpoint).
- PR 2: Delete mode from store/hooks/schema; normalize UI; remove all conditionals.

If doing it in one PR:

- Ensure it stays reviewable by grouping commits (router/nav → store/hooks → schema → cleanup).

## Delegation Mapping

This plan is executed by:

- `docs/delegate-finalize-01-remove-operations-mode-and-dual-mode.md`

For the integrated orchestration across plans, see:

- `docs/finalization-integrated-plan.md`
