# Comprehensive Architectural Audit & Redesign

## Task Management Platform for Startup Teams (5-20 Users)

**Document Version:** 1.0  
**Date:** December 2024  
**Author:** Senior Software Architect

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Part 1: Groups vs. Organization Hierarchy Analysis](#part-1-groups-vs-organization-hierarchy-analysis)
3. [Part 2: Production-Grade RBAC System](#part-2-production-grade-rbac-system)
4. [Part 3: Scalable Task Modeling](#part-3-scalable-task-modeling)
5. [Part 4: Collaboration Engine](#part-4-collaboration-engine)
6. [Part 5: Performance & Integrity](#part-5-performance--integrity)
7. [Part 6: Critical Architectural Weaknesses & Solutions](#part-6-critical-architectural-weaknesses--solutions)
8. [Part 7: Technical Roadmap](#part-7-technical-roadmap)
9. [Complete Schema Summary](#complete-schema-summary)

---

## Executive Summary

This document provides a comprehensive architectural audit of the Anjam task management application, identifying critical weaknesses and proposing a production-grade redesign optimized for startup teams of 5-20 users with a clear path to enterprise scalability.

**Key Findings:**

- The current "Groups" entity creates semantic confusion and limits multi-tenancy
- RBAC system lacks resource-level permissions and project-specific roles
- Task modeling is rigid with hardcoded statuses and no subtask support
- Collaboration features lack real-time activity tracking and @mentions
- Performance bottlenecks exist due to missing indexes and synchronous operations

**Primary Recommendations:**

1. Replace "Groups" with "Organizations" as tenant boundary
2. Implement dual-layer RBAC (organization + project level)
3. Add subtasks, custom statuses, and time entries
4. Build event-driven collaboration engine
5. Add comprehensive indexing and rate limiting

---

## Part 1: Groups vs. Organization Hierarchy Analysis

### Current Architecture Assessment

```
Current Model:
groups (flat container)
  └── users (belong to ONE group)
  └── projects (belong to ONE group)
       └── tasks
```

**Fundamental Problems with "Groups":**

| Issue                   | Impact                                                         | Severity |
| ----------------------- | -------------------------------------------------------------- | -------- |
| Semantic confusion      | "Group" implies ad-hoc collection, not organizational unit     | Medium   |
| Single-group constraint | User can only belong to ONE group—blocks cross-functional work | High     |
| No tenant isolation     | All groups share same database namespace                       | High     |
| Group-Manager coupling  | Group requires manager user with specific role                 | Medium   |
| No hierarchy            | Cannot model departments within organization                   | Medium   |

### Recommended Hierarchy: Organization > Workspace > Project

```
Proposed Model:
organization (tenant boundary)
  └── workspaces (optional team/department grouping)
       └── projects
            └── tasks
                 └── subtasks
```

**Rationale for Each Layer:**

| Entity           | Purpose                                           | For 5-20 User Teams                               |
| ---------------- | ------------------------------------------------- | ------------------------------------------------- |
| **Organization** | Tenant boundary, billing unit, SSO domain         | Required—even single-tenant needs this for future |
| **Workspace**    | Team/department grouping (Engineering, Marketing) | Optional—can skip for <10 users                   |
| **Project**      | Work container with members and settings          | Required                                          |
| **Task**         | Unit of work                                      | Required                                          |

### Decision Matrix: Do You Need Full Hierarchy?

For **5-20 user startup teams**, the recommendation is:

```
Phase 1 (Now):     Organization > Projects > Tasks
Phase 2 (10+ users): Add optional Workspaces
Phase 3 (Enterprise): Add cross-org features
```

**Skip workspaces initially** because:

- Adds complexity without value at small scale
- Users can use project-level membership instead
- Can add later without breaking changes

### Multi-Tenancy Impact

```go
// Current: No tenant isolation
users.group → groups.id  // Single namespace

// Proposed: Full tenant isolation
organizations.id (tenant boundary)
  └── All entities reference organization_id
  └── All queries automatically scoped
```

**Data Isolation Strategy:**

```sql
-- Every query automatically scoped:
SELECT * FROM tasks
WHERE organization_id = :current_org
  AND deleted_at IS NULL
```

---

## Part 2: Production-Grade RBAC System

### Current System Problems

```typescript
// Current: Static role-to-permission mapping
const PERMISSIONS = {
  "projects.view": ["admin", "manager", "supervisor", "employee"],
  // ...
};
```

**Critical Weaknesses:**

1. **No resource-level permissions** (user X can edit project Y but not Z)
2. **No permission inheritance** (project lead doesn't inherit org permissions)
3. **Frontend/Backend mismatch** (frontend checks role, backend checks group membership)
4. **"Supervisor" confusion** (is it org-level or project-level?)

### Proposed RBAC Model: Organization + Project Roles

```
┌─────────────────────────────────────────────────────────────┐
│                    ORGANIZATION LEVEL                        │
├─────────────────────────────────────────────────────────────┤
│  owner     │ Full control, billing, delete org              │
│  admin     │ Manage all resources, users, settings          │
│  member    │ Access based on project membership             │
│  billing   │ View/manage billing only (future)              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PROJECT LEVEL                            │
├─────────────────────────────────────────────────────────────┤
│  owner     │ Delete project, manage all settings            │
│  admin     │ Manage members, settings, all tasks            │
│  member    │ Create/edit own tasks, view all tasks          │
│  viewer    │ Read-only access (for stakeholders)            │
└─────────────────────────────────────────────────────────────┘
```

### New Schema for RBAC

#### Organizations Collection

```json
{
  "name": "organizations",
  "fields": [
    { "name": "id", "type": "text", "primaryKey": true },
    { "name": "name", "type": "text", "required": true },
    { "name": "slug", "type": "text", "unique": true },
    { "name": "logo", "type": "file" },
    { "name": "settings", "type": "json" },
    {
      "name": "plan",
      "type": "select",
      "values": ["free", "pro", "enterprise"]
    },
    { "name": "created", "type": "autodate" },
    { "name": "updated", "type": "autodate" }
  ]
}
```

#### Organization Members Collection

```json
{
  "name": "organization_members",
  "fields": [
    {
      "name": "organization",
      "type": "relation",
      "collection": "organizations"
    },
    { "name": "user", "type": "relation", "collection": "users" },
    {
      "name": "role",
      "type": "select",
      "values": ["owner", "admin", "member"]
    },
    { "name": "invited_by", "type": "relation", "collection": "users" },
    { "name": "joined_at", "type": "date" }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_org_member ON organization_members (organization, user)"
  ]
}
```

#### Project Members Collection (Enhanced)

```json
{
  "name": "project_members",
  "fields": [
    { "name": "project", "type": "relation", "collection": "projects" },
    { "name": "user", "type": "relation", "collection": "users" },
    {
      "name": "role",
      "type": "select",
      "values": ["owner", "admin", "member", "viewer"]
    },
    { "name": "notifications", "type": "bool", "default": true },
    { "name": "added_by", "type": "relation", "collection": "users" },
    { "name": "created", "type": "autodate" }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_project_member ON project_members (project, user)"
  ]
}
```

### Permission Resolution Logic

```go
// Hierarchical permission check
func canAccess(user, resource, action string) bool {
    // 1. Check org-level role
    orgRole := getOrgRole(user, resource.OrganizationID)
    if orgRole == "owner" || orgRole == "admin" {
        return true // Org admins can do anything
    }

    // 2. Check project-level role
    if resource.Type == "task" || resource.Type == "project" {
        projectRole := getProjectRole(user, resource.ProjectID)
        return checkProjectPermission(projectRole, action)
    }

    return false
}

func checkProjectPermission(role, action string) bool {
    permissions := map[string][]string{
        "owner":  {"*"},
        "admin":  {"read", "write", "delete", "manage_members"},
        "member": {"read", "write", "comment"},
        "viewer": {"read"},
    }
    return contains(permissions[role], action) || contains(permissions[role], "*")
}
```

### Users Table Simplification

```json
{
  "name": "users",
  "fields": [
    { "name": "id", "type": "text", "primaryKey": true },
    { "name": "email", "type": "email", "required": true },
    { "name": "username", "type": "text", "required": true },
    { "name": "first_name", "type": "text" },
    { "name": "last_name", "type": "text" },
    { "name": "avatar", "type": "file" },
    { "name": "timezone", "type": "text", "default": "UTC" },
    { "name": "locale", "type": "text", "default": "fa" },
    { "name": "active", "type": "bool" },
    { "name": "blocked", "type": "bool" },
    { "name": "last_active_at", "type": "date" }
  ]
}
```

**Key Change:** User role is determined by membership, not user attribute. This allows:

- Same user can be admin in Org A, member in Org B
- Same user can be project owner on Project X, viewer on Project Y

---

## Part 3: Scalable Task Modeling

### 3.1 Custom Statuses Per Project

**Current Problem:** Hardcoded statuses in schema:

```json
"values": ["todo", "in_progress", "pending", "done", "canceled", "blocked", "review", "testing", "on_hold"]
```

**Proposed Solution:** Status templates with project customization

#### Status Templates Collection

```json
{
  "name": "status_templates",
  "fields": [
    { "name": "name", "type": "text" },
    { "name": "statuses", "type": "json" }
  ]
}
```

Example statuses JSON:

```json
{
  "todo": { "label": "To Do", "color": "#gray", "order": 1, "is_done": false },
  "in_progress": {
    "label": "In Progress",
    "color": "#blue",
    "order": 2,
    "is_done": false
  },
  "done": { "label": "Done", "color": "#green", "order": 3, "is_done": true }
}
```

#### Project Statuses Collection

```json
{
  "name": "project_statuses",
  "fields": [
    { "name": "project", "type": "relation", "collection": "projects" },
    { "name": "key", "type": "text" },
    { "name": "label", "type": "text" },
    { "name": "color", "type": "text" },
    { "name": "icon", "type": "text" },
    { "name": "order", "type": "number" },
    { "name": "is_done", "type": "bool" },
    { "name": "is_default", "type": "bool" },
    { "name": "transitions", "type": "json" }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_project_status ON project_statuses (project, key)"
  ]
}
```

**Status Transition Validation:**

```go
func validateStatusTransition(task, newStatus string) error {
    currentStatus := getProjectStatus(task.ProjectID, task.Status)
    if currentStatus.Transitions != nil {
        allowed := currentStatus.Transitions.([]string)
        if !contains(allowed, newStatus) {
            return fmt.Errorf("cannot transition from %s to %s", task.Status, newStatus)
        }
    }
    return nil
}
```

### 3.2 Parent-Child Task Relationships (Subtasks)

#### Option A: Subtasks Collection (Simpler - Recommended for Start)

```json
{
  "name": "subtasks",
  "fields": [
    {
      "name": "task",
      "type": "relation",
      "collection": "tasks",
      "cascadeDelete": true
    },
    { "name": "title", "type": "text", "required": true },
    { "name": "completed", "type": "bool", "default": false },
    { "name": "completed_at", "type": "date" },
    { "name": "completed_by", "type": "relation", "collection": "users" },
    { "name": "assignee", "type": "relation", "collection": "users" },
    { "name": "order", "type": "number" }
  ]
}
```

#### Option B: Self-Referential Tasks (More Flexible - Future)

```json
// Add to tasks collection:
{ "name": "parent_task", "type": "relation", "collection": "tasks" },
{ "name": "task_type", "type": "select", "values": ["task", "subtask", "epic", "story", "bug"] }
```

**Recommendation:** Start with **Option A** for simplicity, migrate to **Option B** if you need epics/stories later.

### 3.3 Time Entries (Replace time_spent_minutes)

**Current Problem:** `time_spent_minutes` on tasks is cumulative and loses history.

```json
{
  "name": "time_entries",
  "fields": [
    { "name": "task", "type": "relation", "collection": "tasks" },
    { "name": "user", "type": "relation", "collection": "users" },
    { "name": "minutes", "type": "number" },
    { "name": "description", "type": "text" },
    { "name": "date", "type": "date" },
    { "name": "billable", "type": "bool", "default": false },
    { "name": "created", "type": "autodate" }
  ],
  "indexes": [
    "CREATE INDEX idx_time_task ON time_entries (task)",
    "CREATE INDEX idx_time_user_date ON time_entries (user, date)"
  ]
}
```

**Benefits:**

- Track who logged time and when
- Support billable vs non-billable hours
- Proper timesheet history
- Keep `time_spent_minutes` as computed field or remove it

### 3.4 Polymorphic Tagging System

**Current Problem:** Tags are group-scoped with no categorization.

#### Tag Groups Collection

```json
{
  "name": "tag_groups",
  "fields": [
    {
      "name": "organization",
      "type": "relation",
      "collection": "organizations"
    },
    { "name": "name", "type": "text" },
    {
      "name": "type",
      "type": "select",
      "values": ["label", "single_select", "multi_select"]
    },
    { "name": "icon", "type": "text" },
    { "name": "required", "type": "bool" },
    { "name": "order", "type": "number" }
  ]
}
```

#### Tags Collection (Enhanced)

```json
{
  "name": "tags",
  "fields": [
    {
      "name": "organization",
      "type": "relation",
      "collection": "organizations"
    },
    { "name": "tag_group", "type": "relation", "collection": "tag_groups" },
    { "name": "name", "type": "text" },
    { "name": "color", "type": "text" },
    { "name": "description", "type": "text" },
    { "name": "order", "type": "number" }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_tag_name_org ON tags (organization, tag_group, name)"
  ]
}
```

**Usage Example:**

```
Tag Groups:
  - Component (multi_select): [Frontend, Backend, API, Database]
  - Sprint (single_select): [Sprint 1, Sprint 2, Backlog]
  - Type (single_select): [Bug, Feature, Chore, Spike]
```

### 3.5 Enhanced Tasks Schema

```json
{
  "name": "tasks",
  "fields": [
    // Existing fields
    { "name": "id", "type": "text", "primaryKey": true },
    { "name": "display_id", "type": "text" },
    { "name": "title", "type": "text", "required": true },
    { "name": "description", "type": "editor" },
    { "name": "project", "type": "relation", "collection": "projects" },
    { "name": "assignee", "type": "relation", "collection": "users" },
    { "name": "creator", "type": "relation", "collection": "users" },
    {
      "name": "priority",
      "type": "select",
      "values": ["low", "medium", "high", "urgent"]
    },
    { "name": "status", "type": "text" },
    { "name": "deadline", "type": "date" },
    { "name": "order", "type": "number" },
    {
      "name": "tags",
      "type": "relation",
      "collection": "tags",
      "maxSelect": 999
    },
    { "name": "estimated_minutes", "type": "number" },

    // NEW fields
    {
      "name": "task_type",
      "type": "select",
      "values": ["task", "bug", "feature", "story", "epic"]
    },
    { "name": "story_points", "type": "number" },
    { "name": "milestone", "type": "relation", "collection": "milestones" },
    { "name": "parent_task", "type": "relation", "collection": "tasks" },
    {
      "name": "watchers",
      "type": "relation",
      "collection": "users",
      "maxSelect": 999
    },
    { "name": "start_date", "type": "date" },

    // System fields
    { "name": "deleted_at", "type": "text" },
    { "name": "created", "type": "autodate" },
    { "name": "updated", "type": "autodate" }
  ]
}
```

---

## Part 4: Collaboration Engine

### 4.1 Real-Time Activity Logs

```json
{
  "name": "activities",
  "fields": [
    {
      "name": "organization",
      "type": "relation",
      "collection": "organizations"
    },
    { "name": "project", "type": "relation", "collection": "projects" },
    { "name": "task", "type": "relation", "collection": "tasks" },
    { "name": "actor", "type": "relation", "collection": "users" },
    {
      "name": "action",
      "type": "select",
      "values": [
        "task_created",
        "task_updated",
        "task_deleted",
        "status_changed",
        "assignee_changed",
        "priority_changed",
        "comment_added",
        "time_logged",
        "attachment_added",
        "member_added",
        "member_removed",
        "mentioned"
      ]
    },
    { "name": "target_type", "type": "text" },
    { "name": "target_id", "type": "text" },
    { "name": "changes", "type": "json" },
    { "name": "metadata", "type": "json" },
    { "name": "created", "type": "autodate" }
  ],
  "indexes": [
    "CREATE INDEX idx_activity_project ON activities (project, created DESC)",
    "CREATE INDEX idx_activity_task ON activities (task, created DESC)",
    "CREATE INDEX idx_activity_actor ON activities (actor, created DESC)"
  ]
}
```

**Activity Creation Pattern:**

```go
func logActivity(ctx context.Context, params ActivityParams) error {
    activity := &Activity{
        Organization: params.OrgID,
        Project:      params.ProjectID,
        Task:         params.TaskID,
        Actor:        ctx.Value("user_id").(string),
        Action:       params.Action,
        Changes:      computeChanges(params.OldRecord, params.NewRecord),
        Created:      time.Now(),
    }

    // Fire-and-forget to async queue (don't block main operation)
    go activityQueue.Enqueue(activity)
    return nil
}
```

### 4.2 @Mentions System

```json
{
  "name": "mentions",
  "fields": [
    { "name": "source_type", "type": "text" },
    { "name": "source_id", "type": "text" },
    { "name": "mentioned_user", "type": "relation", "collection": "users" },
    { "name": "mentioned_by", "type": "relation", "collection": "users" },
    { "name": "context", "type": "text" },
    { "name": "task", "type": "relation", "collection": "tasks" },
    { "name": "read", "type": "bool", "default": false },
    { "name": "created", "type": "autodate" }
  ]
}
```

**Mention Extraction Logic:**

```go
var mentionRegex = regexp.MustCompile(`@(\w+)`)

func extractMentions(content, sourceType, sourceID string) []Mention {
    matches := mentionRegex.FindAllStringSubmatch(content, -1)
    mentions := []Mention{}

    for _, match := range matches {
        username := match[1]
        user, err := findUserByUsername(username)
        if err == nil {
            mentions = append(mentions, Mention{
                SourceType:    sourceType,
                SourceID:      sourceID,
                MentionedUser: user.ID,
                Context:       extractContext(content, match[0]),
            })
        }
    }
    return mentions
}
```

### 4.3 Threaded Comments

```json
{
  "name": "comments",
  "fields": [
    { "name": "task", "type": "relation", "collection": "tasks" },
    { "name": "parent_comment", "type": "relation", "collection": "comments" },
    { "name": "author", "type": "relation", "collection": "users" },
    { "name": "content", "type": "editor" },
    { "name": "attachments", "type": "file", "maxSelect": 10 },
    { "name": "reactions", "type": "json" },
    { "name": "edited_at", "type": "date" },
    { "name": "deleted_at", "type": "text" },
    { "name": "created", "type": "autodate" },
    { "name": "updated", "type": "autodate" }
  ],
  "indexes": [
    "CREATE INDEX idx_comment_task ON comments (task, created)",
    "CREATE INDEX idx_comment_parent ON comments (parent_comment)"
  ]
}
```

**Reactions JSON Example:**

```json
{
  "👍": ["user_id_1", "user_id_2"],
  "🎉": ["user_id_3"],
  "❤️": ["user_id_1"]
}
```

### 4.4 Enhanced Notifications

```json
{
  "name": "notifications",
  "fields": [
    { "name": "user", "type": "relation", "collection": "users" },
    {
      "name": "type",
      "type": "select",
      "values": [
        "task_assigned",
        "task_updated",
        "status_changed",
        "comment_added",
        "mentioned",
        "deadline_approaching",
        "project_invitation",
        "member_added",
        "system"
      ]
    },
    { "name": "title", "type": "text" },
    { "name": "message", "type": "text" },
    { "name": "read", "type": "bool", "default": false },
    { "name": "data", "type": "json" },
    { "name": "action_url", "type": "text" },
    { "name": "created", "type": "autodate" }
  ],
  "indexes": [
    "CREATE INDEX idx_notification_user ON notifications (user, read, created DESC)"
  ]
}
```

### 4.5 User Preferences

```json
{
  "name": "user_preferences",
  "fields": [
    {
      "name": "user",
      "type": "relation",
      "collection": "users",
      "unique": true
    },
    { "name": "email_notifications", "type": "bool", "default": true },
    { "name": "notify_on_assign", "type": "bool", "default": true },
    { "name": "notify_on_mention", "type": "bool", "default": true },
    { "name": "notify_on_comment", "type": "bool", "default": true },
    { "name": "notify_on_deadline", "type": "bool", "default": true },
    {
      "name": "digest_frequency",
      "type": "select",
      "values": ["instant", "daily", "weekly", "none"]
    },
    {
      "name": "theme",
      "type": "select",
      "values": ["light", "dark", "system"]
    },
    { "name": "language", "type": "text", "default": "fa" }
  ]
}
```

---

## Part 5: Performance & Integrity

### 5.1 Required Database Indexes

```sql
-- Organizations
CREATE INDEX idx_org_slug ON organizations (slug);

-- Users
CREATE INDEX idx_user_email ON users (email);
CREATE INDEX idx_user_username ON users (username);
CREATE INDEX idx_user_active ON users (active) WHERE active = true;

-- Organization Members
CREATE INDEX idx_org_member_user ON organization_members (user);
CREATE INDEX idx_org_member_org ON organization_members (organization);

-- Projects
CREATE INDEX idx_project_org ON projects (organization);
CREATE INDEX idx_project_code ON projects (code);
CREATE INDEX idx_project_status ON projects (status) WHERE status != 'archived';

-- Project Members
CREATE INDEX idx_pm_user ON project_members (user);
CREATE INDEX idx_pm_project ON project_members (project);

-- Tasks
CREATE INDEX idx_task_project ON tasks (project);
CREATE INDEX idx_task_assignee ON tasks (assignee);
CREATE INDEX idx_task_status ON tasks (status);
CREATE INDEX idx_task_display_id ON tasks (display_id);
CREATE INDEX idx_task_deadline ON tasks (deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_task_search ON tasks (title);
CREATE INDEX idx_task_active ON tasks (project, deleted_at) WHERE deleted_at IS NULL;

-- Comments
CREATE INDEX idx_comment_task ON comments (task, created);

-- Activities
CREATE INDEX idx_activity_recent ON activities (organization, created DESC);

-- Time Entries
CREATE INDEX idx_time_task ON time_entries (task);
CREATE INDEX idx_time_user_date ON time_entries (user, date);

-- Notifications
CREATE INDEX idx_notification_unread ON notifications (user, read) WHERE read = false;
```

### 5.2 Soft Delete Pattern (Standardized)

```go
// Standard soft delete fields for all deletable entities
type SoftDeletable struct {
    DeletedAt *time.Time `json:"deleted_at,omitempty"`
    DeletedBy string     `json:"deleted_by,omitempty"`
}

// Middleware to auto-filter deleted records
func softDeleteFilter(collection string) string {
    return fmt.Sprintf("(%s.deleted_at = '' || %s.deleted_at IS NULL)", collection, collection)
}

// Apply to all list/view rules:
// listRule: "... && (deleted_at = '' || deleted_at = null)"
```

**Collections requiring soft delete:**

- tasks
- comments
- projects (archive instead of delete)
- subtasks

### 5.3 Audit Trail System (Enhanced)

```json
{
  "name": "audit_logs",
  "fields": [
    {
      "name": "organization",
      "type": "relation",
      "collection": "organizations"
    },
    { "name": "actor", "type": "relation", "collection": "users" },
    { "name": "actor_email", "type": "text" },
    { "name": "action", "type": "text" },
    { "name": "resource_type", "type": "text" },
    { "name": "resource_id", "type": "text" },
    { "name": "resource_name", "type": "text" },
    { "name": "changes", "type": "json" },
    { "name": "ip_address", "type": "text" },
    { "name": "user_agent", "type": "text" },
    { "name": "request_id", "type": "text" },
    { "name": "created", "type": "autodate" }
  ],
  "indexes": [
    "CREATE INDEX idx_audit_org ON audit_logs (organization, created DESC)",
    "CREATE INDEX idx_audit_resource ON audit_logs (resource_type, resource_id)"
  ],
  "updateRule": null,
  "deleteRule": null
}
```

### 5.4 Data Integrity Constraints

```sql
-- Ensure project members belong to same organization
CREATE TRIGGER check_project_member_org
BEFORE INSERT ON project_members
BEGIN
    SELECT RAISE(ABORT, 'User must belong to project organization')
    WHERE NOT EXISTS (
        SELECT 1 FROM organization_members om
        JOIN projects p ON p.organization = om.organization
        WHERE om.user = NEW.user AND p.id = NEW.project
    );
END;

-- Ensure tasks belong to valid project
CREATE TRIGGER check_task_project
BEFORE INSERT ON tasks
BEGIN
    SELECT RAISE(ABORT, 'Project does not exist or is archived')
    WHERE NOT EXISTS (
        SELECT 1 FROM projects
        WHERE id = NEW.project AND status != 'archived'
    );
END;
```

---

## Part 6: Critical Architectural Weaknesses & Solutions

### 6.1 Rigid State Machine

**Current Problem:**

- Status transitions not validated
- No workflow enforcement
- Any status can transition to any other

**Solution:**

```go
// Define allowed transitions per status
var statusTransitions = map[string][]string{
    "todo":        {"in_progress", "canceled"},
    "in_progress": {"review", "blocked", "on_hold", "done"},
    "review":      {"in_progress", "testing", "done"},
    "testing":     {"in_progress", "done", "blocked"},
    "blocked":     {"todo", "in_progress"},
    "on_hold":     {"todo", "in_progress"},
    "done":        {"in_progress"},  // Reopen
    "canceled":    {"todo"},          // Restore
}

func (e *RecordEvent) validateStatusTransition() error {
    oldStatus := e.Record.Original().GetString("status")
    newStatus := e.Record.GetString("status")

    if oldStatus == newStatus {
        return nil
    }

    allowed, ok := statusTransitions[oldStatus]
    if !ok || !contains(allowed, newStatus) {
        return fmt.Errorf("invalid transition: %s → %s", oldStatus, newStatus)
    }
    return nil
}
```

### 6.2 Lack of Batch Processing

**Current Problem:**

- No bulk operations API
- Each update is individual HTTP request
- Poor UX for bulk status changes, assignments

**Solution:**

```go
// POST /api/v1/tasks/batch
type BatchOperation struct {
    Action  string                 `json:"action"`
    TaskIDs []string               `json:"task_ids"`
    Data    map[string]interface{} `json:"data"`
}

func handleBatchTasks(e *core.RequestEvent) error {
    var ops []BatchOperation
    if err := e.BindBody(&ops); err != nil {
        return err
    }

    results := []BatchResult{}
    err := e.App.RunInTransaction(func(txApp core.App) error {
        for _, op := range ops {
            for _, taskID := range op.TaskIDs {
                result := processBatchOp(txApp, op.Action, taskID, op.Data)
                results = append(results, result)
            }
        }
        return nil
    })

    return e.JSON(200, map[string]interface{}{
        "results": results,
        "success": err == nil,
    })
}
```

**Batch Operations Supported:**

- `update_status` - Bulk status change
- `update_assignee` - Bulk reassignment
- `update_priority` - Bulk priority change
- `add_tags` - Add tags to multiple tasks
- `remove_tags` - Remove tags from multiple tasks
- `move_project` - Move tasks to different project
- `delete` - Soft delete multiple tasks

### 6.3 Poor Notification Dispatching

**Current Problem:**

- Synchronous notification creation
- Blocks main operation
- Silent failures

**Solution: Event Queue Architecture**

```go
// Event types
type Event struct {
    Type      string                 `json:"type"`
    Payload   map[string]interface{} `json:"payload"`
    Timestamp time.Time              `json:"timestamp"`
}

// Async event dispatcher
type EventDispatcher struct {
    queue    chan Event
    handlers map[string][]EventHandler
}

func (d *EventDispatcher) Dispatch(event Event) {
    select {
    case d.queue <- event:
    default:
        log.Printf("Event queue full, dropping: %s", event.Type)
    }
}

func (d *EventDispatcher) ProcessEvents() {
    for event := range d.queue {
        handlers := d.handlers[event.Type]
        for _, handler := range handlers {
            go func(h EventHandler) {
                if err := h.Handle(event); err != nil {
                    log.Printf("Handler error for %s: %v", event.Type, err)
                    // Retry logic here
                }
            }(handler)
        }
    }
}

// Usage in task creation
func handleTaskCreation(e *core.RecordEvent) error {
    // ... create task ...

    eventDispatcher.Dispatch(Event{
        Type: "task.created",
        Payload: map[string]interface{}{
            "task_id":    e.Record.Id,
            "project_id": e.Record.GetString("project"),
            "assignee":   e.Record.GetString("assignee"),
        },
    })

    return e.Next()
}
```

### 6.4 No Rate Limiting

**Solution:**

```go
type RateLimiter struct {
    limits map[string]*rate.Limiter
    mu     sync.RWMutex
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        userID := getUserID(r)
        limiter := rl.getLimiter(userID)

        if !limiter.Allow() {
            http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}

// Configuration
var rateLimits = map[string]rate.Limit{
    "api":      rate.Limit(100),  // 100 req/sec
    "search":   rate.Limit(10),   // 10 req/sec
    "export":   rate.Limit(1),    // 1 req/sec
    "auth":     rate.Limit(5),    // 5 req/sec
}
```

### 6.5 Search Permission Vulnerability

**Current Problem:**

```go
func canViewTask(app core.App, task *core.Record, user *core.Record) bool {
    if user.GetString("role") == "admin" {
        return true
    }
    return true  // Always returns true!
}
```

**Solution:**

```go
func canViewTask(app core.App, task *core.Record, user *core.Record) bool {
    userID := user.Id

    // Admin can see everything
    if isOrgAdmin(app, user, task.GetString("organization")) {
        return true
    }

    // Check project membership
    projectID := task.GetString("project")
    membership, err := getProjectMembership(app, userID, projectID)
    if err != nil || membership == nil {
        return false
    }

    // Any project member can view tasks
    return true
}

func canViewProject(app core.App, project *core.Record, user *core.Record) bool {
    userID := user.Id

    // Admin can see everything
    if isOrgAdmin(app, user, project.GetString("organization")) {
        return true
    }

    // Check project membership
    membership, err := getProjectMembership(app, userID, project.Id)
    return err == nil && membership != nil
}
```

### 6.6 Frontend/Backend Permission Mismatch

**Current Problem:**

- Frontend uses role-based checks
- Backend uses group-based checks
- No unified permission system

**Solution: Unified Permission API**

```go
// GET /api/v1/permissions
// Returns user's effective permissions for current context
func handleGetPermissions(e *core.RequestEvent) error {
    user := e.Auth
    orgID := e.Request.Header.Get("X-Organization-ID")
    projectID := e.Request.URL.Query().Get("project_id")

    permissions := UserPermissions{
        OrganizationRole: getOrgRole(e.App, user.Id, orgID),
        ProjectRole:      getProjectRole(e.App, user.Id, projectID),
        Can: map[string]bool{
            "create_project":    canCreateProject(e.App, user, orgID),
            "manage_members":    canManageMembers(e.App, user, projectID),
            "delete_tasks":      canDeleteTasks(e.App, user, projectID),
            // ... more permissions
        },
    }

    return e.JSON(200, permissions)
}
```

**Frontend Usage:**

```typescript
// hooks/usePermissions.ts
export function usePermissions(projectId?: string) {
    return useQuery({
        queryKey: ['permissions', projectId],
        queryFn: () => pb.send('/api/v1/permissions', {
            params: { project_id: projectId }
        }),
    });
}

// Component usage
function TaskActions({ task }) {
    const { data: permissions } = usePermissions(task.project);

    return (
        <>
            {permissions?.can.delete_tasks && (
                <DeleteButton onClick={() => deleteTask(task.id)} />
            )}
        </>
    );
}
```

---

## Part 7: Technical Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Goal:** Establish multi-tenant foundation without breaking existing functionality

| Task                                     | Priority | Effort | Dependencies         |
| ---------------------------------------- | -------- | ------ | -------------------- |
| Create `organizations` collection        | P0       | 2d     | None                 |
| Migrate `groups` data to `organizations` | P0       | 1d     | organizations        |
| Create `organization_members` junction   | P0       | 2d     | organizations        |
| Update all entity references             | P0       | 3d     | organization_members |
| Update PocketBase rules for org scoping  | P0       | 2d     | entity refs          |
| Add org context to all API calls         | P0       | 2d     | rules                |

**Migration Script:**

```go
func migrateGroupsToOrganizations(app core.App) error {
    groups, _ := app.FindRecordsByFilter("groups", "", "", 0, 0, nil)

    for _, group := range groups {
        // Create organization
        org := core.NewRecord(orgCollection)
        org.Set("name", group.GetString("name"))
        org.Set("slug", slugify(group.GetString("name")))
        app.Save(org)

        // Migrate manager to organization_members
        if managerID := group.GetString("manager"); managerID != "" {
            member := core.NewRecord(orgMemberCollection)
            member.Set("organization", org.Id)
            member.Set("user", managerID)
            member.Set("role", "owner")
            app.Save(member)
        }

        // Update all users in this group
        users, _ := app.FindRecordsByFilter("users",
            fmt.Sprintf("group = '%s'", group.Id), "", 0, 0, nil)
        for _, user := range users {
            member := core.NewRecord(orgMemberCollection)
            member.Set("organization", org.Id)
            member.Set("user", user.Id)
            member.Set("role", "member")
            app.Save(member)
        }

        // Update projects
        projects, _ := app.FindRecordsByFilter("projects",
            fmt.Sprintf("group = '%s'", group.Id), "", 0, 0, nil)
        for _, project := range projects {
            project.Set("organization", org.Id)
            app.Save(project)
        }
    }
    return nil
}
```

### Phase 2: RBAC Overhaul (Weeks 5-8)

**Goal:** Implement project-level permissions

| Task                                   | Priority | Effort | Dependencies        |
| -------------------------------------- | -------- | ------ | ------------------- |
| Create `project_members` with roles    | P0       | 2d     | Phase 1             |
| Remove `role` from users table         | P1       | 1d     | project_members     |
| Implement permission resolution logic  | P0       | 3d     | project_members     |
| Update frontend permission checks      | P0       | 3d     | backend permissions |
| Migrate existing `users_projects` data | P0       | 1d     | project_members     |
| Add invitation system                  | P1       | 2d     | project_members     |

### Phase 3: Task Enhancements (Weeks 9-12)

**Goal:** Scalable task modeling

| Task                                  | Priority | Effort | Dependencies    |
| ------------------------------------- | -------- | ------ | --------------- |
| Add `subtasks` collection             | P0       | 2d     | Phase 2         |
| Add `time_entries` collection         | P0       | 2d     | Phase 2         |
| Implement custom statuses per project | P1       | 3d     | Phase 2         |
| Add status transition validation      | P1       | 2d     | custom statuses |
| Enhance tags with groups              | P2       | 2d     | Phase 2         |

### Phase 4: Collaboration (Weeks 13-16)

**Goal:** Real-time collaboration features

| Task                           | Priority | Effort | Dependencies |
| ------------------------------ | -------- | ------ | ------------ |
| Create `activities` collection | P0       | 2d     | Phase 3      |
| Implement activity logging     | P0       | 2d     | activities   |
| Add @mentions extraction       | P1       | 2d     | activities   |
| Threaded comments              | P1       | 2d     | Phase 3      |
| Event queue system             | P1       | 3d     | activities   |

### Phase 5: Performance & Security (Weeks 17-20)

**Goal:** Production hardening

| Task                        | Priority | Effort | Dependencies |
| --------------------------- | -------- | ------ | ------------ |
| Add all recommended indexes | P0       | 1d     | Phase 4      |
| Implement rate limiting     | P0       | 2d     | None         |
| Batch operations API        | P1       | 3d     | Phase 3      |
| Fix search permission logic | P0       | 1d     | Phase 2      |
| Standardize soft delete     | P1       | 2d     | None         |

### Future: Enterprise Readiness

| Feature                             | Target | Effort |
| ----------------------------------- | ------ | ------ |
| SSO/SAML integration                | Q2     | 2w     |
| Webhook system                      | Q2     | 2w     |
| API tokens for automation           | Q2     | 1w     |
| Advanced audit log export           | Q3     | 1w     |
| Custom fields on tasks              | Q3     | 2w     |
| Cross-project reporting             | Q3     | 2w     |
| Real-time collaboration (WebSocket) | Q4     | 3w     |
| Mobile app                          | Q4     | 8w     |

---

## Complete Schema Summary

```
organizations
  ├── organization_members (user, role)
  ├── projects
  │    ├── project_members (user, role)
  │    ├── project_statuses (customizable workflow)
  │    ├── tasks
  │    │    ├── subtasks
  │    │    ├── comments (threaded)
  │    │    ├── time_entries
  │    │    └── activities
  │    └── milestones
  ├── tags
  │    └── tag_groups
  ├── user_preferences
  ├── notifications
  └── audit_logs
```

### Entity Relationship Diagram (Simplified)

```
┌──────────────────┐
│  organizations   │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐  ┌─────────┐
│ users │◄─┤ org_    │
└───┬───┘  │ members │
    │      └─────────┘
    │
    ▼
┌─────────────────┐
│    projects     │◄────────────────┐
└────────┬────────┘                 │
         │                          │
    ┌────┴────┐                     │
    ▼         ▼                     │
┌───────┐  ┌──────────┐      ┌──────┴──────┐
│ tasks │  │ project_ │      │  project_   │
└───┬───┘  │ members  │      │  statuses   │
    │      └──────────┘      └─────────────┘
    │
    ├──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────┐
│ subtasks │ │ comments │ │ time_      │ │ activities │
└──────────┘ └──────────┘ │ entries    │ └────────────┘
                          └────────────┘
```

---

## Conclusion

This architectural redesign provides:

1. **Multi-tenancy** ready for future SaaS deployment
2. **Flexible RBAC** at organization and project levels
3. **Extensible task modeling** with custom workflows
4. **Collaboration primitives** for team features
5. **Performance foundations** for scale
6. **Security hardening** for production

**Primary Recommendation:** Execute Phase 1-2 first to establish the organizational foundation. The current `groups` concept is the biggest blocker for clean architecture and should be migrated to `organizations` as the first priority.

---

## Appendix: Migration Checklist

- [ ] Backup production database
- [ ] Create organizations collection
- [ ] Run groups → organizations migration
- [ ] Update users collection (remove role field)
- [ ] Create organization_members
- [ ] Create project_members
- [ ] Update all PocketBase rules
- [ ] Update Go backend handlers
- [ ] Update TypeScript types (`bun run types:generate`)
- [ ] Update frontend permission checks
- [ ] Update all API calls to include org context
- [ ] Run full test suite
- [ ] Performance testing
- [ ] Security audit
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Production deployment
