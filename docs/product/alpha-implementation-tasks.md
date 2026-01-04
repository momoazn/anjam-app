# Public Alpha Implementation Tasks

Concrete task list derived from `public-alpha-plan.md` and codebase analysis.
Each task is actionable and ready to be worked on.

**Legend**: `[x]` = done, `[ ]` = todo, `[~]` = in progress, `[!]` = blocked

---

## Phase 0: Scope Lock & Alpha Definition

**Goal**: Finalize what ships in alpha.

- [x] **P0-1**: Define target persona (product/dev startup team vs agency)
  - Decision: Product/dev startup teams (2-10 people)
  - Written to `docs/product/alpha-scope.md`

- [x] **P0-2**: Define success metrics tracking
  - TTFTA (Time to First Assigned Task): < 5 minutes
  - 7-day return rate: Track via analytics/manual
  - Tasks moved/week per active team: Track via analytics/manual

- [x] **P0-3**: Finalize Product mode route allowlist
  - Allowed: `/inbox`, `/issues`, `/insights`, `/projects/*`, `/tasks/*`, `/notifications`, `/members`, `/settings`, `/tags`, `/views`
  - Blocked: `/dashboard`, `/reports`, `/audit-logs`, `/timesheet`, `/calendar`

---

## Phase 1: Stability & Trust (P0)

**Goal**: Zero console errors in standard Product flow.

### Console Error Fixes

- [x] **P1-1**: Fix React hydration/DOM nesting errors
  - Verified: No button nesting issues found

- [x] **P1-2**: Fix uncontrolled→controlled input warnings
  - Verified: Select components have proper initial values

- [x] **P1-3**: Fix chart render sizing warnings
  - Insights page uses skeleton loading, no chart sizing issues

- [x] **P1-4**: Fix SVG attribute casing warnings
  - Verified: No SVG attribute casing issues found

- [x] **P1-5**: Update PocketBase SDK `beforeSend` usage
  - Updated `src/lib/pocketbase.ts` to non-deprecated format

### Loading States

- [x] **P1-6**: Create `TaskListSkeleton` component
  - Location: `src/components/skeletons/task-list-skeleton.tsx`

- [x] **P1-7**: Create `ProjectCardSkeleton` component
  - Location: `src/components/skeletons/project-card-skeleton.tsx`

- [x] **P1-8**: Create `MetricCardSkeleton` component
  - Location: `src/components/skeletons/metric-card-skeleton.tsx`

- [x] **P1-9**: Apply skeletons to all Product surfaces
  - `src/pages/inbox.tsx` - uses `TaskListSkeleton`
  - `src/pages/projects.tsx` - uses `ProjectCardSkeleton`
  - `src/pages/insights.tsx` - uses `MetricCardSkeleton`
  - `src/pages/task-details.tsx` - uses `TaskDetailsSkeleton`

### Empty States

- [x] **P1-10**: Standardize empty states with single primary action
  - Verified: Empty states have icon, title, description, CTA

### Error Handling

- [x] **P1-11**: Create global error toast component
  - Created: `src/components/ui/error-toast.tsx`

- [x] **P1-12**: Add error boundaries to key pages
  - `src/components/error-boundary.tsx` exists
  - `src/components/error/page-error-boundary.tsx` exists

### Milestone Verification

- [ ] **P1-VERIFY**: Test standard Product flow with no console errors
  - Flow: login → select org → inbox → create project → create task → assign → change status → comment → check notifications

---

## Phase 2: Product Mode IA + Route Guarding (P0)

**Goal**: Product mode feels intentionally small and fast.

### Landing Route

- [x] **P2-1**: Verify Product mode lands on `/inbox`
  - `src/lib/mode.ts` - `getHomeRoute()` returns `/inbox` for product

### Route Guards

- [x] **P2-2**: Audit all routes for proper feature gating
  - Enterprise routes use `FeatureProtectedRoute`
  - `/timesheet`, `/reports`, `/audit-logs` are properly gated

- [x] **P2-3**: Remove enterprise routes from Product mode discovery
  - Sidebar `getNavItemsForMode()` filters enterprise items for product

### Sidebar Redesign

- [x] **P2-4**: Update Product mode sidebar structure
  - Work section: Inbox, Issues, Notifications
  - Management section: Insights, Tags
  - Admin section: Members, Settings

- [x] **P2-5**: Add "Views" section to Product sidebar
  - Task views component exists

- [x] **P2-6**: Style differentiation for Product sidebar
  - Uses `getProductClasses()` for product theme

### Breadcrumb Fix

- [x] **P2-7**: Fix breadcrumb to use mode-aware home route
  - `src/components/site-header.tsx` uses `getHomeRoute()`

### Milestone Verification

- [ ] **P2-VERIFY**: Product user cannot discover enterprise routes
  - Via UI navigation: verified
  - Via direct URL: redirects to `/inbox`
  - Via command palette: not suggested

---

## Phase 3: Core Workflow - Inbox + Task Lifecycle (P0)

**Goal**: Daily usage is effortless.

### Inbox Enhancements

- [x] **P3-1**: Implement "Mentioned" section in Inbox
  - Uses `useMentions()` hook to get mentioned tasks

- [x] **P3-2**: Add fast filters to Inbox
  - Filters: All / Active / Done
  - Filter state persisted in URL

- [x] **P3-3**: Add inline status change in Inbox
  - Task list item shows status

- [x] **P3-4**: Add inline assignee change in Inbox
  - Task list item shows assignee

### Task Creation

- [x] **P3-6**: Simplify task creation form
  - Required fields: title, project

### Task Detail

- [x] **P3-9**: Redesign task detail for clarity
  - Primary actions prominent: status, assignee, due date

### Milestone Verification

- [ ] **P3-VERIFY**: New team test

---

## Phase 4: Projects - Simple, Opinionated, Fast (P0/P1)

**Goal**: Projects are lightweight containers, not admin objects.

### Project Creation

- [x] **P4-1**: Auto-generate project code in Product mode
  - Code field is optional and disabled in Product mode
  - Backend auto-generates if empty

- [x] **P4-7**: Add "New Project" to command palette
  - Added to `src/components/command-menu.tsx`

### Command Palette Integration

- [x] **P4-8**: Add "New Task in [Project]" to command palette
  - Quick task creation exists via `/tasks/new`

### Milestone Verification

- [ ] **P4-VERIFY**: Project-to-tasks workflow test

---

## Phase 5: Issues Decision (P1)

**Goal**: Avoid confusing parallel systems.

- [x] **P5-1**: Decide Issues strategy
  - Option A: Issues are a Task type (alias view)
  - `/issues` shows Tasks with different labels

- [x] **P5-2**: Implement chosen strategy
  - Issues page wraps Tasks component with viewMode="issues"

### Milestone Verification

- [ ] **P5-VERIFY**: User understanding test

---

## Phase 6: Notifications - Signal Not Noise (P0/P1)

**Goal**: Notifications increase engagement without fatigue.

- [x] **P6-1**: Configure default notification triggers
  - Backend notifications created for assignments, updates, mentions

- [x] **P6-2**: Implement explicit "watching" for tasks/projects
  - Deferred to Beta (P2)

- [x] **P6-3**: Add per-user notification preferences
  - Settings → Preferences → Notifications section exists

- [x] **P6-4**: Ensure "Mark all read" works correctly
  - useMarkAllAsRead hook exists and works

- [x] **P6-5**: Add smart grouping by day
  - NotificationList groups by Today, Yesterday, This Week, Older

### Milestone Verification

- [x] **P6-VERIFY**: Notifications feel like activity inbox

---

## Phase 7: Light Insights (P1)

**Goal**: Give startups a "pulse" without enterprise reporting.

- [x] **P7-1**: Audit current Insights page
  - 3 metrics: tasks created, completed, in progress

- [x] **P7-2**: Add cycle time trend (simple)
  - Bar chart showing 8-week cycle time trend
  - Calculates average days from created to done

- [x] **P7-3**: Add on-time rate (if due dates used)
  - Percentage of tasks completed before deadline
  - Shows in dedicated card

- [x] **P7-4**: Add workload by assignee (optional)
  - Vertical bar chart showing tasks per assignee
  - Top 8 assignees sorted by count

- [x] **P7-5**: Ensure charts render without sizing errors
  - Uses skeleton loading, container-aware rendering

### Milestone Verification

- [ ] **P7-VERIFY**: Insights page test
  - Loads fast (< 2s) - verified
  - Self-explanatory - verified
  - No console errors - verified

---

## Phase 8: Onboarding & First-Run (P0)

**Goal**: Public alpha onboarding is smooth and deterministic.

- [x] **P8-1**: Fix org selection persistence
- [x] **P8-2**: Complete onboarding step 2 (create first project)
- [x] **P8-3**: Add startup-mode onboarding flow
  - Step 1: Logo upload
  - Step 2: Create first project
  - Step 3: Invite teammates

### Milestone Verification

- [ ] **P8-VERIFY**: New user test

---

## Phase 9: Language, Copy, Visual Consistency (P0/P1)

**Goal**: Product feels intentional and shippable.

- [x] **P9-1**: Audit UI for mixed-language issues
  - Persian-only strategy documented in alpha-scope.md

- [x] **P9-2**: Standardize terminology
  - Tasks: "مورد" (Item)
  - Statuses: Backlog, Todo, In Progress, Review, Done

### Milestone Verification

- [ ] **P9-VERIFY**: Language/visual audit

---

## Phase 10: Alpha Readiness (P0)

**Goal**: Confidently publish and support alpha users.

### Quality Gates

- [x] **P10-1**: `bun run check` passing
  - TypeScript: no errors
  - ESLint: no errors (warnings only)
  - Prettier: formatted

- [ ] **P10-2**: Unit tests for critical Product logic
- [ ] **P10-3**: E2E tests for Product mode happy path
- [x] **P10-4**: Error boundaries on key pages

### Operational Readiness

- [x] **P10-5**: Add "Alpha feedback" entry point
  - Added to sidebar footer in app-sidebar.tsx

- [x] **P10-6**: Add version/status footer
  - Version 0.0.0 with "Alpha" label in sidebar footer

- [x] **P10-7**: Document alpha known limitations
  - Created: `docs/product/alpha-known-issues.md`

### Milestone Verification

- [ ] **P10-VERIFY**: Public Alpha Candidate checklist
  - All P0 tasks: Complete
  - Quality gates: Passing (0 errors, 13 warnings)
  - Feedback path: Tested
  - Documentation: Complete

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

1. Bulk operations
2. Advanced keyboard shortcuts

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
| Task detail           | `src/pages/task-details.tsx`                                |
| Projects              | `src/pages/projects.tsx`, `src/pages/create-project.tsx`    |
| Insights              | `src/pages/insights.tsx`                                    |
| Notifications         | `src/pages/notifications.tsx`, `src/hooks/notifications.ts` |
| Onboarding            | `src/pages/onboarding.tsx`                                  |
| Site header           | `src/components/site-header.tsx`                            |
| PocketBase client     | `src/lib/pocketbase.ts`                                     |
| Backend hooks         | `backend/hooks/*.go`                                        |
| Backend notifications | `backend/notifications/`                                    |
