# Comprehensive Project Cleanup Plan

## Overview

This plan addresses code quality issues, removes duplicate/unused code, and fixes configuration inconsistencies across the task-manager-app. Focus areas: frontend code quality, configuration/dependencies, and selected backend improvements.

**Approach**: Aggressive cleanup - remove all unused code and dependencies.

---

## Phase 1: Dependencies & Test Environment Cleanup

### 1.1 Remove Unused Dependencies

**Files**: `package.json`

- Remove `tw-animate-css` (v1.2.5) - No imports found in codebase
- Remove `happy-dom` (v20.0.10) - Using jsdom in vitest.config.ts, don't need both
- Evaluate `next-themes` (v0.4.6) - Only used in `src/components/ui/sonner.tsx`, verify if truly needed for theme switching

**Impact**: Reduces bundle size and installation time

### 1.2 Update Documentation

**Files**: `README.md`

- Fix line 122: Remove "No test runner configured yet" statement
- Update to reflect Vitest and Playwright setup
- Document actual test coverage status (minimal coverage currently)

---

## Phase 2: Remove Duplicate & Unused Code (Frontend)

### 2.1 Remove Duplicate `getUserInitials` Function

**Files**:

- `src/components/user-avatar.tsx` (lines 6-22) - DELETE local implementation
- `src/lib/utils.ts` (lines 8-20) - KEEP this version

**Changes**:

1. Remove `getUserInitials` function from `user-avatar.tsx`
2. Import from `@/lib/utils` instead
3. Update call site at line ~110 to pass parameters correctly

**Impact**: Eliminates duplicate code, single source of truth

### 2.2 Remove Unused Utility Functions

**Files**:

- `src/lib/utils.ts` (lines 22-43) - Remove `formatUserName` function
- `src/lib/time-utils.ts` (lines 32-51) - Remove `formatTimeSpentCompact` function

**Changes**:

1. Remove `formatUserName` export and implementation
2. Remove import from `src/pages/task-details.tsx` (line 50)
3. Remove `formatTimeSpentCompact` export and implementation

**Impact**: Cleaner API surface, removes dead code

### 2.3 Fix or Remove Demo Component

**Files**: `src/components/section-cards.tsx`

**Decision needed**: This component has hardcoded demo data (revenue, customers, etc.)

**Options**:

- **Option A (Recommended)**: Remove entirely if not used in any routes
- **Option B**: Move to `src/components/examples/` or `src/components/demos/` if keeping for reference

### 2.4 Remove Unused Hook Exports

**Files**:

- `src/hooks/use-error-handler.ts` - `useErrorHandler` hook not imported anywhere

**Changes**: Remove `useErrorHandler` hook if not needed

---

## Phase 3: Configuration Alignment

### 3.1 Align TypeScript Target Versions

**Files**:

- `tsconfig.app.json` (currently ES2020)
- `tsconfig.node.json` (currently ES2022)
- `vite.config.ts` (build.target currently "esnext" at line 19)

**Changes**:

1. Set all TypeScript targets to **ES2020** for consistency and compatibility
2. Change `vite.config.ts` line 19 from `target: "esnext"` to `target: "es2020"`

**Impact**: Consistent transpilation, better browser compatibility

### 3.2 Fix Package.json Dev Script

**Files**: `package.json`

**Issue**: Line 12 `dev` script uses `serve:server` (production) instead of `dev:server` (live reload)

**Changes**:

```json
"dev": "concurrently \"bun run dev:server\" \"bun run dev:client\"",
```

**Impact**: Proper live reload during development

### 3.3 Add Missing Radix UI Components to Vite Chunks

**Files**: `vite.config.ts`

**Changes**: Add missing Radix UI components to manual chunks optimization (around lines 25-45):

- `@radix-ui/react-accordion`
- `@radix-ui/react-popover`
- `@radix-ui/react-scroll-area`

**Impact**: Better bundle splitting and caching

---

## Phase 4: Backend Code Quality (Selected High-Impact Items)

### 4.1 Extract Collection Name Constants

**Files**:

- Create `backend_constants.go` or add to existing constants file
- Update `main.go` (all collection name string literals)

**Changes**: Add constants for collection names:

```go
const (
    CollectionUsers = "users"
    CollectionGroups = "groups"
    CollectionProjects = "projects"
    CollectionTasks = "tasks"
    CollectionNotifications = "notifications"
    CollectionUserLoginLogs = "user_login_logs"
    CollectionSuperusers = "_superusers"
)
```

Replace ~40+ string literals throughout `main.go` with constants.

**Impact**: Type safety, prevents typos, easier refactoring

### 4.2 Extract Magic Numbers to Constants

**Files**: `backend_constants.go`, `main.go`

**Changes**: Add to constants:

```go
const (
    CodeLength = 3
    MaxCodeGenerationAttempts = 100
    DefaultPageSize = 50
    MaxPageSize = 100
    MaxFailedLoginAttempts = 5  // Already exists at line 918
)
```

Update usage in:

- Line 181: `handleGroupCreation`
- Line 526: `generateUniqueProjectCode`
- Line 1221, 1228: `handleGetUserLoginLogs`
- Line 157: `generateRandomCode`

**Impact**: Centralized configuration, easier to adjust limits

### 4.3 Refactor Duplicate Authentication Validation

**Files**: `main.go`

**Changes**: Extract repeated auth validation pattern (lines 647-654, 1107-1114, 1163-1170, 1204-1211) into helper:

```go
func validateAuth(e *core.RequestEvent) (*core.Record, error) {
    requestInfo, err := e.RequestInfo()
    if err != nil {
        return nil, e.BadRequestError("Invalid request", err)
    }
    authRecord := requestInfo.Auth
    if authRecord == nil {
        return nil, e.JSON(401, map[string]string{"error": ErrAuthRequired})
    }
    return authRecord, nil
}
```

Replace 4 duplicate blocks with single function call.

**Impact**: DRY principle, consistent auth handling

---

## Phase 5: Code Organization Improvements

### 5.1 Standardize Import Ordering

**Files**: Multiple files with inconsistent imports

- `src/pages/task-details.tsx` (lines 1-53)
- `src/pages/dashboard.tsx` (lines 1-50)
- Other files mixing relative and absolute imports

**Standard Order**:

1. External packages (React, date-fns, etc.)
2. Internal absolute imports (`@/...`)
3. Component imports
4. Type imports (`import type`)

**Impact**: Improved readability and consistency

### 5.2 Complete Hooks Index Exports

**Files**: `src/hooks/index.ts`

**Changes**: Add missing exports:

```typescript
export { useTags } from "./tags";
export { useErrorHandler } from "./use-error-handler";
export { useFileUpload } from "./use-file-upload";
export { useTheme } from "./use-theme";
export { useMobile } from "./use-mobile";
export { useToast } from "./use-toast";
```

**Note**: Skip if hooks were removed in Phase 2.4

**Impact**: Single entry point for all hooks

---

## Phase 6: Verification & Testing

### 6.1 Run Quality Checks

**Commands**:

```bash
bun run check        # Type check + lint + format
bun run build        # Ensure build succeeds
bun run test:run     # Run unit tests
```

### 6.2 Manual Verification

- Start dev server (`bun run dev:all`) and verify app loads
- Test key user flows (login, create task, etc.)
- Verify no console errors in browser

---

## Summary of Changes

### Files to Modify (Frontend - 8 files)

1. `package.json` - Remove dependencies, fix dev script
2. `README.md` - Update documentation
3. `src/components/user-avatar.tsx` - Remove duplicate function
4. `src/lib/utils.ts` - Remove unused `formatUserName`
5. `src/lib/time-utils.ts` - Remove unused `formatTimeSpentCompact`
6. `src/pages/task-details.tsx` - Remove unused import
7. `src/hooks/use-error-handler.ts` - Remove if unused
8. `vite.config.ts` - Fix target, add Radix chunks
9. `tsconfig.app.json` - Align ES target
10. `tsconfig.node.json` - Align ES target

### Files to Modify (Backend - 2 files)

11. `backend_constants.go` - Add collection names and magic number constants
12. `main.go` - Replace string literals, extract helper function

### Files to Remove (if applicable)

- `src/components/section-cards.tsx` - If demo component not needed
- `src/hooks/use-error-handler.ts` - If hook truly unused

### Estimated Impact

- **LOC Removed**: ~150-200 lines (unused code, duplicates)
- **Files Changed**: 10-12 files
- **Build Size Reduction**: ~50-100KB (dependency removal)
- **Type Safety**: ✅ Improved (backend constants)
- **Maintainability**: ✅ Significantly improved

---

## Execution Order

Follow phases 1→2→3→4→5→6 sequentially. Each phase can be completed independently, but order ensures dependencies are handled correctly (e.g., remove dependencies before running build).

## Risk Assessment

- **Low Risk**: Removing unused code with no imports/references
- **Medium Risk**: Backend refactoring (test thoroughly)
- **Rollback**: All changes tracked in git, easy to revert per-file

## Next Steps After Cleanup

1. Consider expanding test coverage (currently minimal)
2. Consider splitting `main.go` into multiple files (auth, handlers, helpers)
3. Add Playwright tests for critical user flows
