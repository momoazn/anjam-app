# AI Slop Cleanup Plan

This document outlines the code quality issues found in the codebase that resemble AI-generated patterns (excessive comments, thin wrappers, over-abstraction, etc.) and the plan to remove them.

---

## 1. Thin Wrapper Services (Delete Entirely)

### Files to Delete

| File                             | Issue                                                |
| -------------------------------- | ---------------------------------------------------- |
| `src/lib/search-service.ts`      | 40 lines, just wraps `pb.send()` with zero value-add |
| `src/lib/permissions-service.ts` | 45 lines, just wraps `pb.send()` with URL params     |

**Action:** Delete both files and inline the simple calls where used.

**Replace `search()` usages with:**

```typescript
pb.send<SearchResponse>("/api/v1/search", { params: { q: query } });
```

**Replace `getPermissions()` usages with:**

```typescript
const params = new URLSearchParams({ organization_id: orgId });
if (projectId) params.set("project_id", projectId);
pb.send<PermissionsResponse>(`/api/v1/permissions?${params}`);
```

---

## 2. Redundant Function in pocketbase.ts

**File:** `src/lib/pocketbase.ts:49-54`

```typescript
export async function customApiCall<TResponse>(
  path: string,
  options?: Parameters<typeof pb.send>[1],
) {
  return pb.send<TResponse>(path, options ?? {});
}
```

**Action:** Delete `customApiCall` function and call `pb.send()` directly everywhere.

---

## 3. Excessive Comments (Remove)

### 3.1 src/lib/query-config.ts

**Current (15 lines of JSDoc for simple constants):**

```typescript
/**
 * Centralized Query Configuration
 *
 * Provides consistent staleTime and other query options across the application.
 * Adjust these values based on data volatility and user experience requirements.
 */

/**
 * Stale time presets for different data types
 * - static: Rarely changing data (organization settings, user profiles)
 * - dynamic: Frequently changing data (tasks, comments)
 * ...
 */
```

**Action:** Replace with simple comment:

```typescript
// Cache durations in ms
export const STALE_TIMES = {
  static: 5 * 60 * 1000,
  reference: 2 * 60 * 1000,
  dynamic: 30 * 1000,
  frequent: 10 * 1000,
  realtime: 0,
} as const;
```

### 3.2 src/lib/status-priority.ts

**Remove line 4-5:**

```typescript
/**
 * Task priority utilities
 *
 * Extracted from status-utils.ts as part of Priority 5 refactoring
 */
```

### 3.3 src/lib/status-icons.ts

**Remove line 4-5:**

```typescript
/**
 * Task status icons mapping
 *
 * Extracted from status-utils.ts as part of Priority 5 refactoring
 */
```

### 3.4 src/hooks/query-keys.ts

**Remove comments:**

- Line 1-3: File header comment
- Line 7-8: "Factory function to create query keys for a resource"
- Line 18-19: "Helper to create list query keys..."

### 3.5 backend/notifications/builder.go

**Remove self-explanatory comments (lines 26-55):**

```go
// User sets the user for the notification.
func (b *Builder) User(userID string) *Builder {
// Type sets the type of the notification.
func (b *Builder) Type(notificationType string) *Builder {
// Title sets the title of the notification.
func (b *Builder) Title(title string) *Builder {
// Message sets the message of the notification.
func (b *Builder) Message(message string) *Builder {
// Data sets the data of the notification.
func (b *Builder) Data(data map[string]interface{}) *Builder {
```

These add no value since the function names already describe what they do.

---

## 4. Unnecessary try/catch with Silent Failures

### 4.1 src/lib/pocketbase.ts (lines 31-44)

```typescript
pb.beforeSend = function (_url, options) {
  try {
    const storage = localStorage.getItem("anjam-auth-storage");
    if (storage) {
      const parsed = JSON.parse(storage);
      const orgId = parsed?.state?.currentOrganization?.id;
      if (orgId && options.headers) {
        options.headers["X-Organization-ID"] = orgId;
      }
    }
  } catch {
    // Silently fail - not critical if header missing
  }
  return options;
};
```

**Action:** Remove try/catch - let it fail if JSON is corrupt (that's a real bug we'd want to know about).

### 4.2 src/hooks/use-saved-filters.ts (lines 31-43)

```typescript
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  const defaultId = localStorage.getItem(DEFAULT_FILTER_KEY);
  if (stored) {
    const filters = JSON.parse(stored) as SavedFilter[];
    setSavedFilters(filters);
  }
  setDefaultFilterId(defaultId);
} catch {
  // Silently fail - filters will just be empty
}
```

**Action:** Remove try/catch. If localStorage is corrupted, we should know.

### 4.3 src/components/task/subtasks.tsx (line 237)

```typescript
persistOrder(nextOrder).catch(() => {
  toast.error(tasks.details.subtasks.orderUpdateError);
});
```

**Action:** Keep this one - it's intentional error handling for a user action. But verify other silent catches in the file.

---

## 5. Duplicate Code in date-utils.ts

**File:** `src/lib/date-utils.ts`

**Pattern repeated 5 times:**

```typescript
export function formatTaskDate(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "dd MMMM yyyy"));
}

export function formatDateShort(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "dd MMMM"));
}
// ... 3 more nearly identical functions
```

**Action:** Create a helper and simplify:

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
export const formatDateISO = (d: string | null | undefined) =>
  formatDate(d, "yyyy/MM/dd");
export const formatDateLocale = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// formatDateTime needs special handling for time
```

---

## 6. Over-Engineered Abstractions

### 6.1 src/lib/query-invalidators.ts

**Issues:**

- 166 lines for query invalidation
- Multiple nested structures (`collectionInvalidators`, `detailInvalidators`, `compositeInvalidators`, `mutationInvalidators`)
- `createInvalidator` function that's never used

**Action:** Simplify - use query keys directly with inline `invalidateQueries` calls in hooks. The abstraction layer adds complexity without enough value.

### 6.2 src/hooks/factories/use-crud-factory.ts

**Issues:**

- 228 lines
- Complex generic types
- `createBulkOperations` with extensive error handling that duplicates business logic
- Type assertions throughout

**Action:** Evaluate if used. If not used by key hooks, delete entire file. If partially used, extract just what's needed.

---

## 7. Type Assertions (as any, as unknown as X)

### 7.1 src/lib/error-handler.ts:43

```typescript
const pbError = error as PocketBaseError;
```

**Action:** Since `isPocketBaseError` already narrows the type, this cast is redundant:

```typescript
// Remove the cast, use `error` directly since it's already typed as PocketBaseError
const statusCode = error?.status ?? error?.response?.status;
```

### 7.2 Multiple files have patterns like:

```typescript
result as unknown as TResponse;
data as unknown as TCreateData;
```

**Action:** These are in factory/generic code. Acceptable in TypeScript when working with PocketBase SDK, but review each case.

---

## 8. Refactoring Leftovers (Remove)

### status-priority.ts and status-icons.ts

Lines 1-5 in both files have "Extracted from status-utils.ts" comments that serve no purpose.

**Action:** Remove the entire header comment block (lines 1-5 in both files).

---

## 9. Unused/Unnecessary Code

### 9.1 router.tsx:54-57

```typescript
React.lazy(() =>
  importFn().catch(() => ({
    default: () => <PageLoadError message={errorMessage} />,
  })),
);
```

**Issue:** The `.catch()` swallows all errors. If the import fails for any reason (including network), user sees a generic error.

**Action:** Consider removing the catch and letting the error boundary handle it, or log the error.

---

## Priority Order

| Priority | Task                         | Files                                                           |
| -------- | ---------------------------- | --------------------------------------------------------------- |
| 1        | Delete thin wrappers         | `search-service.ts`, `permissions-service.ts`                   |
| 2        | Remove redundant function    | `customApiCall` in `pocketbase.ts`                              |
| 3        | Simplify date-utils          | `date-utils.ts`                                                 |
| 4        | Remove excessive comments    | `query-config.ts`, `status-*.ts`, `query-keys.ts`, `builder.go` |
| 5        | Remove unnecessary try/catch | `pocketbase.ts`, `use-saved-filters.ts`                         |
| 6        | Simplify query-invalidators  | `query-invalidators.ts`                                         |
| 7        | Remove refactoring comments  | `status-priority.ts`, `status-icons.ts`                         |
| 8        | Fix type assertions          | `error-handler.ts`                                              |
| 9        | Evaluate CRUD factory        | `use-crud-factory.ts`                                           |

---

## Files to Modify Summary

| File                                      | Changes                                  |
| ----------------------------------------- | ---------------------------------------- |
| `src/lib/search-service.ts`               | DELETE                                   |
| `src/lib/permissions-service.ts`          | DELETE                                   |
| `src/lib/pocketbase.ts`                   | Remove `customApiCall`, remove try/catch |
| `src/lib/query-config.ts`                 | Remove excessive comments                |
| `src/lib/date-utils.ts`                   | Consolidate duplicate null/NaN checks    |
| `src/lib/status-priority.ts`              | Remove refactoring comment               |
| `src/lib/status-icons.ts`                 | Remove refactoring comment               |
| `src/lib/error-handler.ts`                | Remove redundant type cast               |
| `src/lib/query-invalidators.ts`           | Simplify or inline                       |
| `src/hooks/query-keys.ts`                 | Remove obvious comments                  |
| `src/hooks/use-saved-filters.ts`          | Remove try/catch                         |
| `src/hooks/factories/use-crud-factory.ts` | Evaluate and possibly delete             |
| `backend/notifications/builder.go`        | Remove self-explanatory comments         |

---

## Verification Steps

After cleanup:

1. Run `bun run check` to ensure types still work
2. Run `bun run test:run` to verify tests pass
3. Run `bun run dev` and manually test:
   - Search functionality
   - Permissions checks
   - Date formatting everywhere
   - Filter saving/loading
