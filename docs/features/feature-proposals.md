# Feature Proposals for Anjam

This document outlines useful, non-distracting features that can enhance Anjam without overwhelming the user experience.

> **Note**: Some features from the original proposal list have been analyzed and their current implementation status is noted below:
>
> - ✅ **Command Menu (Cmd+K)** - Fully implemented in `src/components/command-menu.tsx`
> - ✅ **Bulk Operations** - Fully implemented with `BulkActionsBar` component and batch endpoints
> - ⚠️ **Favorites & Recents** - Store exists (`sidebar-store.ts`) but NO UI connected (users can't star projects)
> - ⚠️ **Dashboard Widgets** - Widgets exist but are NOT customizable by users
> - ❌ **Workload View** - Only workload charts in Reports, no dedicated view

## Overview

These features are designed to:

- Improve daily workflow efficiency
- Add value without visual/cognitive clutter
- Support both Startup and Operations modes
- Follow the Linear-inspired design philosophy (fast, keyboard-friendly, minimal)

---

## 1. Task Dependencies

### Description

Add the ability to create "blocked by" and "blocks" relationships between tasks. This creates a dependency graph that helps teams understand task relationships and execution order.

### Use Cases

- Technical tasks that require prior work (e.g., "API design" blocks "Frontend implementation")
- Sequential workflows where order matters
- Identifying critical path items in projects

### UI Implementation

- **Inline indicators**: Small chain/link icon on task cards showing dependencies
- **Dependency panel**: Side panel in task details showing "Blocked by" and "Blocks" sections
- **Visual warnings**: Toast notification when attempting to start a task with unresolved dependencies

### Backend Requirements

- New `task_dependencies` collection:
  - `task`: Relation -> tasks
  - `blocked_by`: Relation -> tasks
  - `type`: Select ("blocks", "blocked_by")
- Validation to prevent circular dependencies
- Hook to cascade status changes (optional)

### Priority

- **Startup Mode**: Low (optional workflow)
- **Operations Mode**: Medium (project planning)

---

## 2. Task Templates

### Description

Allow users to create and use pre-configured task templates with default fields, tags, and descriptions.

### Use Cases

- Standardizing bug reports across projects
- Consistent feature request templates
- Onboarding checklists
- Meeting notes templates

### UI Implementation

- **Template management**: Settings page to create/edit templates
- **Template picker**: Dropdown when creating new task
- **Template preview**: Modal showing template fields before creation

### Backend Requirements

- New `task_templates` collection:
  - `organization`: Relation -> organizations
  - `name`: Text
  - `title_pattern`: Text (with placeholders like `{{date}}`)
  - `default_fields`: JSON (status, priority, tags, description)
  - `is_public`: Bool

### Priority

- **Startup Mode**: Medium (reduces repetition)
- **Operations Mode**: High (standardization)

---

## 3. Favorites & Recents (UI Completion)

### Description

The starred projects store exists but is not connected to the UI. Complete the implementation so users can pin important projects and access them quickly.

### Use Cases

- Quick navigation to active projects
- Pin important projects to sidebar
- Resume work on recent tasks

### UI Implementation

- **Star button**: Add star icon to project items in sidebar
- **Favorites section**: Separate section in sidebar for starred projects
- **Toggle star**: Click to star/unstar projects
- **Recent items**: Dropdown showing recently accessed tasks/projects

### Backend Requirements

- Already exists: `sidebar-store.ts` has `starredProjectIds`, `toggleStar`, `isStarred`
- Need to connect UI to store

### Priority

- **Startup Mode**: Medium (navigation efficiency)
- **Operations Mode**: Low (less critical)

---

## 4. Copy Task Link

### Description

One-click button to copy a deep link to the current task for sharing.

### Use Cases

- Sharing tasks in Slack/Teams
- Referencing tasks in comments
- Email task links to team members

### UI Implementation

- **Share button**: Next to task actions (edit, delete)
- **Copied feedback**: Toast notification "Link copied to clipboard"
- **URL format**: `/tasks/{id}/details` (full page)

### Backend Requirements

- No backend changes needed
- React Router handles URL routing

### Priority

- **Startup Mode**: High (communication efficiency)
- **Operations Mode**: High (cross-team coordination)

---

## 5. Recurring Tasks

### Description

Automatically create new tasks based on a recurrence pattern when a task is completed.

### Use Cases

- Daily standup notes
- Weekly review tasks
- Regular maintenance tasks
- Recurring client deliverables

### UI Implementation

- **Recurrence settings**: In task details, options for recurrence
- **Pattern options**: Daily, Weekly, Monthly, Custom
- **Preview**: Show next occurrence date

### Backend Requirements

- New fields on `tasks` collection:
  - `is_recurring`: Bool
  - `recurrence_pattern`: JSON (frequency, interval, days)
  - `parent_task`: Relation -> tasks (for generated instances)
- Cron or scheduled job to generate recurring tasks (or lazy generation on completion)

### Priority

- **Startup Mode**: Medium (personal productivity)
- **Operations Mode**: Medium (operations workflows)

---

## 6. Unread Comment Indicators

### Description

Visual indicator on task list items showing when new comments have been added since the user's last visit.

### Use Cases

- Quickly identify tasks with activity
- Track follow-up on assigned tasks
- Know when to revisit tasks

### UI Implementation

- **Visual indicator**: Small dot/badge on task card
- **Logic**: Compare user's `last_read_comments` timestamp with comment `created_at`
- **Mark as read**: Button or auto-mark when opening task

### Backend Requirements

- New `user_preferences` fields:
  - `last_read_comments`: JSON (task_id -> timestamp)
- Or client-side tracking via localStorage

### Priority

- **Startup Mode**: Low (nice-to-have)
- **Operations Mode**: Medium (activity tracking)

---

## 7. Customizable Dashboard Widgets

### Description

Dashboard widgets exist but users cannot customize which widgets appear or their order. Add widget customization.

### Use Cases

- Personalized dashboard based on role
- Hide irrelevant widgets
- Prioritize frequently used information

### UI Implementation

- **Customize button**: Edit mode for dashboard
- **Widget picker**: Add/remove widgets
- **Drag-and-drop**: Reorder widgets
- **Save layout**: Persist user preferences

### Backend Requirements

- New `user_preferences.dashboard_config`: JSON (widget layout, visible widgets)
- Existing widgets continue to work

### Priority

- **Startup Mode**: Low (personalization is nice-to-have)
- **Operations Mode**: Low (dashboard already functional)

---

## 8. Dedicated Workload View

### Description

Currently workload information is only available as charts in Reports. Create a dedicated workload view for managers.

### Use Cases

- Managers balancing team workload
- Identifying overloaded team members
- Capacity planning discussions

### UI Implementation

- **New route**: `/workload` or `/team/workload`
- **Workload table**: Columns for team members, task counts, workload score
- **Visual indicators**: Color-coded bars showing workload level
- **Filters**: By project, by date range

### Backend Requirements

- New endpoint: `GET /api/tm/workload`
- Aggregates tasks by assignee
- Filters by organization/project
- Already exists: `workload-aggregations.ts` logic

### Priority

- **Startup Mode**: Low (small teams don't need this)
- **Operations Mode**: High (managerial oversight)

---

## Implementation Priority Matrix

| Feature                   | Startup Mode | Operations Mode | Complexity |
| ------------------------- | ------------ | --------------- | ---------- |
| Task Dependencies         | Low          | Medium          | Medium     |
| Task Templates            | Medium       | High            | Low        |
| Favorites & Recents (UI)  | Medium       | Low             | Low        |
| Copy Task Link            | High         | High            | Very Low   |
| Recurring Tasks           | Medium       | Medium          | Medium     |
| Unread Comment Indicators | Low          | Medium          | Low        |
| Customizable Widgets      | Low          | Low             | Low        |
| Dedicated Workload View   | Low          | High            | Medium     |

---

## Integrations & Connectivity

This section covers external integrations, notifications, and automation features.

---

## 9. Slack/Teams Integration

### Description

Post task updates to Slack channels or Microsoft Teams. Enable team collaboration without leaving their communication platform.

### Use Cases

- Notify channel when tasks are created/completed
- Assignee mentions trigger DMs
- Daily standup reminders
- Project status summaries

### UI Implementation

- **Settings page**: Connect workspace, select channels
- **Notification rules**: Choose which events post to which channel
- **Message preview**: See how notifications will look
- **Disconnect option**: Remove integration

### Backend Requirements

- New `integrations` collection:
  - `organization`: Relation -> organizations
  - `provider`: Select ("slack", "teams")
  - `webhook_url`: Text
  - `settings`: JSON (channels, events)
- OAuth flow for Slack (bot token)
- Microsoft Graph API for Teams
- Message formatting for each platform

### Priority

- **Startup Mode**: Medium (popular communication tool)
- **Operations Mode**: High (team coordination)

---

## 10. Email Digests

### Description

Send periodic email summaries of task activity, deadlines, and updates.

### Use Cases

- Daily digest of assigned tasks
- Weekly summary of project progress
- Missed deadline alerts
- Unread notification summaries

### UI Implementation

- **Notification preferences**: Enable/disable email digests
- **Frequency selector**: Daily, Weekly, Never
- **Timing selector**: Time of day, day of week
- **Content preferences**: What to include in digest

### Backend Requirements

- New `email_digests` collection:
  - `user`: Relation -> users
  - `frequency`: Select ("daily", "weekly", "never")
  - `send_day`: Number (0-6, for weekly)
  - `send_hour`: Number (0-23)
  - `last_sent`: Date
- Background job to generate and send digests
- Email template system
- SMTP configuration (already exists for password reset)

### Priority

- **Startup Mode**: Low (users check app daily)
- **Operations Mode**: Medium (busy teams need summaries)

---

## 11. General Webhooks

### Description

HTTP callbacks for system events, enabling integration with external tools (Zapier, n8n, custom apps).

### Use Cases

- Trigger automation in other tools
- Send data to data warehouses
- Integration with custom internal tools
- Backup/event logging to external services

### UI Implementation

- **Webhook management**: List, create, edit, delete webhooks
- **Event selector**: Choose which events trigger webhook
- **URL input**: Destination endpoint
- **Secret management**: Signing key for verification
- **Test button**: Send test payload
- **Recent deliveries**: View last 10 deliveries with status

### Backend Requirements

- New `webhooks` collection:
  - `organization`: Relation -> organizations
  - `name`: Text
  - `url`: Text (URL validation)
  - `secret`: Text (for HMAC signing)
  - `events`: JSON array (event types)
  - `active`: Bool
- Event emission system for all CRUD operations
- Retry logic (3 retries with exponential backoff)
- Delivery logging (`webhook_deliveries` collection)

### Priority

- **Startup Mode**: Low (power user feature)
- **Operations Mode**: High (automation requirements)

---

## 12. Calendar Sync (Google/Outlook)

### Description

Two-way synchronization between task due dates and external calendars.

### Use Cases

- View tasks in Google Calendar/Outlook
- Sync meeting times to task deadlines
- Avoid scheduling conflicts
- Share availability via calendar

### UI Implementation

- **Connect calendar**: OAuth flow for Google/Outlook
- **Sync settings**: One-way (Anjam→Calendar) or two-way
- **Calendar selector**: Choose which calendar to sync to
- **Conflict indicator**: Show when task conflicts with calendar events

### Backend Requirements

- New `calendar_connections` collection:
  - `user`: Relation -> users
  - `provider`: Select ("google", "outlook")
  - `access_token`, `refresh_token`: Text
  - `calendar_id`: Text
  - `sync_enabled`: Bool
- OAuth2 handlers for Google and Microsoft Graph
- Calendar event creation/update/deletion
- Sync queue for handling two-way sync

### Priority

- **Startup Mode**: Medium (developers use calendars)
- **Operations Mode**: Medium (meeting-heavy teams)

---

## 13. GitLab Integration

### Description

Similar to GitHub integration but for GitLab. Link tasks to GitLab issues and merge requests.

### Use Cases

- Teams using GitLab instead of GitHub
- Sync issue status to task status
- Create branches from tasks
- Link MRs to tasks

### Backend Requirements

- GitLab OAuth2 configuration
- `gitlab_issue_iid`, `gitlab_mr_iid` fields on tasks
- `projects.gitlab_repo_*` fields
- Webhook handler for GitLab events
- API endpoints for sync operations

### Priority

- **Startup Mode**: Low (if team uses GitLab)
- **Operations Mode**: Medium (dev team workflow)

---

## 14. Commit-to-Task Linking

### Description

Parse commit messages for task references (e.g., `ABC-123`) and automatically link commits to tasks.

### Use Cases

- Track which commits relate to which tasks
- Generate changelog from commit history
- Code traceability
- Link PRs/MRs to tasks

### UI Implementation

- **Commit links panel**: Show linked commits on task details
- **Auto-link indicator**: Badge when commit is linked
- **Branch naming suggestion**: Suggest branch name like `feature/ABC-123-description`

### Backend Requirements

- New `task_commits` collection:
  - `task`: Relation -> tasks
  - `commit_sha`: Text
  - `commit_message`: Text
  - `repository`: Text
  - `author`: Text
  - `committed_at`: Date
- Webhook handlers for GitHub/GitLab push events
- Regex pattern matching for task references

### Priority

- **Startup Mode**: Low (nice-to-have for traceability)
- **Operations Mode**: Medium (development workflow)

---

## 15. SLA & Deadline Alerts

### Description

Proactive warnings when tasks are approaching deadlines or at risk of missing SLAs.

### Use Cases

- Warn 24 hours before deadline
- Alert when task is overdue
- Escalate critical tasks
- Track SLA compliance

### UI Implementation

- **SLA configuration**: Set deadline warnings per project/task
- **Alert indicators**: Color-coded badges (green → yellow → red)
- **Escalation settings**: Auto-assign to manager if overdue
- **SLA report**: Compliance metrics per team

### Backend Requirements

- New `sla_rules` collection:
  - `organization`: Relation -> organizations
  - `project`: Relation -> projects (nullable)
  - `name`: Text
  - `warning_hours`: Number
  - `critical_hours`: Number
  - `escalate_to`: Relation -> users (nullable)
- Background job to check deadlines
- Notification triggers for warnings

### Priority

- **Startup Mode**: Low (informal deadlines)
- **Operations Mode**: High (SLA compliance)

---

## 16. Auto-Assignment Rules

### Description

Automatically assign tasks based on configurable rules (e.g., by tag, project, or keyword).

### Use Cases

- Bugs auto-assigned to QA team
- Feature requests to product manager
- Maintenance tasks to DevOps
- Keyword-based routing

### UI Implementation

- **Rule builder**: UI to create assignment rules
- **Condition types**: Tag equals, project equals, title contains
- **Action types**: Assign to user, assign to role
- **Rule ordering**: Priority when multiple rules match
- **Test rule**: Verify rule works before saving

### Backend Requirements

- New `auto_assignment_rules` collection:
  - `organization`: Relation -> organizations
  - `name`: Text
  - `conditions`: JSON (array of condition objects)
  - `assign_to`: Relation -> users (or special value "round_robin")
  - `priority`: Number
  - `active`: Bool
- Hook on task creation to evaluate rules
- Round-robin distribution option

### Priority

- **Startup Mode**: Low (small teams assign manually)
- **Operations Mode**: Medium (workflow automation)

---

## 17. Offline Mode (PWA)

### Description

Progressive Web App support for offline access to tasks and data.

### Use Cases

- View tasks without internet
- Create offline drafts
- Background sync when online
- Mobile app experience

### UI Implementation

- **Service worker**: Cache assets and API responses
- **Offline indicator**: Show when offline
- **Sync status**: Pending changes indicator
- **Conflict resolution UI**: Handle offline edits

### Backend Requirements

- IndexedDB for local data storage
- TanStack Query persistent cache
- Sync queue for offline mutations
- Conflict detection on reconnection

### Priority

- **Startup Mode**: Low (always online)
- **Operations Mode**: Medium (field work scenarios)

---

## 18. Desktop App (Tauri/Electron)

### Description

Native desktop application for better performance and OS integration.

### Use Cases

- Native notifications
- Keyboard shortcuts system-wide
- App launcher integration
- Better offline support

### Implementation Options

- **Tauri**: Rust-based, lighter footprint, better performance
- **Electron**: Mature, larger bundle, more dependencies
- Recommend Tauri for smaller binary size

### Backend Requirements

- No backend changes
- Electron/Tauri wrapper around web app

### Priority

- **Startup Mode**: Low (web app sufficient)
- **Operations Mode**: Medium (desktop workflow)

---

## Integrations Priority Matrix

| Feature               | Startup Mode | Operations Mode | Complexity |
| --------------------- | ------------ | --------------- | ---------- |
| Slack/Teams           | Medium       | High            | Medium     |
| Email Digests         | Low          | Medium          | Medium     |
| General Webhooks      | Low          | High            | Medium     |
| Calendar Sync         | Medium       | Medium          | Medium     |
| GitLab Integration    | Low          | Medium          | Medium     |
| Commit-to-Task Link   | Low          | Medium          | Low        |
| SLA/Deadline Alerts   | Low          | High            | Medium     |
| Auto-Assignment Rules | Low          | Medium          | Medium     |
| Offline Mode (PWA)    | Low          | Medium          | High       |
| Desktop App           | Low          | Medium          | High       |

---

## Design Principles

When implementing these features, follow these guidelines:

1. **Progressive Disclosure**: Show advanced features only when needed
2. **Keyboard First**: Ensure all actions are accessible via keyboard
3. **Optimistic UI**: Update state immediately, sync in background
4. **Minimal Visuals**: Use subtle indicators, avoid visual clutter
5. **Contextual Help**: Tooltips and inline help for new features

---

## References

- [Linear Design System Analysis](../product/linear.md)
- [Startup Requirements](../product/startup-requirements.md)
- [Enterprise Requirements](../product/enterprise-requirements.md)
- [System Architecture](../architecture/system-architecture.md)
- [Roadmap](../roadmap.md)
- [GitHub Integration Plan](../architecture/github-integration.md)
