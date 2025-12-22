# Comprehensive DRY & KISS Refactoring Plan for Anjam Task Management Application

## Executive Summary

This plan addresses **massive code duplication** across the codebase with 700+ lines of repetitive hooks, 25+ identical UI components, 25 constants files creating re-export chains, and complex backend patterns. The refactoring is structured in **7 phases** prioritizing high-impact, low-risk changes first.

**Expected Outcomes:**

- **~5,000+ lines eliminated** (hooks, pages, utils, constants)
- **10 monolithic pages decomposed** into reusable components
- **Single source of truth** for all duplicated patterns
- **Improved maintainability** - easier to change common patterns in one place
- **Better testability** - smaller, focused functions
- **Enhanced readability** - clearer intent, less nesting

---

## Task List & Progress Tracking

### Phase 1: Frontend Hooks Consolidation 🔄 MOSTLY COMPLETED

- [x] **1.1** Create Generic CRUD Hook Factory
  - [x] Created `src/hooks/factories/use-crud-factory.ts`
  - [x] Refactored `src/hooks/tasks.ts` (308→283 lines)
  - [x] Refactored `src/hooks/projects.ts` (153→126 lines)
  - [x] Refactored `src/hooks/users.ts` (245→230 lines)
  - [x] Refactored `src/hooks/groups.ts` (234→220 lines)
  - [x] Result: **~106 lines eliminated**

- [x] **1.2** Consolidate Query Key Management
  - [x] Refactored `src/hooks/query-keys.ts` (145→119 lines)
  - [x] Created `createQueryKeys()` and `createListQueryKeys()` factories
  - [x] Result: **26 lines eliminated**

- [x] **1.3** Simplify Mutation Invalidators
  - [x] Refactored `src/lib/query-invalidators.ts` (currently 296 lines)
  - [x] Created multiple factory functions for invalidators
  - [x] Result: **Improved maintainability, reduced duplication**
  - [ ] **Remaining:** Further consolidation possible (target: ~150 lines)

- [ ] **1.4** Refactor Remaining Hooks ⏳ NOT STARTED (~923 lines total)
  - [ ] `use-file-upload.ts` (214 lines) - Extract reusable upload logic
  - [ ] `use-task-filters.ts` (212 lines) - Simplify filter state management
  - [ ] `notifications.ts` (193 lines) - Apply CRUD factory pattern
  - [ ] `use-saved-filters.ts` (189 lines) - Consolidate with task-filters
  - [ ] `tags.ts` (115 lines) - Apply CRUD factory pattern
  - [ ] Risk: **Low**

### Phase 2: UI Component Standardization ✅ COMPLETED

- [x] **2.1** Create Reusable Card Components
  - [x] Created `src/components/ui/metric-card.tsx`
  - [x] Refactored `src/components/reports/metric-cards.tsx` (90→53 lines)
  - [x] Result: **37 lines eliminated, replaced 25+ duplicate components**

- [x] **2.2** Create Generic FormField Wrapper
  - [x] Created `src/components/forms/form-field.tsx`
  - [x] Refactored task-fields.tsx, project-fields.tsx, user-fields.tsx
  - [x] Result: **Eliminated 50+ repeated FormField patterns**

### Phase 3: Status Utils Simplification 🔄 PARTIALLY COMPLETED

- [x] **3.1** Add Status Color Helper
  - [x] Added `getStatusColorVariant()` helper function (used in 10+ components)
  - [x] Minor refactoring: `src/lib/status-utils.ts` (384→358 lines, 7% reduction)
  - [ ] **Remaining work:**
    - [ ] Remove duplicate color mapping systems (`STATUS_COLOR_CLASSES`, `taskStatusColors`, `taskStatusBgColors`, `taskStatusBadgeSolids`)
    - [ ] Consolidate to single `STATUS_STYLES` source of truth
    - [ ] Target: ~150 lines (60% reduction from current 358 lines)

### Phase 4: Constants Reorganization ⏳ PENDING

- [ ] **4.1** Consolidate Constants
  - [ ] Reduce 25 files to 8 domain-based files
  - [ ] Replace the current “re-export everything” barrel with either direct domain imports or a thin, curated barrel
  - [ ] Merge common.ts and shared.ts into domain files
  - [ ] Result: **Eliminate indirection, clearer dependencies**

### Phase 5: Monolithic Page Decomposition 🔄 IN PROGRESS (1/10 COMPLETE)

- [x] **5.1** Break Down Dashboard ✅ COMPLETED
  - [x] Created 6 widget components in `src/components/dashboard/`:
    - `stats-widget.tsx`, `charts-widget.tsx`, `projects-widget.tsx`
    - `productivity-widget.tsx`, `overdue-tasks-widget.tsx`, `welcome-widget.tsx`
  - [x] Refactored `src/pages/dashboard.tsx` (941→232 lines)
  - [x] Result: **75% reduction, composable widgets**

- [ ] **5.2** Break Down Reports ⏳ NOT STARTED
  - Current: `src/pages/reports.tsx` (815 lines - unchanged)
  - [ ] Create section components in `src/components/reports/`:
    - [ ] `filters-section.tsx`
    - [ ] `metrics-section.tsx`
    - [ ] `charts-section.tsx`
    - [ ] `table-section.tsx`
  - [ ] Refactor to ~300 lines
  - [ ] Result: **Expected ~63% reduction**

- [ ] **5.3** Break Down Settings ⏳ NOT STARTED
  - Current: `src/pages/settings.tsx` (624 lines)
  - [ ] Create section components:
    - [ ] `profile-section.tsx`
    - [ ] `notifications-section.tsx`
    - [ ] `appearance-section.tsx`
    - [ ] `security-section.tsx`
  - [ ] Refactor to ~150 lines
  - [ ] Risk: **Medium** | Result: **Expected ~75% reduction**

- [ ] **5.4** Break Down Project Details ⏳ NOT STARTED
  - Current: `src/pages/project-details.tsx` (619 lines)
  - [ ] Extract: `project-header.tsx`, `project-tasks-list.tsx`, `project-stats.tsx`
  - [ ] Refactor to ~200 lines
  - [ ] Risk: **Medium** | Result: **Expected ~68% reduction**

- [ ] **5.5** Break Down Tasks Page ⏳ NOT STARTED
  - Current: `src/pages/tasks.tsx` (606 lines)
  - [ ] Extract: `task-filters-panel.tsx`, `task-board-view.tsx`, `task-list-view.tsx`
  - [ ] Refactor to ~200 lines
  - [ ] Risk: **High** (complex state) | Result: **Expected ~67% reduction**

- [ ] **5.6** Break Down Notifications Page ⏳ NOT STARTED
  - Current: `src/pages/notifications.tsx` (602 lines)
  - [ ] Extract: `notification-list.tsx`, `notification-filters.tsx`, `notification-item.tsx`
  - [ ] Refactor to ~150 lines
  - [ ] Risk: **Low** | Result: **Expected ~75% reduction**

- [ ] **5.7** Break Down Task Details ⏳ NOT STARTED
  - Current: `src/pages/task-details.tsx` (592 lines)
  - [ ] Extract: `task-header.tsx`, `task-comments.tsx`, `task-activity.tsx`, `task-sidebar.tsx`
  - [ ] Refactor to ~200 lines
  - [ ] Risk: **Medium** | Result: **Expected ~66% reduction**

- [ ] **5.8** Break Down My Tasks ⏳ NOT STARTED
  - Current: `src/pages/my-tasks.tsx` (465 lines)
  - [ ] Extract: Reuse components from 5.5 (tasks.tsx)
  - [ ] Refactor to ~150 lines
  - [ ] Risk: **Low** | Result: **Expected ~68% reduction**

- [ ] **5.9** Break Down Helps Page ⏳ NOT STARTED
  - Current: `src/pages/helps.tsx` (439 lines)
  - [ ] Extract: `help-categories.tsx`, `help-article.tsx`, `help-search.tsx`
  - [ ] Refactor to ~150 lines
  - [ ] Risk: **Low** | Result: **Expected ~66% reduction**

- [ ] **5.10** Break Down Tags Page ⏳ NOT STARTED
  - Current: `src/pages/tags.tsx` (434 lines)
  - [ ] Extract: `tag-list.tsx`, `tag-form.tsx`, `tag-stats.tsx`
  - [ ] Refactor to ~150 lines
  - [ ] Risk: **Low** | Result: **Expected ~65% reduction**

### Phase 6: Backend Simplification ⏳ PENDING

- [ ] **6.1** Create Record Helper Functions
  - Current: `backend/main.go` (1319 lines)
  - [ ] Create `backend/helpers/record.go` - FindRecordById wrapper with error handling
  - [ ] Create `backend/helpers/response.go` - JSON response helpers (WriteJSONError, WriteJSONSuccess)
  - [ ] Create `backend/helpers/logging.go` - Centralized logging patterns
  - [ ] Result: **Reduce ~200 lines, reusable helpers**

- [ ] **6.2** Break Down Large Backend Functions
  - [ ] Split `handleGetUserLoginLogs` (69 lines) → validation, fetching, formatting
  - [ ] Split `trackAuthMiddleware` (53 lines) → body parsing, auth tracking, response recording
  - [ ] Split `handleToggleUserActive` (49 lines) → validation, toggle logic
  - [ ] Result: **Functions ~20 lines each, easier to test**

- [ ] **6.3** Consider Additional Refactoring (Optional)
  - [ ] Extract notification handlers to `backend/notifications.go`
  - [ ] Extract audit handlers to separate functions in `backend/audit.go`
  - [ ] Create `backend/validation.go` for shared validation logic

### Phase 7: AI Slop Detection & Removal ⏳ PENDING

Identify and remove AI-generated code patterns that are inconsistent with the codebase style.

**Current Baseline (auto-detected):**

- `as any` casts: **3 occurrences**
- `@ts-ignore`/`@ts-expect-error`: **0 occurrences**
- Verbose comments (Initialize/Create/Handle/etc.): **~125 occurrences**

- [ ] **7.1** Remove Unnecessary Comments
  - [ ] Scan for verbose/obvious comments (e.g., `// Initialize the state`, `// Return the result`)
  - [ ] Remove JSDoc comments that just repeat the function name
  - [ ] Remove commented-out code blocks
  - [ ] Keep only comments that explain "why", not "what"
  - [ ] Risk: **Low**

- [ ] **7.2** Remove Excessive Defensive Checks
  - [ ] Identify redundant null/undefined checks on already-validated data
  - [ ] Remove unnecessary `try/catch` blocks in trusted codepaths
  - [ ] Remove double-validation (e.g., checking props that TypeScript already guarantees)
  - [ ] Audit: `if (x && x.y && x.y.z)` patterns where optional chaining suffices
  - [ ] Risk: **Medium**

- [ ] **7.3** Fix Type Workarounds
  - [ ] Search for `as any` casts and fix underlying type issues
  - [ ] Search for `@ts-ignore` / `@ts-expect-error` comments
  - [ ] Search for `as unknown as T` double-cast patterns
  - [ ] Replace `any` types with proper generics or specific types
  - [ ] Risk: **Medium**

- [ ] **7.4** Normalize Code Style Inconsistencies
  - [ ] Identify mixed patterns (e.g., some files use `function`, others use arrow functions)
  - [ ] Normalize error handling patterns (some throw, some return null, some use Result types)
  - [ ] Standardize import ordering inconsistencies
  - [ ] Fix inconsistent naming (camelCase vs snake_case in same context)
  - [ ] Risk: **Low**

- [ ] **7.5** Remove Over-Engineering
  - [ ] Identify overly abstract patterns that add complexity without benefit
  - [ ] Remove unnecessary wrapper functions that just pass through
  - [ ] Simplify deeply nested ternaries or conditionals
  - [ ] Remove unused generics or overly complex type gymnastics
  - [ ] Risk: **Medium**

**Detection Commands:**

```bash
# Find 'as any' casts
rg "as any" --type ts --type tsx

# Find ts-ignore comments
rg "@ts-ignore|@ts-expect-error" --type ts --type tsx

# Find verbose comments patterns
rg "// (Initialize|Create|Set|Get|Return|Handle|Process|Check)" --type ts --type tsx

# Find excessive optional chaining
rg "\?\.\w+\?\.\w+\?\." --type ts --type tsx

# Find try-catch that just rethrows
rg -U "catch.*\{[\s\n]*throw" --type ts --type tsx
```

---

## Summary of Completed Work

**Total Impact So Far:**

- **Files Created:** 9 new files
  - `src/hooks/factories/use-crud-factory.ts`
  - `src/components/ui/metric-card.tsx`
  - `src/components/forms/form-field.tsx`
  - 6 dashboard widget components
- **Files Refactored:** 9 existing files (hooks + dashboard)
- **Components Decomposed:** Dashboard (6 widgets)
- **Hooks Consolidated:** Tasks, Projects, Users, Groups
- **Code Reduction:** ~830+ lines total
  - ~130 lines in hooks
  - ~700 lines in dashboard page

**Current Status:**

- 🔄 **Phase 1:** MOSTLY COMPLETED (Core hooks done, 5 remaining hooks identified)
- ✅ **Phase 2:** COMPLETED (UI Components)
- 🔄 **Phase 3:** PARTIALLY COMPLETED (Status Utils - helper added, consolidation pending)
- ⏳ **Phase 4:** PENDING (Constants - 25 files)
- 🔄 **Phase 5:** IN PROGRESS (Page Decomposition - 1/10 complete, Dashboard only)
- ⏳ **Phase 6:** PENDING (Backend - 1319 lines in main.go)
- ⏳ **Phase 7:** PENDING (AI Slop Detection & Removal)

**Remaining Work Estimate:**

| Phase                  | Tasks        | Lines to Reduce        |
| ---------------------- | ------------ | ---------------------- |
| Phase 1.4 (Hooks)      | 5 hooks      | ~400 lines             |
| Phase 3 (Status)       | 1 file       | ~200 lines             |
| Phase 4 (Constants)    | 25→8 files   | ~500 lines             |
| Phase 5.2-5.10 (Pages) | 9 pages      | ~3,800 lines           |
| Phase 6 (Backend)      | 3 tasks      | ~200 lines             |
| Phase 7 (AI Slop)      | 5 tasks      | ~300-500 lines         |
| **Total**              | **23 tasks** | **~5,400-5,600 lines** |

**Phase 5 Breakdown (9 remaining pages):**

| Page                | Current   | Target     | Reduction  | Risk   |
| ------------------- | --------- | ---------- | ---------- | ------ |
| reports.tsx         | 815       | ~300       | 515        | Medium |
| settings.tsx        | 624       | ~150       | 474        | Medium |
| project-details.tsx | 619       | ~200       | 419        | Medium |
| tasks.tsx           | 606       | ~200       | 406        | High   |
| notifications.tsx   | 602       | ~150       | 452        | Low    |
| task-details.tsx    | 592       | ~200       | 392        | Medium |
| my-tasks.tsx        | 465       | ~150       | 315        | Low    |
| helps.tsx           | 439       | ~150       | 289        | Low    |
| tags.tsx            | 434       | ~150       | 284        | Low    |
| **Total**           | **5,196** | **~1,650** | **~3,546** | -      |

---

## Verification Checklist (Per Task)

Before marking any task as complete, ensure:

### Code Quality

- [ ] `bun run check` passes (TypeScript + ESLint + Prettier)
- [ ] `bun run test:run` passes (unit tests)
- [ ] No new TypeScript errors introduced
- [ ] No console warnings in browser

### Functional Verification

- [ ] Feature works as before (manual testing)
- [ ] No regressions in related features
- [ ] Edge cases handled (empty states, errors, loading)

### Code Review Criteria

- [ ] No dead code left behind
- [ ] Imports updated (no unused imports)
- [ ] Component props properly typed
- [ ] No hardcoded values (use constants)

### Rollback Plan

- [ ] Changes committed incrementally (easy to revert)
- [ ] Each commit is atomic and buildable
- [ ] Document any breaking changes

---

## Risk Assessment Matrix

| Risk Level | Description                       | Mitigation                                   |
| ---------- | --------------------------------- | -------------------------------------------- |
| **Low**    | Isolated changes, no shared state | Standard testing                             |
| **Medium** | Touches shared components/hooks   | Extra manual testing, staged rollout         |
| **High**   | Complex state, many dependencies  | Feature flag, extensive testing, pair review |

---

## Phase 1: Frontend Hooks Consolidation ⭐ HIGH IMPACT, LOW RISK

**Impact: Reduces ~700 lines of duplicate code**

### 1.1 Create Generic CRUD Hook Factory

**Files to Create:**

- `src/hooks/factories/use-crud-factory.ts` - Generic factory for create/update/delete operations
- `src/hooks/factories/use-list-factory.ts` - Generic factory for list queries
- `src/hooks/factories/use-detail-factory.ts` - Generic factory for detail queries

**Implementation Approach:**

```typescript
export function createCrudHooks<TRecord, TResponse>({
  collection,
  queryKeys,
  invalidators,
  mapToResponse,
}: CrudConfig<TRecord, TResponse>) {
  return {
    useCreate: () => createMutation(/* ... */),
    useUpdate: () => createMutation(/* ... */),
    useDelete: () => createMutation(/* ... */),
  };
}
```

**Files to Refactor:**

- `src/hooks/tasks.ts` (308 lines) - Apply generic factory
- `src/hooks/projects.ts` (153 lines) - Apply generic factory
- `src/hooks/users.ts` (245 lines) - Apply generic factory
- `src/hooks/groups.ts` (234 lines) - Apply generic factory
- `src/hooks/comments.ts` - Apply same pattern

**Result:** Reduce ~500 lines, keep 200 lines of business-specific logic

### 1.2 Consolidate Query Key Management

**File to Modify:**

- `src/hooks/query-keys.ts` - Replace repeated `normalizeListOptions` patterns

**Implementation:**

```typescript
export function createQueryKeys<T extends string>(resource: T) {
  return {
    all: [resource] as const,
    lists: () => [resource, "list"] as const,
    detail: (id: string) => [resource, "detail", id] as const,
    list: (options?: ListOptions) => /* simplified */,
  };
}
```

**Current Pattern (duplicated):**

- tasks, projects, users, groups, auditLogs each have identical `normalizeListOptions` pattern
- Lines 7-18 in query-keys.ts repeated for each resource

**Result:** Reduce ~100 lines, improve maintainability

### 1.3 Simplify Mutation Invalidators

**File to Modify:**

- `src/lib/query-invalidators.ts` (256 lines)

**Current Duplication:**

- `collectionInvalidators` - identical structure for tasks, projects, users, groups, comments
- `detailInvalidators` - identical structure for task, project, user
- `compositeInvalidators` - similar patterns repeated

**Implementation:**

```typescript
export function createInvalidator(
  resource: string,
  dependencies: string[] = [],
) {
  return (client: QueryClient) => {
    client.invalidateQueries({ queryKey: [resource] });
    dependencies.forEach((dep) => {
      client.invalidateQueries({ queryKey: [dep] });
    });
  };
}
```

**Result:** Reduce ~150 lines, easier to add new resources

---

## Phase 2: UI Component Standardization ⭐ HIGH IMPACT, LOW RISK

**Impact: Eliminates 25+ duplicate components**

### 2.1 Create Reusable Card Components

**Files to Create:**

- `src/components/ui/metric-card.tsx` - Generic metric card
- `src/components/ui/stat-card.tsx` - Generic stat display

**Implementation:**

```typescript
export function MetricCard({
  title,
  value,
  icon: Icon,
  valueColor,
  description,
  trend,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
```

**Replace These Duplicates:**

- `src/components/reports/metric-cards.tsx` (89 lines)
- `src/components/reports/employee-overview-cards.tsx` (74 lines)
- 20+ similar card components with identical structure

**Current Pattern (found in 25+ files):**

```jsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">{title}</CardTitle>
    <Icon className="text-muted-foreground h-4 w-4" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
  </CardContent>
</Card>
```

**Result:** Reduce ~400 lines, consistent UI

### 2.2 Create Generic FormField Wrapper

**File to Create:**

- `src/components/forms/form-field.tsx` - Single reusable FormField component

**Current Duplication:**

- 50+ repeated FormField patterns in task-fields.tsx, project-fields.tsx, user-fields.tsx
- Each follows identical pattern (lines 75-88 in task-fields.tsx)

**Implementation:**

```typescript
export function FormField({
  name,
  label,
  required,
  description,
  children,
}: FormFieldProps) {
  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <FormControl>{children}</FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
```

**Before:**

```jsx
<FormField
  control={control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**After:**

```jsx
<FormField name="title" label={label} control={control} required>
  <Input {...field} />
</FormField>
```

**Result:** Reduce ~300 lines, simpler forms

---

## Phase 3: Status Utils Simplification ⭐ HIGH IMPACT, MEDIUM RISK

**Impact: Reduces 384-line file by 60%**

### 3.1 Consolidate Status Color Logic

**File to Modify:**

- `src/lib/status-utils.ts` (384 lines) - **KISS violation**

**Current Issues:**

- `STATUS_COLOR_CLASSES` (duplicates with `taskStatusBadgeSolids`)
- `taskStatusColors`
- `taskStatusBgColors`
- `taskStatusBadgeSolids`
- 4 different ways to get the same color information

**Implementation - Single Source of Truth:**

```typescript
// Keep: TASK_STATUS_CONFIG (source of truth)
// Remove: All duplicate color mappings

export const STATUS_STYLES: Record<TasksStatusOptions, StatusStyle> = {
  todo: {
    color: "slate",
    badge: "bg-slate-600 text-white",
    background: "bg-slate-50",
    // ... other variants computed from base
  },
};

// Generate all variants dynamically
function generateStyleVariants(base: StatusStyle) {
  return {
    light: `bg-${base.color}-50 text-${base.color}-700`,
    solid: `bg-${base.color}-600 text-white`,
    subtle: `bg-${base.color}-100 text-${base.color}-800`,
  };
}
```

**Benefits:**

- Remove duplicate color mappings
- Generate variants from single source
- Keep only necessary public APIs

**Result:** Reduce to ~150 lines, single source of truth

---

## Phase 4: Constants Reorganization 🔶 MEDIUM IMPACT, MEDIUM RISK

**Impact: Eliminates re-export chains**

### 4.1 Consolidate Constants

**Current Issue:** 25 files with re-export chains creating unnecessary indirection

**Current Structure:**

```
constants/
├── index.ts (89 lines) - re-exports all 25 files
├── auth.ts
├── users.ts
├── groups.ts
├── projects.ts
├── tasks.ts
├── reports.ts
├── dashboard.ts
├── settings.ts
├── timesheet.ts
├── ui.ts
├── audit-logs.ts
├── helps.ts
├── saved-filters.ts
├── navigation.ts
├── loading.ts
├── errors.ts
├── text.ts
├── app.ts
├── misc.ts
├── common.ts
├── shared.ts
└── ...
```

**Solution - Domain-Based Consolidation:**

```
constants/
├── auth.ts (merge: auth, common)
├── tasks.ts (merge: tasks, subtasks)
├── ui.ts (merge: ui, common, loading)
├── navigation.ts
├── reports.ts (merge: reports, dashboard)
├── forms.ts (merge: project-fields, user-fields patterns)
├── misc.ts (merge: errors, notifications, helps, app)
└── index.ts (direct exports, NO re-exports)
```

**Implementation Steps:**

1. Group related constants by domain, not by component
2. Merge `common.ts`, `shared.ts` into domain files
3. Remove `constants/index.ts` re-export chain
4. Direct imports: `import { tasks } from "@/constants/tasks"`
5. Remove `fa` object (Persian abbreviation, not intuitive)

**Before:**

```typescript
// Imports through index.ts
import { fa } from "@/constants";
const title = fa.tasks.status.todo;

// Or specific import
import { tasks } from "@/constants/tasks";
```

**After:**

```typescript
// Direct domain import
import { tasks } from "@/constants/tasks";
const title = tasks.status.todo;
```

**Result:** Reduce to 8 files, eliminate indirection, clearer dependencies

---

## Phase 5: Monolithic Page Decomposition 🔶 MEDIUM IMPACT, HIGH RISK

**Impact: Better maintainability**

### 5.1 Break Down Large Pages

**Files to Refactor:**

- `src/pages/dashboard.tsx` (941 lines) - Extract dashboard widgets
- `src/pages/reports.tsx` (815 lines) - Extract report components
- `src/pages/settings.tsx` (624 lines) - Extract settings sections

**Current Issue:**

- Monolithic components handling multiple concerns
- Business logic mixed with presentation
- Complex state management in single files

**Implementation:**

```typescript
// Before: 941 lines in single file
export default function DashboardPage() {
  return (
    <div>
      {/* 200 lines of task stats */}
      {/* 200 lines of project stats */}
      {/* 200 lines of user activity */}
      {/* 200 lines of charts */}
      {/* 141 lines of other widgets */}
    </div>
  );
}

// After: Composed components (~100 lines)
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <TaskStatsWidget />
      <ProjectStatsWidget />
      <UserActivityWidget />
      <ChartsWidget />
    </div>
  );
}
```

**Create New Files:**

- `src/components/dashboard/task-stats-widget.tsx`
- `src/components/dashboard/project-stats-widget.tsx`
- `src/components/dashboard/user-activity-widget.tsx`
- `src/components/dashboard/charts-widget.tsx`

**For Reports:**

- `src/components/reports/filters-section.tsx`
- `src/components/reports/metrics-section.tsx`
- `src/components/reports/charts-section.tsx`
- `src/components/reports/table-section.tsx`

**Result:** Pages ~100 lines each, composable widgets

---

## Phase 6: Backend Simplification 🔶 MEDIUM IMPACT, MEDIUM RISK

**Impact: Reduces duplication, improves readability**

### 6.1 Create Record Helper Functions

**Files to Create:**

- `backend/helpers/record.go` - Record fetching helpers
- `backend/helpers/response.go` - JSON response helpers
- `backend/helpers/logging.go` - Centralized logging

**Current Issues:**

- `FindRecordById` repeated 15+ times with identical error handling
- 30+ similar error logging statements
- Repeated JSON response patterns (404, 400, 500 errors)

**Implementation:**

```go
// backend/helpers/record.go
func FindRecordByIdWithContext(app core.App, collectionName, id string, w http.ResponseWriter, r *http.Request) (*core.Record, error) {
    record, err := app.FindRecordById(collectionName, id)
    if err != nil {
        WriteJSONError(w, http.StatusNotFound, fmt.Sprintf("%s not found", collectionName))
        return nil, err
    }
    return record, nil
}

// backend/helpers/response.go
func WriteJSONError(w http.ResponseWriter, status int, message string) {
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func WriteJSONSuccess(w http.ResponseWriter, data interface{}) {
    json.NewEncoder(w).Encode(map[string]interface{}{"data": data})
}
```

**Before (15+ occurrences):**

```go
record, err := e.App.FindRecordById(CollectionUsers, userId)
if err != nil {
    log.Printf("Error finding user %q: %v", userId, err)
    return e.JSON(404, map[string]string{"error": ErrUserNotFound})
}
```

**After:**

```go
record := FindRecordByIdWithContext(e.App, CollectionUsers, userId, w, r)
if record == nil {
    return // Error already written
}
```

**Result:** Reduce ~200 lines, reusable helpers

### 6.2 Break Down Large Functions

**Files to Modify:**

- `backend/main.go`

**Target Functions:**

1. `handleGetUserLoginLogs` (69 lines) - Split into validation, fetching, formatting
2. `trackAuthMiddleware` (53 lines) - Split into body parsing, auth tracking, response recording
3. `handleToggleUserActive` (49 lines) - Extract validation logic

**Implementation:**

```go
// Before: 69 lines
func handleGetUserLoginLogs(w http.ResponseWriter, r *http.Request) {
    // Parse user ID
    // Fetch user
    // Validate permissions
    // Fetch login logs
    // Format response
    // Send response
}

// After: Smaller functions
func handleGetUserLoginLogs(w http.ResponseWriter, r *http.Request) {
    userId := getUserIdFromRequest(r)
    user := fetchUserOr404(w, r, userId)
    if user == nil { return }

    if !canViewLoginLogs(r) {
        WriteJSONError(w, http.StatusForbidden, "Forbidden")
        return
    }

    logs := fetchLoginLogs(userId)
    WriteJSONSuccess(w, logs)
}
```

**Result:** Functions ~20 lines each, easier to test

---

## Implementation Strategy

### Phase Execution Order

1. **Phase 1** (Frontend Hooks)
2. **Phase 2** (UI Components)
3. **Phase 3** (Status Utils)
4. **Phase 4** (Constants)
5. **Phase 6** (Backend)
6. **Phase 5** (Pages) - after other refactoring complete

### Risk Mitigation

1. **Incremental Changes**: Refactor file-by-file, commit frequently
2. **Backward Compatibility**: Keep public APIs, deprecate gradually
3. **Test Coverage**: Run `bun run test:all` after each phase
4. **Quality Gates**: Ensure `bun run check` passes after each change
5. **Feature Flags**: For breaking changes, use feature flags

### Success Metrics

- **Code Reduction**: 30-40% total reduction (~3000+ lines)
- **Maintainability**: Single source of truth for all duplicated patterns
- **Readability**: No file >300 lines (currently have 3 files >600 lines)
- **Testability**: Smaller functions = easier to test
- **Performance**: No performance impact (only code organization)

---

## Critical Files for Implementation (Updated)

Based on current state analysis, prioritize these files:

### Highest Priority (Quick Wins)

1. **src/lib/status-utils.ts** (358 lines) - Phase 3 completion
   - Remove duplicate color mappings
   - Target: ~150 lines | Risk: Low

2. **src/pages/reports.tsx** (815 lines) - Phase 5.2
   - Largest page, highest impact
   - Target: ~300 lines | Risk: Medium

3. **src/pages/settings.tsx** (624 lines) - Phase 5.3
   - Target: ~150 lines | Risk: Medium

### High Priority (Large Pages)

4. **src/pages/project-details.tsx** (619 lines) - Phase 5.4
   - Target: ~200 lines | Risk: Medium

5. **src/pages/tasks.tsx** (606 lines) - Phase 5.5
   - Complex state management
   - Target: ~200 lines | Risk: High

6. **src/pages/notifications.tsx** (602 lines) - Phase 5.6
   - Target: ~150 lines | Risk: Low

7. **src/pages/task-details.tsx** (592 lines) - Phase 5.7
   - Target: ~200 lines | Risk: Medium

### Medium Priority

8. **src/pages/my-tasks.tsx** (465 lines) - Phase 5.8
   - Can reuse components from tasks.tsx
   - Target: ~150 lines | Risk: Low

9. **src/pages/helps.tsx** (439 lines) - Phase 5.9
   - Target: ~150 lines | Risk: Low

10. **src/pages/tags.tsx** (434 lines) - Phase 5.10
    - Target: ~150 lines | Risk: Low

11. **Remaining hooks** (5 files, ~923 lines) - Phase 1.4
    - `use-file-upload.ts`, `use-task-filters.ts`, `notifications.ts`, etc.
    - Risk: Low

### Lower Priority

12. **src/constants/index.ts** - Phase 4
    - 25→8 files | Risk: Medium

13. **backend/helpers/record.go** - Phase 6.1 (new file)
    - Risk: Low

14. **src/lib/query-invalidators.ts** (296 lines) - Phase 1.3 remaining
    - Target: ~150 lines | Risk: Low

### Already Completed

- ~~src/hooks/factories/use-crud-factory.ts~~ ✅
- ~~src/components/ui/metric-card.tsx~~ ✅
- ~~src/components/forms/form-field.tsx~~ ✅
- ~~src/pages/dashboard.tsx~~ ✅ (941→232 lines)
- ~~src/hooks/tasks.ts, projects.ts, users.ts, groups.ts~~ ✅

---

## Summary of Benefits

### Achieved So Far

- ✅ **CRUD hook factory** - Consistent pattern for all resource hooks
- ✅ **MetricCard component** - Replaced 25+ duplicate Card patterns
- ✅ **FormField wrapper** - Simplified form field boilerplate
- ✅ **Dashboard decomposition** - 75% reduction (941→232 lines)
- ✅ **getStatusColorVariant()** - Unified status color API

### Remaining Wins

- **Complete status-utils.ts** - 358→150 lines (208 line reduction)
- **Decompose 9 pages** - 5,196→~1,650 lines (~3,546 line reduction)
  - reports.tsx, settings.tsx, project-details.tsx, tasks.tsx
  - notifications.tsx, task-details.tsx, my-tasks.tsx, helps.tsx, tags.tsx
- **Refactor 5 hooks** - ~923 lines → ~500 lines (~400 line reduction)
- **Consolidate constants** - 25→8 files (clearer dependencies)
- **Backend helpers** - ~200 line reduction, reusable patterns
- **Total potential reduction:** ~4,350+ lines

### Long-term Improvements

- **Faster feature development** - use existing factories and components
- **Easier onboarding** - consistent patterns across codebase
- **Better testing** - smaller, focused functions and components
- **Reduced bugs** - single source of truth, less duplication to maintain

---

## Recommended Next Steps (Priority Order)

### Quick Wins & High Impact

1. **Complete Phase 3** - Finish status-utils.ts consolidation
   - Quick win, low risk, clears "partially completed" status

2. **Phase 5.2** - Break down reports.tsx (815 lines)
   - Largest page, highest single-file impact

3. **Phase 5.3** - Break down settings.tsx (624 lines)
   - Medium risk, clear extraction boundaries

### Large Pages (Medium Risk)

4. **Phase 5.4** - Break down project-details.tsx (619 lines)
5. **Phase 5.7** - Break down task-details.tsx (592 lines)
6. **Phase 5.6** - Break down notifications.tsx (602 lines)

### Complex & Remaining Pages

7. **Phase 5.5** - Break down tasks.tsx (606 lines)
   - **High risk** - complex state, do after simpler pages
8. **Phase 5.8-5.10** - my-tasks.tsx, helps.tsx, tags.tsx
   - Low risk, can reuse components from earlier work

### Cleanup & Backend

9. **Phase 1.4** - Remaining hooks consolidation
10. **Phase 4** - Constants reorganization
    - Do incrementally (one domain at a time)
11. **Phase 6** - Backend simplification
    - Can be done in parallel with frontend work

### Code Quality (Phase 7)

12. **Phase 7.1** - Remove unnecessary comments
13. **Phase 7.3** - Fix type workarounds (`as any`, `@ts-ignore`)
14. **Phase 7.2** - Remove excessive defensive checks
15. **Phase 7.4-7.5** - Normalize style & remove over-engineering

### Parallel Track (Optional)

- **Phase 1.3 remaining** - query-invalidators.ts can be done anytime
- **Phase 6** - Backend work can run parallel to frontend phases
- **Phase 7** - AI slop removal can be done incrementally alongside other work

---

This plan provides a clear roadmap to transform the codebase from highly duplicated to clean, maintainable, and following DRY/KISS principles. Each phase builds on the previous one, and all changes maintain existing functionality while dramatically improving code quality.

**Last Updated:** 2025-12-22 | **Plan Status:** Active
