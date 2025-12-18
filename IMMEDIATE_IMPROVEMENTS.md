# Immediate Improvements Plan

A focused plan for dependency upgrades and frontend architecture improvements.

---

## Phase 1: Dependency Upgrades

### 1.1 Frontend Dependencies

**File:** `package.json`

**Tasks:**

- [x] Run `bun outdated` to check for updates
- [x] Run `bun update` to apply minor/patch updates
- [x] Run `bun run check` to verify compatibility
- [x] Run `bun run test:run` to ensure tests pass

### 1.2 Backend Dependencies

**File:** `backend/go.mod`

**Tasks:**

- [x] Run `go get -u ./...` to update dependencies
- [x] Run `go mod tidy` to clean up
- [x] Run `go build ./...` to verify compilation

---

## Phase 2: Frontend Architecture Improvements

### 2.1 Component Extraction from Large Pages

**Target:** `src/pages/tasks.tsx` (was 693 lines; now ~606 lines)

**Extract to new files:**

- `src/components/task/task-list-skeleton.tsx` - Loading skeleton
- `src/components/task/task-empty-state.tsx` - Empty state UI

**Tasks:**

- [x] Extract TaskListSkeleton component
- [x] Extract TaskEmptyState component
- [ ] Verify page still works correctly

### 2.2 Performance Optimizations

**Files to modify:**

- `src/components/task/task-list-item.tsx`
- `src/components/task/task-list-group.tsx`

**Tasks:**

- [x] Add React.memo to TaskListItem
- [x] Add React.memo to TaskListGroup
- [x] Verify useMemo dependencies in tasks page

### 2.3 TanStack Query Improvements

**File:** `src/app.tsx`

**Tasks:**

- [x] Add retry with exponential backoff
- [x] Configure better error handling for network failures

**Example config:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### 2.4 Suspense Boundaries (Optional)

**Files to create:**

- `src/components/suspense/route-suspense.tsx`

**Tasks:**

- [x] Create route-level Suspense wrapper
- [x] Add route-specific loading skeletons

---

## Implementation Order

1. **Dependency upgrades** (1.1, 1.2) - Quick wins, low risk
2. **Component extraction** (2.1) - Improves maintainability
3. **Performance optimizations** (2.2) - Better UX
4. **Query improvements** (2.3) - Better error handling
5. **Suspense boundaries** (2.4) - Nice to have

---

## Success Criteria

- [x] All dependencies updated to latest stable
- [x] `bun run check` passes
- [x] `bun run test:run` passes
- [ ] tasks.tsx reduced to <400 lines
- [ ] No regression in functionality
