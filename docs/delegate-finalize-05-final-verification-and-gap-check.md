# Delegate Prompt: Final Verification + Migration Gap Check (No Resend)

## Context

We need confidence that the Convex migration is complete for Product v1 (excluding Resend email sending work which is deferred).

This task is to **verify**, **document gaps**, and make small fixes if needed to meet the migration Definition of Done.

Reference:

- `docs/convex-migration-plan.md`
- `docs/convex-migration-tasks.md`

## Scope

### In scope

- Run and update the "verification" section of the task list (K section).
- Confirm the app is Convex-only and Product-only.
- Identify any leftover references to PB/Go/mode and **document them as TODOs** with exact file paths and commands to reproduce.

### Explicitly skip

- Resend/email sending integration and any auth-email delivery configuration.
- Making code changes (other delegates own code removal work).

## Required Deliverables

1. Update `docs/convex-migration-tasks.md` statuses to reflect reality (DONE/IN PROGRESS/PENDING).
2. Provide a short "gap report" section in the doc:
   - what is still missing (if anything), with file paths and steps
3. Proof:
   - `bun run check` passes.
   - Grep checks:
     - `rg -n "pocketbase|pb_schema|:8090|/api/tm|/api/v1" src convex` => empty
     - `rg -n "useCurrentOrgMode|isProductMode|OrgMode|\boperations\b" src convex` => empty

## Execution Checklist

1. Run grep checks above and fix remaining issues if small/contained.
2. Run `bun run check`.
3. Update docs task statuses accordingly.

## Dependency Note (Run Order)

- This verification task should run after delegates 01–04 have landed (or at least after their changes are locally present), otherwise it will mostly report expected failures.

---

## Verification Results

### Grep Check 1: PocketBase/Go Backend References

```
rg -n "pocketbase|pb_schema|:8090|/api/tm|/api/v1" src convex
```

**Result**: ✅ PASS - No matches

### Grep Check 2: Mode/Operations References

```
rg -n "useCurrentOrgMode|isProductMode|OrgMode|\boperations\b" src convex
```

**Result**: ❌ FAIL - Multiple matches found (see Gap Report below)

### TypeCheck

```
bun run check
```

**Result**: ❌ FAIL - 46 TypeScript errors (all related to removed `useCurrentOrgMode` hook)

---

## Gap Report

### Gap 1: Removed `useCurrentOrgMode` Hook Still Imported

**Issue**: The `useCurrentOrgMode` hook was removed from `src/store/auth-store.ts` (delegate 01 work), but **35 files** still import and use it.

**Impact**: TypeScript compilation fails with `TS2724: '"@/store/auth-store"' has no exported member named 'useCurrentOrgMode'`

**Affected Files**:

```
src/components/command-menu.tsx:26
src/components/notifications/mentions-list.tsx:11
src/components/notifications/notification-filters.tsx:19
src/components/page-header.tsx:12
src/components/task/board/board-card.tsx:29
src/components/task/board/board-column.tsx:17
src/components/task/task-details-content.tsx:19
src/components/task/task-details-sidebar.tsx:23
src/components/task/task-filters-panel.tsx:18
src/components/task/task-list-group.tsx:5
src/components/task/task-list-header.tsx:23
src/components/task/task-list-view.tsx:4
src/hooks/use-keyboard-shortcuts.tsx:5
src/pages/create-project.tsx:24
src/pages/inbox.tsx:18
src/pages/insights.tsx:29
src/pages/project-tasks.tsx:26
src/pages/projects.tsx:12
src/pages/select-organization.tsx:11
src/pages/settings.tsx:13
src/pages/settings/members.tsx:54
src/pages/tags.tsx:15
```

**Resolution**: These files need to be updated to remove `useCurrentOrgMode` usage. Since this is mode-switching logic no longer needed in product-only mode:

- Remove imports of `useCurrentOrgMode`
- Replace `const isProductMode = mode === "product"` checks with `true`
- Remove conditional rendering based on `isProductMode`

### Gap 2: Unused `operations` Section in Command Menu Constants

**Issue**: `src/constants/command-menu.ts:22-31` still contains an `operations` section that is unused.

**Resolution**: Remove the `operations` object since operations mode is removed.

### Gap 3: Unused Imports

**Issue**: Several files have unused imports causing lint errors:

- `src/pages/create-task.tsx`: `IconActivity`, `IconCpu`, `IconTerminal2`, `PageHeader`
- `src/pages/edit-task.tsx`: `IconActivity`, `IconCpu`, `IconTerminal2`, `PageHeader`
- `src/pages/edit-project.tsx`: `IconPencil`, `PageHeader`
- `src/pages/notifications.tsx`: Multiple unused icons
- `src/components/project/project-list-group.tsx`: `projectLabels`

**Resolution**: Remove unused imports.

---

## Summary

| Check                     | Status  |
| ------------------------- | ------- |
| No PocketBase/Go API refs | ✅ PASS |
| No mode/operations refs   | ❌ FAIL |
| `bun run check` passes    | ❌ FAIL |

**Migration Status**: Core Convex migration is complete. The remaining gaps are frontend code cleanup related to the removed dual-mode architecture. These are not blockers for the Convex backend but are required for the application to compile and run.

**Next Steps**: A follow-up delegate should remove `useCurrentOrgMode` references from all affected files and clean up unused imports.
