# Codebase Cleanup and Architecture Improvement Plan

## Summary

Comprehensive cleanup, organization, consolidation, and architecture improvement for the task-manager-app (Go backend + React frontend) to align with best practices and improve scalability.

## Approach

- **Implementation style:** All phases implemented together as one comprehensive effort
- **Backend structure:** Keep flat package structure, extract to separate files (helpers.go, logger.go)
- **Frontend refactoring:** Complete refactoring of all mutation hooks to use factory pattern
- **Breaking changes:** Allowed - prioritize clean architecture over backward compatibility

---

## Phase 1: Quick Wins (Low Risk, High Impact)

**Goal:** Eliminate configuration inconsistencies and replace magic strings with typed constants to improve code maintainability and reduce runtime errors from typos.

**Expected Outcomes:**

- All Go version references are consistent across the project
- Role and status comparisons use compile-time checked constants
- Code is more self-documenting and IDE-friendly with autocomplete support

### 1.1 Fix Go Version Mismatch

**File:** `go.work`

- Change `go 1.25.3` to `go 1.24.0` (1.25.3 doesn't exist, aligns with go.mod and Dockerfile)

### 1.2 Add Role and Status Constants

**File:** `backend/backend_constants.go`

- Add role constants: `RoleAdmin`, `RoleManager`, `RoleSupervisor`, `RoleEmployee`
- Add task status constants: `TaskStatusTodo`, `TaskStatusInProgress`, `TaskStatusDone`, `TaskStatusCanceled`, `TaskStatusPending`
- Add priority constants: `PriorityLow`, `PriorityMedium`, `PriorityHigh`

### 1.3 Replace Magic Strings with Constants

**File:** `backend/main.go`

- Replace all `"admin"`, `"manager"`, `"supervisor"`, `"employee"` strings with constants
- Replace `"todo"`, `"in_progress"`, `"done"` strings with constants
- ~15 locations identified

### Phase 1 Completion Checklist

**Status (verified 2025-12-17):**

- [x] `go.work` version matches `go.mod` (1.24.0)
- [x] Role constants defined in `backend_constants.go`
- [x] Task status constants defined in `backend_constants.go`
- [x] Priority constants defined in `backend_constants.go`
- [x] All magic role strings in `main.go` replaced with constants (no `role == "admin"`-style comparisons remain)
- [x] All magic status strings in `main.go` replaced with constants (no direct status string comparisons remain)
- [ ] `go build ./backend` succeeds without errors
- [ ] `bun run check` passes

---

## Phase 2: Backend Helper Extraction

**Goal:** Eliminate code duplication in the backend by extracting repeated patterns into reusable helper functions, improving maintainability and reducing the risk of inconsistent behavior.

**Expected Outcomes:**

- Single source of truth for IP address extraction logic
- Consistent pagination handling across all paginated endpoints
- Simplified and uniform admin/role validation
- Cleaner notification creation with builder pattern
- Reduced `main.go` complexity (~100-150 lines removed)

### 2.1 Create helpers.go File

**New file:** `backend/helpers.go`

Extract the following utilities:

```go
// IP address extraction (currently duplicated in 2 places)
func extractIPAddress(r *http.Request) string

// Pagination parsing (repeated pattern)
func parsePagination(r *http.Request) PaginationParams

// Admin role validation (repeated 4+ times)
func requireAdmin(e *core.RequestEvent) (*core.Record, error)

// Role validation helper
func requireRole(e *core.RequestEvent, roles ...string) (*core.Record, error)
```

### 2.2 Update main.go to Use Helpers

**File:** `backend/main.go`

- Replace inline IP extraction at lines ~840-849 and ~1009-1015
- Replace inline pagination parsing at lines ~1142-1154
- Replace admin checks at lines ~1048, ~1100

### 2.3 Consolidate Notification Pattern

**File:** `backend/main.go`

- Create `NotificationBuilder` struct with fluent API
- Simplify 5+ notification creation sites to use builder pattern

### Phase 2 Completion Checklist

**Status (verified 2025-12-17):**

- [x] `backend/helpers.go` file created
- [ ] `extractIPAddress()` function implemented and tested
- [x] `PaginationParams` struct and `parsePagination()` function implemented
- [x] `requireAdmin()` helper implemented
- [x] `requireRole()` helper implemented
- [ ] All inline IP extraction code replaced with helper
- [ ] All inline pagination parsing replaced with helper
- [ ] All admin role checks use `requireAdmin()` helper
- [ ] `NotificationBuilder` struct created with fluent API
- [ ] All notification creation sites use builder pattern
- [ ] `go build ./backend` succeeds without errors
- [ ] Existing functionality unchanged (manual testing)

---

## Phase 3: Frontend Mutation Factory

**Goal:** Reduce boilerplate code in TanStack Query mutation hooks by creating a reusable factory pattern, and standardize all API calls to use PocketBase SDK consistently.

**Expected Outcomes:**

- ~50% reduction in mutation hook code (remove ~200 lines of repeated boilerplate)
- Consistent mutation behavior across all hooks (onSuccess, onSettled patterns)
- All API calls use PocketBase SDK (no raw fetch for custom endpoints)
- Easier to add new mutations with minimal code
- Improved type safety with generic factory

### 3.1 Create Mutation Factory

**New file:** `src/hooks/use-mutation-factory.ts`

```typescript
export function createMutation<TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidate: (client: QueryClient, data: TData, variables: TVariables) => void,
);
```

### 3.2 Refactor Task Hooks

**File:** `src/hooks/tasks.ts`

- Refactor `useCreateTask`, `useUpdateTask`, `useDeleteTask` to use factory
- Remove duplicated `options` destructuring pattern (~30 lines per hook)

### 3.3 Refactor All Mutation Hooks (Complete Refactoring)

**Files:**

- `src/hooks/projects.ts` - useCreateProject, useUpdateProject, useDeleteProject
- `src/hooks/users.ts` - useCreateUser, useUpdateUser, useDeleteUser, useToggleUserActive, useUnblockUser
- `src/hooks/comments.ts` - useCreateComment, useUpdateComment, useDeleteComment
- `src/hooks/groups.ts` - useCreateGroup, useUpdateGroup, useDeleteGroup
- `src/hooks/tags.ts` - useCreateTag, useUpdateTag, useDeleteTag
- `src/hooks/notifications.ts` - useMarkNotificationRead, useMarkAllNotificationsRead

### 3.4 Standardize Custom API Calls

**File:** `src/hooks/users.ts`

- Convert `useToggleUserActive` and `useUnblockUser` to use consistent pattern
- Add `customApiCall` helper to `src/lib/pocketbase.ts`

### Phase 3 Completion Checklist

- [ ] `src/hooks/use-mutation-factory.ts` created with typed factory function
- [ ] Factory supports custom `onSuccess` and `onSettled` callbacks
- [ ] `customApiCall` helper added to `src/lib/pocketbase.ts`
- [ ] `tasks.ts` mutations refactored (useCreateTask, useUpdateTask, useDeleteTask, useBulkUpdateTasks, useBulkDeleteTasks)
- [ ] `projects.ts` mutations refactored
- [ ] `users.ts` mutations refactored (including custom API calls)
- [ ] `comments.ts` mutations refactored
- [ ] `groups.ts` mutations refactored
- [ ] `tags.ts` mutations refactored
- [ ] `notifications.ts` mutations refactored
- [ ] No raw `fetch()` calls remain for API endpoints
- [ ] `bun run type:check` passes
- [ ] `bun run test:run` passes
- [ ] All CRUD operations work correctly (manual testing)

---

## Phase 4: Query Invalidation Consolidation

**Goal:** Centralize and simplify query cache invalidation logic to ensure consistent data freshness across the application while reducing duplicated invalidation code in hooks.

**Expected Outcomes:**

- Single source of truth for invalidation strategies per resource type
- Reduced risk of stale data from missed invalidations
- Easier to understand and maintain cache invalidation logic
- Consistent invalidation patterns for CRUD operations

### 4.1 Enhance Invalidators

**File:** `src/lib/query-invalidators.ts`

- Add `mutationInvalidators.crud` presets for standard operations
- Reduce per-hook invalidation boilerplate

### 4.2 Standardize Bulk Operations

**Files:** `src/hooks/tasks.ts`

- Consolidate `useBulkUpdateTasks` and `useBulkDeleteTasks` invalidation
- Use consistent invalidation patterns

### Phase 4 Completion Checklist

- [ ] `mutationInvalidators.crud` object added with presets for tasks, projects, users, comments, groups
- [ ] All mutation hooks use centralized invalidators
- [ ] Bulk operation hooks use consistent invalidation
- [ ] No duplicate invalidation logic in individual hooks
- [ ] `bun run type:check` passes
- [ ] Data updates correctly reflected in UI after mutations (manual testing)

---

## Phase 5: Type Safety Improvements

**Goal:** Strengthen TypeScript type safety throughout the application by eliminating unsafe type assertions and adding proper error boundaries for graceful failure handling.

**Expected Outcomes:**

- No unsafe `as` type assertions in filter logic
- Runtime type validation with type guard functions
- Graceful error handling at page level with recovery options
- Better developer experience with stronger type checking

### 5.1 Fix Filter Type Safety

**File:** `src/hooks/use-task-filters.ts`

- Add type guards: `isValidStatus()`, `isValidPriority()`
- Remove unsafe type assertions like `as TasksRecord["status"]`

### 5.2 Add Page Error Boundaries

**New file:** `src/components/error/page-error-boundary.tsx`

- Create reusable error boundary with retry capability
- Apply to critical routes in router.tsx

### Phase 5 Completion Checklist

- [ ] `isValidStatus()` type guard function created
- [ ] `isValidPriority()` type guard function created
- [ ] All `as TasksRecord["status"]` assertions replaced with type guards
- [ ] `PageErrorBoundary` component created with retry button
- [ ] Error boundary applied to main route wrapper in `router.tsx`
- [ ] `bun run type:check` passes with no type errors
- [ ] Filter functionality works correctly (manual testing)
- [ ] Error boundary catches and displays errors gracefully (manual testing)

---

## Phase 6: Testing Infrastructure

**Goal:** Improve test coverage and quality assurance by increasing coverage thresholds and adding tests for newly created helper functions and utilities.

**Expected Outcomes:**

- Higher confidence in code correctness with 70% coverage threshold
- All new helper functions (backend and frontend) have unit tests
- Regression protection for refactored code
- CI/CD pipeline catches more issues before deployment

### 6.1 Increase Coverage Thresholds

**File:** `vitest.config.ts`

- Increase thresholds: 60% → 70% (lines, functions, statements)
- Set branches to 65%

### 6.2 Add Backend Tests

**New file:** `backend/helpers_test.go`

- Test `extractIPAddress`, `parsePagination`, `requireAdmin`
- Test role validation logic

### 6.3 Add Frontend Hook Tests

**Files to create:**

- `src/hooks/query-keys.test.ts`
- `src/lib/query-invalidators.test.ts`

### Phase 6 Completion Checklist

- [ ] `vitest.config.ts` thresholds updated to 70%/65%
- [ ] `backend/helpers_test.go` created with tests for all helper functions
- [ ] `extractIPAddress` tests cover X-Forwarded-For, X-Real-IP, and RemoteAddr cases
- [ ] `parsePagination` tests cover default values and edge cases
- [ ] `requireAdmin` and `requireRole` tests cover success and failure cases
- [ ] `src/hooks/query-keys.test.ts` created
- [ ] `src/lib/query-invalidators.test.ts` created
- [ ] `go test ./backend/...` passes
- [ ] `bun run test:run` passes
- [ ] `bun run test:coverage` meets new thresholds

---

## Phase 7: Structured Logging (Optional)

**Goal:** Replace unstructured `log.Printf` calls with JSON-formatted structured logging for better observability, log aggregation, and debugging in production environments.

**Expected Outcomes:**

- Machine-parseable JSON log format for log aggregation tools
- Consistent log structure with timestamp, level, message, and context fields
- Easier debugging with contextual information (request ID, user ID, etc.)
- Foundation for future observability improvements (metrics, tracing)

### 7.1 Add Structured Logger

**New file:** `backend/logger.go`

- JSON-formatted log entries with timestamp, level, message, fields
- Replace `log.Printf` calls in critical paths

### Phase 7 Completion Checklist

- [ ] `backend/logger.go` created with `LogEntry` struct
- [ ] Log levels implemented: DEBUG, INFO, WARN, ERROR
- [ ] Helper functions created: `LogInfo()`, `LogWarn()`, `LogError()`
- [ ] Authentication events use structured logging
- [ ] User management operations use structured logging
- [ ] Error conditions use structured logging with error context
- [ ] `go build ./backend` succeeds without errors
- [ ] Logs output valid JSON format (manual verification)

---

## Critical Files to Modify

| File                                | Changes                                         |
| ----------------------------------- | ----------------------------------------------- |
| `go.work`                           | Fix version                                     |
| `backend/backend_constants.go`      | Add role/status/priority constants              |
| `backend/main.go`                   | Use constants, extract to helpers               |
| `backend/helpers.go`                | New file with extracted utilities               |
| `src/hooks/use-mutation-factory.ts` | New mutation factory                            |
| `src/hooks/tasks.ts`                | Refactor mutations                              |
| `src/hooks/projects.ts`             | Refactor mutations                              |
| `src/hooks/users.ts`                | Refactor mutations, fix custom API              |
| `src/lib/query-invalidators.ts`     | Add mutation presets                            |
| `src/lib/pocketbase.ts`             | Add customApiCall helper, update API base paths |
| `vitest.config.ts`                  | Increase coverage thresholds                    |
| `backend/pb_schema.json`            | Schema cleanup (if needed)                      |

---

## Phase 8: Breaking Changes & Cleanup

**Goal:** Make breaking changes that significantly improve code quality, remove deprecated patterns, and clean up technical debt that was previously avoided for compatibility reasons.

**Expected Outcomes:**

- Cleaner, more consistent API endpoints
- Simplified frontend hook signatures
- Removed legacy code and unused exports
- Streamlined component props and interfaces

### 8.1 API Endpoint Restructuring

**Files:** `backend/main.go`, `src/hooks/users.ts`, `src/lib/pocketbase.ts`

**Breaking Changes:**

- Rename `/api/tm/*` endpoints to `/api/v1/*` for versioning consistency
- Standardize response format across all custom endpoints:
  ```json
  { "data": {...}, "meta": {...} }
  ```
- Remove deprecated query parameters if any exist

### 8.2 Hook Signature Simplification

**Files:** All `src/hooks/*.ts` files

**Breaking Changes:**

- Simplify mutation hook options - remove rarely used callback overrides
- Change hook return types to be more consistent
- Remove legacy function signatures that were kept for compatibility

### 8.3 Component Props Cleanup

**Files:** Various component files

**Breaking Changes:**

- Remove deprecated props from components
- Consolidate similar props into unified interfaces
- Remove `any` types and replace with proper typing
- Delete unused component variants

### 8.4 Remove Dead Code

**Files:** Throughout codebase

**Breaking Changes:**

- Delete unused exports from `src/lib/*`
- Remove commented-out code blocks
- Delete unused utility functions
- Remove empty or placeholder files
- Clean up unused CSS classes and styles

### 8.5 Database Schema Cleanup (if needed)

**File:** `backend/pb_schema.json`

**Breaking Changes:**

- Remove deprecated fields from collections
- Rename inconsistently named fields
- Add proper indexes for frequently queried fields
- Update field validations to be stricter

### Phase 8 Completion Checklist

- [ ] API endpoints renamed to `/api/v1/*` pattern
- [ ] All custom API responses use consistent format
- [ ] Frontend API calls updated to match new endpoints
- [ ] Hook signatures simplified and documented
- [ ] Deprecated component props removed
- [ ] All `any` types replaced with proper types
- [ ] Dead code removed (run `bun run lint` to verify no unused exports)
- [ ] Commented-out code blocks deleted
- [ ] Database schema cleaned up (if applicable)
- [ ] `bun run types:generate` run after schema changes
- [ ] All tests updated to match new signatures
- [ ] `bun run check` passes
- [ ] Full application tested end-to-end

---

## Final Completion Checklist

### Pre-Implementation

- [ ] Review plan with team/stakeholders
- [ ] Create feature branch from main
- [ ] Backup existing database before starting
- [ ] Document current API endpoints for reference

### Post-Implementation

- [ ] All phase checklists completed (Phases 1-8)
- [ ] `bun run check` passes (type + lint + format)
- [ ] `bun run test:all` passes (unit + e2e)
- [ ] `go build ./backend` succeeds
- [ ] `go test ./backend/...` passes
- [ ] Manual smoke test of critical flows:
  - [ ] User login/logout
  - [ ] Create/edit/delete task
  - [ ] Create/edit/delete project
  - [ ] User management (admin)
  - [ ] Notifications working
  - [ ] All new API endpoints (`/api/v1/*`) working
- [ ] Data migration completed (if schema changed)
- [ ] Code review completed
- [ ] PR merged to main

### Breaking Changes Deployment Notes

- Coordinate frontend/backend deployment together
- Clear browser cache after deployment (API endpoints changed)
- Run database migrations before starting new backend
- Update any external integrations using old API paths
