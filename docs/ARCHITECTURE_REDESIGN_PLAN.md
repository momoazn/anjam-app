# Anjam Architecture Redesign Plan

## Comprehensive Implementation Guide

**Status**: Ready for Implementation
**Scope**: Greenfield build (no existing users/data; no migrations or backward compatibility)
**Hierarchy**: Organization > Projects > Tasks (no Workspaces)
**Date**: December 2024
**Estimated Duration**: 5-6 weeks

---

## Table of Contents

1. [PocketBase Built-in Features](#pocketbase-built-in-features)
2. [Executive Summary](#executive-summary)
3. [Current Architecture Analysis](#current-architecture-analysis)
4. [Target Architecture](#target-architecture)
5. [UI/UX Requirements](#uiux-requirements)
6. [Phase 0: Security Hardening](#phase-0-security-hardening)
7. [Phase 1: Foundation - Organizations](#phase-1-foundation---organizations)
8. [Phase 2: RBAC Overhaul](#phase-2-rbac-overhaul)
9. [Phase 3: Task Enhancements](#phase-3-task-enhancements)
10. [Phase 4: Collaboration Engine](#phase-4-collaboration-engine)
11. [Phase 5: Performance & Security](#phase-5-performance--security)
12. [Testing Strategy](#testing-strategy)
13. [Rollback Plan](#rollback-plan)

---

## PocketBase Built-in Features

### Overview

**IMPORTANT**: Before implementing custom solutions, leverage PocketBase's built-in features. This reduces code complexity, improves maintainability, and ensures consistency with PocketBase's security model.

**Repo note (schema format)**: In this repository, `backend/pb_schema.json` is imported via `ImportCollectionsByMarshaledJSON(...)` and uses PocketBase's exported-collections JSON shape (top-level array of collections with `fields`, `indexes`, etc.). The schema snippets in this document are _conceptual_; prefer creating/updating collections in the PocketBase Admin UI and exporting to `backend/pb_schema.json`, or mirror the existing file's JSON structure (including stable `id`/`collectionId` values).

### Features to Leverage Instead of Recreating

| Feature                       | PocketBase Built-in                                   | Instead of Recreating                                  |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| **Access Control**            | API Rules act as both access control AND data filters | No need for manual filtering in Go code                |
| **Membership Checks**         | Back-relations with `?=` operator                     | No need for manual JOIN queries                        |
| **Cleanup on Delete**         | `cascadeDelete: true` on relation fields              | No need for custom cleanup handlers                    |
| **Collection-specific Logic** | Tagged hooks: `app.OnRecordCreate("tasks")`           | Cleaner than checking collection name in generic hooks |
| **Computed Fields**           | `OnRecordEnrich` hook adds fields on-the-fly          | No need to store computed values in DB                 |
| **Validation**                | `OnRecordValidate` hook per collection                | Centralized validation logic                           |
| **Access Checks in Code**     | `app.CanAccessRecord(record, requestInfo, rule)`      | Reuse existing rules in custom endpoints               |
| **Real-time Updates**         | Built-in SSE with automatic topic filtering           | No need for custom WebSocket infrastructure            |
| **System Updates**            | `app.SaveNoValidate(record)`                          | Skip validation for trusted system operations          |
| **Soft Delete**               | `OnRecordDeleteRequest` with `e.StopPropagation()`    | Intercept delete and convert to update                 |

### API Rules as Filters

PocketBase API rules serve dual purposes - they control access AND filter results automatically:

```
// This rule:
listRule: "@request.auth.id != '' && status = 'active' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id"

// Automatically:
// 1. Denies access if user has no organization
// 2. Filters to only return active records
// 3. Filters to only return records in user's organization
```

**Recommendation**: Put filtering logic in API rules, not in Go code. The rules are evaluated at the database level and are more efficient.

### Back-Relations for Membership Checks

The `?=` operator checks if ANY record in the related collection matches:

```
// Check if user is a member of the organization
@collection.organization_members.organization.id ?= organization.id
&& @collection.organization_members.user.id ?= @request.auth.id

// This is equivalent to:
// SELECT 1 FROM organization_members
// WHERE organization = record.organization
// AND user = current_user
```

**Recommendation**: Use back-relations in API rules instead of custom permission checking functions.

### Tagged Hooks Pattern

Instead of checking collection names in generic hooks:

```go
// BAD: Generic hook with collection check
app.OnRecordCreate().BindFunc(func(e *core.RecordEvent) error {
    if e.Record.Collection().Name == "tasks" {
        // task-specific logic
    }
    return e.Next()
})

// GOOD: Tagged hook for specific collection
app.OnRecordCreate("tasks").BindFunc(func(e *core.RecordEvent) error {
    // task-specific logic - cleaner and more performant
    return e.Next()
})
```

### OnRecordEnrich for Computed Fields

Add computed fields without storing them:

```go
app.OnRecordEnrich("tasks").BindFunc(func(e *core.RecordEnrichEvent) error {
    // Add computed field
    e.Record.WithCustomData(true)
    created := e.Record.GetDateTime("created")
    e.Record.Set("age_days", int(time.Since(created.Time()).Hours()/24))

    // Hide sensitive fields from non-owners
    if e.RequestInfo.Auth == nil ||
       e.Record.GetString("assignee") != e.RequestInfo.Auth.Id {
        e.Record.Hide("internal_notes")
    }

    return e.Next()
})
```

### CanAccessRecord for Custom Endpoints

Reuse collection rules in custom API endpoints:

```go
// In custom search endpoint - reuse existing rules
func canViewTask(e *core.RequestEvent, task *core.Record) bool {
    requestInfo, err := e.RequestInfo()
    if err != nil {
        return false
    }

    rule := task.Collection().ViewRule
    if rule == nil {
        return false // locked to superusers only
    }

    canAccess, _ := e.App.CanAccessRecord(task, requestInfo, rule)
    return canAccess
}
```

**Recommendation for Phase 0**: Replace the custom `canViewTask()` and `canViewProject()` functions with `app.CanAccessRecord()` to ensure search results respect the same rules as direct API access.

### Soft Delete Pattern

Intercept delete requests and convert to soft delete:

```go
app.OnRecordDeleteRequest("tasks").BindFunc(func(e *core.RecordRequestEvent) error {
    // Convert to soft delete
    e.Record.Set("deleted_at", time.Now().Format(time.RFC3339))
    if e.Auth != nil {
        e.Record.Set("deleted_by", e.Auth.Id)
    }

    if err := e.App.Save(e.Record); err != nil {
        return err
    }

    // Prevent actual deletion
    e.StopPropagation()
    return nil
})
```

### Cascade Delete Configuration

Use relation field options instead of custom cleanup:

```json
{
  "name": "project",
  "type": "relation",
  "options": {
    "collectionId": "projects",
    "cascadeDelete": true // Auto-delete when parent is deleted
  }
}
```

**When to use `cascadeDelete: true`**:

- `organization_members` → when organization is deleted
- `project_members` → when project is deleted
- `comments` → when task is deleted
- `subtasks` → when parent task is deleted

**When to use `cascadeDelete: false`**:

- `projects` → organization deletion should be explicit
- `tasks` → project deletion should be explicit (prevent accidents)

### Real-time Subscriptions

PocketBase provides built-in real-time via SSE:

```javascript
// Client-side: Subscribe to task changes in a project
pb.collection("tasks").subscribe(
  "*",
  (e) => {
    console.log(e.action); // 'create', 'update', 'delete'
    console.log(e.record);
  },
  { filter: 'project = "PROJECT_ID"' },
);

// Subscribe to specific record
pb.collection("tasks").subscribe("RECORD_ID", (e) => {
  console.log("Task updated:", e.record);
});
```

**Recommendation for Phase 4**: Use built-in real-time instead of creating custom activity streaming. The audit logs + real-time subscriptions can replace a custom `activities` collection.

### Validation Hooks

Centralize validation per collection:

```go
app.OnRecordValidate("tasks").BindFunc(func(e *core.RecordEvent) error {
    // Validate status transition
    if e.Record.Original() != nil {
        oldStatus := e.Record.Original().GetString("status")
        newStatus := e.Record.GetString("status")

        if !isValidStatusTransition(oldStatus, newStatus) {
            return errors.New("invalid status transition")
        }
    }

    // Validate due date is in the future for new tasks
    if e.Record.IsNew() {
        dueDate := e.Record.GetDateTime("due_date")
        if !dueDate.IsZero() && dueDate.Time().Before(time.Now()) {
            return errors.New("due date must be in the future")
        }
    }

    return e.Next()
})
```

---

## Executive Summary

### Why This Redesign?

The current Anjam architecture was designed as a proof-of-concept with a simple "Groups" model. As the application transitions to a production-grade B2B SaaS platform, several fundamental limitations prevent scalability:

| Current Limitation                                  | Business Impact                                                | Solution                      |
| --------------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| Users locked to single group                        | Cannot support contractors, consultants, or multi-team members | Organization membership model |
| Hardcoded roles (admin/manager/supervisor/employee) | Cannot customize permissions per project                       | Dual-layer RBAC               |
| Fixed task statuses                                 | Teams cannot define their own workflows                        | Custom statuses per project   |
| No subtasks                                         | Cannot break down complex work                                 | Subtasks collection           |
| Cumulative time tracking                            | No history, no per-user breakdown                              | Time entries collection       |
| Synchronous notifications                           | Blocks API responses, poor UX                                  | Async event queue             |
| Security vulnerabilities                            | Data leaks between tenants                                     | Tenant-scoped access rules    |

### What Will Change?

```
BEFORE:                              AFTER:
groups                               organizations
  └── users (1 group only)             └── organization_members (multi-org)
  └── projects                         └── projects
       └── tasks                            └── project_members (roles)
            └── comments                    └── project_statuses (custom)
                                            └── tasks
                                                 └── subtasks
                                                 └── time_entries
                                                 └── comments (threaded)
                                                 └── activities
```

---

## Current Architecture Analysis

### Database Schema Overview

The current system has **14 collections**:

```
Core Business:
├── groups (tenant boundary - WILL BE REPLACED)
├── users (auth, belongs to 1 group)
├── projects (belongs to 1 group)
├── tasks (belongs to project)
├── comments (belongs to task)
├── tags (belongs to group)
├── users_projects (many-to-many, no roles)
├── notifications
├── user_login_logs
└── audit_logs

System:
├── _superusers
├── _authOrigins
├── _externalAuths
├── _mfas
└── _otps
```

### Current Role System

**Location**: `backend/backend_constants.go:30-36`

```go
const (
    RoleAdmin      = "admin"      // System-wide access
    RoleManager    = "manager"    // Group-level management
    RoleSupervisor = "supervisor" // Project-level oversight
    RoleEmployee   = "employee"   // Task-level work
)
```

**Problems with this approach**:

1. **Roles are stored on users**: A user has ONE role globally. They cannot be admin in Project A and viewer in Project B.

2. **Roles are hardcoded**: Adding a new role requires code changes and database migration.

3. **No resource-level permissions**: The role determines EVERYTHING. A "supervisor" has the same permissions on all projects they can access.

### Current Access Control Rules

**Location**: `backend/pb_schema.json`

Example from tasks collection (line 730):

```
listRule: "(@request.auth.role = 'admin'
    || (@request.auth.role = 'manager' && project.group.manager.id = @request.auth.id)
    || (@request.auth.role = 'supervisor' && project.supervisor.id = @request.auth.id)
    || assignee.id = @request.auth.id
    || (@collection.users_projects.project.id ?= project && @collection.users_projects.user.id ?= @request.auth.id))
    && ((deleted_at = '' || deleted_at = null))"
```

**What this means**: Access is determined by:

- Global role check (admin)
- Group manager relationship
- Project supervisor relationship
- Task assignment
- users_projects membership

**The problem**: This creates complex, hard-to-maintain rules that mix multiple access patterns.

### Security Vulnerabilities Identified

#### Vulnerability 1: Comments Globally Readable

**Location**: `backend/pb_schema.json:964`

```json
"listRule": "@request.auth.id != ''"
```

**Impact**: ANY authenticated user can read ANY comment in the system, regardless of which group/project it belongs to. This is a **critical tenant isolation breach**.

#### Vulnerability 2: Search Returns All Results

**Location**: `backend/search.go:109-130`

```go
func canViewTask(app core.App, task *core.Record, user *core.Record) bool {
    if user.GetString("role") == "admin" {
        return true
    }
    return true  // BUG: Always returns true!
}
```

**Impact**: The search endpoint returns tasks from ALL projects/groups, bypassing access control.

---

## Target Architecture

### New Entity Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORGANIZATIONS                             │
│  The tenant boundary. All data belongs to an organization.       │
│  Users can belong to MULTIPLE organizations.                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION MEMBERS                          │
│  Junction table: user + organization + role                      │
│  Roles: owner | admin | member                                   │
│  - owner: Full control, billing, delete org                      │
│  - admin: Manage all resources and users                         │
│  - member: Access based on project membership                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PROJECTS                                 │
│  Work containers within an organization.                         │
│  Have their own member list with project-specific roles.         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PROJECT MEMBERS                             │
│  Junction table: user + project + role                           │
│  Roles: owner | admin | member | viewer                          │
│  - owner: Delete project, manage all settings                    │
│  - admin: Manage members and all tasks                           │
│  - member: Create/edit tasks                                     │
│  - viewer: Read-only access                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          TASKS                                   │
│  Individual work items with:                                     │
│  - Custom statuses (per project)                                 │
│  - Subtasks                                                      │
│  - Time entries                                                  │
│  - Threaded comments                                             │
│  - Activity log                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Permission Resolution Flow

```
User requests access to Task X
           │
           ▼
┌──────────────────────────┐
│ 1. Get Organization ID   │ ← Task belongs to Project belongs to Org
│    from task.project.org │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│ 2. Check Org Membership  │ ← Is user in organization_members?
└──────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
   Owner/      Member
   Admin         │
     │           ▼
     │  ┌──────────────────────────┐
     │  │ 3. Check Project Member  │ ← Is user in project_members?
     │  └──────────────────────────┘
     │           │
     │     ┌─────┴─────┐
     │     │           │
     │   owner/      viewer
     │   admin/        │
     │   member        │
     │     │           │
     ▼     ▼           ▼
  FULL   EDIT       READ
 ACCESS  ACCESS     ONLY
```

---

## UI/UX Requirements

This plan includes some frontend implementation steps (e.g. auth store, permission hooks), but a greenfield redesign also needs explicit UI/UX scope so the product is cohesive and permission-safe.

### Global UX Rules (Always True)

- **Tenant context is visible**: Always show the current organization in the primary layout (header/sidebar) to prevent cross-tenant confusion.
- **Organization selection is a first-class flow**: After login, the user must be able to pick an organization (or create one if allowed) before seeing any projects/tasks.
- **Permission-driven UI**: If the backend denies an action, the UI should not present it as available (disable/hide buttons based on effective permissions).
- **Empty states explain “why”**: “No projects” vs “You don’t have access to any projects” must be distinguishable and actionable.
- **Consistent navigation**: URLs and navigation should always include enough context to avoid ambiguity (at minimum, a selected org; project pages are scoped within that org).

### Phase 1 UX: Organizations

**Change**: “Group” mental model → “Organization”.

- Add an **organization switcher** in the main layout (why: multi-org membership is core to the new tenancy model).
- Add **organization settings** (name, logo, slug) with role-gated edit access (why: org branding + admin controls).
- Add **organization members UI** (list members, invite/add, roles: owner/admin/member; status: invited/active/suspended) (why: tenant administration without relying on PocketBase admin UI).
- Update all list/detail pages to show only data for the selected org (why: avoids accidental cross-tenant browsing and reinforces boundaries).

### Phase 2 UX: RBAC (Project Roles)

**Change**: Global user role assumptions → project-scoped roles.

- Project “Members” screen with per-project roles (owner/admin/member/viewer) (why: the core RBAC primitive).
- Permission-aware controls across the app:
  - Hide/disable “Edit project”, “Manage members”, “Delete project” based on effective permissions.
  - Gate task actions (create/edit/assign/status change) based on project role + org role.
- Prefer **clear role affordances** (badges/labels) and **explanatory tooltips** on disabled actions (why: reduce support burden and confusion).

### Phase 3 UX: Task Enhancements

**Change**: Tasks become richer objects (subtasks, time entries, custom statuses).

- Task detail page should support:
  - Subtasks checklist (why: decomposing work)
  - Time entries (why: historical time tracking per user)
  - Custom statuses (why: workflow customization per project)
- Update create/edit task flows:
  - Status selection driven by the project’s configured statuses.
  - Enforce/communicate invalid status transitions (why: prevent “silent failures”).

### Phase 4 UX: Activity Feed (Audit Logs as Activity)

**Change**: “Activity” becomes a project-scoped timeline derived from `audit_logs`.

- Add an “Activity” panel/tab in:
  - Project view (project-wide timeline)
  - Task view (task-specific timeline)
- Decide on **who sees what**:
  - Admins can see full field diffs (`changes`)
  - Non-admins see redacted diffs or message-only entries (why: minimize leakage of sensitive fields)
- Add filtering and readability:
  - Filter by resource (`tasks/comments/projects`) and action (`create/update/delete`)
  - Human-readable messages (why: audit entries are technical by default)
- Real-time UX:
  - Subscribe to `audit_logs` (filtered by project) and update the UI incrementally or invalidate the activity query (why: live collaboration without building custom infra)

### Phase 5 UX: Performance & Safety

- Rate-limit feedback and error states should be user-friendly and consistent (why: security without a “broken app” feel).
- Admin-facing audit views can include export/filtering (optional) (why: operational usefulness).

---

## Phase 0: Security Hardening

### Overview

**Goal**: Establish a secure baseline from day 1 (no legacy patching or backward compatibility).
**Duration**: 1-2 days
**Priority**: CRITICAL - Must complete first
**Risk if skipped**: Data leaks between tenants in production

### Step 0.1: Fix Comments Tenant Isolation

#### Security Requirement

Comments must never be readable cross-tenant. In a greenfield build, implement the correct rules immediately (instead of “fixing” them later).

```json
"listRule": "@request.auth.id != ''"
```

By itself, this translates to: "Any authenticated user can list all comments." That is not tenant-safe.

#### Why It's Dangerous

1. User A in "Acme Corp" can see comments from "Beta Inc"
2. Sensitive information in comments is exposed
3. This is a GDPR/compliance violation for B2B SaaS

#### The Fix

**File to modify**: `backend/pb_schema.json`

**Find** (around line 964):

```json
{
  "name": "comments",
  "listRule": "@request.auth.id != ''",
  ...
}
```

**Replace with**:

```json
{
  "name": "comments",
  "listRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= task.project.organization.id && @collection.organization_members.user.id ?= @request.auth.id && (deleted_at = '' || deleted_at = null)",
  ...
}
```

#### Explanation of the New Rule

```
@request.auth.id != ''
  → User must be authenticated

&& @collection.organization_members.organization.id ?= task.project.organization.id
&& @collection.organization_members.user.id ?= @request.auth.id
  → The user must be a member of the organization that owns the comment's task.project

&& (deleted_at = '' || deleted_at = null)
  → Filter out soft-deleted comments
```

#### How to Test

1. Create two users in different organizations
2. Create a project + task + comment in Organization A
3. Log in as user from Organization B
4. Try to fetch comments - should return empty
5. Log in as user from Organization A
6. Try to fetch comments - should return the comment

```bash
# Test as Organization B user (should fail)
curl -X GET "http://localhost:8090/api/collections/comments/records" \
  -H "Authorization: Bearer <org_b_user_token>"
# Expected: []

# Test as Organization A user (should succeed)
curl -X GET "http://localhost:8090/api/collections/comments/records" \
  -H "Authorization: Bearer <org_a_user_token>"
# Expected: [{ comment data }]
```

---

### Step 0.2: Fix Search Permission Vulnerability

#### What's Wrong

**File**: `backend/search.go`

The search endpoint fetches records via `e.App.FindRecordsByFilter(...)` (server/admin context), which **does not automatically enforce collection API rules**. Any manual `canView*` helper must stay perfectly in sync with the collection `listRule`/`viewRule` or it will leak cross-tenant or over-broad results.

#### Why It's Dangerous

The global search endpoint (`/api/v1/search`) can accidentally return tasks/projects a user shouldn't be able to discover if the helper logic drifts from the PocketBase rules (tenant isolation, membership checks, soft delete filters, etc.).

#### The Fix (Using PocketBase Built-in Features)

**File to modify**: `backend/search.go`

> **RECOMMENDED APPROACH**: Use `app.CanAccessRecord()` to reuse existing collection rules instead of duplicating permission logic. This ensures search results respect the same rules as direct API access.

**Replace the `canViewTask` function**:

```go
// canViewTask checks if a user has permission to view a specific task
// Uses PocketBase's built-in CanAccessRecord to reuse collection rules
func canViewTask(e *core.RequestEvent, task *core.Record) bool {
    requestInfo, err := e.RequestInfo()
    if err != nil {
        return false
    }

    // If rule is nil, only superusers can access.
    rule := task.Collection().ViewRule
    if rule == nil {
        return false
    }

    // Reuse the collection's viewRule for consistent access checks.
    canAccess, _ := e.App.CanAccessRecord(task, requestInfo, rule)
    return canAccess
}
```

**Replace the `canViewProject` function**:

```go
// canViewProject checks if a user has permission to view a specific project
// Uses PocketBase's built-in CanAccessRecord to reuse collection rules
func canViewProject(e *core.RequestEvent, project *core.Record) bool {
    requestInfo, err := e.RequestInfo()
    if err != nil {
        return false
    }

    rule := project.Collection().ViewRule
    if rule == nil {
        return false
    }

    canAccess, _ := e.App.CanAccessRecord(project, requestInfo, rule)
    return canAccess
}
```

**Update the search handler** to pass `*core.RequestEvent`:

```go
// In the search handler, update the calls:
for _, task := range tasks {
    if canViewTask(e, task) {
        results = append(results, task)
    }
}

for _, project := range projects {
    if canViewProject(e, project) {
        results = append(results, project)
    }
}
```

#### Why This Approach is Better

1. **Single Source of Truth**: Permission logic is defined once in collection rules
2. **Automatic Updates**: When rules change, search respects them automatically
3. **Less Code**: No need to duplicate complex permission checking
4. **Consistency**: Search results match what users can access via direct API
5. **Future-Proof**: Works automatically with organization-based rules after Phase 1

#### Alternative: Manual Implementation (If CanAccessRecord doesn't fit)

If you need more control or `CanAccessRecord` doesn't work for your use case, here's the manual implementation:

```go
// canViewTask - manual implementation with tenant isolation
func canViewTask(app core.App, task *core.Record, user *core.Record) bool {
    userID := user.Id
    userRole := user.GetString("role")
    userGroupID := user.GetString("group")

    if userRole == RoleAdmin {
        return true
    }

    projectID := task.GetString("project")
    if projectID == "" {
        return false
    }

    project, err := app.FindRecordById("projects", projectID)
    if err != nil {
        return false
    }

    // CRITICAL: Tenant isolation check
    if project.GetString("group") != userGroupID {
        return false
    }

    // Role-based checks within the tenant
    if userRole == RoleManager {
        return true
    }

    if userRole == RoleSupervisor && project.GetString("supervisor") == userID {
        return true
    }

    if task.GetString("assignee") == userID {
        return true
    }

    // Check project membership
    members, _ := app.FindRecordsByFilter(
        "users_projects",
        "user = {:user} && project = {:project}",
        "", 1, 0,
        map[string]any{"user": userID, "project": projectID},
    )
    return len(members) > 0
}
```

#### How to Test

```bash
# Create test data:
# - Org A with Project A1 and Task A1-001
# - Org B with Project B1 and Task B1-001
# - User in Org A

# Search as Org A user
curl -X GET "http://localhost:8090/api/v1/search?q=test" \
  -H "Authorization: Bearer <org_a_token>"

# Expected: Only returns tasks/projects from Org A
# Should NOT include B1-001 or Project B1
```

---

### Step 0.3: Standardize Soft Delete Pattern

#### What's Wrong

Currently, `deleted_at` is a `text` field with inconsistent handling:

- Some queries check `deleted_at = ''`
- Others check `deleted_at = null`
- No standard for the value format when set

#### The Fix

We'll keep `deleted_at` as text (to match the current schema) but standardize:

- Empty string `""` = not deleted
- ISO timestamp = deleted at that time

**Update all access rules** to use consistent pattern:

```
(deleted_at = '' || deleted_at = null)
```

#### Files to Check

1. `backend/pb_schema.json` - All collections with soft delete
2. `backend/main.go` - All handlers that set deleted_at

#### Verification Checklist _(completed December 25, 2025)_

- [x] Tasks collection: listRule includes soft delete filter
- [x] Comments collection: listRule includes soft delete filter
- [x] Soft delete sets ISO timestamp: `time.Now().Format(time.RFC3339)`
- [x] All queries filter by deleted_at

---

### Phase 0 Completion Checklist

- [x] Comments rules enforce organization membership
- [x] Search results are filtered via `CanAccessRecord`
- [x] All soft delete patterns standardized
- [x] Run `bun run check` - no errors
- [x] Manual security testing completed
- [x] Code reviewed for remaining security issues

---

## Phase 1: Foundation - Organizations

### Overview

**Goal**: Implement organizations as the tenant boundary (no groups).
**Duration**: 1 week
**Dependencies**: Phase 0 must be complete
**Breaking Changes**: Yes - all frontend and backend code affected

### Why Organizations Instead of Groups?

| Aspect               | "Groups"                            | "Organizations"                    |
| -------------------- | ----------------------------------- | ---------------------------------- |
| Naming               | Ambiguous (team? folder? category?) | Clear business meaning             |
| Multi-membership     | User belongs to ONE group           | User can join MULTIPLE orgs        |
| Manager relationship | Group has ONE manager               | Org has MULTIPLE owners/admins     |
| Billing              | Not supported                       | Natural fit (org = billing entity) |
| SSO                  | Awkward                             | Natural fit (org = SSO domain)     |

### Step 1.1: Create Organizations Collection

#### What We're Building

A new collection that represents the "tenant" - the company or team that owns the data.

#### Schema Definition

**File to modify**: `backend/pb_schema.json`

Add this new collection definition (add to the top-level array in `backend/pb_schema.json`):

```json
{
  "id": "organizations",
  "name": "organizations",
  "type": "base",
  "system": false,
  "schema": [
    {
      "id": "org_name",
      "name": "name",
      "type": "text",
      "system": false,
      "required": true,
      "presentable": true,
      "options": {
        "min": 1,
        "max": 200,
        "pattern": ""
      }
    },
    {
      "id": "org_slug",
      "name": "slug",
      "type": "text",
      "system": false,
      "required": true,
      "options": {
        "min": 1,
        "max": 100,
        "pattern": "^[a-z0-9-]+$"
      }
    },
    {
      "id": "org_logo",
      "name": "logo",
      "type": "file",
      "system": false,
      "required": false,
      "options": {
        "mimeTypes": ["image/jpeg", "image/png", "image/svg+xml", "image/webp"],
        "thumbs": ["100x100", "200x200"],
        "maxSelect": 1,
        "maxSize": 5242880
      }
    },
    {
      "id": "org_description",
      "name": "description",
      "type": "editor",
      "system": false,
      "required": false,
      "options": {
        "convertUrls": false
      }
    },
    {
      "id": "org_settings",
      "name": "settings",
      "type": "json",
      "system": false,
      "required": false,
      "options": {
        "maxSize": 65536
      }
    },
    {
      "id": "org_plan",
      "name": "plan",
      "type": "select",
      "system": false,
      "required": false,
      "options": {
        "maxSelect": 1,
        "values": ["free", "pro", "enterprise"]
      }
    },
    {
      "id": "org_active",
      "name": "active",
      "type": "bool",
      "system": false,
      "required": false,
      "options": {}
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_org_slug` ON `organizations` (`slug`)",
    "CREATE INDEX `idx_org_active` ON `organizations` (`active`)"
  ],
  "listRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= id && @collection.organization_members.user.id ?= @request.auth.id",
  "viewRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= id && @collection.organization_members.user.id ?= @request.auth.id",
  "createRule": null,
  "updateRule": "@collection.organization_members.organization.id ?= id && @collection.organization_members.user.id ?= @request.auth.id && (@collection.organization_members.role = 'owner' || @collection.organization_members.role = 'admin')",
  "deleteRule": null
}
```

#### Explanation of Each Field

| Field         | Type   | Purpose                                              |
| ------------- | ------ | ---------------------------------------------------- |
| `name`        | text   | Display name (e.g., "Acme Corporation")              |
| `slug`        | text   | URL-safe identifier (e.g., "acme-corp")              |
| `logo`        | file   | Organization logo for branding                       |
| `description` | editor | Rich text description                                |
| `settings`    | json   | Flexible settings storage (timezone, defaults, etc.) |
| `plan`        | select | Billing tier for future monetization                 |
| `active`      | bool   | Soft disable without deletion                        |

#### Explanation of Access Rules

```
listRule/viewRule:
  @request.auth.id != ''
    → User must be authenticated

  && @collection.organization_members.organization.id ?= id
    → There must be an organization_members record where org matches

  && @collection.organization_members.user.id ?= @request.auth.id
    → And that record's user is the current user

  Result: Users can only see orgs they're members of

createRule: null
  → Only system/admin can create orgs (via API endpoint)

updateRule:
  → Only owner or admin of the org can update it

deleteRule: null
  → Only system/admin can delete orgs (prevent accidents)
```

---

### Step 1.2: Create Organization Members Collection

#### What We're Building

A junction table that connects users to organizations with a specific role.

#### Schema Definition

Add this collection to `backend/pb_schema.json`:

```json
{
  "id": "organization_members",
  "name": "organization_members",
  "type": "base",
  "system": false,
  "schema": [
    {
      "id": "om_organization",
      "name": "organization",
      "type": "relation",
      "system": false,
      "required": true,
      "options": {
        "collectionId": "organizations",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1,
        "displayFields": ["name"]
      }
    },
    {
      "id": "om_user",
      "name": "user",
      "type": "relation",
      "system": false,
      "required": true,
      "options": {
        "collectionId": "users",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1,
        "displayFields": ["username", "email"]
      }
    },
    {
      "id": "om_role",
      "name": "role",
      "type": "select",
      "system": false,
      "required": true,
      "options": {
        "maxSelect": 1,
        "values": ["owner", "admin", "member"]
      }
    },
    {
      "id": "om_status",
      "name": "status",
      "type": "select",
      "system": false,
      "required": false,
      "options": {
        "maxSelect": 1,
        "values": ["invited", "active", "suspended"]
      }
    },
    {
      "id": "om_invited_by",
      "name": "invited_by",
      "type": "relation",
      "system": false,
      "required": false,
      "options": {
        "collectionId": "users",
        "cascadeDelete": false,
        "maxSelect": 1
      }
    },
    {
      "id": "om_invited_at",
      "name": "invited_at",
      "type": "date",
      "system": false,
      "required": false,
      "options": {}
    },
    {
      "id": "om_joined_at",
      "name": "joined_at",
      "type": "date",
      "system": false,
      "required": false,
      "options": {}
    },
    {
      "id": "om_last_active_at",
      "name": "last_active_at",
      "type": "date",
      "system": false,
      "required": false,
      "options": {}
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_org_member_unique` ON `organization_members` (`organization`, `user`)",
    "CREATE INDEX `idx_org_member_user` ON `organization_members` (`user`)",
    "CREATE INDEX `idx_org_member_org` ON `organization_members` (`organization`)",
    "CREATE INDEX `idx_org_member_role` ON `organization_members` (`organization`, `role`)"
  ],
  "listRule": "@request.auth.id != '' && (organization.id = @collection.organization_members.organization.id && @collection.organization_members.user.id = @request.auth.id)",
  "viewRule": "@request.auth.id != '' && (organization.id = @collection.organization_members.organization.id && @collection.organization_members.user.id = @request.auth.id)",
  "createRule": null,
  "updateRule": null,
  "deleteRule": null
}
```

#### Role Definitions

| Role     | Permissions                                           | Use Case            |
| -------- | ----------------------------------------------------- | ------------------- |
| `owner`  | Full control, billing, delete org, transfer ownership | Founder, CEO        |
| `admin`  | Manage users, projects, settings (not billing/delete) | Team lead, manager  |
| `member` | Access based on project membership                    | Regular team member |

#### Status Flow

```
invited → active → suspended
   │         │         │
   │         │         └── Temporary block (policy violation)
   │         └── Normal working state
   └── Awaiting user acceptance
```

#### Why cascadeDelete on organization?

When an organization is deleted, all its memberships should be deleted too. This is `cascadeDelete: true`.

However, when a user is deleted, we also want to clean up their memberships, so user relation also has `cascadeDelete: true`.

---

### Step 1.3: Update Projects Collection

#### What We're Changing

Add `organization` field to projects and update access rules.

#### Schema Changes

**File**: `backend/pb_schema.json`

**Find the projects collection** and add this field to the schema array:

```json
{
  "id": "proj_organization",
  "name": "organization",
  "type": "relation",
  "system": false,
  "required": true,
  "options": {
    "collectionId": "organizations",
    "cascadeDelete": false,
    "minSelect": 1,
    "maxSelect": 1,
    "displayFields": ["name"]
  }
}
```

**Note**: We use `cascadeDelete: false` because we want to prevent accidental cascade deletion of all projects. Organization deletion should be a deliberate admin action with explicit project handling.

#### Update Access Rules

Replace the projects collection rules:

```json
{
  "listRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id",

  "viewRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id",

  "createRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= @request.body.organization && @collection.organization_members.user.id ?= @request.auth.id && (@collection.organization_members.role = 'owner' || @collection.organization_members.role = 'admin')",

  "updateRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id && (@collection.organization_members.role = 'owner' || @collection.organization_members.role = 'admin')",

  "deleteRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id && @collection.organization_members.role = 'owner'"
}
```

#### Rule Explanation

```
listRule/viewRule:
  User must be a member of the organization that owns the project

createRule:
  User must be owner or admin of the target organization

updateRule:
  User must be owner or admin of the project's organization

deleteRule:
  Only organization owners can delete projects
```

---

### Step 1.4: Update Tags Collection

#### What We're Changing

Tags are currently scoped to groups. We need to scope them to organizations.

#### Schema Changes

**File**: `backend/pb_schema.json`

**Find the tags collection** and add:

```json
{
  "id": "tag_organization",
  "name": "organization",
  "type": "relation",
  "system": false,
  "required": true,
  "options": {
    "collectionId": "organizations",
    "cascadeDelete": true,
    "minSelect": 1,
    "maxSelect": 1
  }
}
```

#### Update Access Rules

```json
{
  "listRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id",

  "viewRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id",

  "createRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= @request.body.organization && @collection.organization_members.user.id ?= @request.auth.id",

  "updateRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id",

  "deleteRule": "@request.auth.id != '' && @collection.organization_members.organization.id ?= organization.id && @collection.organization_members.user.id ?= @request.auth.id && (@collection.organization_members.role = 'owner' || @collection.organization_members.role = 'admin')"
}
```

---

### Step 1.5: Update Audit Logs Collection

#### What We're Changing

Add organization scope to audit logs for per-tenant audit reporting.

#### Schema Changes

Add to audit_logs collection:

```json
{
  "id": "audit_organization",
  "name": "organization",
  "type": "relation",
  "system": false,
  "required": false,
  "options": {
    "collectionId": "organizations",
    "cascadeDelete": false,
    "maxSelect": 1
  }
}
```

#### Why Required = false?

Some audit events might be system-level (not tied to a specific org), so we allow null.

#### Implementation Notes (Important)

- Adding the field to the schema is not enough: update `backend/audit.go` to populate `audit_logs.organization` when writing audit entries.
- If you plan to use audit logs as a **project activity feed** (Phase 4), also add a `project` relation field to `audit_logs` (or do it in Phase 4) so you can query efficiently by project: `filter: project = "{projectId}"`.

---

### Step 1.6: Bootstrap / Seed (Greenfield)

Because this is a greenfield project (no existing users/data), we don't need migrations. Instead, add a small bootstrap/seed flow for development and QA:

1. Create an initial organization
2. Create an initial org owner membership for the first admin user
3. Optionally create a sample project and a few tasks for UI testing

Implement this either as a one-time bootstrap endpoint (superuser-only) or as a Bun script under `scripts/` that runs against an empty database.

<!--

#### What We're Building

A script that:

1. Creates an organization for each existing group
2. Creates organization_members from group membership
3. Updates all projects to reference the new organization
4. Updates all tags to reference the new organization

#### Migration Script

**Create file**: `scripts/migrate-groups-to-orgs.ts`

```typescript
/**
 * Migration Script: Groups → Organizations
 *
 * This script migrates the legacy "groups" model to the new "organizations" model.
 *
 * Prerequisites:
 * - New collections (organizations, organization_members) must exist in schema
 * - Projects and tags must have the new 'organization' field
 * - Backend server must be running
 *
 * Usage:
 *   bun run scripts/migrate-groups-to-orgs.ts
 *
 * What it does:
 * 1. For each group:
 *    a. Create a new organization with the same name
 *    b. Create organization_members for all users in the group
 *    c. Update all projects in the group to reference the new org
 *    d. Update all tags in the group to reference the new org
 *
 * This script is IDEMPOTENT - running it multiple times is safe.
 * It checks for existing data before creating duplicates.
 */

import PocketBase from "pocketbase";

// Configuration
const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin12345";

// Type definitions
interface Group {
  id: string;
  name: string;
  description: string;
  manager: string;
  active: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  group: string;
}

interface Project {
  id: string;
  name: string;
  group: string;
}

interface Tag {
  id: string;
  name: string;
  group: string;
}

// Utility function to create URL-safe slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

// Generate unique slug by appending number if needed
async function generateUniqueSlug(
  pb: PocketBase,
  baseName: string,
): Promise<string> {
  const baseSlug = slugify(baseName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    try {
      await pb.collection("organizations").getFirstListItem(`slug = "${slug}"`);
      // If we get here, slug exists, try next one
      slug = `${baseSlug}-${counter}`;
      counter++;
    } catch {
      // Slug doesn't exist, we can use it
      return slug;
    }
  }
}

// Map old roles to new organization roles
function mapRoleToOrgRole(oldRole: string, isManager: boolean): string {
  if (isManager) return "owner";

  switch (oldRole) {
    case "admin":
      return "admin";
    case "manager":
      return "admin";
    case "supervisor":
      return "member";
    case "employee":
      return "member";
    default:
      return "member";
  }
}

async function main() {
  console.log("🚀 Starting Groups → Organizations migration...\n");

  const pb = new PocketBase(PB_URL);

  // Authenticate as admin
  console.log("📝 Authenticating as admin...");
  try {
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authenticated successfully\n");
  } catch (error) {
    console.error("❌ Failed to authenticate:", error);
    process.exit(1);
  }

  // Track migration stats
  const stats = {
    groupsProcessed: 0,
    orgsCreated: 0,
    membersCreated: 0,
    projectsUpdated: 0,
    tagsUpdated: 0,
    errors: 0,
  };

  // Create mapping of group IDs to organization IDs
  const groupToOrgMap = new Map<string, string>();

  try {
    // Step 1: Fetch all groups
    console.log("📥 Fetching all groups...");
    const groups = await pb.collection("groups").getFullList<Group>();
    console.log(`   Found ${groups.length} groups\n`);

    // Step 2: Process each group
    for (const group of groups) {
      console.log(`\n📦 Processing group: "${group.name}" (${group.id})`);
      stats.groupsProcessed++;

      try {
        // Check if organization already exists (by name match)
        let org;
        try {
          org = await pb
            .collection("organizations")
            .getFirstListItem(`name = "${group.name.replace(/"/g, '\\"')}"`);
          console.log(`   ⚠️  Organization already exists: ${org.id}`);
        } catch {
          // Create new organization
          const slug = await generateUniqueSlug(pb, group.name);
          org = await pb.collection("organizations").create({
            name: group.name,
            slug: slug,
            description: group.description || "",
            active: group.active !== false,
            plan: "free",
            settings: {},
          });
          console.log(`   ✅ Created organization: ${org.id} (slug: ${slug})`);
          stats.orgsCreated++;
        }

        groupToOrgMap.set(group.id, org.id);

        // Step 3: Create organization_members for users in this group
        console.log("   👥 Migrating group members...");

        const usersInGroup = await pb.collection("users").getFullList<User>({
          filter: `group = "${group.id}"`,
        });
        console.log(`      Found ${usersInGroup.length} users in group`);

        for (const user of usersInGroup) {
          const isManager = group.manager === user.id;
          const orgRole = mapRoleToOrgRole(user.role, isManager);

          // Check if membership already exists
          try {
            await pb
              .collection("organization_members")
              .getFirstListItem(
                `organization = "${org.id}" && user = "${user.id}"`,
              );
            console.log(`      ⚠️  Membership exists for ${user.username}`);
          } catch {
            // Create new membership
            await pb.collection("organization_members").create({
              organization: org.id,
              user: user.id,
              role: orgRole,
              status: "active",
              joined_at: new Date().toISOString(),
            });
            console.log(
              `      ✅ Created membership: ${user.username} as ${orgRole}`,
            );
            stats.membersCreated++;
          }
        }

        // Step 4: Update projects in this group
        console.log("   📁 Updating projects...");

        const projectsInGroup = await pb
          .collection("projects")
          .getFullList<Project>({
            filter: `group = "${group.id}"`,
          });
        console.log(`      Found ${projectsInGroup.length} projects`);

        for (const project of projectsInGroup) {
          try {
            await pb.collection("projects").update(project.id, {
              organization: org.id,
            });
            console.log(`      ✅ Updated project: ${project.name}`);
            stats.projectsUpdated++;
          } catch (error) {
            console.log(
              `      ❌ Failed to update project ${project.name}:`,
              error,
            );
            stats.errors++;
          }
        }

        // Step 5: Update tags in this group
        console.log("   🏷️  Updating tags...");

        const tagsInGroup = await pb.collection("tags").getFullList<Tag>({
          filter: `group = "${group.id}"`,
        });
        console.log(`      Found ${tagsInGroup.length} tags`);

        for (const tag of tagsInGroup) {
          try {
            await pb.collection("tags").update(tag.id, {
              organization: org.id,
            });
            console.log(`      ✅ Updated tag: ${tag.name}`);
            stats.tagsUpdated++;
          } catch (error) {
            console.log(`      ❌ Failed to update tag ${tag.name}:`, error);
            stats.errors++;
          }
        }
      } catch (error) {
        console.error(`   ❌ Error processing group ${group.name}:`, error);
        stats.errors++;
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary");
    console.log("=".repeat(50));
    console.log(`Groups processed:      ${stats.groupsProcessed}`);
    console.log(`Organizations created: ${stats.orgsCreated}`);
    console.log(`Members created:       ${stats.membersCreated}`);
    console.log(`Projects updated:      ${stats.projectsUpdated}`);
    console.log(`Tags updated:          ${stats.tagsUpdated}`);
    console.log(`Errors:                ${stats.errors}`);
    console.log("=".repeat(50));

    if (stats.errors > 0) {
      console.log(
        "\n⚠️  Migration completed with errors. Please review the logs above.",
      );
      process.exit(1);
    } else {
      console.log("\n✅ Migration completed successfully!");
      console.log("\n📝 Next steps:");
      console.log("   1. Verify data in PocketBase admin UI");
      console.log(
        "   2. Run `bun run types:generate` to update TypeScript types",
      );
      console.log(
        "   3. Update frontend to use organizations instead of groups",
      );
      console.log(
        '   4. After verification, you can remove the old "group" fields',
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
main();
```

#### How to Run the Migration

```bash
# Make sure the backend is running with new schema
cd backend && go run .

# In another terminal, run the migration
bun run scripts/migrate-groups-to-orgs.ts

# Or with custom credentials
ADMIN_EMAIL=custom@example.com ADMIN_PASSWORD=secret bun run scripts/migrate-groups-to-orgs.ts
```

-->

---

### Step 1.7: Update Backend Constants

#### What We're Changing

Replace the old role constants with new organization and project role constants.

#### Changes to Make

**File**: `backend/backend_constants.go`

**Add new constants**:

```go
// =============================================================================
// NEW: Organization-based Role System
// =============================================================================

// Organization Roles
// These determine what a user can do within an organization
const (
    // OrgRoleOwner has full control: billing, delete org, transfer ownership
    OrgRoleOwner = "owner"

    // OrgRoleAdmin can manage users, projects, and settings (not billing/delete)
    OrgRoleAdmin = "admin"

    // OrgRoleMember has access based on their project memberships
    OrgRoleMember = "member"
)

// Project Roles
// These determine what a user can do within a specific project
const (
    // ProjectRoleOwner can delete project, manage all settings
    ProjectRoleOwner = "owner"

    // ProjectRoleAdmin can manage members, settings, and all tasks
    ProjectRoleAdmin = "admin"

    // ProjectRoleMember can create and edit tasks
    ProjectRoleMember = "member"

    // ProjectRoleViewer has read-only access (for stakeholders)
    ProjectRoleViewer = "viewer"
)

// Member Status
const (
    MemberStatusInvited   = "invited"
    MemberStatusActive    = "active"
    MemberStatusSuspended = "suspended"
)

	// Greenfield note: do not keep the old group-based roles around.
```

#### Add Validation Helpers

```go
// IsValidOrgRole checks if the given role is a valid organization role
func IsValidOrgRole(role string) bool {
    switch role {
    case OrgRoleOwner, OrgRoleAdmin, OrgRoleMember:
        return true
    default:
        return false
    }
}

// IsValidProjectRole checks if the given role is a valid project role
func IsValidProjectRole(role string) bool {
    switch role {
    case ProjectRoleOwner, ProjectRoleAdmin, ProjectRoleMember, ProjectRoleViewer:
        return true
    default:
        return false
    }
}

// CanOrgRoleManageMembers checks if an org role can add/remove members
func CanOrgRoleManageMembers(role string) bool {
    return role == OrgRoleOwner || role == OrgRoleAdmin
}

// CanOrgRoleCreateProjects checks if an org role can create new projects
func CanOrgRoleCreateProjects(role string) bool {
    return role == OrgRoleOwner || role == OrgRoleAdmin
}

// CanProjectRoleManageTasks checks if a project role can create/edit/delete tasks
func CanProjectRoleManageTasks(role string) bool {
    return role == ProjectRoleOwner || role == ProjectRoleAdmin || role == ProjectRoleMember
}

// CanProjectRoleManageMembers checks if a project role can add/remove project members
func CanProjectRoleManageMembers(role string) bool {
    return role == ProjectRoleOwner || role == ProjectRoleAdmin
}
```

---

### Step 1.8: Update Main Backend Handler

#### What We're Changing

Update `backend/main.go` to:

1. Handle organization context in API calls
2. Create organization when needed
3. Update validation logic

#### Add Organization API Endpoint

**Add to** `backend/main.go`:

```go
// =============================================================================
// Organization Management Endpoints
// =============================================================================

// POST /api/v1/organizations
// Creates a new organization and adds the creator as owner
func registerOrganizationEndpoints(app *pocketbase.PocketBase) {
    app.OnServe().BindFunc(func(se *core.ServeEvent) error {

        // Create Organization
        se.Router.POST("/api/v1/organizations", func(e *core.RequestEvent) error {
            user := e.Auth
            if user == nil {
                return e.UnauthorizedError("Authentication required", nil)
            }

            // Parse request body
            var body struct {
                Name        string `json:"name"`
                Description string `json:"description"`
            }
            if err := e.BindBody(&body); err != nil {
                return e.BadRequestError("Invalid request body", err)
            }

            // Validate name
            if body.Name == "" {
                return e.BadRequestError("Organization name is required", nil)
            }
            if len(body.Name) > 200 {
                return e.BadRequestError("Organization name too long (max 200 chars)", nil)
            }

            // Generate slug
            slug := slugify(body.Name)

            // Ensure slug is unique
            existingOrg, _ := e.App.FindFirstRecordByFilter(
                "organizations",
                "slug = {:slug}",
                map[string]any{"slug": slug},
            )
            if existingOrg != nil {
                slug = fmt.Sprintf("%s-%s", slug, generateShortID())
            }

            // Start transaction
            var newOrg *core.Record
            err := e.App.RunInTransaction(func(txApp core.App) error {
                // Create organization
                orgCollection, _ := txApp.FindCollectionByNameOrId("organizations")
                newOrg = core.NewRecord(orgCollection)
                newOrg.Set("name", body.Name)
                newOrg.Set("slug", slug)
                newOrg.Set("description", body.Description)
                newOrg.Set("active", true)
                newOrg.Set("plan", "free")

                if err := txApp.Save(newOrg); err != nil {
                    return fmt.Errorf("failed to create organization: %w", err)
                }

                // Add creator as owner
                memberCollection, _ := txApp.FindCollectionByNameOrId("organization_members")
                member := core.NewRecord(memberCollection)
                member.Set("organization", newOrg.Id)
                member.Set("user", user.Id)
                member.Set("role", OrgRoleOwner)
                member.Set("status", MemberStatusActive)
                member.Set("joined_at", time.Now().Format(time.RFC3339))

                if err := txApp.Save(member); err != nil {
                    return fmt.Errorf("failed to add owner membership: %w", err)
                }

                return nil
            })

            if err != nil {
                return e.InternalServerError("Failed to create organization", err)
            }

            // Return the new organization
            return e.JSON(201, map[string]any{
                "organization": newOrg,
            })
        })

        // Get User's Organizations
        se.Router.GET("/api/v1/organizations", func(e *core.RequestEvent) error {
            user := e.Auth
            if user == nil {
                return e.UnauthorizedError("Authentication required", nil)
            }

            // Get all memberships for this user
            memberships, err := e.App.FindRecordsByFilter(
                "organization_members",
                "user = {:user} && status = 'active'",
                "-created",
                0, 0,
                map[string]any{"user": user.Id},
            )
            if err != nil {
                return e.InternalServerError("Failed to fetch memberships", err)
            }

            // Get organization details for each membership
            type OrgWithRole struct {
                Organization *core.Record `json:"organization"`
                Role         string       `json:"role"`
                JoinedAt     string       `json:"joined_at"`
            }

            result := make([]OrgWithRole, 0, len(memberships))
            for _, membership := range memberships {
                orgID := membership.GetString("organization")
                org, err := e.App.FindRecordById("organizations", orgID)
                if err != nil {
                    continue // Skip if org not found
                }

                result = append(result, OrgWithRole{
                    Organization: org,
                    Role:         membership.GetString("role"),
                    JoinedAt:     membership.GetString("joined_at"),
                })
            }

            return e.JSON(200, map[string]any{
                "organizations": result,
            })
        })

        return se.Next()
    })
}

// Helper: Generate URL-safe slug from text
func slugify(text string) string {
    // Convert to lowercase and trim
    slug := strings.ToLower(strings.TrimSpace(text))

    // Replace spaces with hyphens
    slug = strings.ReplaceAll(slug, " ", "-")

    // Remove non-alphanumeric characters except hyphens
    reg := regexp.MustCompile("[^a-z0-9-]+")
    slug = reg.ReplaceAllString(slug, "")

    // Remove multiple consecutive hyphens
    reg = regexp.MustCompile("-+")
    slug = reg.ReplaceAllString(slug, "-")

    // Trim hyphens from ends
    slug = strings.Trim(slug, "-")

    return slug
}

// Helper: Generate short random ID
func generateShortID() string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    result := make([]byte, 6)
    for i := range result {
        result[i] = chars[rand.Intn(len(chars))]
    }
    return string(result)
}
```

#### Register the Endpoints

Add to the main() function or init section:

```go
func main() {
    app := pocketbase.New()

    // ... existing setup ...

    // Register organization endpoints
    registerOrganizationEndpoints(app)

    // ... rest of setup ...
}
```

---

### Step 1.9: Update Frontend Auth Store

#### What We're Changing

The auth store needs to track the current organization context.

#### Changes to Make

**File**: `src/store/auth-store.ts`

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { pb } from "@/lib/pocketbase";
import type {
  UsersResponse,
  OrganizationsResponse,
  OrganizationMembersResponse,
} from "@/lib/pocketbase-types";

// Types
interface OrganizationWithRole {
  organization: OrganizationsResponse;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface AuthState {
  // User authentication
  user: UsersResponse | null;
  isAuthenticated: boolean;

  // Organization context
  currentOrganization: OrganizationsResponse | null;
  currentOrgRole: "owner" | "admin" | "member" | null;
  userOrganizations: OrganizationWithRole[];

  // Loading states
  isLoading: boolean;
  isLoadingOrgs: boolean;

  // Actions
  setUser: (user: UsersResponse | null) => void;
  setCurrentOrganization: (
    org: OrganizationsResponse | null,
    role: "owner" | "admin" | "member" | null,
  ) => void;
  fetchUserOrganizations: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  logout: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      currentOrganization: null,
      currentOrgRole: null,
      userOrganizations: [],
      isLoading: false,
      isLoadingOrgs: false,

      // Set user after login
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });

        // Fetch organizations after login
        if (user) {
          get().fetchUserOrganizations();
        }
      },

      // Set current organization context
      setCurrentOrganization: (org, role) => {
        set({
          currentOrganization: org,
          currentOrgRole: role,
        });
      },

      // Fetch all organizations the user belongs to
      fetchUserOrganizations: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ isLoadingOrgs: true });

        try {
          const response = await pb.send("/api/v1/organizations", {
            method: "GET",
          });

          const orgs: OrganizationWithRole[] = response.organizations.map(
            (item: any) => ({
              organization: item.organization,
              role: item.role,
              joinedAt: item.joined_at,
            }),
          );

          set({ userOrganizations: orgs });

          // Auto-select first org if none selected
          const { currentOrganization } = get();
          if (!currentOrganization && orgs.length > 0) {
            set({
              currentOrganization: orgs[0].organization,
              currentOrgRole: orgs[0].role,
            });
          }
        } catch (error) {
          console.error("Failed to fetch organizations:", error);
          set({ userOrganizations: [] });
        } finally {
          set({ isLoadingOrgs: false });
        }
      },

      // Switch to a different organization
      switchOrganization: async (orgId) => {
        const { userOrganizations } = get();

        const orgWithRole = userOrganizations.find(
          (o) => o.organization.id === orgId,
        );

        if (orgWithRole) {
          set({
            currentOrganization: orgWithRole.organization,
            currentOrgRole: orgWithRole.role,
          });
        }
      },

      // Logout
      logout: () => {
        pb.authStore.clear();
        set({
          user: null,
          isAuthenticated: false,
          currentOrganization: null,
          currentOrgRole: null,
          userOrganizations: [],
        });
      },

      // Clear all state
      clear: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentOrganization: null,
          currentOrgRole: null,
          userOrganizations: [],
          isLoading: false,
          isLoadingOrgs: false,
        });
      },
    }),
    {
      name: "anjam-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentOrganization: state.currentOrganization,
        currentOrgRole: state.currentOrgRole,
      }),
    },
  ),
);
```

---

### Step 1.10: Regenerate TypeScript Types

After all schema changes, regenerate the TypeScript types:

```bash
bun run types:generate
```

This will update `src/lib/pocketbase-types.ts` with:

- `OrganizationsResponse` type
- `OrganizationMembersResponse` type
- Updated `ProjectsResponse` with organization field
- Updated `TagsResponse` with organization field

---

### Phase 1 Completion Checklist

- [x] `organizations` collection created in schema
- [x] `organization_members` collection created in schema
- [x] Projects collection has `organization` field
- [x] Tags collection has `organization` field
- [x] Audit logs collection has `organization` field
- [x] All access rules updated for organization-based access
- [x] Bootstrap/seed flow implemented (optional but recommended)
- [x] Backend constants updated with new roles
- [x] Organization API endpoints created
- [x] Auth store updated with organization context
- [x] TypeScript types regenerated
- [x] Run `bun run check` - no errors
- [x] Manual testing of organization CRUD
- [x] Manual testing of organization switching

---

## Phase 2: RBAC Overhaul

### Overview

**Goal**: Implement project-level permissions with proper role hierarchy.
**Duration**: 1 week
**Dependencies**: Phase 1 must be complete
**Breaking Changes**: Yes - permission checking completely rewritten

### Why Project-Level RBAC?

With the current system, if you're a "supervisor" you have supervisor permissions everywhere. But in reality:

- You might be a **project lead** on Project A (can manage everything)
- A **contributor** on Project B (can edit tasks)
- A **stakeholder** on Project C (read-only access)

Project-level RBAC solves this by assigning roles per project.

### Step 2.1: Create Project Members Collection

#### Schema Definition

**Add to** `backend/pb_schema.json`:

```json
{
  "id": "project_members",
  "name": "project_members",
  "type": "base",
  "system": false,
  "schema": [
    {
      "id": "pm_project",
      "name": "project",
      "type": "relation",
      "system": false,
      "required": true,
      "options": {
        "collectionId": "projects",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1,
        "displayFields": ["name", "code"]
      }
    },
    {
      "id": "pm_user",
      "name": "user",
      "type": "relation",
      "system": false,
      "required": true,
      "options": {
        "collectionId": "users",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1,
        "displayFields": ["username", "email"]
      }
    },
    {
      "id": "pm_role",
      "name": "role",
      "type": "select",
      "system": false,
      "required": true,
      "options": {
        "maxSelect": 1,
        "values": ["owner", "admin", "member", "viewer"]
      }
    },
    {
      "id": "pm_notifications",
      "name": "notifications",
      "type": "bool",
      "system": false,
      "required": false,
      "options": {}
    },
    {
      "id": "pm_added_by",
      "name": "added_by",
      "type": "relation",
      "system": false,
      "required": false,
      "options": {
        "collectionId": "users",
        "cascadeDelete": false,
        "maxSelect": 1
      }
    },
    {
      "id": "pm_added_at",
      "name": "added_at",
      "type": "date",
      "system": false,
      "required": false,
      "options": {}
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_project_member_unique` ON `project_members` (`project`, `user`)",
    "CREATE INDEX `idx_pm_user` ON `project_members` (`user`)",
    "CREATE INDEX `idx_pm_project` ON `project_members` (`project`)",
    "CREATE INDEX `idx_pm_project_role` ON `project_members` (`project`, `role`)"
  ],
  "listRule": "@request.auth.id != '' && (project.organization.id = @collection.organization_members.organization.id && @collection.organization_members.user.id = @request.auth.id)",
  "viewRule": "@request.auth.id != '' && (project.organization.id = @collection.organization_members.organization.id && @collection.organization_members.user.id = @request.auth.id)",
  "createRule": null,
  "updateRule": null,
  "deleteRule": null
}
```

#### Role Capabilities

| Role   | View Tasks | Create Tasks | Edit Any Task | Delete Tasks | Manage Members | Project Settings |
| ------ | ---------- | ------------ | ------------- | ------------ | -------------- | ---------------- |
| owner  | ✅         | ✅           | ✅            | ✅           | ✅             | ✅               |
| admin  | ✅         | ✅           | ✅            | ✅           | ✅             | ❌               |
| member | ✅         | ✅           | Own only      | Own only     | ❌             | ❌               |
| viewer | ✅         | ❌           | ❌            | ❌           | ❌             | ❌               |

---

### Step 2.2: Create Permission Resolution Module

#### What We're Building

A centralized module that determines what a user can do based on their organization and project roles.

#### Create New File

**Create file**: `backend/permissions.go`

```go
package main

import (
    "fmt"

    "github.com/pocketbase/pocketbase/core"
)

// =============================================================================
// Permission Context
// =============================================================================

// PermissionContext holds the resolved permissions for a user in a specific context
type PermissionContext struct {
    // User info
    UserID    string
    UserEmail string

    // Organization context
    OrganizationID   string
    OrganizationRole string // owner, admin, member, or "" if not a member
    IsOrgOwner       bool
    IsOrgAdmin       bool
    IsOrgMember      bool

    // Project context (optional)
    ProjectID   string
    ProjectRole string // owner, admin, member, viewer, or "" if not a member

    // Computed permissions
    Permissions map[string]bool
}

// =============================================================================
// Permission Resolution
// =============================================================================

// GetPermissionContext resolves all permissions for a user in the given context
func GetPermissionContext(app core.App, userID, orgID, projectID string) (*PermissionContext, error) {
    ctx := &PermissionContext{
        UserID:         userID,
        OrganizationID: orgID,
        ProjectID:      projectID,
        Permissions:    make(map[string]bool),
    }

    // Get user details
    user, err := app.FindRecordById("users", userID)
    if err != nil {
        return nil, fmt.Errorf("user not found: %w", err)
    }
    ctx.UserEmail = user.GetString("email")

    // Get organization membership
    if orgID != "" {
        orgMembership, err := app.FindFirstRecordByFilter(
            "organization_members",
            "organization = {:org} && user = {:user} && status = 'active'",
            map[string]any{"org": orgID, "user": userID},
        )

        if err == nil && orgMembership != nil {
            ctx.OrganizationRole = orgMembership.GetString("role")
            ctx.IsOrgOwner = ctx.OrganizationRole == OrgRoleOwner
            ctx.IsOrgAdmin = ctx.OrganizationRole == OrgRoleOwner || ctx.OrganizationRole == OrgRoleAdmin
            ctx.IsOrgMember = true
        }
    }

    // Get project membership (if project specified)
    if projectID != "" {
        projectMembership, err := app.FindFirstRecordByFilter(
            "project_members",
            "project = {:project} && user = {:user}",
            map[string]any{"project": projectID, "user": userID},
        )

        if err == nil && projectMembership != nil {
            ctx.ProjectRole = projectMembership.GetString("role")
        }
    }

    // Compute permissions
    ctx.computePermissions()

    return ctx, nil
}

// computePermissions calculates all boolean permissions based on roles
func (ctx *PermissionContext) computePermissions() {
    // Organization-level permissions
    ctx.Permissions["org.view"] = ctx.IsOrgMember
    ctx.Permissions["org.update"] = ctx.IsOrgOwner
    ctx.Permissions["org.delete"] = ctx.IsOrgOwner
    ctx.Permissions["org.manage_billing"] = ctx.IsOrgOwner
    ctx.Permissions["org.manage_members"] = ctx.IsOrgAdmin
    ctx.Permissions["org.invite_members"] = ctx.IsOrgAdmin
    ctx.Permissions["org.create_project"] = ctx.IsOrgAdmin

    // Project-level permissions
    // Org admins automatically get full project access
    if ctx.IsOrgAdmin {
        ctx.Permissions["project.view"] = true
        ctx.Permissions["project.update"] = true
        ctx.Permissions["project.delete"] = ctx.IsOrgOwner
        ctx.Permissions["project.manage_members"] = true
        ctx.Permissions["project.manage_statuses"] = true
        ctx.Permissions["task.view"] = true
        ctx.Permissions["task.create"] = true
        ctx.Permissions["task.update"] = true
        ctx.Permissions["task.delete"] = true
        ctx.Permissions["task.assign"] = true
        ctx.Permissions["comment.create"] = true
        ctx.Permissions["comment.delete_any"] = true
        ctx.Permissions["time_entry.create"] = true
        ctx.Permissions["time_entry.delete_any"] = true
    } else {
        // Project-specific permissions based on project role
        switch ctx.ProjectRole {
        case ProjectRoleOwner:
            ctx.Permissions["project.view"] = true
            ctx.Permissions["project.update"] = true
            ctx.Permissions["project.delete"] = true
            ctx.Permissions["project.manage_members"] = true
            ctx.Permissions["project.manage_statuses"] = true
            ctx.Permissions["task.view"] = true
            ctx.Permissions["task.create"] = true
            ctx.Permissions["task.update"] = true
            ctx.Permissions["task.delete"] = true
            ctx.Permissions["task.assign"] = true
            ctx.Permissions["comment.create"] = true
            ctx.Permissions["comment.delete_any"] = true
            ctx.Permissions["time_entry.create"] = true
            ctx.Permissions["time_entry.delete_any"] = true

        case ProjectRoleAdmin:
            ctx.Permissions["project.view"] = true
            ctx.Permissions["project.update"] = true
            ctx.Permissions["project.manage_members"] = true
            ctx.Permissions["project.manage_statuses"] = true
            ctx.Permissions["task.view"] = true
            ctx.Permissions["task.create"] = true
            ctx.Permissions["task.update"] = true
            ctx.Permissions["task.delete"] = true
            ctx.Permissions["task.assign"] = true
            ctx.Permissions["comment.create"] = true
            ctx.Permissions["comment.delete_any"] = true
            ctx.Permissions["time_entry.create"] = true
            ctx.Permissions["time_entry.delete_any"] = true

        case ProjectRoleMember:
            ctx.Permissions["project.view"] = true
            ctx.Permissions["task.view"] = true
            ctx.Permissions["task.create"] = true
            ctx.Permissions["task.update_own"] = true
            ctx.Permissions["comment.create"] = true
            ctx.Permissions["comment.delete_own"] = true
            ctx.Permissions["time_entry.create"] = true
            ctx.Permissions["time_entry.delete_own"] = true

        case ProjectRoleViewer:
            ctx.Permissions["project.view"] = true
            ctx.Permissions["task.view"] = true
            ctx.Permissions["comment.view"] = true
        }
    }
}

// =============================================================================
// Permission Check Helpers
// =============================================================================

// Can checks if the context has a specific permission
func (ctx *PermissionContext) Can(permission string) bool {
    return ctx.Permissions[permission]
}

// CanViewProject checks if user can view the project
func (ctx *PermissionContext) CanViewProject() bool {
    return ctx.Can("project.view")
}

// CanManageProject checks if user can update project settings
func (ctx *PermissionContext) CanManageProject() bool {
    return ctx.Can("project.update")
}

// CanManageProjectMembers checks if user can add/remove project members
func (ctx *PermissionContext) CanManageProjectMembers() bool {
    return ctx.Can("project.manage_members")
}

// CanCreateTask checks if user can create tasks in the project
func (ctx *PermissionContext) CanCreateTask() bool {
    return ctx.Can("task.create")
}

// CanUpdateTask checks if user can update any task in the project
func (ctx *PermissionContext) CanUpdateTask() bool {
    return ctx.Can("task.update")
}

// CanUpdateOwnTask checks if user can update their own tasks
func (ctx *PermissionContext) CanUpdateOwnTask() bool {
    return ctx.Can("task.update") || ctx.Can("task.update_own")
}

// CanDeleteTask checks if user can delete tasks
func (ctx *PermissionContext) CanDeleteTask() bool {
    return ctx.Can("task.delete")
}

// =============================================================================
// Request Helpers
// =============================================================================

// GetPermissionContextFromRequest extracts context from request headers
func GetPermissionContextFromRequest(app core.App, e *core.RequestEvent) (*PermissionContext, error) {
    user := e.Auth
    if user == nil {
        return nil, fmt.Errorf("not authenticated")
    }

    // Get organization from header or query param
    orgID := e.Request.Header.Get("X-Organization-ID")
    if orgID == "" {
        orgID = e.Request.URL.Query().Get("organization_id")
    }

    // Get project from query param (optional)
    projectID := e.Request.URL.Query().Get("project_id")

    return GetPermissionContext(app, user.Id, orgID, projectID)
}

// RequirePermission is a middleware that checks for a specific permission
func RequirePermission(permission string) func(*core.RequestEvent) error {
    return func(e *core.RequestEvent) error {
        ctx, err := GetPermissionContextFromRequest(e.App, e)
        if err != nil {
            return e.UnauthorizedError("Permission check failed", err)
        }

        if !ctx.Can(permission) {
            return e.ForbiddenError(
                fmt.Sprintf("You don't have permission to: %s", permission),
                nil,
            )
        }

        return nil
    }
}
```

---

### Step 2.3: Create Permissions API Endpoint

#### What We're Building

An endpoint that returns the user's effective permissions for the current context.

#### Add to main.go

```go
// GET /api/v1/permissions
// Returns the user's effective permissions for the given context
func registerPermissionsEndpoint(app *pocketbase.PocketBase) {
    app.OnServe().BindFunc(func(se *core.ServeEvent) error {
        se.Router.GET("/api/v1/permissions", func(e *core.RequestEvent) error {
            user := e.Auth
            if user == nil {
                return e.UnauthorizedError("Authentication required", nil)
            }

            // Get context from query params
            orgID := e.Request.URL.Query().Get("organization_id")
            projectID := e.Request.URL.Query().Get("project_id")

            if orgID == "" {
                return e.BadRequestError("organization_id is required", nil)
            }

            // Get permission context
            ctx, err := GetPermissionContext(e.App, user.Id, orgID, projectID)
            if err != nil {
                return e.InternalServerError("Failed to resolve permissions", err)
            }

            // Return permissions
            return e.JSON(200, map[string]any{
                "user_id":           ctx.UserID,
                "organization_id":   ctx.OrganizationID,
                "organization_role": ctx.OrganizationRole,
                "project_id":        ctx.ProjectID,
                "project_role":      ctx.ProjectRole,
                "is_org_owner":      ctx.IsOrgOwner,
                "is_org_admin":      ctx.IsOrgAdmin,
                "permissions":       ctx.Permissions,
            })
        })

        return se.Next()
    })
}
```

---

### Step 2.4: Update Frontend Permissions

#### Rewrite permissions.ts

**Replace contents of**: `src/lib/permissions.ts`

```typescript
/**
 * Permission System
 *
 * This module provides permission checking for the frontend.
 * Permissions are resolved based on:
 * 1. Organization role (owner, admin, member)
 * 2. Project role (owner, admin, member, viewer)
 *
 * Organization admins (owner/admin) have full access to all projects.
 * Project roles only apply to organization members.
 */

// =============================================================================
// Types
// =============================================================================

export type OrgRole = "owner" | "admin" | "member";
export type ProjectRole = "owner" | "admin" | "member" | "viewer";

export interface PermissionContext {
  userId: string;
  organizationId: string;
  organizationRole: OrgRole | null;
  projectId: string | null;
  projectRole: ProjectRole | null;
  isOrgOwner: boolean;
  isOrgAdmin: boolean;
  permissions: Record<string, boolean>;
}

// =============================================================================
// Permission Definitions
// =============================================================================

/**
 * All possible permissions in the system.
 * Used for type safety and documentation.
 */
export const PERMISSIONS = {
  // Organization permissions
  "org.view": "View organization details",
  "org.update": "Update organization settings",
  "org.delete": "Delete organization",
  "org.manage_billing": "Manage billing and subscription",
  "org.manage_members": "Add/remove organization members",
  "org.invite_members": "Invite new members to organization",
  "org.create_project": "Create new projects",

  // Project permissions
  "project.view": "View project and its contents",
  "project.update": "Update project settings",
  "project.delete": "Delete project",
  "project.manage_members": "Add/remove project members",
  "project.manage_statuses": "Manage custom statuses",

  // Task permissions
  "task.view": "View tasks",
  "task.create": "Create new tasks",
  "task.update": "Update any task",
  "task.update_own": "Update own tasks only",
  "task.delete": "Delete tasks",
  "task.assign": "Assign tasks to users",

  // Comment permissions
  "comment.view": "View comments",
  "comment.create": "Create comments",
  "comment.delete_own": "Delete own comments",
  "comment.delete_any": "Delete any comment",

  // Time entry permissions
  "time_entry.create": "Log time",
  "time_entry.delete_own": "Delete own time entries",
  "time_entry.delete_any": "Delete any time entry",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// =============================================================================
// Role Checks
// =============================================================================

/**
 * Check if the organization role is owner
 */
export function isOrgOwner(role: OrgRole | null | undefined): boolean {
  return role === "owner";
}

/**
 * Check if the organization role has admin-level access (owner or admin)
 */
export function isOrgAdmin(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user has any organization membership
 */
export function isOrgMember(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

/**
 * Check if user can manage projects in the organization
 */
export function canManageProjects(
  orgRole: OrgRole | null | undefined,
): boolean {
  return isOrgAdmin(orgRole);
}

/**
 * Check if user can manage organization members
 */
export function canManageOrgMembers(
  orgRole: OrgRole | null | undefined,
): boolean {
  return isOrgAdmin(orgRole);
}

// =============================================================================
// Project Role Checks
// =============================================================================

/**
 * Check if user can view project content
 */
export function canViewProject(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return !!projectRole; // Any project role can view
}

/**
 * Check if user can manage project settings
 */
export function canManageProject(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can manage project members
 */
export function canManageProjectMembers(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can create tasks
 */
export function canCreateTasks(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return (
    projectRole === "owner" ||
    projectRole === "admin" ||
    projectRole === "member"
  );
}

/**
 * Check if user can edit any task
 */
export function canEditAnyTask(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can edit a specific task
 * Members can only edit tasks assigned to them
 */
export function canEditTask(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
  taskAssigneeId: string | null | undefined,
  currentUserId: string,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  if (projectRole === "owner" || projectRole === "admin") return true;
  if (projectRole === "member" && taskAssigneeId === currentUserId) return true;
  return false;
}

/**
 * Check if user can delete tasks
 */
export function canDeleteTasks(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can comment
 */
export function canComment(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return (
    projectRole === "owner" ||
    projectRole === "admin" ||
    projectRole === "member"
  );
}

/**
 * Check if user can log time
 */
export function canLogTime(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return (
    projectRole === "owner" ||
    projectRole === "admin" ||
    projectRole === "member"
  );
}

// =============================================================================
// Computed Permission Object
// =============================================================================

/**
 * Compute all permissions for a given context
 * This mirrors the backend permission computation
 */
export function computePermissions(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): Record<Permission, boolean> {
  const isAdmin = isOrgAdmin(orgRole);
  const isOwner = isOrgOwner(orgRole);

  return {
    // Organization permissions
    "org.view": isOrgMember(orgRole),
    "org.update": isOwner,
    "org.delete": isOwner,
    "org.manage_billing": isOwner,
    "org.manage_members": isAdmin,
    "org.invite_members": isAdmin,
    "org.create_project": isAdmin,

    // Project permissions
    "project.view": canViewProject(orgRole, projectRole),
    "project.update": canManageProject(orgRole, projectRole),
    "project.delete": isOwner || projectRole === "owner",
    "project.manage_members": canManageProjectMembers(orgRole, projectRole),
    "project.manage_statuses": canManageProject(orgRole, projectRole),

    // Task permissions
    "task.view": canViewProject(orgRole, projectRole),
    "task.create": canCreateTasks(orgRole, projectRole),
    "task.update": canEditAnyTask(orgRole, projectRole),
    "task.update_own": canCreateTasks(orgRole, projectRole),
    "task.delete": canDeleteTasks(orgRole, projectRole),
    "task.assign": canEditAnyTask(orgRole, projectRole),

    // Comment permissions
    "comment.view": canViewProject(orgRole, projectRole),
    "comment.create": canComment(orgRole, projectRole),
    "comment.delete_own": canComment(orgRole, projectRole),
    "comment.delete_any": canEditAnyTask(orgRole, projectRole),

    // Time entry permissions
    "time_entry.create": canLogTime(orgRole, projectRole),
    "time_entry.delete_own": canLogTime(orgRole, projectRole),
    "time_entry.delete_any": canEditAnyTask(orgRole, projectRole),
  };
}
```

---

### Step 2.5: Create usePermissions Hook

**Create file**: `src/hooks/usePermissions.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useAuthStore } from "@/store/auth-store";
import {
  computePermissions,
  type Permission,
  type OrgRole,
  type ProjectRole,
} from "@/lib/permissions";

// =============================================================================
// Types
// =============================================================================

interface PermissionsResponse {
  user_id: string;
  organization_id: string;
  organization_role: OrgRole | null;
  project_id: string | null;
  project_role: ProjectRole | null;
  is_org_owner: boolean;
  is_org_admin: boolean;
  permissions: Record<string, boolean>;
}

interface UsePermissionsResult {
  // Loading state
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Role info
  orgRole: OrgRole | null;
  projectRole: ProjectRole | null;
  isOrgOwner: boolean;
  isOrgAdmin: boolean;

  // Permission check function
  can: (permission: Permission) => boolean;

  // All permissions
  permissions: Record<Permission, boolean>;

  // Refetch
  refetch: () => void;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to get and check user permissions
 *
 * @param projectId - Optional project ID to get project-specific permissions
 * @returns Permission context and helper functions
 *
 * @example
 * // Get org-level permissions
 * const { can, isOrgAdmin } = usePermissions();
 *
 * // Get project-specific permissions
 * const { can, projectRole } = usePermissions(projectId);
 *
 * // Check a permission
 * if (can('task.create')) {
 *   // Show create button
 * }
 */
export function usePermissions(projectId?: string): UsePermissionsResult {
  const { currentOrganization, currentOrgRole } = useAuthStore();
  const orgId = currentOrganization?.id;

  // Fetch permissions from backend
  const query = useQuery({
    queryKey: ["permissions", orgId, projectId],
    queryFn: async (): Promise<PermissionsResponse> => {
      if (!orgId) {
        throw new Error("No organization selected");
      }

      const params = new URLSearchParams();
      params.set("organization_id", orgId);
      if (projectId) {
        params.set("project_id", projectId);
      }

      const response = await pb.send(`/api/v1/permissions?${params}`, {
        method: "GET",
      });

      return response;
    },
    enabled: !!orgId,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Compute permissions locally as fallback
  const localPermissions = computePermissions(
    currentOrgRole ?? undefined,
    query.data?.project_role ?? undefined,
  );

  // Use backend permissions if available, otherwise use local computation
  const permissions = (query.data?.permissions ?? localPermissions) as Record<
    Permission,
    boolean
  >;

  // Permission check function
  const can = (permission: Permission): boolean => {
    return permissions[permission] ?? false;
  };

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    orgRole: query.data?.organization_role ?? currentOrgRole,
    projectRole: query.data?.project_role ?? null,
    isOrgOwner: query.data?.is_org_owner ?? currentOrgRole === "owner",
    isOrgAdmin:
      query.data?.is_org_admin ??
      (currentOrgRole === "owner" || currentOrgRole === "admin"),

    can,
    permissions,

    refetch: query.refetch,
  };
}

// =============================================================================
// Convenience Hooks
// =============================================================================

/**
 * Hook to check a single permission
 * Useful when you only need one permission check
 */
export function useCanDo(permission: Permission, projectId?: string): boolean {
  const { can, isLoading } = usePermissions(projectId);

  if (isLoading) return false;
  return can(permission);
}

/**
 * Hook to check if user is org admin
 */
export function useIsOrgAdmin(): boolean {
  const { isOrgAdmin, isLoading } = usePermissions();

  if (isLoading) return false;
  return isOrgAdmin;
}

/**
 * Hook to check if user can manage a specific project
 */
export function useCanManageProject(projectId: string): boolean {
  const { can, isLoading } = usePermissions(projectId);

  if (isLoading) return false;
  return can("project.update");
}
```

---

### Step 2.6: No Migration Required (Greenfield)

Because this is a greenfield build, skip any migration from `users_projects`. Implement `project_members` directly and remove `users_projects` from the target schema/code.

<!--

#### Migration Script

**Create file**: `scripts/migrate-users-projects-to-members.ts`

```typescript
/**
 * Migration Script: users_projects → project_members
 *
 * This script migrates the legacy junction table to the new project_members model.
 * All existing users_projects entries are migrated with role = 'member'.
 */

import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin12345";

async function main() {
  console.log("🚀 Starting users_projects → project_members migration...\n");

  const pb = new PocketBase(PB_URL);

  // Authenticate
  console.log("📝 Authenticating...");
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("✅ Authenticated\n");

  // Get all users_projects
  console.log("📥 Fetching users_projects...");
  const usersProjects = await pb.collection("users_projects").getFullList();
  console.log(`   Found ${usersProjects.length} entries\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const up of usersProjects) {
    const userId = up.user;
    const projectId = up.project;

    try {
      // Check if already exists
      const existing = await pb
        .collection("project_members")
        .getFirstListItem(`user = "${userId}" && project = "${projectId}"`)
        .catch(() => null);

      if (existing) {
        console.log(
          `   ⚠️  Skipping: ${userId} already member of ${projectId}`,
        );
        skipped++;
        continue;
      }

      // Create new project_members entry
      await pb.collection("project_members").create({
        project: projectId,
        user: userId,
        role: "member", // Default role
        notifications: true,
        added_at: up.created,
      });

      console.log(`   ✅ Migrated: ${userId} → ${projectId}`);
      migrated++;
    } catch (error) {
      console.log(`   ❌ Error: ${userId} → ${projectId}:`, error);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary");
  console.log("=".repeat(50));
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
  console.log("=".repeat(50));

  if (errors > 0) {
    console.log("\n⚠️  Migration completed with errors");
    process.exit(1);
  }

  console.log("\n✅ Migration completed successfully!");
}

main();
```

-->

---

### Phase 2 Completion Checklist

- [x] `project_members` collection created
- [x] `backend/permissions.go` created
- [x] Permissions API endpoint created
- [x] `src/lib/permissions.ts` rewritten
- [x] `src/hooks/usePermissions.ts` created
- [x] All components updated to use new permission hooks
- [x] Run `bun run check` - no errors
- [x] Manual testing of role-based access
- [x] Test org admin access to all projects
- [x] Test project member restrictions
- [x] Test viewer read-only access

---

## Remaining Phases (Summary)

Due to length constraints, I'll summarize the remaining phases. Each follows the same detailed pattern:

### Phase 3: Task Enhancements

1. **Create `subtasks` collection** - Checklist items within tasks
2. **Create `time_entries` collection** - Replace cumulative time tracking
3. **Create `project_statuses` collection** - Custom statuses per project
4. **Add status transition validation** - Prevent invalid status changes
5. **Update tasks schema** - Add task_type, story_points, watchers, etc.

### Phase 3 Completion Checklist

- [x] Added `subtasks` and `time_entries` collections in the schema plus PocketBase hooks to keep task totals in sync.
- [x] Implemented status transition validation and automatic linking to `project_statuses` so only valid workflows are permitted.
- [x] Delivered frontend support: subtasks list + creation, time-entry dialog with notes, and aggregated totals on the detail page.
- [x] Tied the task detail activity tab to the audit log feed, exposing real-time status/history data alongside the new UX.

### Phase 4 Progress

- [x] Activity stream subscribes to `audit_logs` via SSE and invalidates React Query caches for the current resource.
- [x] Task history tab now respects user preferences and hides the feed when the toggle is off.
- [x] `mentions` entries now have a surfaced section in the notifications page so users can review direct references.
- [x] Comments now support threading, attachments, and reactions directly within the task view.

### Phase 5 Progress

- [x] Preferences tab now exposes `user_preferences`, letting users toggle the activity feed and notification settings.
- [x] Additional rate limiting/error feedback refinements implemented (rate limit toast + handler).
- [x] Batch operations API wired into bulk task updates/deletes to avoid per-record calls.
- [ ] Final security audit work remains to be completed (access rules review continues).

### Recent Issues & Changes

- **Commenting UX** – Threaded comments, attachments, reactions, and reply state were missing; tackled by rewriting the composer, list, and item components plus new React Query hooks to keep caches in sync and surface replies within task detail tabs.
- **Mentions visibility** – Mentions existed but had no surface area; added a `useMentions` hook plus a dedicated notifications panel with task links and snippet previews so users can review references.
- **Preferences and rate limiting** – Settings lacked a dedicated preferences section and rate-limiter errors were generic; introduced the new preferences component, wired it to user preference hooks, and display a localized toast when the global 429 guard fires.
- **Batch operations** – Bulk task actions now use the `/api/v1/tasks/batch-update` endpoint for updates and deletes so bulk flows are a single backend call.
- **Access rules tightening** – Comments, time entries, and mentions now require org/project membership on update/create/delete to reduce cross-tenant exposure.

### Phase 4: Collaboration Engine

> **RECOMMENDATION**: Leverage PocketBase built-in features instead of recreating them:
>
> - Use existing `audit_logs` collection instead of creating separate `activities` collection
> - Use PocketBase real-time subscriptions instead of custom event dispatching
> - The `OnRecordEnrich` hook can add computed activity data on-the-fly

**Repo alignment**: This repo already has server-side audit logging (`backend/audit.go`) and a UI component that renders audit entries (`src/components/audit/activity-stream.tsx`). Phase 4 mainly extends this into a consistent, project-scoped “activity feed”.

1. **Extend `audit_logs` for activity feed** (required to make this implementable)
   - Add `organization` (tenant boundary) **and** `project` (for efficient project-scoped activity queries).
   - Update `backend/audit.go` to populate `audit_logs.organization`/`audit_logs.project` on write.
   - Update `audit_logs` `listRule/viewRule` to allow reading activity for authorized org/project members (today it is admin-only in `backend/pb_schema.json`).
   - Optional but recommended: use `OnRecordEnrich("audit_logs")` to hide `changes` for non-admin users (show message-only activity to viewers).
2. **Create `mentions` collection** - @mention tracking (still needed)
3. **Enhance comments** - Threading, reactions, attachments
4. **Use PocketBase real-time** - subscribe to `audit_logs` for a single, consistent activity stream
5. **Implement mention extraction** - Parse @username in `OnRecordValidate` hook

**Real-time Activity Example** (client-side):

```javascript
// Recommended: subscribe to audit logs (single feed), and refetch/invalidate queries.
//
// Notes:
// - The "filter" is additive; access is still enforced by audit_logs rules.
// - For this to work, audit_logs must be readable by project members and include a `project` field.
pb.collection("audit_logs").subscribe(
  "*",
  (e) => {
    // e.action: 'create' | 'update' | 'delete'
    // e.record: the new audit log record
    invalidateProjectActivityQuery(e.record.project);
  },
  { filter: `project = "${projectId}"` },
);
```

**Activity from Audit Logs** (instead of separate collection):

```ts
// No custom Go endpoint is required if audit_logs rules allow reads.
// Fetch project activity directly via the collection list API.
await pb.collection("audit_logs").getList(1, 50, {
  filter: `project = "${projectId}" && (resource = "tasks" || resource = "comments" || resource = "projects")`,
  sort: "-created",
  expand: "actor",
});
```

### Phase 5: Performance & Security

1. **Add database indexes** - All critical query paths
2. **Implement rate limiting** - Prevent abuse
3. **Add batch operations API** - Bulk updates
4. **Create `user_preferences` collection** - Notification settings
5. **Final security audit** - Review all access rules

---

## Testing Strategy

### Unit Tests

For each phase, add tests for:

- Permission resolution logic
- Role inheritance
- Access rule enforcement

### Integration Tests

- API endpoint authentication
- Cross-organization isolation
- Project membership enforcement
- Status transition validation

### E2E Tests

- User login and organization selection
- Project creation and membership
- Task CRUD with role restrictions
- Search with tenant isolation

---

## Rollback Plan

### Before Each Phase

1. Backup database: `cp data/data.db data/data.db.backup-phase-X`
2. Tag git: `git tag pre-phase-X`

### If Phase Fails

1. Restore database: `cp data/data.db.backup-phase-X data/data.db`
2. Revert code: `git checkout pre-phase-X`
3. Restart server
4. Debug and fix before retrying

---

## Post-Implementation

### Cleanup Tasks

After all phases complete and are verified:

1. Remove any unused collections/fields and dead code paths
2. Review API rules for least privilege
3. Update all documentation

### Documentation Updates

1. Update API documentation
2. Update CLAUDE.md with new architecture
3. Create user guide for organization management
4. Create admin guide for RBAC configuration
