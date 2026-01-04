# Comprehensive AI Slop Cleanup Plan

This document consolidates findings from 5 AI-generated cleanup plans (GPT, OPUS, FLASH, GLM, M2) to create a comprehensive, prioritized cleanup strategy for the Anjam codebase.

## Executive Summary

**Total findings across all plans**: 150+ items
**High priority issues**: 45+ (type safety, excessive defensive code, major abstractions)
**Medium priority issues**: 70+ (comments, duplicated patterns, style inconsistencies)
**Low priority issues**: 35+ (minor optimizations, refactoring leftovers)

**Estimated impact**: 500-800 lines of code removal, improved type safety, better maintainability.

---

## Priority 1: Critical Type Safety Issues (High Risk, High Reward)

### 1.1 Fix All `as any` Type Assertions

**Files affected**: 12+ files with type workarounds

| File                                              | Issue                                         | Fix                                            |
| ------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `src/hooks/organization-invites.ts`               | 4 instances of `data.user as any`             | Use proper `UsersResponse` type                |
| `src/components/task/time-entry-dialog.tsx`       | File-level eslint-disable + `as any` resolver | Remove disable, fix Zod resolver types         |
| `src/hooks/factories/use-crud-factory.ts`         | 6+ instances of `as unknown as TResponse`     | Use proper generic constraints                 |
| `src/components/settings/preferences-section.tsx` | `icon: any`                                   | Import proper `Icon` type from Tabler          |
| **Report Components** (9 files)                   | File-level eslint-disable for Recharts        | Create typed wrapper or proper type assertions |

### 1.2 Remove Excessive ESLint Disables

**Files affected**: 10+ files with blanket disables

| File                                        | Disabled Rule                                                    | Action                        |
| ------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| `src/components/task/time-entry-dialog.tsx` | `no-explicit-any`                                                | Remove after fixing types     |
| `src/pages/task-details.tsx`                | `react-hooks/set-state-in-effect`                                | Fix root cause or add comment |
| `src/pages/tasks.tsx`                       | `react-hooks/set-state-in-effect`, `preserve-manual-memoization` | Fix root cause                |
| `src/components/task/subtasks.tsx`          | `react-hooks/set-state-in-effect`                                | Fix root cause                |
| `src/hooks/use-theme.ts`                    | `react-hooks/set-state-in-effect`                                | Fix root cause                |
| `src/hooks/use-saved-filters.ts`            | `react-hooks/set-state-in-effect`                                | Fix root cause                |
| `src/hooks/use-keyboard-shortcuts.tsx`      | `react-hooks/exhaustive-deps`                                    | Fix root cause                |

---

## Priority 2: Remove Excessive Defensive Code (High Risk, Medium Reward)

### 2.1 Eliminate Unnecessary Try/Catch Blocks

**Files affected**: 8+ files with over-defensive error handling

| File                               | Issue                                    | Action                          |
| ---------------------------------- | ---------------------------------------- | ------------------------------- |
| `src/components/scroll-to-top.tsx` | Try/catch around DOM scroll              | Remove entirely                 |
| `src/lib/pocketbase.ts`            | Try/catch in beforeSend for localStorage | Keep but remove verbose comment |
| `src/hooks/use-saved-filters.ts`   | Try/catch for localStorage parsing       | Remove - let it fail            |
| `src/lib/audit-log-service.ts`     | Nested try/catch with fallbacks          | Simplify type checking          |
| `src/components/task/subtasks.tsx` | Silent .catch() on persistOrder          | Review - may be legitimate      |

### 2.2 Remove Redundant State Management

**Files affected**: Settings and project components

| File                                                   | Issue                        | Action                             |
| ------------------------------------------------------ | ---------------------------- | ---------------------------------- |
| `src/components/settings/preferences-section.tsx`      | Manual isSaving + try/catch  | Use mutation.isPending             |
| `src/components/settings/profile-section.tsx`          | Same pattern                 | Use mutation.isPending             |
| `src/components/settings/security-section.tsx`         | Same pattern                 | Use mutation.isPending             |
| `src/components/project/project-statuses-settings.tsx` | Repetitive state + try/catch | Consolidate state, use React Query |

---

## Priority 3: Clean Up Comments and Documentation (Low Risk, High Reward)

### 3.1 Remove Module-Level Docstrings

**Files affected**: 15+ hook files

Remove boilerplate file headers:

- `src/hooks/tasks.ts`, `projects.ts`, `users.ts`, `comments.ts`
- `src/hooks/index.ts`, `use-mutation-factory.ts`
- `src/hooks/factories/use-crud-factory.ts`

### 3.2 Remove Section Divider Comments

**Files affected**: Member management hooks

Remove ASCII art dividers from:

- `src/hooks/project-members.ts` (25+ comment blocks)
- `src/hooks/organization-members.ts` (20+ comment blocks)
- `src/hooks/organization-invites.ts` (15+ comment blocks)

### 3.3 Remove Excessive JSDoc Blocks

**Files affected**: 20+ files with verbose documentation

Remove `@example`, `@param`, `@returns` blocks that restate obvious types:

- All hooks in `project-members.ts`, `organization-members.ts`, `organization-invites.ts`
- `src/lib/time-utils.ts`, `src/lib/excel-export.ts`
- `src/lib/query-config.ts`, `src/hooks/audit-logs.ts`
- `backend/notifications/builder.go`

### 3.4 Remove Verbose Inline Comments

**Files affected**: Various utility files

| File                                 | Comment Type                              | Action               |
| ------------------------------------ | ----------------------------------------- | -------------------- |
| `src/lib/pocketbase.ts`              | Multi-line baseUrl explanation with emoji | Simplify to one line |
| `src/components/page-transition.tsx` | Verbose animation explanation             | Remove or simplify   |
| `src/pages/inbox.tsx`                | TODO comment                              | Implement or remove  |
| `src/lib/mode-features.ts`           | Module header                             | Remove               |
| `src/lib/audit-log-service.ts`       | File header                               | Remove               |

---

## Priority 4: Eliminate Thin Wrappers and Useless Abstractions

### 4.1 Delete Thin Service Wrappers

**Files to delete entirely**:

- `src/lib/search-service.ts` (40 lines, zero value-add)
- `src/lib/permissions-service.ts` (45 lines, just URL params)

**Inline replacements**:

```typescript
// Instead of searchService.search(query)
pb.send<SearchResponse>("/api/v1/search", { params: { q: query } });

// Instead of permissionsService.getPermissions(orgId, projectId)
const params = new URLSearchParams({ organization_id: orgId });
if (projectId) params.set("project_id", projectId);
pb.send<PermissionsResponse>(`/api/v1/permissions?${params}`);
```

### 4.2 Remove Redundant Functions

**Files affected**: pocketbase.ts, mode-features.ts

| File                       | Function                 | Action                                                   |
| -------------------------- | ------------------------ | -------------------------------------------------------- |
| `src/lib/pocketbase.ts`    | `customApiCall<T>()`     | Delete, use `pb.send()` directly                         |
| `src/lib/mode-features.ts` | `getDefaultTaskStatus()` | Replace with `export const DEFAULT_TASK_STATUS = "todo"` |

### 4.3 Simplify Hook Exports

**Files affected**: subtasks.ts, time-entries.ts

Replace thin wrapper functions:

```typescript
// Before
export function useCreateSubtask() {
  return useCreateSubtaskMutation();
}

// After
const crudHooks = createCrudHooks<SubtasksRecord>({...});
export const { useCreate: useCreateSubtask, useUpdate: useUpdateSubtask, useDelete: useDeleteSubtask } = crudHooks;
```

---

## Priority 5: Consolidate Duplicated Code

### 5.1 Merge Date Formatting Functions

**File**: `src/lib/date-utils.ts`

**Current**: 5 nearly identical functions with repeated null/NaN checks

**Action**: Create shared helper:

```typescript
function formatDate(
  dateStr: string | null | undefined,
  pattern: string,
): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, pattern));
}

export const formatTaskDate = (d: string | null | undefined) =>
  formatDate(d, "dd MMMM yyyy");
export const formatDateShort = (d: string | null | undefined) =>
  formatDate(d, "dd MMMM");
// ... etc
```

### 5.2 Merge Mode-Related Files

**Files to merge**: `mode-features.ts`, `mode-labels.ts`, `mode-theme.ts` → `mode.ts`

**Result**:

```typescript
export const MODE_CONFIG = {
  operations: { features: {...}, labels: {...}, themeClass: "" },
  product: { features: {...}, labels: {...}, themeClass: "product-theme" }
} as const;
```

### 5.3 Remove Duplicate Types

**File**: `src/lib/reports-utils.ts` duplicates types from `src/lib/reports/types.ts`

**Action**: Remove duplicates, import from central location.

### 5.4 Simplify Reports Index Exports

**File**: `src/lib/reports/index.ts`

**Current**: 85 lines of individual exports
**Action**: Replace with `export *` pattern (6 lines)

---

## Priority 6: Simplify Over-Engineered Systems

### 6.1 Query Invalidation System

**File**: `src/lib/query-invalidators.ts` (166 lines)

**Issue**: Complex hierarchy of invalidator functions
**Action**: Replace with direct `invalidateQueries` calls in hooks

### 6.2 Mutation Factory Complexity

**File**: `src/hooks/use-mutation-factory.ts`

**Issue**: Complex type duplication, unnecessary parameters
**Action**: Align with TanStack Query signatures, remove `void context` no-ops

### 6.3 CRUD Factory Evaluation

**File**: `src/hooks/factories/use-crud-factory.ts` (228 lines)

**Issue**: Complex generics, type assertions, unused complexity
**Action**: Evaluate usage - may need to delete or significantly simplify

### 6.4 Query Keys Factory

**File**: `src/hooks/query-keys.ts`

**Issue**: Over-engineered factory functions for simple objects
**Action**: Replace with plain object literals

---

## Priority 7: Clean Up Backend Code

### 7.1 Remove Self-Explanatory Comments

**File**: `backend/notifications/builder.go`

Remove comments like:

```go
// User sets the user for the notification.
func (b *Builder) User(userID string) *Builder
```

### 7.2 Simplify Constants Indirection

**File**: `backend/backend_constants.go`

**Issue**: Just re-exports from `config/constants.go`
**Action**: Use `config.CollectionUsers` directly throughout

---

## Priority 8: Minor Consistency Fixes

### 8.1 Standardize Logging

**File**: `src/hooks/factories/use-crud-factory.ts`

Replace `console.warn` with `logWarn` from logger utility.

### 8.2 Remove Duplicate Auth Store Selectors

**File**: `src/store/auth-store.ts`

Remove duplicate `useAuthIsLoggedIn` (keep `useAuthIsAuthenticated`).

### 8.3 Fix Type Casts in Error Handler

**File**: `src/lib/error-handler.ts`

Remove redundant `as PocketBaseError` cast when `isPocketBaseError` already narrows.

### 8.4 Remove Branded Console Logs

**File**: `src/main.tsx`

Replace `[Anjam]` prefixed logs with proper logging utility.

---

## Priority 9: Remove Refactoring Leftovers

### 9.1 Delete Status Utility Comments

**Files**: `src/lib/status-priority.ts`, `src/lib/status-icons.ts`

Remove "Extracted from status-utils.ts" comments.

### 9.2 Clean Up Notifications Utils

**File**: `src/lib/notifications-utils.ts`

Remove duplicate `fetchAllNotifications` function.

---

## Implementation Phases

### Phase 1: Type Safety (Week 1)

- Fix all `as any` assertions
- Remove eslint disables
- Fix report component types

### Phase 2: Defensive Code Cleanup (Week 1)

- Remove unnecessary try/catch
- Simplify state management in components
- Use React Query patterns consistently

### Phase 3: Comment Cleanup (Week 2)

- Remove module docstrings
- Remove section dividers
- Remove excessive JSDoc
- Remove verbose inline comments

### Phase 4: Abstraction Simplification (Week 2)

- Delete thin wrapper services
- Simplify hook exports
- Merge related files
- Remove duplicate code

### Phase 5: System Simplification (Week 3)

- Simplify query invalidation
- Evaluate/refactor mutation factory
- Simplify query keys
- Clean up backend comments

### Phase 6: Final Polish (Week 3)

- Minor consistency fixes
- Remove refactoring artifacts
- Final testing and validation

---

## Success Metrics

- **Lines removed**: 500-800
- **Type safety**: 12+ files with `any` removal
- **Files deleted**: 4-6 (wrappers, duplicates)
- **Files merged**: 2-3 (mode files, reports exports)
- **Test coverage**: Maintain or improve
- **Build time**: No regression

---

## Risk Assessment

| Risk                                      | Mitigation                                               |
| ----------------------------------------- | -------------------------------------------------------- |
| **Type errors after `any` removal**       | Fix types properly, use union types or proper assertions |
| **Runtime errors from removed try/catch** | Only remove truly unnecessary defensive code             |
| **Functionality regression**              | Comprehensive testing after each phase                   |
| **Merge conflicts**                       | Implement in small, focused commits                      |

---

## Validation Checklist

After each phase:

- [ ] `bun run check` passes (types + lint)
- [ ] `bun run test:run` passes
- [ ] Manual testing of affected features
- [ ] No new console errors/warnings

After all phases:

- [ ] `bun run test:coverage` maintains threshold
- [ ] Performance not degraded
- [ ] Bundle size not increased
- [ ] Code review for consistency

---

## Files Requiring Changes (Complete List)

| File                                                   | Priority | Changes                          |
| ------------------------------------------------------ | -------- | -------------------------------- |
| `src/hooks/organization-invites.ts`                    | 1        | Fix 4 `any` casts                |
| `src/components/task/time-entry-dialog.tsx`            | 1        | Remove eslint-disable, fix types |
| `src/hooks/factories/use-crud-factory.ts`              | 1        | Fix 6+ type assertions           |
| `src/components/settings/preferences-section.tsx`      | 1        | Fix `icon: any`                  |
| **9 Report Components**                                | 1        | Fix Recharts formatter types     |
| `src/components/scroll-to-top.tsx`                     | 2        | Remove try/catch                 |
| `src/hooks/use-saved-filters.ts`                       | 2        | Remove try/catch                 |
| `src/components/settings/*.tsx`                        | 2        | Simplify state management        |
| `src/components/project/project-statuses-settings.tsx` | 2        | Consolidate state                |
| `src/hooks/tasks.ts`                                   | 3        | Remove module docstring          |
| `src/hooks/projects.ts`                                | 3        | Remove module docstring          |
| `src/hooks/users.ts`                                   | 3        | Remove module docstring          |
| `src/hooks/comments.ts`                                | 3        | Remove docstrings                |
| `src/hooks/project-members.ts`                         | 3        | Remove 25+ comment blocks        |
| `src/hooks/organization-members.ts`                    | 3        | Remove 20+ comment blocks        |
| `src/hooks/organization-invites.ts`                    | 3        | Remove 15+ comment blocks        |
| `src/lib/time-utils.ts`                                | 3        | Remove JSDoc blocks              |
| `src/lib/excel-export.ts`                              | 3        | Remove verbose JSDoc             |
| `src/lib/pocketbase.ts`                                | 3        | Simplify baseUrl comment         |
| `src/lib/search-service.ts`                            | 4        | **DELETE**                       |
| `src/lib/permissions-service.ts`                       | 4        | **DELETE**                       |
| `src/lib/pocketbase.ts`                                | 4        | Remove `customApiCall`           |
| `src/hooks/subtasks.ts`                                | 4        | Simplify exports                 |
| `src/hooks/time-entries.ts`                            | 4        | Simplify exports                 |
| `src/lib/date-utils.ts`                                | 5        | Consolidate functions            |
| `src/lib/mode-features.ts`                             | 5        | **MERGE** into `mode.ts`         |
| `src/lib/mode-labels.ts`                               | 5        | **DELETE** (merge)               |
| `src/lib/mode-theme.ts`                                | 5        | **DELETE** (merge)               |
| `src/lib/reports-utils.ts`                             | 5        | Remove duplicate types           |
| `src/lib/reports/index.ts`                             | 5        | Simplify exports                 |
| `src/lib/query-invalidators.ts`                        | 6        | Simplify                         |
| `src/hooks/use-mutation-factory.ts`                    | 6        | Simplify types                   |
| `src/hooks/factories/use-crud-factory.ts`              | 6        | Evaluate/delete                  |
| `src/hooks/query-keys.ts`                              | 6        | Replace factories with objects   |
| `backend/notifications/builder.go`                     | 7        | Remove self-explanatory comments |
| `backend/backend_constants.go`                         | 7        | Remove indirection               |
| `src/store/auth-store.ts`                              | 8        | Remove duplicate selector        |
| `src/lib/error-handler.ts`                             | 8        | Remove redundant cast            |
| `src/main.tsx`                                         | 8        | Replace branded logs             |
| `src/lib/status-priority.ts`                           | 9        | Remove refactoring comment       |
| `src/lib/status-icons.ts`                              | 9        | Remove refactoring comment       |
| `src/lib/notifications-utils.ts`                       | 9        | Remove duplicate function        |

---

## Prevention Guidelines

To avoid future AI slop accumulation:

1. **Code Review Checklist**:
   - [ ] No `as any` without explanation
   - [ ] No excessive JSDoc for obvious functions
   - [ ] No try/catch around non-throwing operations
   - [ ] No thin wrapper functions
   - [ ] No duplicate code patterns

2. **AI Usage Guidelines**:
   - Always review AI-generated code before committing
   - Prefer human-written patterns from existing codebase
   - Test AI suggestions thoroughly
   - Document any AI-generated code with clear attribution

3. **Maintenance**:
   - Run this cleanup quarterly
   - Monitor for new AI slop patterns
   - Update guidelines based on lessons learned
