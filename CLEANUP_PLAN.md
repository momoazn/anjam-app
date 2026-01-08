# Comprehensive Codebase Cleanup Plan

## Overview

This plan transforms the Anjam codebase from its current messy state into a clean, maintainable, and streamlined application.

**Approach:** All at once (single session)
**Unused code:** Remove everything unused
**Features:** Keep all existing features (saved filters, command menu, board view, comments with mentions)

The cleanup focuses on removing dead code, simplifying abstractions, and reorganizing structure - not removing features.

---

## Phase 1: Remove Dead Code & Unused Dependencies

### 1.1 Remove Unused Dependencies

**Files:** `package.json`

Remove these unused packages:

- `embla-carousel-react` - carousel.tsx exists but never used (~50KB)
- `react-resizable-panels` - resizable.tsx exists but never used (~20KB)
- `tw-animate-css` - imported but not actively used (~5KB)
- `@base-ui/react` - no imports found

**Action:** `bun remove embla-carousel-react react-resizable-panels tw-animate-css @base-ui/react`

### 1.2 Remove Unused UI Components

**Directory:** `src/components/ui/`

Delete these unused shadcn components:

- `carousel.tsx` (requires embla-carousel)
- `resizable.tsx` (requires react-resizable-panels)
- `breadcrumb.tsx`
- `navigation-menu.tsx`
- `slider.tsx`
- `progress.tsx`
- `input-otp.tsx`
- `hover-card.tsx`

### 1.3 Remove Dead Hooks

**Files to delete:**

- `src/hooks/use-create-actions.ts` - just wraps `useNavigate()`, conflicts with actual create hooks
- `src/hooks/use-mutation-factory.ts` - defined but never used

**Code to remove:**

- `usePrefetchTask()` in `src/hooks/tasks.ts:429-433` - no-op function

### 1.4 Remove Duplicate Components

**Files to delete:**

- `src/components/forms/form-field.tsx` - just re-exports from recipes/
- `src/components/skeletons/task-list-skeleton.tsx` - duplicate of `src/components/task/task-list-skeleton.tsx`

---

## Phase 2: Consolidate State Management

### 2.1 Migrate `useSavedFilters` to Zustand Store

**Current:** `src/hooks/use-saved-filters.ts` (146 lines with antipatterns)

**Action:** Create `src/store/filters-store.ts` following auth-store pattern:

- Use `persist` middleware for localStorage
- Remove ESLint disable comments
- Consolidate 9 functions into cleaner store actions

### 2.2 Migrate `useUserPreferences` to Zustand Store

**Current:** `src/hooks/user-preferences.ts` (120 lines with antipatterns)

**Action:** Create `src/store/preferences-store.ts`:

- Merge toggle favorites logic
- Follow same persist pattern as auth-store
- Remove ESLint disable comments

### 2.3 Standardize Mutation Hook Returns

**Files:** All hooks in `src/hooks/`

Standardize to consistent shape:

```typescript
return {
  mutate: async (...) => {...},
  isPending: boolean,
}
```

Remove redundant `mutateAsync` that just points to same function.

---

## Phase 3: Consolidate & Simplify Hooks

### 3.1 Consolidate Notification Hooks

**Current:** 5 nearly identical hooks in `src/hooks/notifications.ts`

**Action:** Create single factory or generic hook:

```typescript
function useNotificationMutation(
  action: "markRead" | "markAllRead" | "delete" | "clearAll" | "clearRead",
);
```

### 3.2 Simplify Permission Hooks

**Current:** `src/hooks/use-permissions.ts` (76 lines, 4 separate hooks)

**Action:** Consolidate to single `usePermissions()` hook returning object with all checks.

### 3.3 Remove Page Data Wrapper Hooks

**Files to inline or remove:**

- `src/hooks/use-tasks-page-data.ts` - just calls `useAllTasks()` + `useUsers()`
- `src/hooks/use-project-tasks-page-data.ts` - minimal value wrapper

---

## Phase 4: Fix Type System

### 4.1 Fix OrgRole Type Mismatch

**Issue:** Defined in 3 places with different values

**Action:**

1. Keep single source of truth in `src/types/user.ts`
2. Update `src/lib/permissions.ts` to import from types
3. Remove "admin" role (not in Convex schema) or add to schema

### 4.2 Remove Legacy PocketBase Compatibility

**Files:** `src/types/tasks.ts`, `src/types/user.ts`

Remove dual field patterns:

- `firstName`/`first_name`
- `lastName`/`last_name`
- `image`/`avatar`
- Legacy fields: `active`, `blocked`, `created`

### 4.3 Clean Up TaskExpand Type

**File:** `src/types/tasks.ts:40-47`

Replace `unknown` with proper typing.

---

## Phase 5: Reorganize Component Structure

### 5.1 Reorganize Task Components (31 files)

**Current:** `src/components/task/` - all 31 files flat

**New structure:**

```
src/components/task/
├── list/
│   ├── task-list-view.tsx
│   ├── task-list-group.tsx
│   ├── task-list-item.tsx
│   ├── task-list-header.tsx
│   └── task-list-skeleton.tsx
├── details/
│   ├── task-details-content.tsx
│   ├── task-details-sidebar.tsx
│   └── task-details-skeleton.tsx
├── filters/
│   ├── task-filters.tsx
│   ├── saved-filters-dropdown.tsx
│   ├── save-filter-dialog.tsx
│   └── manage-saved-filters-dialog.tsx
├── comments/
│   ├── comment-composer.tsx
│   ├── comment-item.tsx
│   └── comments-list.tsx
└── board/
    └── (existing)
```

### 5.2 Flatten Single-File Directories

Move these to parent or consolidate:

- `src/components/error/page-error-boundary.tsx` → `src/components/`
- `src/components/suspense/route-suspense.tsx` → `src/components/`
- `src/components/design-system/spring-interactions.tsx` → `src/components/ui/`
- `src/components/brand/logo.tsx` → `src/components/`

### 5.3 Consolidate Notification Components

**Current:** `notification-dropdown.tsx` + `notifications/` directory

**Action:** Move all into `src/components/notifications/`:

- `notification-dropdown.tsx` → `notifications/dropdown.tsx`
- Keep existing `notifications/*.tsx` files

### 5.4 Merge Skeleton Components

**Current:** `src/components/skeletons/` + scattered skeleton files

**Action:** Consolidate into feature directories or single `skeletons/` with all skeletons.

---

## Phase 6: Simplify Large Components

### 6.1 Split Comment Components

**Files:**

- `comment-composer.tsx` (215 lines) - extract mention logic to hook
- `comment-item.tsx` (394 lines) - split into sub-components

### 6.2 Split Task Fields

**File:** `src/components/forms/task-fields.tsx` (396 lines)

Split into individual field components in `forms/fields/`:

- `status-field.tsx`
- `priority-field.tsx`
- `assignee-field.tsx`
- `date-field.tsx`
- `tags-field.tsx`

### 6.3 Extract Page Business Logic

**File:** `src/pages/tasks/index.tsx` (415 lines)

Extract to hooks:

- Filtering logic → `useTaskFiltering()`
- Selection logic → `useTaskSelection()`
- Bulk actions → `useBulkActions()`

---

## Phase 7: Backend Cleanup

### 7.1 Extract Auth Verification Pattern

**Issue:** Repeated in all Convex functions

**Action:** Create `convex/lib/auth.ts`:

```typescript
export async function requireOrgMembership(ctx, organizationId, userId) {
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_org_user", (q) =>
      q.eq("organizationId", organizationId).eq("userId", userId),
    )
    .first();
  if (!membership) throw new Error("Not a member");
  return membership;
}
```

### 7.2 Fix Search Scalability

**File:** `convex/search.ts:46-58`

Replace in-memory filtering with proper Convex search index pagination.

### 7.3 Remove TODO Comments

**File:** `convex/tasks.ts:106`

Either implement notification trigger or remove TODO.

---

## Phase 8: CSS Cleanup

### 8.1 Remove Duplicate CSS

**File:** `src/index.css`

- Remove duplicate scrollbar-thin rules (lines 385-464)
- Remove unused animations: `page-fade-in`, `stagger-fade-up`, `hero-*`

### 8.2 Consolidate Utility Files

Merge into single `src/lib/status-utils.ts`:

- `status-icons.ts`
- `status-priority.ts`

---

## Phase 9: Final Cleanup

### 9.1 Update Imports

After reorganization, update all imports across the codebase.

### 9.2 Remove Index Barrel Re-exports

**File:** `src/hooks/index.ts`

Remove barrel exports - let consumers import directly from specific files.

### 9.3 Run Quality Checks

```bash
bun run check
bun run fix
```

### 9.4 Test All Features

Ensure no regressions after cleanup.

---

## Summary of Deletions

### Files to Delete (12+ files):

1. `src/hooks/use-create-actions.ts`
2. `src/hooks/use-mutation-factory.ts`
3. `src/components/forms/form-field.tsx`
4. `src/components/skeletons/task-list-skeleton.tsx`
5. `src/components/ui/carousel.tsx`
6. `src/components/ui/resizable.tsx`
7. `src/components/ui/breadcrumb.tsx`
8. `src/components/ui/navigation-menu.tsx`
9. `src/components/ui/slider.tsx`
10. `src/components/ui/progress.tsx`
11. `src/components/ui/input-otp.tsx`
12. `src/components/ui/hover-card.tsx`

### Dependencies to Remove (4):

1. `embla-carousel-react`
2. `react-resizable-panels`
3. `tw-animate-css`
4. `@base-ui/react`

### Estimated Impact:

- ~90KB bundle size reduction
- ~30% fewer hook files
- ~40% reduction in task component directory complexity
- Cleaner, consistent patterns throughout

---

## Execution Order

1. **Phase 1** - Safe deletions, no dependencies
2. **Phase 2** - State management (affects many components)
3. **Phase 3** - Hook consolidation
4. **Phase 4** - Type fixes
5. **Phase 5** - Component reorganization (largest change)
6. **Phase 6** - Component simplification
7. **Phase 7** - Backend cleanup
8. **Phase 8** - CSS cleanup
9. **Phase 9** - Final verification
