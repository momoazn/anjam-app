# Sidebar Functionality Improvements

A proposal to expand the functionality and options of the application sidebar beyond basic navigation, focusing on productivity, personalization, and role-aware context.

## TL;DR

Incrementally evolve the sidebar into a context-aware command center:

- Project-aware submenu with recent/starred projects and quick actions
- Saved task views with URL-based filters and deep links
- Live badges (counts) for tasks, notifications, and per-project items
- Role/permission-driven visibility via a centralized permission helper
- Quick actions on hover (create task/project)
- Pinned links (bookmarks) and Recent links (auto-populated)
- Sidebar search/filter, collapsible groups with persisted state
- Keyboard shortcuts, context menus, feature toggles, external resources

Roll out in phases with feature flags, telemetry, and acceptance criteria per feature.

---

## Goals

- Improve task and project navigation efficiency
- Increase discoverability of relevant items (recent, starred, saved views)
- Provide context-aware actions with minimal clicks
- Respect roles and permissions (admin/supervisor/user)
- Keep performance smooth and avoid UI thrash
- Preserve UX consistency and a11y including keyboard and screen readers

## Non-Goals

- Major redesign of sidebar visuals or layout
- Adding a full global command palette (future candidate, but not included here)
- Backend schema changes beyond simple counts or optional endpoints

---

## Current State (Summary)

- Static items configured in a list (Dashboard, Projects, Tasks, Users, Helps, Settings)
- One quick-create task button at the top via dialog
- Basic role gating with ad-hoc flags (adminOnly, supervisorOnly)
- No submenus, no saved views, no badges
- No persistence for user-customized links (pinned) or group collapse state

---

## Proposed Capabilities

1. Project-Aware Submenu (Recent/Starred/Quick Actions)

- Description:
  - Replace the single “Projects” link with a group that contains:
    - “Create Project” quick action
    - “Recent projects” (top N by last visited or created; configurable)
    - “Starred projects” (user-pinned)
    - “All Projects” link
    - Optional per-project sublinks (e.g., “Tasks” or “Users”)
- UX Behavior:
  - Parent row “Projects” with a hover action “+” to open Create Project dialog
  - Submenu items show project names; star icon indicates starred
  - Star toggle persists to a client store (Zustand/localStorage)
- Data/API:
  - Use existing projects list via react-query
  - “Recent” derived locally from a small recent-links store
  - “Starred” is user state only (persisted locally)
- Analytics:
  - Track clicks on Recent/Starred/All Projects; track star/unstar events
- Acceptance Criteria:
  - Submenu renders stable with projects fetched
  - Click opens destination without layout jank
  - Create action works and invalidates relevant queries

2. Saved Views under Tasks

- Description:
  - Add task view shortcuts like My Tasks, Due Today, Overdue, In Progress, and custom user-saved views
  - Use URL params so page filter state can be deep-linked
- UX Behavior:
  - “Tasks” expands to show default saved views
  - Users can save current filters as a named view
- Data/API:
  - Extend tasks page to read URL params (assigned/me, status=open, due=today, tag=xyz)
  - Persist custom saved views in a store; optional future server sync
- Analytics:
  - Track saved view usage; count creation, deletion
- Acceptance Criteria:
  - Navigating to a saved view applies the filters
  - Creating a saved view saves the filter params

3. Live Badges with Counts

- Description:
  - Show badges next to menu items and subitems, e.g.:
    - Tasks: my open task count, overdue count
    - Projects: per-project open task count
    - Notifications: unread count (if added as a menu item)
- UX Behavior:
  - Badge appears to the right; updates when queries update
  - Avoid visual thrash by debouncing updates if needed
- Data/API:
  - Aggregate counts client-side from loaded lists initially
  - Optionally introduce lightweight count endpoints later
- Analytics:
  - Track time-to-first-count render for performance
- Acceptance Criteria:
  - Badges reflect current counts and update upon mutations

4. Centralized Role/Permission Gating

- Description:
  - Replace ad-hoc flags with a permission helper that maps roles → permissions (e.g., tasks.view, tasks.create, projects.manage, users.admin)
- UX Behavior:
  - Items not permitted are hidden or disabled consistently
  - Tooltips can show “Insufficient permissions” when disabled (optional)
- Data/API:
  - Use existing role field on user; define a static permission map
- Analytics:
  - Track hidden items coverage to gauge permission model coverage
- Acceptance Criteria:
  - Changing roles updates sidebar availability after refresh or re-auth

5. Quick Actions on Hover

- Description:
  - Add contextual action buttons on menu rows (e.g., Create Task on Tasks row, Create Project on Projects row)
- UX Behavior:
  - Subtle action button appears on hover/focus; accessible via keyboard
- Data/API:
  - Reuse existing create dialogs and react-query invalidation
- Analytics:
  - Track quick-create usage vs regular navigation
- Acceptance Criteria:
  - Action opens dialog and success updates related data

6. Pinned Links (Bookmarks)

- Description:
  - Let users pin any route to a “Pinned” section and reorder pins
- UX Behavior:
  - Star icon pins current route; Pinned group can be reordered (drag or controls)
- Data/API:
  - Persist pins in Zustand/localStorage; structure includes label, href, icon/type
- Analytics:
  - Track adds/removes/reorders
- Acceptance Criteria:
  - Pins persist across reloads; reordering updates UI predictably

7. Recent Items (Auto-Populated)

- Description:
  - Automatically maintain last N visited routes for quick recall
- UX Behavior:
  - A “Recent” group lists last visited project pages, task views, etc.
  - Clear all option
- Data/API:
  - Small store that subscribes to route changes (react-router location) and pushes recent entries
- Analytics:
  - Track recent usage; measure “time to target” reduction
- Acceptance Criteria:
  - Recent list updates on navigation; cap at N items; duplicates handled

8. Sidebar Search/Filter

- Description:
  - Inline input filters visible sidebar items in real-time; acts like a local command filter
- UX Behavior:
  - Typing narrows visible items and subitems; Enter triggers top match
  - Clear control resets filter
- Data/API:
  - Pure client-side filtering; debounce optional
- Analytics:
  - Track usage frequency and search success
- Acceptance Criteria:
  - Filter reduces items reliably; keyboard Enter navigates top result

9. Keyboard Shortcuts

- Description:
  - Shortcuts like Alt+1 for Dashboard, Alt+2 for Projects, etc.; arrow keys expand/collapse submenus
- UX Behavior:
  - Show shortcuts in tooltips; accessible with focus states
- Data/API:
  - Add global keydown listener; ensure conflicts are minimal
- Analytics:
  - Track shortcut usage per route
- Acceptance Criteria:
  - Shortcuts navigate correctly and are documented in tooltips

10. Collapsible Groups with Persisted State

- Description:
  - Allow groups (“Projects”, “Saved Views”, “Pinned”, “Recent”) to be collapsed/expanded and remember state
- UX Behavior:
  - Toggle persists across reloads; keyboard-accessible
- Data/API:
  - Small store keyed by group ID; persisted
- Analytics:
  - Track expanded/collapsed state adoption
- Acceptance Criteria:
  - State persists; opening one group doesn’t jank layout

11. Context Menus

- Description:
  - Right-click/context menu on items with actions: Pin, Copy link, Open in new tab, Create under this context
- UX Behavior:
  - Respect platform conventions; fallback menu on long-press mobile
- Data/API:
  - Use existing create dialogs and link targets
- Analytics:
  - Track context menu usage
- Acceptance Criteria:
  - Menu appears with correct actions; accessible fallback available

12. Feature Toggles

- Description:
  - Feature flag certain items (e.g., Reports) or new sidebar sections for safe rollout
- UX Behavior:
  - Disabled or hidden sections gated by flags
- Data/API:
  - Config-driven flag resolver at runtime
- Analytics:
  - Track flag rollout adoption and errors
- Acceptance Criteria:
  - Toggling flags hides/shows items without errors

13. External Resources Group

- Description:
  - Add “Resources” section with links to docs, support, Slack, etc.; allow custom links
- UX Behavior:
  - A simple group at the bottom; optionally user-managed custom links
- Data/API:
  - Static + user-added links stored locally
- Analytics:
  - Track clicks on resources
- Acceptance Criteria:
  - Links open reliably; custom links persist

---

## Technical Design Notes

- Menu Configuration Model:

  - Define a typed menu config supporting:
    - id, title, icon, href, children, quickActions, requiredPermissions, featureFlag, badgeResolver, getChildren (async or derived), contextMenu actions
  - Filter by permissions and flags at render

- Permission Helper:

  - `can(user, permission: string): boolean`
  - Map roles → permissions in a central module
  - Example permissions: tasks.view, tasks.create, projects.view, projects.manage, users.admin, reports.view

- State Stores (persisted):

  - Pinned links: `{ id, label, href, icon?, type? }[]`
  - Sidebar preferences: `{ collapsedGroups: Record<string, boolean> }`
  - Recent links: `{ href, label, ts, type }[]` (de-dup by href)

- URL Param Contract for Tasks Saved Views:

  - `assigned=me|id`, `status=open|in_progress|done|...`, `due=today|overdue|range`, `priority=high|...`, `tag=...`
  - Ensure `tasks` page reads params on mount and syncs with internal filters

- Counts (Badges):

  - Start with client aggregation from existing lists
  - Optional: add simple server endpoints for counts later if perf requires

- React Query Integration:

  - Invalidate related queries after create/update/delete
  - Consider lightweight selectors for counts to avoid recompute storms

- Performance:

  - Lazy render large submenus (e.g., projects > 100)
  - Debounce live badges if costly; memoize derived items

- Accessibility:

  - All actions keyboard focusable
  - Tooltips hidden when sidebar expanded; present when collapsed (consistent with current behavior)
  - Context menu with ARIA roles; provide accessible alternatives

- Telemetry:
  - Define events: sidebar.quick_create, sidebar.saved_view_open, sidebar.pin_add, sidebar.pin_remove, sidebar.recent_click, sidebar.search_use, sidebar.shortcut_use
  - Include route and item identifiers (non-PII)

---

## Phased Task List

Phase 1: Foundations and Core Value

- [ ] 1.1 Implement permission helper and permission map
- [ ] 1.2 Refactor menu config to support requiredPermissions and featureFlag
- [ ] 1.3 Projects group:
  - [ ] 1.3.1 Convert Projects item to a group with submenu
  - [ ] 1.3.2 Add quick create action (+) and wire dialog
  - [ ] 1.3.3 Render Recent (mock from store) and All Projects links
- [ ] 1.4 Saved views under Tasks:
  - [ ] 1.4.1 Define URL param contract and parsing in Tasks page
  - [ ] 1.4.2 Add default saved views to submenu (My Tasks, Due Today, Overdue, In Progress)
- [ ] 1.5 Badges (minimal):
  - [ ] 1.5.1 Tasks badge: my open tasks count (client aggregation)
  - [ ] 1.5.2 Optional badge for overdue (simple subset)
- [ ] 1.6 Quick actions:
  - [ ] 1.6.1 Add quick create task action to Tasks row
  - [ ] 1.6.2 Add quick create project action to Projects row
- [ ] 1.7 QA + a11y pass for Phase 1
- [ ] 1.8 Docs update (README + this doc status)

Phase 2: Personalization and State

- [ ] 2.1 Pinned links:
  - [ ] 2.1.1 Create persisted store and API for additions/removals
  - [ ] 2.1.2 Add “Pinned” group; support reorder
  - [ ] 2.1.3 Add star/unstar control to context or hover action for current route
- [ ] 2.2 Recent links:
  - [ ] 2.2.1 Route listener to push recent items
  - [ ] 2.2.2 Add “Recent” group and Clear All
- [ ] 2.3 Collapsible groups:
  - [ ] 2.3.1 Persisted collapsed state per group
  - [ ] 2.3.2 Default expansion rules
- [ ] 2.4 Sidebar search/filter:
  - [ ] 2.4.1 Input to filter visible menu entries
  - [ ] 2.4.2 Keyboard Enter to navigate top match
- [ ] 2.5 Badges (project-level):
  - [ ] 2.5.1 Per-project open task count (client aggregation)
- [ ] 2.6 QA + a11y pass for Phase 2
- [ ] 2.7 Docs update and usage guide

Phase 3: Power Features and Flags

- [ ] 3.1 Keyboard shortcuts:
  - [ ] 3.1.1 Alt+1..9 mapping for top-level items
  - [ ] 3.1.2 Arrow keys expand/collapse focused group
  - [ ] 3.1.3 Tooltip/Help text for shortcuts
- [ ] 3.2 Context menus:
  - [ ] 3.2.1 Context menu on rows with Pin, Copy link, Open in new tab
  - [ ] 3.2.2 Mobile long-press fallback
- [ ] 3.3 Feature flags infra:
  - [ ] 3.3.1 Introduce flag resolver and config
  - [ ] 3.3.2 Gate Reports or experimental groups
- [ ] 3.4 External resources group with custom links
- [ ] 3.5 Optional counts endpoint for performance (if needed)
- [ ] 3.6 QA + a11y pass for Phase 3
- [ ] 3.7 Final documentation and changelog

---

## Acceptance Criteria (Per Phase)

Phase 1

- Projects expands with recent and an All Projects link; quick create works
- Tasks has saved views that apply expected filters via URL
- Tasks item shows accurate badge(s), updating after mutations
- Permission helper hides items consistently based on role

Phase 2

- Users can pin current route and see it under Pinned; pins persist and can be reordered
- Recent links populate automatically and cap at N items
- Group collapse state is persisted across reloads
- Sidebar search filters entries quickly; Enter navigates to top match

Phase 3

- Keyboard shortcuts navigate and control collapse functions; tooltips reflect shortcuts
- Context menu offers relevant actions and works on desktop and mobile
- Feature-flagged items can be toggled without code changes
- External resources group displays, and custom links persist

---

## Risks and Mitigations

- Rendering performance with large project lists:
  - Mitigation: Show top N recent/starred; lazy-load others
- Badge count accuracy vs latency:
  - Mitigation: Client aggregation first; add count endpoints later
- Permission drift:
  - Mitigation: Centralized helper; unit tests on role → permission map
- State persistence conflicts:
  - Mitigation: Namespaced storage keys; shape validation on load
- Keyboard shortcut collisions:
  - Mitigation: Use Alt+digits and document; allow user toggle to disable

---

## Observability and QA

- Telemetry: events for quick create, saved views, pins, recent, search, shortcuts
- Metrics: adoption (% of users with pins), frequency of quick create, saved view hits, average navigation time to target
- QA:
  - Role-based checklists for visibility
  - a11y checks (keyboard, screen readers)
  - Smoke tests for URL filter parsing and state persistence

---

## Open Questions

- Should saved views be sync’d per user account server-side?
- Do we need a dedicated “Notifications” sidebar item with unread badges?
- What is the default N for Recent items and Projects submenu?
- Any enterprise-specific roles/permissions beyond admin/supervisor/user?

---

## Estimation (High-Level)

- Phase 1: 2–4 days (depending on saved views URL parsing complexity)
- Phase 2: 3–5 days (pinned, recent, collapse persistence, search)
- Phase 3: 3–5 days (shortcuts, context menu, flags, resources)

---

## Appendix

Suggested permission matrix (example):

- admin: [projects.manage, projects.view, tasks.create, tasks.view, users.admin, reports.view]
- supervisor: [projects.manage, projects.view, tasks.create, tasks.view, users.view]
- user: [projects.view, tasks.view, tasks.create]

State store shapes (examples):

- Pinned: { links: Array<{ id: string; href: string; label: string; icon?: string; type?: "project"|"tasks"|"custom"; }> }
- Recent: { items: Array<{ href: string; label: string; ts: number; type?: string; }> }
- Sidebar: { collapsedGroups: Record<string, boolean> }

URL params for tasks saved views (examples):

- /tasks?assigned=me&status=open
- /tasks?due=today
- /tasks?status=in_progress
- /tasks?due=overdue&priority=high

Feature flags (examples):

- sidebar.projects.submenu.enabled
- sidebar.tasks.savedViews.enabled
- sidebar.badges.enabled
- sidebar.pinned.enabled
- sidebar.recent.enabled
- sidebar.search.enabled
- sidebar.shortcuts.enabled
- sidebar.contextMenu.enabled
- sidebar.resources.enabled

Change management:

- Use a change proposal and delta specs for approval before implementation
- Gate rollouts behind flags and progressive enabling
