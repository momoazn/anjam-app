# Immediate Improvements Plan

A focused plan for dependency upgrades and frontend architecture improvements.

---

## Phase 1: Dependency Upgrades

### 1.1 Frontend Dependencies
**File:** `package.json`

**Tasks:**
- [ ] Run `bun outdated` to check for updates
- [ ] Run `bun update` to apply minor/patch updates
- [ ] Run `bun run check` to verify compatibility
- [ ] Run `bun run test:run` to ensure tests pass

### 1.2 Backend Dependencies
**File:** `backend/go.mod`

**Tasks:**
- [ ] Run `go get -u ./...` to update dependencies
- [ ] Run `go mod tidy` to clean up
- [ ] Run `go build ./backend` to verify compilation

---

## Phase 2: Frontend Architecture Improvements

### 2.1 Component Extraction from Large Pages
**Target:** `src/pages/tasks.tsx` (693 lines)

**Extract to new files:**
- `src/components/task/task-list-skeleton.tsx` - Loading skeleton
- `src/components/task/task-empty-state.tsx` - Empty state UI

**Tasks:**
- [ ] Extract TaskListSkeleton component
- [ ] Extract TaskEmptyState component
- [ ] Verify page still works correctly

### 2.2 Performance Optimizations
**Files to modify:**
- `src/components/task/task-list-item.tsx`
- `src/components/task/task-list-group.tsx`

**Tasks:**
- [ ] Add React.memo to TaskListItem
- [ ] Add React.memo to TaskListGroup
- [ ] Verify useMemo dependencies in tasks page

### 2.3 TanStack Query Improvements
**File:** `src/app.tsx`

**Tasks:**
- [ ] Add retry with exponential backoff
- [ ] Configure better error handling for network failures

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
- [ ] Create route-level Suspense wrapper
- [ ] Add route-specific loading skeletons

---

## Implementation Order

1. **Dependency upgrades** (1.1, 1.2) - Quick wins, low risk
2. **Component extraction** (2.1) - Improves maintainability
3. **Performance optimizations** (2.2) - Better UX
4. **Query improvements** (2.3) - Better error handling
5. **Suspense boundaries** (2.4) - Nice to have

---

## Success Criteria

- [ ] All dependencies updated to latest stable
- [ ] `bun run check` passes
- [ ] `bun run test:run` passes
- [ ] tasks.tsx reduced to <400 lines
- [ ] No regression in functionality
