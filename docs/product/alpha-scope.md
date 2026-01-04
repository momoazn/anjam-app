# Product Mode Alpha Scope

**Target Persona**: Product/dev startup teams (small, fast-moving, 2-10 people)

**Success Metrics**:

- TTFTA (Time to First Assigned Task): < 5 minutes
- 7-day return rate: Track via analytics/manual
- Tasks moved/week per active team: Track via analytics/manual

**Product Mode Route Allowlist**:

### Allowed Routes

- `/inbox` - Primary landing, daily work home
- `/issues` - Bug/triage workflow (filtered task view)
- `/insights` - Lightweight team pulse metrics
- `/projects/*` - Project management
- `/tasks/*` - Task detail and editing
- `/notifications` - Activity and mentions
- `/members` - Team management
- `/settings` - Workspace and preferences
- `/tags` - Task organization (optional)
- `/views` - Saved filters and custom views

### Blocked Routes (redirect to `/inbox`)

- `/dashboard` - Enterprise admin dashboard
- `/reports` - Heavy enterprise reports
- `/audit-logs` - Compliance/admin tooling
- `/timesheet` - Time tracking (agency feature)
- `/calendar` - Calendar view (optional feature)

**Default Statuses (Product Mode)**:

1. Backlog
2. Todo
3. In Progress
4. Review
5. Done

**Default Task Views**:

- My Tasks (Inbox)
- Today
- Upcoming
- Backlog (optional)

**Alpha Feature Scope**:

### Must Ship

- Inbox with fast filters (Active/Done/By Project)
- Inline status and assignee changes
- Project creation with auto-generated codes
- Task creation with minimal required fields
- Notifications (assignment, mentions, status changes)
- Command palette for quick actions
- Route guards preventing enterprise feature access

### Should Ship

- Lightweight Insights page (3-5 metrics)
- Saved views/filters
- Basic tags
- Onboarding flow (workspace → project → task → invite)

### Do Not Ship (hide entirely)

- Audit logs
- Enterprise reports
- Timesheet
- Advanced permission management
- Complex status configuration

**Language Strategy**: Persian-only for Product mode alpha

**Known Limitations**:

- No bulk operations (individual actions only)
- No advanced keyboard shortcuts beyond command palette
- No time tracking in alpha
- Issues may be merged into Tasks (pending decision in Phase 5)
