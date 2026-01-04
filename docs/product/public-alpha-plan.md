# Product Mode → Public Alpha Plan (Startup Teams)

Goal: make **Product mode** feel like **Linear** (fast, keyboard-first, low-friction, opinionated), and be stable enough for a **public alpha**.  
Non-goal: change **Organization mode** UX/feature set. Any shared changes must be mode-gated or strictly non-breaking.

---

## Vision (what “Linear-like” means for Anjam Product Mode)

**Principles**

- **Speed to first value**: create a project + 3 tasks + assign owners + move status in < 5 minutes.
- **Daily home is “what I should do next”**: Inbox is the default landing page, not an admin dashboard.
- **Low cognitive load**: minimal navigation, minimal settings, minimal required fields.
- **Keyboard-first**: global command palette, quick create, predictable shortcuts, focus states everywhere.
- **Opinionated workflow**: a small set of statuses and views that cover 80% of startup needs.
- **Trust through polish**: no console errors, consistent language/terminology, predictable UI states.

**Product mode information architecture**

- **Work**: Inbox, Issues, Projects, Notifications
- **Views**: My Tasks, Today, Upcoming, Backlog (saved filters)
- **Insights (lightweight)**: a small “team pulse” page (not enterprise reporting)
- **Settings (minimal)**: Members, Workspace settings, Personal preferences

---

## Mode Strategy (how we keep Product and Organization separate)

**Single source of truth**: `organizations.mode` (e.g., `product` vs `organization`) drives:

- Route availability (hard guard + redirect).
- Sidebar + landing route + terminology.
- Feature visibility (UI gating) and defaults (templates, statuses, required fields).

**Rule**: If a feature is “too much” for startups, it must be:

- Fully hidden in Product mode (not merely “don’t click it”), and/or
- Relocated behind a “Settings → Advanced” wall with strong rationale.

---

## What to Hide/De-emphasize in Product Mode (for alpha)

**Hide from navigation in Product mode**

- Audit logs (`/audit-logs`)
- Enterprise reports (`/reports`) and heavy exports
- Timesheet (`/timesheet`) unless your alpha is explicitly agency/time-tracking driven
- Organization-level admin surfaces that feel “IT-ish” (complex roles, unblock flows, etc.)

**De-emphasize**

- Deep permission/RBAC management (keep simple roles: Owner/Admin/Member)
- Complex status configuration (keep opinionated defaults; allow edit only in “Advanced”)

**Keep**

- Projects, Tasks, Inbox (My tasks), Notifications
- Issues (if it’s your “bugs/requests” differentiator; otherwise merge into Tasks in alpha)
- Tags (only if they’re lightweight; otherwise postpone)

---

## Phases & Milestones

### Phase 0 — Scope Lock + Alpha Definition (1–2 days)

**Outcome**: a crisp alpha scope that you can ship and support.

**Changes**

- Define target alpha persona: _product/dev startup team_ vs _agency_ (pick one for defaults).
- Define alpha success metrics:
  - TTFTA (time to first assigned task)
  - % users who return within 7 days
  - tasks moved/week per active team
- Define Product mode nav + routes list (allowed/blocked).

**Milestone**

- “Alpha Scope Doc” approved (features in/out, routes in/out, default statuses/views).

---

### Phase 1 — Stability & Trust (P0) (3–7 days)

**Outcome**: Product mode is clean, predictable, and doesn’t leak technical debt to users.

**Required fixes**

- Eliminate React hydration/invalid DOM nesting errors (e.g., `<button>` inside `<button>`, invalid `<p>` nesting).
- Fix uncontrolled→controlled warnings on selects/comboboxes.
- Fix chart render sizing warnings (`width(-1)/height(-1)`) by making charts container-aware and rendering after layout is stable.
- Fix SVG attribute casing warnings (React prop casing).
- Update PocketBase SDK `beforeSend` usage to the non-deprecated format.

**UX changes**

- Standard loading states (skeletons) for all Product surfaces (Inbox, Issues, Projects, Task detail).
- Consistent empty states with one primary action (e.g., “Create task”).
- Error handling UX: user-friendly toast + retry + “copy details” (alpha support).

**Milestone**

- “Zero known console errors” during a standard Product flow:
  - login → select org → inbox → create project → create task → assign → change status → comment → notifications.

---

### Phase 2 — Product Mode IA + Route Guarding (P0) (2–5 days)

**Outcome**: Product mode feels intentionally “small and fast.”

**Changes**

- Set Product mode landing route to `/inbox`.
- Ensure route guards:
  - Product mode: block enterprise/admin routes (redirect to `/inbox`).
  - Organization mode: keep current behavior (no changes in this plan).
- Sidebar redesign for Product mode:
  - Work: Inbox, Issues, Projects, Notifications
  - Views: My Tasks, Today, Upcoming (and optionally “Backlog”)
  - Settings: Members, Workspace, Preferences (collapsed)
- Remove “enterprise” items from Product sidebar (reports/audit/timesheet).

**Milestone**

- A Product user cannot discover enterprise routes via UI, and direct navigation redirects safely.

---

### Phase 3 — Core Workflow: Inbox + Task Lifecycle (P0) (5–10 days)

**Outcome**: daily usage is effortless.

**Changes**

- Inbox becomes “My tasks” with:
  - Fast filters (Active/Done) + “By project”
  - Inline status change + assignment change
  - Bulk select (keep if it’s truly faster; otherwise postpone)
- Task creation:
  - Minimal required fields: title + project (default project allowed).
  - Optional fields behind “More” (priority, estimate, due date, tags).
- Task detail:
  - Make “Next action” obvious: status, assignee, due date.
  - Comments + mentions first-class.
  - Hide/disable heavy panels not needed in alpha (advanced time analytics, audit-like history if too noisy).

**Milestone**

- A new team completes: create 10 tasks, assign, move statuses, comment/mention, and it feels fast.

---

### Phase 4 — Projects: Simple, Opinionated, Fast (P0/P1) (4–8 days)

**Outcome**: projects are lightweight containers, not admin objects.

**Changes**

- Project creation:
  - Auto-generate project code in Product mode (or make code optional); don’t force “enterprise-like” naming.
  - Default statuses template applied automatically.
  - Member assignment flow: “Add members” inline, not a separate admin step.
- Project tasks view:
  - Default view: List
  - Secondary view: Board (if it’s stable and fast)
  - Quick add task inside the project

**Milestone**

- “Project to tasks” workflow is 1 click from anywhere via command palette or global “New”.

---

### Phase 5 — Issues (Decide: keep, merge, or postpone) (P1) (2–6 days)

**Outcome**: avoid shipping a confusing parallel system in alpha.

**Option A (recommended if you want Linear-like)**: Issues are a _Task type_ (label + view), not a separate mental model.

- Keep `/issues` as a filtered view of Tasks.

**Option B**: Keep Issues separate only if they have a clear differentiator (triage pipeline, sources, etc.).

**Milestone**

- Users understand “what an Issue is” in < 30 seconds, or it doesn’t ship in alpha.

---

### Phase 6 — Notifications: signal, not noise (P0/P1) (3–6 days)

**Outcome**: notifications increase engagement without fatigue.

**Changes**

- Defaults:
  - Notify on assignment, mention, status change on watched items.
  - Make “watching” explicit.
- Controls:
  - Per-user notification preferences (minimal, not enterprise).
  - “Mark all read” and smart grouping by day.

**Milestone**

- Notifications page feels like an activity inbox; unread count is trusted.

---

### Phase 7 — Light Insights (P1) (3–7 days)

**Outcome**: give startups a “pulse” without enterprise reporting.

**Changes**

- Replace/trim heavy reports with 3–5 lightweight charts/cards:
  - Active work by status
  - Cycle time trend (simple)
  - On-time rate (if due dates used)
  - Workload by assignee (optional)
- Ensure charts never render with invalid sizes.

**Milestone**

- Insights page loads fast, explains itself, and doesn’t require configuration.

---

### Phase 8 — Onboarding & First-Run (P0) (3–7 days)

**Outcome**: public alpha onboarding is smooth and deterministic.

**Changes**

- Fix org selection consistency and persistence (no redirects back to select unless truly needed).
- Startup-mode onboarding:
  - Create workspace
  - Invite teammates (optional)
  - Create first project (template)
  - Create first task
- Add sample content toggle (optional) for empty-state clarity.

**Milestone**

- New user reaches “first assigned task” within 5 minutes without confusion.

---

### Phase 9 — Language, Copy, and Visual Consistency (P0/P1) (2–6 days)

**Outcome**: product feels intentional and shippable.

**Changes**

- Eliminate mixed-language UI in Product mode (choose Persian-only or bilingual strategy and apply consistently).
- Standardize terminology:
  - Task/Issue naming
  - Status names
  - Priority labels
- Tighten microcopy in Product mode: shorter, action-oriented, less “enterprise” tone.

**Milestone**

- No visible English leftovers (unless explicitly part of the localization strategy).

---

### Phase 10 — Alpha Readiness: Quality Gates, Support, Release (P0) (3–7 days)

**Outcome**: you can confidently publish and support alpha users.

**Quality gates**

- `bun run check` passing.
- Unit coverage for critical Product logic (filters, route guards, query invalidation, notifications).
- E2E happy paths for Product mode:
  - Sign in → create org (product) → create project → create task → assign → change status → comment → notification appears.
- Crash-safe error boundaries for key pages.

**Operational readiness**

- Add an “Alpha feedback” entry point in Product mode (link opens email/issue form).
- Add a minimal “System status”/version footer in Product mode (helps debugging).
- Document alpha known limitations in `docs/`.

**Milestone**

- “Public Alpha Candidate” checklist is fully green.

---

## Suggested Alpha Feature Set (Product Mode)

**Must ship**

- Inbox (My tasks), Projects, Task creation/edit, Status transitions, Notifications, Members invite, Command palette.

**Should ship**

- Lightweight Insights, Saved views, Basic tags.

**Do not ship (hide)**

- Audit logs, heavy Reports, Timesheet (unless time-tracking is the alpha wedge), deep admin tooling.

---

## Definition of Done (Public Alpha, Product Mode)

- A brand-new startup team can onboard and reach first value in < 5 minutes.
- Product mode feels cohesive (IA + language + defaults) and “light.”
- No known console errors in normal use.
- Route guards prevent cross-mode leakage (Product users never see enterprise surfaces).
- Critical flows covered by E2E + basic unit tests.
- Clear in-app feedback path and documented alpha limitations.
