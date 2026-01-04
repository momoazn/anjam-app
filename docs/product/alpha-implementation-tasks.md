# Public Alpha Implementation Tasks

Concrete task list derived from `public-alpha-plan.md` and codebase analysis.
Each task is actionable and ready to be worked on.

**Legend**: `[x]` = done, `[ ]` = todo, `[~]` = in progress, `[!]` = blocked

---

## Phase 0: Scope Lock & Alpha Definition

**Goal**: Finalize what ships in alpha.

- [ ] **P0-1**: Define target persona (product/dev startup team vs agency)
  - Decision needed: Which default configuration?
  - Write decision to `docs/product/alpha-scope.md`

- [ ] **P0-2**: Define success metrics tracking
  - TTFTA (time to first assigned task)
  - 7-day return rate
  - Tasks moved/week per active team
  - Add analytics hooks or document manual tracking approach

- [ ] **P0-3**: Finalize Product mode route allowlist
  - Current allowed: `/inbox`, `/issues`, `/insights`, `/projects/*`, `/tasks/*`, `/notifications`, `/members`, `/settings`, `/tags`, `/views`
  - Confirm blocked: `/dashboard`, `/reports`, `/audit-logs`, `/timesheet`, `/calendar`
  - Update `src/lib/mode.ts` if needed

---

## Phase 1: Stability & Trust (P0)

**Goal**: Zero console errors in standard Product flow.

### Console Error Fixes

- [ ] **P1-1**: Fix React hydration/DOM nesting errors
  - Search for `<button>` or interactive elements nested inside other interactive elements
  - Files to check: `src/components/ui/button.tsx`, any compound button components
  - Command: `bun run dev` and watch console for hydration warnings

- [ ] **P1-2**: Fix uncontrolled→controlled input warnings
  - Search for select/combobox components with undefined initial values
  - Files: `src/components/ui/select.tsx`, `src/components/ui/combobox.tsx`
  - Ensure all controlled inputs have defined initial values (empty string, not undefined)

- [ ] **P1-3**: Fix chart render sizing warnings
  - Location: `src/pages/insights.tsx` and any chart components
  - Issue: Charts rendering with width(-1) or height(-1)
  - Fix: Wrap charts in container-aware wrapper, render after layout stable
  - Consider using `ResizeObserver` or container query

- [ ] **P1-4**: Fix SVG attribute casing warnings
  - Search for SVG attributes in custom icons
  - React requires camelCase: `strokeWidth` not `stroke-width`, `fillRule` not `fill-rule`
  - Files: `src/components/icons/`, any inline SVGs

- [ ] **P1-5**: Update PocketBase SDK `beforeSend` usage
  - Location: `src/lib/pocketbase.ts`
  - Update to non-deprecated format per PocketBase docs

### Loading States

- [ ] **P1-6**: Create `TaskListSkeleton` component
  - Location: `src/components/skeletons/task-list-skeleton.tsx`
  - Use in: Inbox, My Tasks, Project tasks view

- [ ] **P1-7**: Create `ProjectCardSkeleton` component
  - Location: `src/components/skeletons/project-card-skeleton.tsx`
  - Use in: Projects list, sidebar project submenu

- [ ] **P1-8**: Create `MetricCardSkeleton` component
  - Location: `src/components/skeletons/metric-card-skeleton.tsx`
  - Use in: Insights page

- [ ] **P1-9**: Apply skeletons to all Product surfaces
  - Update: `src/pages/inbox.tsx` - use `TaskListSkeleton`
  - Update: `src/pages/my-tasks.tsx` - use `TaskListSkeleton`
  - Update: `src/pages/insights.tsx` - use `MetricCardSkeleton`
  - Update: `src/pages/projects.tsx` - use `ProjectCardSkeleton`
  - Update: `src/pages/task.tsx` - create and use `TaskDetailSkeleton`

### Empty States

- [ ] **P1-10**: Standardize empty states with single primary action
  - Audit all empty states in Product mode pages
  - Each should have: icon, title, description, ONE primary CTA
  - Files: `src/pages/inbox.tsx`, `src/pages/projects.tsx`, `src/pages/notifications.tsx`

### Error Handling

- [ ] **P1-11**: Create global error toast component
  - Features: user-friendly message, retry button, "copy details" for support
  - Location: `src/components/ui/error-toast.tsx`
  - Integrate with existing toast system

- [ ] **P1-12**: Add error boundaries to key pages
  - Wrap: Inbox, Projects, Task detail, Insights
  - Create: `src/components/error-boundary.tsx` if not exists
  - Show friendly error UI with retry option

### Milestone Verification

- [ ] **P1-VERIFY**: Test standard Product flow with no console errors
  - Flow: login → select org → inbox → create project → create task → assign → change status → comment → check notifications
  - All steps must complete without console errors

---

## Phase 2: Product Mode IA + Route Guarding (P0)

**Goal**: Product mode feels intentionally small and fast.

### Landing Route

- [ ] **P2-1**: Verify Product mode lands on `/inbox`
  - Check: `src/lib/mode.ts` - `getHomeRoute()` returns `/inbox` for product
  - Check: `src/router.tsx` - default redirect uses `getHomeRoute()`
  - Check: Post-login redirect uses mode-aware routing

### Route Guards

- [ ] **P2-2**: Audit all routes for proper feature gating
  - Every enterprise route must use `FeatureProtectedRoute`
  - Test: Product mode user navigating to `/reports` → redirects to `/inbox`
  - Test: Product mode user navigating to `/audit-logs` → redirects to `/inbox`
  - Test: Product mode user navigating to `/timesheet` → redirects to `/inbox`

- [ ] **P2-3**: Remove enterprise routes from Product mode discovery
  - Ensure sidebar `getNavItemsForMode()` returns no enterprise items for product
  - Ensure command palette doesn't suggest blocked routes
  - Location: `src/components/app-sidebar.tsx`, `src/components/command-menu.tsx`

### Sidebar Redesign

- [ ] **P2-4**: Update Product mode sidebar structure
  - **Work section**: Inbox, Issues, Projects, Notifications
  - **Views section**: My Tasks, Today, Upcoming, (Backlog optional)
  - **Settings section**: Members, Workspace, Preferences (collapsed by default)
  - Location: `src/components/app-sidebar.tsx` - update `getNavItemsForMode()`

- [ ] **P2-5**: Add "Views" section to Product sidebar
  - Display saved filters prominently
  - Quick access to: My Tasks, Today, Upcoming
  - Consider: inline filter chips or dedicated nav section

- [ ] **P2-6**: Style differentiation for Product sidebar
  - Apply product theme classes to sidebar
  - Consider: lighter feel, less dense navigation
  - Location: `src/components/app-sidebar.tsx`, use `useProductClasses()`

### Breadcrumb Fix

- [ ] **P2-7**: Fix breadcrumb to use mode-aware home route
  - Location: `src/components/site-header.tsx`
  - Change: hardcoded `/dashboard` → `getHomeRoute()`
  - Change: Use `getModeLabels()` for breadcrumb text

### Milestone Verification

- [ ] **P2-VERIFY**: Product user cannot discover enterprise routes
  - Via UI navigation: impossible
  - Via direct URL: redirects to `/inbox`
  - Via command palette: not suggested

---

## Phase 3: Core Workflow - Inbox + Task Lifecycle (P0)

**Goal**: Daily usage is effortless.

### Inbox Enhancements

- [ ] **P3-1**: Implement "Mentioned" section in Inbox
  - Location: `src/pages/inbox.tsx`
  - Query: tasks where current user is mentioned in comments
  - Backend: may need mention extraction/indexing in `backend/hooks/`

- [ ] **P3-2**: Add fast filters to Inbox
  - Filters: Active / Done / By Project
  - UI: filter chips or tabs at top of Inbox
  - Persist filter state in URL or local storage

- [ ] **P3-3**: Add inline status change in Inbox
  - Location: `src/components/task-list-item.tsx`
  - Add: status dropdown that updates without navigating to detail
  - Use: optimistic update with query invalidation

- [ ] **P3-4**: Add inline assignee change in Inbox
  - Location: `src/components/task-list-item.tsx`
  - Add: assignee dropdown/avatar picker inline
  - Use: optimistic update with query invalidation

- [ ] **P3-5**: Add bulk select to Inbox (optional)
  - Only if truly faster than individual actions
  - UI: checkbox column, bulk action bar
  - Actions: change status, change assignee, delete

### Task Creation

- [ ] **P3-6**: Simplify task creation form
  - Required fields: title, project (with default project option)
  - Optional fields hidden behind "More" expander: priority, estimate, due date, tags
  - Location: `src/pages/create-task.tsx` or quick-create modal

- [ ] **P3-7**: Add quick-create task from Inbox
  - Inline "Add task" input at top of Inbox sections
  - Creates task with minimal fields, assigned to current user
  - Opens detail for additional editing if needed

- [ ] **P3-8**: Implement default project setting
  - User preference: default project for new tasks
  - Location: user settings or workspace settings
  - Pre-fill project field in task creation

### Task Detail

- [ ] **P3-9**: Redesign task detail for "next action" clarity
  - Primary actions prominent: status, assignee, due date
  - Comments/mentions first-class (top of activity section)
  - Location: `src/pages/task.tsx`

- [ ] **P3-10**: Hide advanced panels in task detail (Product mode)
  - Hide: time analytics, audit-like history (if too noisy)
  - Gate with `currentOrgFeatures` from auth store
  - Show only essential info for startup workflow

### Milestone Verification

- [ ] **P3-VERIFY**: New team test
  - Create 10 tasks, assign, move statuses, comment/mention
  - Must feel fast and intuitive
  - Time target: < 10 minutes for all operations

---

## Phase 4: Projects - Simple, Opinionated, Fast (P0/P1)

**Goal**: Projects are lightweight containers, not admin objects.

### Project Creation

- [ ] **P4-1**: Auto-generate project code in Product mode
  - Backend already generates code if empty
  - Frontend: hide code field or show as "auto-generated"
  - Location: `src/pages/create-project.tsx`

- [ ] **P4-2**: Apply default status template automatically
  - On project creation, seed with standard statuses
  - Statuses: Backlog, Todo, In Progress, Review, Done
  - Backend: `backend/hooks/projects.go` may already do this

- [ ] **P4-3**: Add inline member assignment during project creation
  - UI: member picker/invite in creation form
  - Not a separate admin step after creation
  - Location: `src/pages/create-project.tsx`

### Project Tasks View

- [ ] **P4-4**: Set default project view to List
  - Location: `src/pages/project.tsx` or project tasks page
  - Remember user preference per project

- [ ] **P4-5**: Ensure Board view is stable (secondary view)
  - Only show if stable and fast
  - Gate behind feature flag if unstable
  - Location: project page view toggle

- [ ] **P4-6**: Add quick-add task inside project view
  - Inline input at bottom of task list
  - Pre-fills project, minimal other fields
  - Location: project tasks component

### Command Palette Integration

- [ ] **P4-7**: Add "New Project" to command palette
  - Shortcut: accessible from anywhere
  - Location: `src/components/command-menu.tsx`

- [ ] **P4-8**: Add "New Task in [Project]" to command palette
  - Quick task creation with project context
  - Location: `src/components/command-menu.tsx`

### Milestone Verification

- [ ] **P4-VERIFY**: Project-to-tasks workflow test
  - Create project → create task inside → 1 click from anywhere via command palette
  - Must be fast and obvious

---

## Phase 5: Issues Decision (P1)

**Goal**: Avoid confusing parallel systems.

- [ ] **P5-1**: Decide Issues strategy
  - **Option A (recommended)**: Issues are a Task type (label + filtered view)
    - `/issues` shows Tasks filtered by type="issue"
    - Simpler mental model
  - **Option B**: Keep Issues separate (only if clear differentiator exists)
    - Triage pipeline, external sources, etc.

- [ ] **P5-2**: Implement chosen strategy
  - If Option A: add task type field, create filtered view
  - If Option B: document differentiator, build distinct UI

### Milestone Verification

- [ ] **P5-VERIFY**: User understanding test
  - New user understands "what an Issue is" in < 30 seconds
  - If confusing, don't ship in alpha

---

## Phase 6: Notifications - Signal Not Noise (P0/P1)

**Goal**: Notifications increase engagement without fatigue.

### Notification Defaults

- [ ] **P6-1**: Configure default notification triggers
  - Notify on: assignment, mention, status change on watched items
  - Location: notification creation logic in `backend/notifications/`

- [ ] **P6-2**: Implement explicit "watching" for tasks/projects
  - UI: watch/unwatch button on task detail
  - Backend: track watchers, notify on changes
  - Location: task detail page, backend hooks

### Notification Controls

- [ ] **P6-3**: Add per-user notification preferences
  - Settings: notification types to receive
  - Keep minimal (not enterprise-level controls)
  - Location: `src/pages/settings.tsx` or user profile

- [ ] **P6-4**: Ensure "Mark all read" works correctly
  - Location: `src/pages/notifications.tsx`
  - Verify hook: `useMarkAllAsRead()`

- [ ] **P6-5**: Add smart grouping by day
  - Group notifications: Today, Yesterday, This Week, Older
  - Location: `src/pages/notifications.tsx`

### Milestone Verification

- [ ] **P6-VERIFY**: Notifications feel like activity inbox
  - Unread count is trusted (accurate)
  - No notification fatigue (reasonable defaults)

---

## Phase 7: Light Insights (P1)

**Goal**: Give startups a "pulse" without enterprise reporting.

### Insights Improvements

- [ ] **P7-1**: Audit current Insights page
  - Current: 3 metrics (tasks created, completed, in progress)
  - Confirm no heavy enterprise charts present

- [ ] **P7-2**: Add cycle time trend (simple)
  - Chart: average time from created to done, weekly
  - Keep simple, no configuration needed

- [ ] **P7-3**: Add on-time rate (if due dates used)
  - Metric: % of tasks completed before due date
  - Only show if workspace uses due dates

- [ ] **P7-4**: Add workload by assignee (optional)
  - Chart: tasks per team member
  - Simple bar chart, no drill-down

- [ ] **P7-5**: Ensure charts render without sizing errors
  - Fix any width/height(-1) issues
  - Container-aware rendering
  - Related to P1-3

### Milestone Verification

- [ ] **P7-VERIFY**: Insights page test
  - Loads fast (< 2s)
  - Self-explanatory (no configuration needed)
  - No console errors

---

## Phase 8: Onboarding & First-Run (P0)

**Goal**: Public alpha onboarding is smooth and deterministic.

### Onboarding Fixes

- [ ] **P8-1**: Fix org selection persistence
  - No redirects back to org select unless truly needed
  - Check: `src/store/auth-store.ts` persistence
  - Check: `RequireOrganization` guard logic

- [ ] **P8-2**: Complete onboarding step 2 (create first project)
  - Current: step 2 is empty
  - Add: project creation form or template selection
  - Location: `src/pages/onboarding.tsx`

- [ ] **P8-3**: Add startup-mode onboarding flow
  - Steps:
    1. Create workspace (org details)
    2. Create first project (with template)
    3. Create first task (quick win)
    4. Invite teammates (optional)
  - Location: `src/pages/onboarding.tsx`

- [ ] **P8-4**: Add sample content toggle (optional)
  - Option to seed with example project/tasks
  - Helps with empty-state clarity
  - Location: onboarding settings or project creation

### Milestone Verification

- [ ] **P8-VERIFY**: New user test
  - Brand new user reaches "first assigned task" within 5 minutes
  - No confusion about what to do next

---

## Phase 9: Language, Copy, Visual Consistency (P0/P1)

**Goal**: Product feels intentional and shippable.

### Language Consistency

- [ ] **P9-1**: Audit UI for mixed-language issues
  - Choose: Persian-only or bilingual strategy
  - Apply consistently across Product mode
  - Check: buttons, labels, placeholders, error messages

- [ ] **P9-2**: Standardize terminology
  - Task vs Issue: decide and apply
  - Status names: consistent across all views
  - Priority labels: consistent naming

- [ ] **P9-3**: Tighten microcopy
  - Shorter, action-oriented labels
  - Less "enterprise" tone
  - Location: all Product mode pages and components

### Visual Consistency

- [ ] **P9-4**: Audit Product mode for visual inconsistencies
  - Spacing, typography, colors
  - Button styles, form inputs
  - Apply product theme consistently

- [ ] **P9-5**: Remove any English leftovers (if Persian-only)
  - Or: properly implement bilingual if that's the strategy
  - Check: all user-facing strings

### Milestone Verification

- [ ] **P9-VERIFY**: Language/visual audit
  - No visible inconsistencies
  - No unexpected language switches

---

## Phase 10: Alpha Readiness (P0)

**Goal**: Confidently publish and support alpha users.

### Quality Gates

- [ ] **P10-1**: `bun run check` passing
  - TypeScript: no errors
  - ESLint: no errors
  - Prettier: formatted

- [ ] **P10-2**: Unit tests for critical Product logic
  - Filters logic
  - Route guards
  - Query invalidation
  - Notifications
  - Location: `src/**/*.test.ts`

- [ ] **P10-3**: E2E tests for Product mode happy path
  - Flow: sign in → create org (product) → create project → create task → assign → change status → comment → notification appears
  - Location: E2E test files

- [ ] **P10-4**: Error boundaries on key pages
  - Inbox, Projects, Task detail, Insights
  - Crash-safe with recovery option

### Operational Readiness

- [ ] **P10-5**: Add "Alpha feedback" entry point
  - Link in Product mode (footer or settings)
  - Opens: email form or GitHub issue template
  - Location: sidebar or settings page

- [ ] **P10-6**: Add version/status footer
  - Minimal: version number, "Alpha" label
  - Helps debugging support requests
  - Location: sidebar footer or app footer

- [ ] **P10-7**: Document alpha known limitations
  - Create: `docs/product/alpha-known-issues.md`
  - List: features not yet implemented, known bugs

### Milestone Verification

- [ ] **P10-VERIFY**: Public Alpha Candidate checklist
  - All P0 tasks complete
  - All quality gates passing
  - Feedback path tested
  - Documentation complete

---

## Quick Reference: Priority Order

### Must Complete for Alpha (P0)

1. Phase 1: Stability (console errors, loading states)
2. Phase 2: Route guarding
3. Phase 3: Inbox + task lifecycle
4. Phase 8: Onboarding
5. Phase 10: Quality gates

### Should Complete for Alpha (P1)

1. Phase 4: Projects
2. Phase 6: Notifications polish
3. Phase 7: Light insights
4. Phase 9: Language/visual consistency

### Can Defer (P2)

1. Phase 5: Issues decision (can ship as alias only)
2. Bulk operations
3. Advanced keyboard shortcuts

---

## Files Quick Reference

| Area                  | Key Files                                                   |
| --------------------- | ----------------------------------------------------------- |
| Mode logic            | `src/lib/mode.ts`                                           |
| Auth store            | `src/store/auth-store.ts`                                   |
| Router                | `src/router.tsx`                                            |
| Sidebar               | `src/components/app-sidebar.tsx`                            |
| Command palette       | `src/components/command-menu.tsx`                           |
| Inbox                 | `src/pages/inbox.tsx`                                       |
| Task detail           | `src/pages/task.tsx`                                        |
| Projects              | `src/pages/projects.tsx`, `src/pages/create-project.tsx`    |
| Insights              | `src/pages/insights.tsx`                                    |
| Notifications         | `src/pages/notifications.tsx`, `src/hooks/notifications.ts` |
| Onboarding            | `src/pages/onboarding.tsx`                                  |
| Site header           | `src/components/site-header.tsx`                            |
| PocketBase client     | `src/lib/pocketbase.ts`                                     |
| Backend hooks         | `backend/hooks/*.go`                                        |
| Backend notifications | `backend/notifications/`                                    |
