# Codebase Issues & Improvement Opportunities

## Summary

This document outlines bugs, code quality issues, and potential improvements discovered during codebase analysis for the Anjam application.

---

## Critical Issues

### 1. Search Permission Logic is Too Permissive

**File**: `backend/search.go` (lines 99-112)  
**Severity**: HIGH  
**Type**: Security Bug

**Problem**:

- `canViewTask()` and `canViewProject()` functions always return `true` for non-admin users
- Currently only checks if user is admin, then allows all other roles
- Does not validate if user belongs to the same group as the task/project

**Code**:

```go
func canViewTask(app core.App, task *core.Record, user *core.Record) bool {
	if user.GetString("role") == "admin" {
		return true
	}
	// For MVP, we trust the internal nature of the app.
	// In a full implementation, we would check if user is in project group, etc.
	return true  // ❌ Always returns true
}

func canViewProject(app core.App, project *core.Record, user *core.Record) bool {
	if user.GetString("role") == "admin" {
		return true
	}
	return true  // ❌ Always returns true
}
```

**Impact**:

- Users can see search results for tasks/projects from groups they don't belong to
- Violates group-based access control model
- Information disclosure vulnerability

**Recommendation**:

- Implement group-based filtering matching the schema rules
- Check if user's group matches task/project's group
- Respect supervisor/employee access restrictions

---

### 2. Notification Creation Silently Fails

**File**: `backend/main.go` (lines 735-770)  
**Severity**: HIGH  
**Type**: Error Handling Bug

**Problem**:

- `createNotification()` returns `nil` on ALL errors
- Errors are only logged, never propagated to caller
- Caller cannot distinguish between success and failure

**Code**:

```go
func createNotification(...) error {
	// ...
	if err != nil {
		log.Printf("Warning: User %s not found, skipping notification creation: %v", userId, err)
		return nil  // ❌ Returns success on error
	}
	// ...
	if err != nil {
		log.Printf("Error finding notifications collection: %v", err)
		return nil  // ❌ Returns success on error
	}
	// ...
	if err := app.Save(record); err != nil {
		log.Printf("Error creating notification for user %s: %v", userId, err)
		return nil  // ❌ Returns success on error
	}
	return nil  // ✓ Only returns nil on success
}
```

**Impact**:

- Silent data loss - notifications are not created but no one knows
- Difficult to debug why users don't receive expected notifications
- Makes it impossible to implement retry logic

**Recommendation**:

- Return proper error values to caller
- Let caller decide whether to fail the parent operation or log and continue
- Add metrics/monitoring for notification failures

---

### 3. Search Lookup Errors Silently Ignored

**File**: `backend/search.go` (lines 44-55)  
**Severity**: MEDIUM  
**Type**: Error Handling Bug

**Problem**:

- `FindRecordById()` errors for the related project are discarded (`project, _ := ...`)
- When the project lookup fails, the API still returns a task with a blank `project_name`
- Upstream callers cannot tell whether a missing name means “no project” or “backend lookup failed”

**Code**:

```go
project, _ := e.App.FindRecordById("projects", t.GetString("project"))
projectName := ""
if project != nil {
	projectName = project.GetString("name")
}
```

**Impact**:

- Search responses hide backend/database issues
- Debugging production incidents is hard because logs don’t capture which lookup failed
- Users receive incomplete search results without any indication something went wrong

**Recommendation**:

- Capture and log the project lookup error before continuing
- Include a lightweight failure indicator (e.g., `partial: true`) in the payload when related data is missing due to backend errors
- Consider short-circuiting the DTO append when the parent project can’t be resolved

---

### 4. Unsafe Display ID Parsing

**File**: `backend/main.go` (lines 583-595)  
**Severity**: MEDIUM  
**Type**: Data Integrity Bug

**Problem**:

- Splits `display_id` by "-" without robust validation
- Defaults to task number 1 if parsing fails
- Could cause task number collisions

**Code**:

```go
parts := strings.Split(lastTask.DisplayID, "-")
if len(parts) != 2 {
	log.Printf("Warning: Unexpected display_id format %q. Defaulting to 1.", lastTask.DisplayID)
	return 1, nil  // ❌ Could cause duplicate IDs
}

lastNum, parseErr := strconv.Atoi(parts[1])
if parseErr != nil {
	log.Printf("Warning: Could not parse task number from display_id %q: %v. Defaulting to 1.", lastTask.DisplayID, parseErr)
	return 1, nil  // ❌ Could cause duplicate IDs
}
```

**Impact**:

- If parsing fails, next task gets ID that might already exist
- Display ID uniqueness violated
- Confusing UX with duplicate task IDs

**Recommendation**:

- Return error instead of defaulting to 1
- Store task number separately from display_id
- Add validation regex for format
- Add database constraint to enforce uniqueness

---

### 5. Code Generation Validation is Weak

**File**: `backend/main.go` (lines 514-527)  
**Severity**: MEDIUM  
**Type**: Incomplete Validation

**Problem**:

- No validation that generated code matches expected format
- Reason for failure not clear when `MaxCodeGenerationAttempts` is reached
- `FindFirstRecordByData` behavior might be inconsistent

**Code**:

```go
func generateUniqueProjectCode(app core.App) (string, error) {
	for attempt := 0; attempt < MaxCodeGenerationAttempts; attempt++ {
		projectCode := generateRandomCode()
		exists, err := app.FindFirstRecordByData(CollectionProjects, "code", projectCode)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return "", err
		}
		if exists == nil {
			return projectCode, nil
		}
		log.Printf("Project code collision for %q, generating a new one (attempt %d/%d).", projectCode, attempt+1, MaxCodeGenerationAttempts)
	}
	return "", fmt.Errorf("failed to generate unique project code after %d attempts", MaxCodeGenerationAttempts)
}
```

**Impact**:

- Unclear what "max attempts exceeded" means
- Could be database error or actual collisions
- Hard to debug in production

**Recommendation**:

- Add detailed error messages distinguishing collision from DB errors
- Consider using UUID-based codes
- Add telemetry for collision rate
- Increase character set if collision rate is high

---

## Data Integrity Issues

### 6. Group-Manager Cascade Delete Risk

**File**: `backend/pb_schema.json`, `backend/main.go`  
**Severity**: MEDIUM  
**Type**: Referential Integrity

**Problem**:

- Groups have required relation to manager (users)
- `cascadeDelete: false` in schema
- If manager is deleted, group becomes orphaned
- No foreign key constraint or migration strategy

**Impact**:

- Could leave groups with invalid manager references
- Users in group have invalid manager
- Breaking group functionality

**Recommendation**:

- Implement cascade delete if manager should delete group
- Or prevent manager deletion if they manage a group
- Add database constraint/trigger
- Add migration for existing orphaned groups

---

### 7. Soft Delete Enforcement Is Inconsistent

**File**: `backend/search.go`, `src/hooks/tasks.ts`, `backend/pb_schema.json`  
**Severity**: LOW  
**Type**: Data Integrity / UX Gap

**Problem**:

- Tasks do store a `deleted_at` timestamp and the React hooks exclude them from normal task lists (`src/hooks/tasks.ts`, line 47)
- Backend APIs such as `handleGlobalSearch` never filter on `deleted_at`, so “deleted” tasks still appear in global search results
- There is no backend rule preventing other API consumers from querying soft-deleted records directly

**Impact**:

- Users can still discover “deleted” tasks via search or direct PocketBase queries, undermining expectations of removal
- Automation or integrations built on top of the API need to duplicate the filtering logic
- Soft delete loses its UX value because data re-surfaces unpredictably

**Recommendation**:

- Update backend queries (search, reporting handlers, etc.) to append `(deleted_at = "" || deleted_at = null)` filters
- Consider enforcing the filter via PocketBase list/view rules so every request automatically excludes soft-deleted tasks
- Provide an admin-only endpoint to list or restore soft-deleted items instead of leaking them through general endpoints

---

## Performance & Scalability Issues

### 8. Missing Database Indexes

**File**: `backend/pb_schema.json`, `backend/search.go`, `backend/main.go`  
**Severity**: MEDIUM  
**Type**: Performance

**Problem**:

- Search queries without proper indexes: `title ~ {:q} || display_id ~ {:q}`
- Task number lookups query full result set and order DESC
- No indexes on frequently filtered fields

**Code from search.go**:

```go
tasks, err := e.App.FindRecordsByFilter(
	"tasks",
	"title ~ {:q} || display_id ~ {:q}",  // ❌ No indexes for title/display_id
	"-created",
	10,
	0,
	dbx.Params{"q": query},
)
```

**Impact**:

- Slow search as data grows
- Scalability issues with large databases
- Unnecessary full table scans

**Recommendation**:

- Add index on `tasks.title`
- Add index on `tasks.display_id`
- Add index on `tasks.project`
- Add index on `projects.code`
- Add index on `user_login_logs.user, created`

---

### 9. Hardcoded Search Limits

**File**: `backend/search.go` (lines 34, 71)  
**Severity**: LOW  
**Type**: Configuration

**Problem**:

- Search results hardcoded to 10 items
- No pagination support
- No configuration mechanism

**Code**:

```go
tasks, err := e.App.FindRecordsByFilter(
	"tasks",
	taskFilter,
	"-created",
	10,      // ❌ Hardcoded limit
	0,       // ❌ Hardcoded offset
	// ...
)
```

**Impact**:

- Users can't see more than 10 results
- No way to customize search limits
- Inconsistent with rest of API

**Recommendation**:

- Accept `limit` and `offset` query parameters
- Validate limits (min, max)
- Add constants for configuration
- Document API limits

---

## Code Quality Issues

### 10. Overly Broad Error Handling

**File**: `backend/search.go` (lines 40-42, 75-78)  
**Severity**: LOW  
**Type**: Maintainability

**Problem**:

- Errors swallowed and replaced with empty collections
- Makes debugging difficult
- No distinction between "no results" and "error occurred"

**Code**:

```go
if err != nil {
	log.Printf("Search tasks error: %v", err)
	tasks = []*core.Record{}  // ❌ Silent failure
}
```

**Impact**:

- Hard to diagnose search failures
- Users can't tell if search failed or there are no results
- Debugging in production is difficult

**Recommendation**:

- Return error information in response
- Add status field: `"status": "error" | "success"`
- Include error details in JSON response
- Only hide sensitive errors from clients

---

### 11. Permission System Mismatch

**File**: `src/lib/permissions.ts`, `backend/pb_schema.json`  
**Severity**: MEDIUM  
**Type**: Architecture

**Problem**:

- Frontend permissions define role-based access
- Backend uses group-based access control
- Two different authorization models
- Could lead to security bypasses

**Frontend (role-based)**:

```typescript
"projects.view": ["admin", "manager", "supervisor", "employee"]
```

**Backend (group-based)**:

```go
// Must be in same group as project
if userGroupId != projectGroupId {
	return fmt.Errorf("user and project must be in same group")
}
```

**Impact**:

- Confusion about authorization rules
- Frontend might show options user can't actually use
- Potential security holes if not handled correctly

**Recommendation**:

- Document both authorization layers
- Align frontend with backend rules
- Add group information to permission checks
- Add test cases for both authorization models

---

### 12. Inconsistent Logging Levels

**File**: `backend/main.go` (various)  
**Severity**: LOW  
**Type**: Maintainability

**Problem**:

- No consistent logging strategy
- Some errors use `log.Printf()`, others swallowed
- Some operations at INFO level, others at error level
- Makes it hard to trace user actions and debug

**Impact**:

- Difficult to monitor application health
- Hard to trace issues in production
- Inconsistent log analysis

**Recommendation**:

- Implement structured logging with log levels
- Use DEBUG for development details
- Use INFO for important business events
- Use ERROR only for actual errors
- Implement log aggregation/monitoring

---

### 13. Magic Numbers and Strings

**File**: Multiple files  
**Severity**: LOW  
**Type**: Code Maintainability

**Problem**:

- Display ID separator "-" hardcoded in multiple places
- Search results limit "10" hardcoded
- Status values like "todo" scattered throughout code
- No constants for validation rules

**Examples**:

```go
// In search.go
10,  // ❌ Magic number

// In main.go
parts := strings.Split(lastTask.DisplayID, "-")  // ❌ Magic string
```

**Impact**:

- Hard to change display format globally
- Inconsistent values if changed in one place but not another
- Difficult to maintain

**Recommendation**:

- Create `backend_constants.go` with all magic values
- Reference constants throughout codebase
- Add configuration file for adjustable values

---

## Missing Features & Improvements

### 14. No Audit Trail for Sensitive Operations

**Severity**: MEDIUM  
**Type**: Feature Gap / Compliance

**Missing Audits**:

- User creation/deletion
- User role changes
- Group assignments/modifications
- Project creation/deletion
- Permission changes

**Impact**:

- No compliance trail
- Can't answer "who made this change and when"
- Difficult to debug user permission issues
- Regulatory compliance issues

**Recommendation**:

- Add audit logging for all sensitive operations
- Store: user, action, resource, timestamp, changes
- Implement audit log viewer in admin panel
- Retention policy for audit logs

---

### 15. Advanced Search Features Missing

**Severity**: LOW  
**Type**: Feature Enhancement

**Missing Features**:

- Full-text search across all text fields
- Field-specific search (e.g., `assignee:john task:urgent`)
- Saved searches/filters
- Search history
- Search suggestions/autocomplete

**Impact**:

- Users can't find information efficiently
- Limited discoverability of tasks/projects
- Poor UX for power users

**Recommendation**:

- Add full-text search indexes
- Implement field-specific search syntax
- Add search suggestions from database
- Store search history per user

---

### 16. No Rate Limiting

**Severity**: HIGH  
**Type**: Security Gap

**Missing Protections**:

- Rate limiting on API endpoints
- Login attempt limiting (partial - has failed login blocking but no rate limit)
- No request throttling
- No DoS protection

**Impact**:

- Vulnerable to brute force attacks
- Vulnerable to DoS attacks
- No protection against resource exhaustion

**Recommendation**:

- Implement rate limiting per IP/user
- Add request throttling
- Implement exponential backoff for failed attempts
- Add monitoring for rate limit violations

---

### 17. No Webhook/Event System

**Severity**: LOW  
**Type**: Feature Gap

**Missing**:

- Webhooks for external integrations
- Event system for reactive features
- No way for external systems to react to task updates
- No integration capabilities

**Impact**:

- Can't integrate with other systems
- Limited extensibility
- Duplicate data in external systems

**Recommendation**:

- Implement webhook system with retry logic
- Create event publishing infrastructure
- Document webhook payload formats
- Add webhook management UI

---

### 18. Input Validation Doesn’t Match Backend Rules

**Severity**: MEDIUM  
**Type**: UX / Data Integrity

**Problem**:

- Frontend forms do use Zod schemas, but the rules are much looser than what the backend enforces
- Example: `projectFormSchema` only requires `code` to be a non-empty string and later uppercases it (`src/pages/create-project.tsx`, lines 15-69). The backend expects a three-character uppercase code (`CodeLength = 3`, `generateRandomCode()` in `backend/main.go`)
- Users can enter codes with whitespace, emojis, or wrong lengths and only learn about the failure when the server rejects or normalizes it
- Similar gaps exist for other formatted inputs (no pattern for usernames, no max lengths aligned with schema, etc.)

**Impact**:

- Users experience confusing “invalid data” errors after submit instead of real-time feedback
- Data that slips through may violate naming conventions, creating inconsistent records until backend validation catches up
- QA can’t reliably test edge cases because the browser doesn’t mimic the real constraints

**Recommendation**:

- Update the Zod schemas to mirror backend requirements (e.g., regex for 3-letter project code, string length caps matching schema)
- Reuse shared validator utilities so both forms and API calls stay in sync
- Add inline formatting hints (e.g., “ABC”) so users know what is expected before submitting

---

### 19. No Search Result Caching

**Severity**: LOW  
**Type**: Performance

**Missing**:

- Search result caching
- Query result memoization
- Cache invalidation strategy

**Impact**:

- Repeated searches hit database
- No performance optimization for common searches
- Higher database load

**Recommendation**:

- Implement caching layer (Redis or in-memory)
- Cache search results with TTL
- Implement cache invalidation on updates
- Monitor cache hit rate

---

## Backend Issues - Detailed

### 20. Group Managers Must Be Role “manager” (Admins Rejected)

**File**: `backend/main.go` (lines 178-200), `backend/pb_schema.json` (`groups` collection rules)  
**Severity**: LOW  
**Type**: Validation Strictness

**Problem**:

- Only admins may create groups (schema `createRule`), but `handleGroupCreation` enforces that the assigned `manager` relation must belong to a user whose role exactly equals `"manager"`
- This prevents an admin from simply managing a group themselves—they must create a separate manager user first
- When seed data or migrations assign an admin to `manager`, the handler rejects the record with `ErrOnlyManagersCanBeGroupManagers`

**Code**:

```go
func handleGroupCreation(e *core.RecordEvent) error {
	managerId := record.GetString("manager")
	if managerId != "" {
		manager, err := e.App.FindRecordById(CollectionUsers, managerId)
		if err != nil {
			return fmt.Errorf("manager not found: %w", err)
		}
		managerRole := manager.GetString("role")
		if managerRole != "manager" {  // ❌ Rejects admin users
			return errors.New(ErrOnlyManagersCanBeGroupManagers)
		}
	}
	// ...
}
```

**Impact**:

- Adds unnecessary friction when bootstrapping environments (an admin must create a “manager” user just to own groups)
- Makes it impossible to have a unified “admin equals manager” workflow in small deployments
- Confuses admins because the schema allows them to submit the form, but the handler rejects it downstream

**Recommendation**:

- Permit both `"admin"` and `"manager"` roles to satisfy the `manager` relation check
- Alternatively, auto-downgrade the stored `manager` role for group ownership while keeping the auth account as admin
- Clarify the validation error so the UI can guide admins toward compliant assignments

---

## Summary Table

| Issue                                        | Severity | Type                  | File                          | Line(s) |
| -------------------------------------------- | -------- | --------------------- | ----------------------------- | ------- |
| Search permission too permissive             | HIGH     | Security              | search.go                     | 99-112  |
| Notification creation fails silently         | HIGH     | Error Handling        | main.go                       | 735-770 |
| Search lookup errors silently ignored        | MEDIUM   | Error Handling        | search.go                     | 44-55   |
| Unsafe display ID parsing                    | MEDIUM   | Data Integrity        | main.go                       | 583-595 |
| Code generation weak validation              | MEDIUM   | Validation            | main.go                       | 514-527 |
| Group-manager cascade delete risk            | MEDIUM   | Referential Integrity | pb_schema.json                | N/A     |
| Permission system mismatch                   | MEDIUM   | Architecture          | permissions.ts                | N/A     |
| Missing database indexes                     | MEDIUM   | Performance           | search.go, main.go            | N/A     |
| No rate limiting                             | HIGH     | Security              | N/A                           | N/A     |
| Soft delete enforcement inconsistent         | LOW      | Data Integrity / UX   | search.go, src/hooks/tasks.ts | N/A     |
| Missing audit trail                          | MEDIUM   | Compliance            | N/A                           | N/A     |
| Hardcoded values                             | LOW      | Maintainability       | search.go                     | 34, 71  |
| Overly broad error handling                  | LOW      | Maintainability       | search.go                     | 30-78   |
| Inconsistent logging                         | LOW      | Maintainability       | main.go                       | Various |
| Input validation doesn’t match backend rules | MEDIUM   | UX/Data Integrity     | src/pages/create-project.tsx  | N/A     |
| No advanced search                           | LOW      | Feature               | search.go                     | N/A     |
| Group managers must be role “manager” only   | LOW      | Validation            | main.go, pb_schema.json       | 178-200 |
| No webhook system                            | LOW      | Feature               | N/A                           | N/A     |

---

## Recommended Priority

### Immediate (Next Sprint)

1. Fix search permission logic (Security)
2. Implement rate limiting (Security)
3. Fix notification error handling (Reliability)

### Short Term (1-2 Sprints)

4. Add database indexes (Performance)
5. Implement audit logging (Compliance)
6. Fix group-manager cascade issue (Data Integrity)

### Medium Term (3-4 Sprints)

7. Align permission systems
8. Enforce soft-delete filtering and restoration flows
9. Add advanced search features

### Long Term / Nice to Have

10. Webhook system
11. Search caching
12. Align client-side validation with backend rules

---

## Testing Recommendations

1. Add integration tests for permission validation
2. Add tests for error scenarios in notification creation
3. Add tests for display ID parsing edge cases
4. Add tests for search filtering by group
5. Add load tests for search performance
6. Add security tests for rate limiting
7. Add data integrity tests for cascade deletes
