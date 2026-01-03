# AI Slop Cleanup Plan

This document outlines all AI-generated code patterns ("AI slop") found in the codebase that should be removed or cleaned up for consistency.

## Summary

After thorough analysis, the following categories of AI slop were identified:

1. **Module-level docstrings** - Unnecessary file-level JSDoc comments
2. **Section divider comments** - ASCII art-style separators
3. **Excessive JSDoc** - Over-documented functions with `@param`, `@returns`, `@example`
4. **Casts to `any`** - Bypassing TypeScript type safety
5. **Inconsistent comment styles** - Some files over-documented, others minimal

---

## Category 1: Module-Level Docstrings

Remove boilerplate file-level JSDoc comments that describe what the file contains. These add no value since the filename already conveys the purpose.

### Files to clean:

| File                                      | Lines             | Content to Remove                                           |
| ----------------------------------------- | ----------------- | ----------------------------------------------------------- |
| `src/hooks/tasks.ts`                      | 1-3               | `/** * Task-related React Query hooks */`                   |
| `src/hooks/projects.ts`                   | 1-3               | `/** * Project-related React Query hooks */`                |
| `src/hooks/users.ts`                      | 1-3               | `/** * User-related React Query hooks */`                   |
| `src/hooks/comments.ts`                   | 1-6               | Full module docstring block                                 |
| `src/hooks/index.ts`                      | 1-6               | `/** * Centralized exports for all React Query hooks... */` |
| `src/hooks/factories/use-crud-factory.ts` | 1-4               | `/** * Generic CRUD hook factory... */`                     |
| `src/lib/time-utils.ts`                   | 5-9, 29-34, 40-44 | JSDoc blocks on simple utility functions                    |

---

## Category 2: Section Divider Comments

Remove ASCII-art style section dividers. These are a clear AI pattern that human developers rarely use.

### Files to clean:

#### `src/hooks/project-members.ts`

Remove all lines containing:

```
// =============================================================================
// Types
// =============================================================================
```

Lines to remove: 13-15, 42-44, 50-52, 137-139, 252-254

#### `src/hooks/organization-members.ts`

Remove all lines containing:

```
// =============================================================================
// Types
// =============================================================================
```

Lines to remove: 14-16, 44-46, 65-67, 121-123, 271-273

#### `src/hooks/organization-invites.ts`

Remove all lines containing:

```
// =============================================================================
// Types
// =============================================================================
```

Lines to remove: 15-17, 66-68, 120-122, 297-299

---

## Category 3: Excessive JSDoc Comments

Remove over-documented JSDoc blocks that add no value beyond what TypeScript types already express.

### `src/hooks/project-members.ts`

**Remove `@example` JSDoc blocks:**

Lines 53-58 (useProjectMembers):

```typescript
/**
 * Fetch all members of a project
 *
 * @example
 * const { data: members, isLoading } = useProjectMembers("project-id");
 */
```

Replace with nothing (the function signature is self-explanatory)

Lines 82-84 (useProjectMember):

```typescript
/**
 * Fetch a single project member by ID
 */
```

Remove entirely

Lines 103-106 (useIsProjectMember):

```typescript
/**
 * Check if current user is a member of a project
 * Returns { isMember, isLoading } for proper loading state handling
 */
```

Remove entirely

Lines 120-123 (useMyProjectRole):

```typescript
/**
 * Get current user's role in a project
 * Returns { role, isLoading } for proper loading state handling
 */
```

Remove entirely

Lines 140-147 (useAddProjectMember):

```typescript
/**
 * Add a member to a project
 *
 * @example
 * const { mutate: addMember, isPending } = useAddProjectMember();
 * addMember({ projectId: "abc", userId: "def", role: "member" });
 */
```

Remove entirely

Lines 188-194 (useUpdateProjectMemberRole):

```typescript
/**
 * Update a project member's role
 *
 * @example
 * const { mutate: updateRole } = useUpdateProjectMemberRole();
 * updateRole({ memberId: "abc123", role: "admin" });
 */
```

Remove entirely

Lines 222-228 (useRemoveProjectMember):

```typescript
/**
 * Remove a member from a project
 *
 * @example
 * const { mutate: removeMember } = useRemoveProjectMember();
 * removeMember("member-id-123");
 */
```

Remove entirely

Lines 255-257, 261-263, 267-269, 273-275, 279-281 (selector hooks):
Remove all the single-line JSDoc comments

### `src/hooks/organization-members.ts`

Apply same treatment as project-members.ts:

- Remove all `@example` JSDoc blocks
- Remove all single-line JSDoc comments like `/** Get count of active members */`
- Lines: 69-76, 100-102, 124-131, 191-197, 218-224, 242-244, 275-277, 283-285

### `src/hooks/organization-invites.ts`

Apply same treatment:

- Remove JSDoc blocks: Lines 70-72, 99-101, 123-125, 167-169, 205-207, 250-252, 301-303, 319-321

### `src/hooks/comments.ts`

Lines 89-94, 119-123, 130-134, 141-145:
Remove all the `@param` and `@returns` JSDoc comments

### `src/lib/time-utils.ts`

Lines 5-9:

```typescript
/**
 * Formats minutes into a compact "Xh Ym" format with localized labels
 * @param minutes - Total minutes to format
 * @returns Formatted string such as "2 hours 30 minutes" with Persian digits
 */
```

Remove entirely

Lines 29-34, 40-44: Remove similar JSDoc blocks

### `src/hooks/factories/use-crud-factory.ts`

Lines 11-13:

```typescript
/**
 * Configuration for CRUD hooks
 */
```

Remove

Lines 47-51:

```typescript
/**
 * Creates standardized CRUD mutation hooks
 * @param config - Configuration object with collection, queryKeys, and invalidators
 * @returns Object with create, update, and delete mutation hooks
 */
```

Remove

### `src/hooks/use-mutation-factory.ts`

Lines 24-26:

```typescript
/**
 * Configuration for mutation factory
 */
```

Remove

Lines 32-39:

```typescript
/**
 * Creates a reusable mutation hook with automatic cache invalidation and error handling
 *
 * @param mutationFn - The async function that performs the mutation
 * @param invalidate - Function to invalidate relevant queries after mutation succeeds
 * @param config - Optional configuration for the mutation factory
 * @returns A hook that can be used in components with optional additional options
 */
```

Remove

### `src/hooks/tags.ts`

Lines 32-34, 47-49, 77-79, 90-92:
Remove single-line JSDoc comments like `/** Fetch all tags */`

### `src/store/auth-store.ts`

Lines 16-18:

```typescript
/**
 * Organization settings type for mode features
 */
```

Remove

---

## Category 4: Casts to `any`

Fix TypeScript type issues instead of casting to `any`.

### `src/hooks/organization-invites.ts`

Lines 238-241:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
pb.authStore.save(data.token, data.user as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
login(data.user as any, data.token);
```

Lines 284-288 (same pattern repeated):

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
pb.authStore.save(data.token, data.user as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
login(data.user as any, data.token);
```

**Fix:** Define proper types for the auth response or use type assertions to the correct type rather than `any`.

---

## Category 5: Backend Go Comments (Lower Priority)

The Go backend has some package-level comments that could be simplified, but Go convention actually encourages package documentation, so these are less critical:

### `backend/main.go`

Lines 1-4:

```go
// Package main implements the Anjam application using PocketBase.
// It provides a web-based interface for managing projects, tasks, and users
// with role-based access control and embedded static assets.
```

This is actually acceptable Go convention, but could be simplified to just: `// Package main is the entry point for the Anjam application.`

### `backend/hooks/tasks.go`

Line 1:

```go
// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
```

Acceptable but could be simplified.

---

## Duplicated Invalidator Pattern

### `src/hooks/subtasks.ts` and `src/hooks/time-entries.ts`

Both files have nearly identical invalidator patterns:

```typescript
invalidators: {
  create: (client) =>
    client.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey[0] === "subtasks",
    }),
  update: (client) =>
    client.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey[0] === "subtasks",
    }),
  delete: (client) =>
    client.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey[0] === "subtasks",
    }),
},
```

**Fix:** Create a shared helper function for these invalidators:

```typescript
function createPredicateInvalidators(resourceKey: string) {
  const invalidate = (client: QueryClient) =>
    client.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey[0] === resourceKey,
    });
  return { create: invalidate, update: invalidate, delete: invalidate };
}
```

---

## Implementation Order

1. **Phase 1 - Comments cleanup** (Low risk, high impact on consistency)
   - Remove all section divider comments
   - Remove module-level docstrings
   - Remove excessive JSDoc blocks

2. **Phase 2 - Type fixes** (Medium risk)
   - Fix `any` casts in organization-invites.ts

3. **Phase 3 - Code deduplication** (Lower priority)
   - Extract shared invalidator helper for subtasks/time-entries

---

## Files Affected Summary

| File                                      | Changes                                            |
| ----------------------------------------- | -------------------------------------------------- |
| `src/hooks/tasks.ts`                      | Remove lines 1-3                                   |
| `src/hooks/projects.ts`                   | Remove lines 1-3                                   |
| `src/hooks/users.ts`                      | Remove lines 1-3                                   |
| `src/hooks/comments.ts`                   | Remove lines 1-6, 89-94, 119-123, 130-134, 141-145 |
| `src/hooks/tags.ts`                       | Remove lines 32-34, 47-49, 77-79, 90-92            |
| `src/hooks/index.ts`                      | Remove lines 1-6                                   |
| `src/hooks/project-members.ts`            | Remove ~25 comment blocks                          |
| `src/hooks/organization-members.ts`       | Remove ~20 comment blocks                          |
| `src/hooks/organization-invites.ts`       | Remove ~15 comment blocks, fix 4 `any` casts       |
| `src/hooks/factories/use-crud-factory.ts` | Remove lines 1-4, 11-13, 47-51                     |
| `src/hooks/use-mutation-factory.ts`       | Remove lines 24-26, 32-39                          |
| `src/lib/time-utils.ts`                   | Remove lines 5-9, 29-34, 40-44                     |
| `src/store/auth-store.ts`                 | Remove lines 16-18                                 |
| `src/hooks/subtasks.ts`                   | Potential refactor for shared invalidator          |
| `src/hooks/time-entries.ts`               | Potential refactor for shared invalidator          |

---

## Category 6: Unnecessary Complexity & Abstractions

### 6.1 Over-abstracted Mode System

The mode system (`mode-features.ts`, `mode-labels.ts`, `mode-theme.ts`) has three separate files for a simple two-mode system (operations vs product). This could be consolidated.

**Current:**

- `src/lib/mode-features.ts` - Feature flags per mode
- `src/lib/mode-labels.ts` - UI labels per mode
- `src/lib/mode-theme.ts` - Theme classes per mode

**Simplify:**
Merge into single `src/lib/mode.ts`:

```typescript
export type OrgMode = "operations" | "product";

export const MODE_CONFIG = {
  operations: {
    features: { timeTracking: true, timesheet: true, reports: true, ... },
    labels: { home: "داشبورد", tasks: "تسک‌ها", ... },
    themeClass: "",
  },
  product: {
    features: { timeTracking: false, timesheet: false, reports: false, ... },
    labels: { home: "صندوق ورودی", tasks: "موردها", ... },
    themeClass: "product-theme",
  },
} as const;

export function getModeConfig(mode: OrgMode | null | undefined) {
  return MODE_CONFIG[mode ?? "operations"];
}
```

### 6.2 Thin Export Wrappers

**`src/hooks/subtasks.ts`** and **`src/hooks/time-entries.ts`** have thin wrappers that add no value:

```typescript
// These are just pass-through wrappers
export function useCreateSubtask() {
  return useCreateSubtaskMutation();
}

export function useUpdateSubtask() {
  return useUpdateSubtaskMutation();
}

export function useDeleteSubtask() {
  return useDeleteSubtaskMutation();
}
```

**Fix:** Export the hooks directly without wrapper functions:

```typescript
const crudHooks = createCrudHooks<SubtasksRecord, SubtasksResponse>({...});

export const {
  useCreate: useCreateSubtask,
  useUpdate: useUpdateSubtask,
  useDelete: useDeleteSubtask,
} = crudHooks;
```

### 6.3 Redundant Query Config Constants

**`src/lib/query-config.ts`** defines stale times that are mostly unused:

```typescript
export const STALE_TIMES = {
  static: 5 * 60 * 1000, // Used 0 times
  reference: 2 * 60 * 1000, // Used 0 times
  dynamic: 30 * 1000, // Used 0 times
  frequent: 10 * 1000, // Used 0 times
  realtime: 0, // Used 0 times
};
```

**Action:** Audit usage. If unused, delete. If used in 1-2 places, inline the value.

### 6.4 Notifications Utils Duplication

**`src/lib/notifications-utils.ts`** has functions that duplicate what TanStack Query hooks already do:

```typescript
export async function fetchUserNotifications(userId: string) { ... }
export async function fetchUnreadNotifications(userId: string) { ... }
export async function fetchAllNotifications(userId: string) { ... }  // Same as fetchUserNotifications!
export async function fetchReadNotifications(userId: string) { ... }
```

**Issues:**

1. `fetchAllNotifications` is identical to `fetchUserNotifications` (duplicate)
2. These are raw fetch functions that should be in hooks, not a utils file

**Fix:**

- Remove `fetchAllNotifications` (duplicate of `fetchUserNotifications`)
- Move remaining functions into `src/hooks/notifications.ts` or inline them

### 6.5 Excessive Type Re-exports

**`src/lib/reports/index.ts`** re-exports every single type and function individually (85 lines of exports). This is verbose and hard to maintain.

**Fix:** Use namespace re-exports:

```typescript
// Before: 85 lines of individual exports
export type { StatusDistributionData, PriorityDistributionData, ... } from "./types";
export { calculateStatusDistribution, ... } from "./metrics";
// ... etc

// After: 6 lines
export * from "./types";
export * from "./metrics";
export * from "./employee-aggregations";
export * from "./team-aggregations";
export * from "./workload-aggregations";
export * from "./time-calculations";
export * from "./chart-data";
export * from "./filters";
```

### 6.6 Duplicated Page Data Hooks

**`src/hooks/use-tasks-page-data.ts`** and **`src/hooks/use-project-tasks-page-data.ts`** share significant code:

Both fetch:

- Tasks with expand
- Users list

**Potential simplification:** Create a shared base hook:

```typescript
function useTasksAndUsers(options?: { projectId?: string }) {
  const tasksQuery = useTasks({
    projectId: options?.projectId,
    expandFields: "project,assignee",
    mode: "full",
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ batch: 100, sort: "-created" }),
    queryFn: () => pb.collection("users").getFullList<UsersResponse>({ ... }),
  });

  return { tasksQuery, usersQuery };
}
```

---

## Category 7: Architectural Simplifications

### 7.1 Consolidate Permission Checking

Permission checking is split between:

- `src/lib/permissions.ts` (frontend role computation)
- `src/hooks/use-permissions.ts` (API call + local fallback)
- `backend/permissions.go` (backend computation)

The frontend duplicates backend logic for "offline" fallback. This creates maintenance burden.

**Recommendation:** Trust the API. Remove frontend permission computation fallback or clearly document it as offline-only mode.

### 7.2 Simplify Auth Store Selectors

**`src/store/auth-store.ts`** has 20+ individual selector hooks:

```typescript
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthIsLoggedIn = () =>
  useAuthStore((state) => state.isAuthenticated); // Duplicate!
export const useCurrentOrganization = () =>
  useAuthStore((state) => state.currentOrganization);
// ... 15+ more
```

**Issues:**

1. `useAuthIsAuthenticated` and `useAuthIsLoggedIn` are duplicates
2. Too many small selectors that could be combined

**Fix:**

1. Remove duplicate `useAuthIsLoggedIn` (keep `useAuthIsAuthenticated`)
2. Consider grouping related selectors:

```typescript
// Group related state
export const useAuth = () =>
  useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isAuthenticated: s.isAuthenticated,
    })),
  );

export const useOrg = () =>
  useAuthStore(
    useShallow((s) => ({
      current: s.currentOrganization,
      role: s.currentOrgRole,
      mode: s.currentOrgMode,
      features: s.currentOrgFeatures,
    })),
  );
```

### 7.3 Backend Constants Indirection

**`backend/backend_constants.go`** just re-exports from `backend/config/constants.go`:

```go
package main

import "anjam/config"

const (
    CollectionUsers = config.CollectionUsers
    CollectionProjects = config.CollectionProjects
    // ... 30+ re-exports
)
```

This indirection adds no value and duplicates definitions.

**Fix:** Use `config.CollectionUsers` directly throughout `main` package, or put all constants in one place.

---

## Category 8: Code Style Inconsistencies

### 8.1 Inconsistent Hook Return Types

Some hooks return objects with explicit types, others rely on inference:

```typescript
// Explicit return type (project-members.ts)
export function useProjectMembers(projectId: string): UseProjectMembersResult { ... }

// Inferred return type (most hooks)
export function useTasks(options?: TasksOptions) { ... }
```

**Recommendation:** Choose one style and apply consistently. Prefer inference for simple hooks, explicit for complex ones.

### 8.2 Inconsistent Error Handling

Some hooks use `handlePocketBaseError`, others use `toast.error` directly, others do neither:

```typescript
// Pattern 1: Using error handler
} catch (error: unknown) {
  handlePocketBaseError(error as Error);
}

// Pattern 2: Direct toast
} catch (error) {
  toast.error("Failed to load");
}

// Pattern 3: Let React Query handle it
// (no try/catch, just throw)
```

**Recommendation:** Standardize on React Query's built-in error handling + `handlePocketBaseError` in mutation `onError` callbacks.

---

## Implementation Order (Updated)

### Phase 1 - Comments cleanup (Low risk)

- Remove all section divider comments
- Remove module-level docstrings
- Remove excessive JSDoc blocks
- **Estimated time: 1-2 hours**

### Phase 2 - Type fixes (Medium risk)

- Fix `any` casts in organization-invites.ts
- **Estimated time: 30 minutes**

### Phase 3 - Remove thin wrappers (Low risk)

- Simplify subtasks.ts and time-entries.ts exports
- Remove duplicate auth store selector
- **Estimated time: 30 minutes**

### Phase 4 - Consolidate modules (Medium risk)

- Merge mode-features/labels/theme into single file
- Simplify reports/index.ts re-exports
- Remove notifications-utils duplicates
- **Estimated time: 1-2 hours**

### Phase 5 - Backend cleanup (Low risk)

- Simplify backend_constants.go indirection
- **Estimated time: 30 minutes**

### Phase 6 - Architectural improvements (Higher risk, optional)

- Consolidate permission system
- Simplify auth store selectors
- **Estimated time: 2-3 hours**

---

## Files Affected Summary (Updated)

| File                                      | Changes                                           |
| ----------------------------------------- | ------------------------------------------------- |
| `src/hooks/tasks.ts`                      | Remove module docstring                           |
| `src/hooks/projects.ts`                   | Remove module docstring                           |
| `src/hooks/users.ts`                      | Remove module docstring                           |
| `src/hooks/comments.ts`                   | Remove docstrings, JSDoc blocks                   |
| `src/hooks/tags.ts`                       | Remove JSDoc comments                             |
| `src/hooks/index.ts`                      | Remove module docstring                           |
| `src/hooks/project-members.ts`            | Remove ~25 comment blocks                         |
| `src/hooks/organization-members.ts`       | Remove ~20 comment blocks                         |
| `src/hooks/organization-invites.ts`       | Remove comments, fix 4 `any` casts                |
| `src/hooks/factories/use-crud-factory.ts` | Remove JSDoc blocks                               |
| `src/hooks/use-mutation-factory.ts`       | Remove JSDoc blocks                               |
| `src/hooks/subtasks.ts`                   | Simplify exports, extract invalidator helper      |
| `src/hooks/time-entries.ts`               | Simplify exports, use shared invalidator          |
| `src/lib/time-utils.ts`                   | Remove JSDoc blocks                               |
| `src/lib/mode-features.ts`                | **Merge** into `mode.ts`                          |
| `src/lib/mode-labels.ts`                  | **Delete** - merge into `mode.ts`                 |
| `src/lib/mode-theme.ts`                   | **Delete** - merge into `mode.ts`                 |
| `src/lib/notifications-utils.ts`          | Remove duplicate function, consider consolidation |
| `src/lib/reports/index.ts`                | Simplify to `export *` pattern                    |
| `src/lib/query-config.ts`                 | Audit usage, possibly delete unused constants     |
| `src/store/auth-store.ts`                 | Remove JSDoc, remove duplicate selector           |
| `backend/backend_constants.go`            | Remove indirection, use config directly           |

---

## Category 9: File-Level ESLint Disables

Multiple files disable TypeScript's `no-explicit-any` rule at the file level. This is a sign of type issues that should be fixed properly.

### Report Components with `any` Types

| File                                                     | Issue                                    |
| -------------------------------------------------------- | ---------------------------------------- |
| `src/components/reports/workload-distribution-chart.tsx` | File-level `eslint-disable`              |
| `src/components/reports/employee-productivity-chart.tsx` | File-level `eslint-disable`              |
| `src/components/reports/employee-comparison-chart.tsx`   | File-level `eslint-disable`              |
| `src/components/reports/timeliness-donut.tsx`            | File-level `eslint-disable`              |
| `src/components/reports/productivity-trends-chart.tsx`   | File-level `eslint-disable`              |
| `src/components/reports/overtime-analysis-chart.tsx`     | File-level `eslint-disable`              |
| `src/components/reports/throughput-chart.tsx`            | File-level `eslint-disable`              |
| `src/components/reports/priority-distribution.tsx`       | File-level `eslint-disable`              |
| `src/components/settings/preferences-section.tsx`        | File-level `eslint-disable`, `icon: any` |

**Root cause:** These files use Recharts library which has poor TypeScript support for custom formatters/renderers.

**Fix options:**

1. Create typed wrapper components for Recharts
2. Use proper type assertions instead of `any`
3. Create local type definitions for Recharts callbacks

### Example fix for chart formatter:

```typescript
// Before (uses any)
formatter={(value: any, name: any, props: any) => { ... }}

// After (properly typed)
type TooltipPayload = {
  value: number;
  name: string;
  payload: { workloadLevel: WorkloadLevel };
};
formatter={(value, name, props) => {
  const { payload } = props as TooltipPayload;
  // ...
}}
```

---

## Category 10: Type Duplication

### `src/lib/reports-utils.ts` duplicates types from `src/lib/reports/types.ts`

Both files define:

- `StatusDistributionData`
- `PriorityDistributionData`
- `CompletionTrendData`
- `UserPerformanceData`
- `TaskStatsData`

**Fix:** Delete duplicates from `reports-utils.ts`, import from `reports/types.ts` instead.

---

## Category 11: Miscellaneous Issues

### 11.1 Dead `console.warn` in CRUD Factory

**`src/hooks/factories/use-crud-factory.ts:165, 208`** has warning logs that should use the logger:

```typescript
console.warn(`Bulk update failed for ID ${id}:`, error.message);
```

**Fix:** Use `logWarn` from `@/lib/logger` for consistency.

### 11.2 Preferences Section Icon Type

**`src/components/settings/preferences-section.tsx:89`:**

```typescript
function SectionHeader({ icon: Icon, ... }: { icon: any; ... }) {
```

**Fix:** Use proper Tabler icon type:

```typescript
import type { Icon } from "@tabler/icons-react";
function SectionHeader({ icon: Icon, ... }: { icon: Icon; ... }) {
```

### 11.3 Unused eslint-disable for react-hooks rules

Several files have `eslint-disable` for React hooks rules that may indicate actual issues:

| File                                   | Rule Disabled                                                    |
| -------------------------------------- | ---------------------------------------------------------------- |
| `src/pages/task-details.tsx`           | `react-hooks/set-state-in-effect`                                |
| `src/pages/tasks.tsx`                  | `react-hooks/set-state-in-effect`, `preserve-manual-memoization` |
| `src/components/task/subtasks.tsx`     | `react-hooks/set-state-in-effect`                                |
| `src/hooks/use-theme.ts`               | `react-hooks/set-state-in-effect`                                |
| `src/hooks/use-saved-filters.ts`       | `react-hooks/set-state-in-effect`                                |
| `src/hooks/use-keyboard-shortcuts.tsx` | `react-hooks/exhaustive-deps`                                    |

**Review:** These may indicate actual hook issues that should be fixed, or legitimate exceptions that need comments explaining why.

---

## Updated Implementation Order

### Phase 1 - Comments cleanup (Low risk)

- Remove all section divider comments
- Remove module-level docstrings
- Remove excessive JSDoc blocks
- **Estimated time: 1-2 hours**

### Phase 2 - Type fixes (Medium risk)

- Fix `any` casts in organization-invites.ts (4 instances)
- Fix `icon: any` in preferences-section.tsx
- Fix report chart formatters (8 files)
- Remove type duplications in reports-utils.ts
- **Estimated time: 2-3 hours**

### Phase 3 - Remove thin wrappers (Low risk)

- Simplify subtasks.ts and time-entries.ts exports
- Remove duplicate auth store selector
- Replace console.warn with logger in crud-factory
- **Estimated time: 30 minutes**

### Phase 4 - Consolidate modules (Medium risk)

- Merge mode-features/labels/theme into single file
- Simplify reports/index.ts re-exports
- Remove notifications-utils duplicates
- **Estimated time: 1-2 hours**

### Phase 5 - Backend cleanup (Low risk)

- Simplify backend_constants.go indirection
- **Estimated time: 30 minutes**

### Phase 6 - React hooks audit (Medium risk)

- Review all `eslint-disable` for react-hooks rules
- Fix or document legitimate exceptions
- **Estimated time: 1-2 hours**

### Phase 7 - Architectural improvements (Higher risk, optional)

- Consolidate permission system
- Simplify auth store selectors
- **Estimated time: 2-3 hours**

---

## Files Affected Summary (Final)

| File                                                     | Changes                                          |
| -------------------------------------------------------- | ------------------------------------------------ |
| `src/hooks/tasks.ts`                                     | Remove module docstring                          |
| `src/hooks/projects.ts`                                  | Remove module docstring                          |
| `src/hooks/users.ts`                                     | Remove module docstring                          |
| `src/hooks/comments.ts`                                  | Remove docstrings, JSDoc blocks                  |
| `src/hooks/tags.ts`                                      | Remove JSDoc comments                            |
| `src/hooks/index.ts`                                     | Remove module docstring                          |
| `src/hooks/project-members.ts`                           | Remove ~25 comment blocks                        |
| `src/hooks/organization-members.ts`                      | Remove ~20 comment blocks                        |
| `src/hooks/organization-invites.ts`                      | Remove comments, fix 4 `any` casts               |
| `src/hooks/factories/use-crud-factory.ts`                | Remove JSDoc, use logger instead of console.warn |
| `src/hooks/use-mutation-factory.ts`                      | Remove JSDoc blocks                              |
| `src/hooks/subtasks.ts`                                  | Simplify exports, extract invalidator helper     |
| `src/hooks/time-entries.ts`                              | Simplify exports, use shared invalidator         |
| `src/lib/time-utils.ts`                                  | Remove JSDoc blocks                              |
| `src/lib/mode-features.ts`                               | **Merge** into `mode.ts`                         |
| `src/lib/mode-labels.ts`                                 | **Delete** - merge into `mode.ts`                |
| `src/lib/mode-theme.ts`                                  | **Delete** - merge into `mode.ts`                |
| `src/lib/notifications-utils.ts`                         | Remove duplicate function                        |
| `src/lib/reports/index.ts`                               | Simplify to `export *` pattern                   |
| `src/lib/reports-utils.ts`                               | Remove duplicate types, import from reports/     |
| `src/lib/query-config.ts`                                | Audit usage, possibly delete                     |
| `src/store/auth-store.ts`                                | Remove JSDoc, remove duplicate selector          |
| `src/components/settings/preferences-section.tsx`        | Fix `icon: any` type                             |
| `src/components/reports/workload-distribution-chart.tsx` | Fix any types                                    |
| `src/components/reports/employee-productivity-chart.tsx` | Fix any types                                    |
| `src/components/reports/employee-comparison-chart.tsx`   | Fix any types                                    |
| `src/components/reports/timeliness-donut.tsx`            | Fix any types                                    |
| `src/components/reports/productivity-trends-chart.tsx`   | Fix any types                                    |
| `src/components/reports/overtime-analysis-chart.tsx`     | Fix any types                                    |
| `src/components/reports/throughput-chart.tsx`            | Fix any types                                    |
| `src/components/reports/priority-distribution.tsx`       | Fix any types                                    |
| `backend/backend_constants.go`                           | Remove indirection, use config directly          |

---

## Estimated Impact (Final)

- **Lines to remove:** ~300-400 lines
- **Files to delete:** 2 (mode-labels.ts, mode-theme.ts after merge)
- **Files to modify:** 30+
- **Type safety improvements:** 12+ files with `any` removal
- **Risk level:** Low to Medium
- **Consistency improvement:** High
- **Maintainability improvement:** High
