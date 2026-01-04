# AI Slop Cleanup Plan

This plan documents the cleanup work to remove AI slop, thin wrappers, duplicated code, and unnecessary complexity. It is intentionally specific (files + patterns) so the execution can be mechanical and low-risk.

## Audit Approach

- Searched for comment noise and “divider” blocks.
- Searched for `any` casts and eslint disables that hide type issues.
- Searched for `try {` patterns to locate defensive/boilerplate error handling.
- Searched for barrel exports / thin wrappers and unused re-exports.

## Findings And Planned Changes

### 1) Comment Noise Cleanup (module docstrings, section dividers, verbose JSDoc)

Remove file-level JSDoc and section divider comments that are inconsistent with the rest of the codebase, plus redundant per-function JSDoc that only restates types.

Target files:

- `src/hooks/tasks.ts` (module JSDoc)
- `src/hooks/projects.ts` (module JSDoc)
- `src/hooks/users.ts` (module JSDoc)
- `src/hooks/comments.ts` (module + per-function JSDoc)
- `src/hooks/index.ts` (module JSDoc)
- `src/hooks/factories/use-crud-factory.ts` (JSDoc on config + factory)
- `src/hooks/use-mutation-factory.ts` (JSDoc on config + factory)
- `src/hooks/project-members.ts` (section dividers + per-hook JSDoc, including @example)
- `src/hooks/organization-members.ts` (section dividers + per-hook JSDoc)
- `src/hooks/organization-invites.ts` (section dividers + per-hook JSDoc)
- `src/hooks/tags.ts` (single-line JSDoc)
- `src/lib/time-utils.ts` (verbose JSDoc on small helpers)
- `src/store/auth-store.ts` (single JSDoc type note)

Optional pass (if comments are only duplicating the heading or JSX structure):

- `src/components/settings/preferences-section.tsx` (section header comments)
- `src/components/task/bulk-actions-bar.tsx` (inline “Bulk X” comments)

### 2) Type Escapes / `any` Cleanup

Replace explicit `any` casts and lint disables with proper types. This is direct removal of slop and makes the type system meaningful.

Target files:

- `src/hooks/organization-invites.ts` (replace `data.user as any` with typed auth payload)
- `src/components/settings/preferences-section.tsx` (replace `icon: any` with `Icon` type from Tabler)
- Recharts components using `any` + eslint disable:
  - `src/components/reports/workload-distribution-chart.tsx`
  - `src/components/reports/employee-productivity-chart.tsx`
  - `src/components/reports/employee-comparison-chart.tsx`
  - `src/components/reports/timeliness-donut.tsx`
  - `src/components/reports/productivity-trends-chart.tsx`
  - `src/components/reports/overtime-analysis-chart.tsx`
  - `src/components/reports/throughput-chart.tsx`
  - `src/components/reports/priority-distribution.tsx`
  - Use `TooltipProps`, `Payload`, or `TooltipPayload` from Recharts types instead of `any`.

### 3) Redundant Defensive Checks / Try-Catch Noise

Several UI handlers wrap `mutateAsync` with nearly identical `try/catch/finally` blocks and local `isSaving` flags. These are repetitive and often unnecessary because mutation hooks already expose `isPending` and can accept `onSuccess/onError` handlers.

Plan:

- Replace per-component `isSaving` + `try/catch` with mutation `isPending` + `onSuccess/onError` where possible, and centralize toast handling in the mutation hook callsite.
- Keep try/catch only when it actually transforms errors or guarantees a fallback state.

Candidates to simplify:

- `src/components/settings/preferences-section.tsx`
- `src/components/settings/profile-section.tsx`
- `src/components/settings/security-section.tsx`
- `src/pages/settings/organization.tsx`
- `src/pages/settings/members.tsx`
- `src/pages/organizations/create.tsx`
- `src/pages/audit-logs.tsx`
- `src/components/task/bulk-actions-bar.tsx`
- `src/components/task/time-entry-dialog.tsx`
- `src/components/task/time-entries.tsx`
- `src/components/task/task-details-content.tsx`
- `src/components/task/comment-item.tsx`
- `src/components/user/user-list-table.tsx`
- `src/components/user/user-login-logs-dialog.tsx`

### 4) Thin Wrappers / Useless Barrels

Remove one-off re-export files or unused barrels that add indirection with no value.

Target files:

- `src/components/forms/form-field.tsx` (single re-export used once; import directly from `src/components/recipes/form-field.tsx`)
- `src/components/organization/index.ts` (unused barrel)
- `src/components/recipes/index.ts` (unused barrel)
- `src/components/design-system/index.ts` (unused barrel)
- `backend/helpers/response.go` (one callsite; inline JSON write in `backend/main.go`)

### 5) Duplicate Types And Helpers

Remove duplicate type definitions and consolidate to a single source of truth.

Target files:

- `src/lib/reports-utils.ts` duplicates types defined in `src/lib/reports/types.ts`.
  - Remove duplicates from `src/lib/reports-utils.ts` and import from `src/lib/reports/types.ts`.

Also remove unused helper:

- `src/lib/notifications-utils.ts` exports `getNotificationsQueryKey` but it is unused; remove it.

### 6) ESLint Disable Cleanup (Fix Root Causes)

Replace blanket disables with proper fixes or targeted comments explaining the exception.

Target files:

- `src/pages/task-details.tsx` (`react-hooks/set-state-in-effect`)
- `src/pages/tasks.tsx` (`react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`)
- `src/components/task/subtasks.tsx` (`react-hooks/set-state-in-effect`)
- `src/hooks/use-theme.ts` (`react-hooks/set-state-in-effect`)
- `src/hooks/use-saved-filters.ts` (`react-hooks/set-state-in-effect`)
- `src/hooks/use-keyboard-shortcuts.tsx` (`react-hooks/exhaustive-deps`)

### 7) Simplify Mutation Factory (Remove Boilerplate)

The mutation factory currently wraps TanStack mutation callbacks with extra parameters, redundant casts, and `void context` no-ops.

Plan:

- Align `createMutation` callbacks to the actual TanStack Query signature.
- Remove `void context` lines and unnecessary casts around `variables`.
- Use the mutation’s `isPending` state at callsites instead of extra local state where applicable.

Files:

- `src/hooks/use-mutation-factory.ts`
- Call sites in `src/hooks/factories/use-crud-factory.ts` and other hooks if signature changes are needed.

### 8) Minor Consistency Fixes

- Replace `console.warn` in `src/hooks/factories/use-crud-factory.ts` with `logWarn` from `src/lib/logger.ts` to match logging style.
- Review `backend/backend_constants.go` for indirection that can be folded into the single source (`backend/config/constants.go`) if redundant.

## Execution Order

1. Comment noise cleanup (fast + low risk)
2. Remove `any` and lint disables (type-safe + medium risk)
3. Remove thin wrappers and unused barrels (low risk)
4. Simplify mutation/try-catch patterns (medium risk)
5. Deduplicate reports types + helper cleanup (low risk)
6. Backend small simplifications (low risk)

## Validation Plan

- Run `bun run check` after all changes are done.
- Run targeted tests only if a change touches logic used in tests (e.g., `src/hooks/*`, `src/lib/*`).
