# AI Slop Cleanup Plan

This document catalogs all "AI slop" found in the codebase - code patterns that appear to be AI-generated rather than human-written, including extra comments, defensive checks, type workarounds, and unnecessary complexity.

## Summary

- **Total findings**: 23 items
- **High priority**: 11 items (type workarounds, excessive defensive code)
- **Medium priority**: 8 items (redundant comments, thin wrappers)
- **Low priority**: 4 items (minor style issues)

---

## Category 1: Type Workarounds (`as any`)

### 1.1 `src/hooks/organization-invites.ts:241`

**Issue**: Using `as any` to bypass TypeScript for auth storage

```typescript
pb.authStore.save(data.token, data.user as any);
```

**Why it's AI slop**: The developer couldn't figure out the correct type mapping and used a type escape hatch.
**Fix**: Properly type the response or assert to `UsersResponse`

### 1.2 `src/hooks/organization-invites.ts:288`

**Issue**: Duplicate of above

```typescript
pb.authStore.save(data.token, data.user as any);
```

**Fix**: Same as 1.1

### 1.3 `src/components/task/time-entry-dialog.tsx:70`

**Issue**: Entire file has `eslint-disable @typescript-eslint/no-explicit-any` at top, then uses `as any` for resolver

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
...
resolver: zodResolver(timeEntrySchema) as any,
```

**Fix**: Remove the eslint disable and fix the zodResolver type properly

### 1.4 `src/hooks/factories/use-crud-factory.ts:64,67,83,104,108,155`

**Issue**: Multiple uses of `as unknown as TResponse` type assertions

```typescript
.create(data as Record<string, unknown>)
return (result as unknown as TResponse);
```

**Why it's AI slop**: Overly defensive type assertions suggest AI trying to handle generics without understanding the types.
**Fix**: Use proper generic constraints or mapToResponse consistently

---

## Category 2: Excessive Defensive Code

### 2.1 `src/components/scroll-to-top.tsx:8-19`

**Issue**: Try/catch around simple DOM scroll operation

```typescript
useEffect(() => {
  try {
    const scrollable = document.querySelector(
      'main[data-slot="sidebar-inset"]',
    );
    if (scrollable) {
      scrollable.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch {
    window.scrollTo(0, 0);
  }
}, [pathname]);
```

**Why it's AI slop**: DOM scroll operations don't throw in normal circumstances. This is overly defensive.
**Fix**: Remove try/catch entirely:

```typescript
useEffect(() => {
  const scrollable = document.querySelector('main[data-slot="sidebar-inset"]');
  if (scrollable) {
    scrollable.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [pathname]);
```

### 2.2 `src/lib/pocketbase.ts:31-47`

**Issue**: Try/catch in `beforeSend` hook for localStorage parsing

```typescript
pb.beforeSend = function (_url, options) {
  try {
    const storage = localStorage.getItem("anjam-auth-storage");
    if (storage) {
      const parsed = JSON.parse(storage);
      // ...
    }
  } catch {
    // Silently fail - not critical if header missing
  }
  return options;
};
```

**Why it's AI slop**: While this is a legitimate use case, the pattern is common in AI-generated code. The comment "Silently fail" is a telltale sign.
**Fix**: Keep the try/catch (legitimate) but remove the verbose comment.

### 2.3 `src/lib/audit-log-service.ts:136-146`

**Issue**: Nested try/catch for JSON parsing with multiple fallback strategies

```typescript
if (typeof item.changes === "string") {
  changes = parseAndMaskChanges(item.changes);
} else if (typeof item.changes === "object" && item.changes !== null) {
  try {
    changes = maskSensitiveFields(item.changes as Record<string, FieldDiff>);
  } catch {
    changes = parseAndMaskChanges(JSON.stringify(item.changes));
  }
}
```

**Why it's AI slop**: Overly complex fallback chain suggests defensive AI programming.
**Fix**: Simplify - the type check should be sufficient.

---

## Category 3: Redundant/Verbose Comments

### 3.1 `src/lib/pocketbase.ts:11-16`

**Issue**: Overly explanatory comment about baseUrl

```typescript
// During development, the PocketBase server is running on localhost:8090
// and the frontend is running on another port, so we need to specify the host
// But in production, the frontend is served by PocketBase itself, so we can use '/'
//
// 👉 Be sure to keep a trailing / in the baseUrl as its value is used to build
//    other URLs for images and links and those would break if the trailing / is missing
const baseUrl = import.meta.env.PROD ? "/" : "http://127.0.0.1:8090/";
```

**Why it's AI slop**: The emoji and overly detailed explanation are hallmarks of AI-generated documentation.
**Fix**: Simplify to a single line or remove entirely - the code is self-explanatory.

### 3.2 `src/lib/query-config.ts:1-14`

**Issue**: JSDoc-style block comments explaining obvious concepts

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
 * - realtime: Always refetch (notifications)
 * - reference: Reference data that changes occasionally (projects, tags)
 */
```

**Why it's AI slop**: Inconsistent with the rest of the codebase's minimal comment style. Overly verbose for what is essentially a constants file.
**Fix**: Keep only the inline comments for the values themselves.

### 3.3 `src/lib/mode-features.ts:1-4`

**Issue**: Overly verbose module header

```typescript
/**
 * Mode Features Module
 * Determines feature availability based on org mode
 */
```

**Fix**: Remove - the file name and exports are self-explanatory.

### 3.4 `src/hooks/factories/use-crud-factory.ts:1-4,11-13,46-50`

**Issue**: Multiple JSDoc comments explaining obvious function purposes

```typescript
/**
 * Generic CRUD hook factory for creating standardized create/update/delete hooks
 * Eliminates boilerplate code across tasks, projects, users, groups, and other collections
 */
...
/**
 * Configuration for CRUD hooks
 */
...
/**
 * Creates standardized CRUD mutation hooks
 * @param config - Configuration object with collection, queryKeys, and invalidators
 * @returns Object with create, update, and delete mutation hooks
 */
```

**Fix**: Remove most of these - the function names and types are self-documenting.

### 3.5 `src/hooks/audit-logs.ts:1-5,16-18,27-29`

**Issue**: Verbose JSDoc comments for simple query hooks

```typescript
/**
 * Audit Logs React Query hooks
 *
 * Provides hooks for fetching audit logs for admin console and resource-specific history.
 */
...
/**
 * Hook to fetch audit logs for admin console with filters
 */
...
/**
 * Hook to fetch audit logs for a specific resource (task, project, etc.)
 */
```

**Fix**: Remove - these are standard React Query patterns.

### 3.6 `src/lib/audit-log-service.ts:1-3`

**Issue**: Verbose file header

```typescript
/**
 * Audit Log Service - Type-safe functions for fetching audit logs with filtering and pagination
 */
```

**Fix**: Remove - the file name and exports are self-explanatory.

### 3.7 `src/lib/excel-export.ts:10-13,45-47,59-61,67-69,76-78`

**Issue**: Every function has an overly verbose JSDoc comment

```typescript
/**
 * Strips HTML tags from a string securely
 * Uses DOMParser in browser, falls back to regex in SSR/Node environments
 */
...
/**
 * Gets the full name of a user
 */
...
/**
 * Gets the status label in Persian
 */
...
/**
 * Gets the priority label in Persian
 */
...
/**
 * Configures Excel sheet formatting (column widths, auto-filter, frozen rows)
 */
```

**Fix**: Remove all - the function names are self-explanatory.

### 3.8 `src/pages/inbox.tsx:63`

**Issue**: TODO comment that doesn't add value

```typescript
// TODO: Connect to notification system for @mentions
```

**Fix**: Either implement or remove the comment.

### 3.9 `src/components/page-transition.tsx:11-15`

**Issue**: Verbose comment explaining CSS animation

```typescript
/**
 * Provides a consistent entry animation for all pages and optionally staggers
 * direct child sections. The animation is implemented with CSS to avoid adding
 * heavy runtime dependencies while still supporting prefers-reduced-motion.
 */
```

**Fix**: Remove or simplify to one line.

---

## Category 4: Thin Wrappers & Useless Abstractions

### 4.1 `src/lib/mode-features.ts:79-81`

**Issue**: Function that just returns a static string

```typescript
export function getDefaultTaskStatus(): string {
  return "todo";
}
```

**Why it's AI slop**: Overly simple function that could be a constant.
**Fix**: Replace with `export const DEFAULT_TASK_STATUS = "todo" as const;`

### 4.2 `src/lib/query-invalidators.ts:150-165`

**Issue**: `createInvalidator` function that's overly complex for what it does

```typescript
export function createInvalidator(
  patterns: Array<{
    predicate?: (query: unknown) => boolean;
    queryKey?: unknown;
  }>,
) {
  return (client: QueryClient) => {
    patterns.forEach(({ predicate, queryKey }) => {
      if (predicate) {
        client.invalidateQueries({ predicate });
      } else if (queryKey) {
        client.invalidateQueries({ queryKey: queryKey as readonly unknown[] });
      }
    });
  };
}
```

**Why it's AI slop**: Creates an abstraction for a simple operation. The `as readonly unknown[]` cast is also suspicious.
**Fix**: Remove this unused function or simplify the type.

### 4.3 `src/hooks/use-mutation-factory.ts:4-22`

**Issue**: Complex type definition that duplicates UseMutationOptions

```typescript
type FactoryMutationOptions<
  TData,
  TError,
  TVariables,
  TOnMutateResult = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  "onSuccess" | "onSettled"
> & {
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: unknown,
  ) => void;
};
```

**Why it's AI slop**: Reinventing types that TanStack Query already provides. The context type is also hardcoded to `unknown`.
**Fix**: Use `UseMutationOptions` directly with proper generic context type.

---

## Category 5: Over-Engineered Code

### 5.1 `src/lib/excel-export.ts:14-43`

**Issue**: Overly complex `stripHtml` function with multiple fallback strategies

```typescript
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Check if we're in a browser environment
  if (typeof document === "undefined" || typeof DOMParser === "undefined") {
    // Server-side fallback: regex-based stripping
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&[a-z]+;/gi, "")
      .trim();
  }

  // Browser environment: use DOMParser (safer than innerHTML)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || doc.body.innerText || "";
  } catch {
    // Fallback to regex if parsing fails
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
}
```

**Why it's AI slop**: This is a browser-only app (Vite SPA). The SSR checks and try/catch with duplicate regex fallback are excessive.
**Fix**: Simplify to just use DOMParser:

```typescript
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}
```

### 5.2 `src/lib/date-utils.ts:4-45`

**Issue**: Four nearly identical date formatting functions

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

export function formatDateISO(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "yyyy/MM/dd"));
}

export function formatDateLocale(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

**Why it's AI slop**: Repetitive code that could be consolidated. This pattern suggests AI generating similar functions.
**Fix**: Consolidate into a single function with a format parameter.

---

## Category 6: Duplicated Patterns (3+ times)

### 6.1 Empty fallback pattern in `src/lib/date-utils.ts`

**Count**: 4 identical checks

```typescript
if (!dateString) return "-";
const date = new Date(dateString);
if (Number.isNaN(date.getTime())) return "-";
```

**Fix**: Create a helper function `parseDateOrDash()` to eliminate duplication.

### 6.2 Console logging pattern in `src/main.tsx:10,17,26`

**Count**: 3 branded log statements

```typescript
console.log("[Anjam] Environment:", { ... });
console.log("[Anjam] PostHog disabled - running in development mode");
console.log("[Anjam] PostHog enabled - running in production mode");
```

**Why it's AI slop**: Branded log messages are common in AI-generated code.
**Fix**: Use a proper logging utility or remove in production.

### 6.3 Soft delete check in `src/hooks/factories/use-crud-factory.ts`

**Count**: 2 identical checks

```typescript
const supportsSoftDelete = ["tasks", "comments"].includes(collection);
```

**Fix**: This should be a constant or configuration, not repeated.

### 6.4 Type cast pattern in `src/hooks/factories/use-crud-factory.ts`

**Count**: 4+ occurrences of `as unknown as`

```typescript
return (result as unknown as TResponse);
```

**Fix**: Fix the generic types properly instead of using double casts.

---

## Category 7: Style Inconsistencies

### 7.1 Comment style inconsistency

**Issue**: Some files use `//` comments, others use JSDoc `/** */`, others use block comments.
**Files affected**:

- `src/lib/date-utils.ts` - No comments
- `src/lib/query-config.ts` - Heavy JSDoc
- `src/hooks/factories/use-crud-factory.ts` - Mixed styles
- `src/lib/mode-features.ts` - JSDoc
- `src/hooks/tasks.ts, projects.ts, users.ts` - Minimal `/** */`

**Fix**: Choose one style and apply consistently. Given the codebase's preference for minimal comments, use JSDoc only for exported functions that need it, remove all others.

### 7.2 `eslint-disable` at file level

**File**: `src/components/task/time-entry-dialog.tsx:1`

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

**Why it's AI slop**: Disabling eslint at the file level suggests the AI couldn't figure out the types.
**Fix**: Remove the disable and fix the underlying type issue.

---

## Category 8: Unnecessary Code

### 8.1 `src/hooks/query-keys.ts:9-15,20-38`

**Issue**: `createQueryKeys` and `createListQueryKeys` factory functions that add complexity

```typescript
function createQueryKeys<T extends string>(resource: T) {
  return {
    all: [resource] as const,
    lists: () => [resource, "list"] as const,
    detail: (id: string) => [resource, "detail", id] as const,
  };
}

function createListQueryKeys<
  T extends string,
  TOptions extends Record<string, unknown>,
>(resource: T, defaults: TOptions) {
  const base = createQueryKeys(resource);
  return {
    ...base,
    list: (options?: Partial<TOptions>) => {
      const merged = { ...defaults, ...(options ?? {}) } as TOptions;
      (Object.keys(defaults) as Array<keyof TOptions>).forEach((key) => {
        if (options?.[key] === undefined) {
          (merged as Record<string, unknown>)[key as string] = defaults[key];
        }
      });
      return [...base.lists(), merged] as [string, string, TOptions];
    },
  };
}
```

**Why it's AI slop**: Over-engineered abstraction for what is essentially object literals. The `merged` manipulation is particularly convoluted.
**Fix**: Just define the query keys as plain objects - they're more readable and TypeScript can still infer them.

### 8.2 `src/lib/query-invalidators.ts`

**Issue**: The entire file is a complex hierarchy of invalidator functions that wrap basic `invalidateQueries` calls.
**Size**: 165 lines for what could be ~50 lines
**Why it's AI slop**: Creates unnecessary abstraction layers. The `collectionInvalidators`, `detailInvalidators`, `compositeInvalidators`, and `mutationInvalidators` hierarchy is over-engineered.
**Fix**: Simplify to direct invalidation calls in the mutation hooks themselves, or keep only the most commonly used combinations.

---

## Execution Order

1. **Phase 1 (High Priority)**: Fix all `as any` type issues
2. **Phase 2 (High Priority)**: Remove excessive try/catch blocks
3. **Phase 3 (Medium Priority)**: Consolidate duplicated code patterns
4. **Phase 4 (Medium Priority)**: Remove redundant comments
5. **Phase 5 (Low Priority)**: Simplify over-engineered abstractions
6. **Phase 6 (Low Priority)**: Standardize comment style across codebase

---

## Files Requiring Changes

| File                                        | Issues                                        | Priority |
| ------------------------------------------- | --------------------------------------------- | -------- |
| `src/hooks/organization-invites.ts`         | 2 type issues                                 | High     |
| `src/components/task/time-entry-dialog.tsx` | eslint disable + type                         | High     |
| `src/hooks/factories/use-crud-factory.ts`   | 6 type issues, excessive comments             | High     |
| `src/components/scroll-to-top.tsx`          | excessive try/catch                           | High     |
| `src/lib/excel-export.ts`                   | 8 verbose comments, over-engineered stripHtml | Medium   |
| `src/lib/date-utils.ts`                     | 4 duplicated functions                        | Medium   |
| `src/lib/pocketbase.ts`                     | 1 verbose comment                             | Low      |
| `src/lib/query-config.ts`                   | verbose JSDoc                                 | Low      |
| `src/lib/mode-features.ts`                  | thin wrapper function                         | Medium   |
| `src/lib/query-invalidators.ts`             | over-engineered                               | Medium   |
| `src/hooks/use-mutation-factory.ts`         | complex type duplication                      | Medium   |
| `src/hooks/query-keys.ts`                   | over-engineered factory                       | Medium   |
| `src/main.tsx`                              | branded console logs                          | Low      |
| `src/pages/inbox.tsx`                       | TODO comment                                  | Low      |
| `src/components/page-transition.tsx`        | verbose comment                               | Low      |
| `src/hooks/audit-logs.ts`                   | 3 verbose comments                            | Low      |
| `src/lib/audit-log-service.ts`              | 1 verbose comment                             | Low      |
| `src/lib/pocketbase.ts`                     | try/catch with verbose comment                | Low      |

---

## Prevention

To avoid future AI slop:

1. Review AI-generated code for excessive comments before committing
2. Prefer direct code over abstractions that only save 1-2 lines
3. Use proper TypeScript types instead of `as any`
4. Avoid try/catch around operations that don't normally throw
5. Don't duplicate similar code - consolidate into helpers
6. Keep comment style consistent with existing codebase (minimal)
