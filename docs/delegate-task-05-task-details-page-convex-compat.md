# Delegate Task 05 — Task Details Page: Remove Global Roles + Fix Convex Fields

## Context

- Branch: `feat/convex-migration`
- v1: global roles are removed; only org-level role exists (`owner`/`member`).
- Goal: make `src/pages/task-details.tsx` compile and behave correctly with Convex task/user shapes.

## Current Problems (Observed)

- `src/pages/task-details.tsx` references `authUser.role` and `authUser.id` (global role + PB-style id).
- It references `display_id` but Convex uses `displayId`.
- It expects `TaskWithDetails.project` to be an object `{ name }`, but some hooks return only `projectId` unless expanded/mapped.

## Deliverable

- A working task details page that:
  - uses `authUser._id` instead of `authUser.id`
  - uses org role from store (e.g. `useCurrentOrgRole`) for any owner-only gating
  - uses `task.displayId` (and/or `task.display_id` only if compatibility mapping is still present)
  - resolves project display name safely (if `task.expand?.project` exists, use it; otherwise show fallback)

## Files to Change

- `src/pages/task-details.tsx`
- Potentially update related types in:
  - `src/hooks/tasks.ts` (ensure task `expand.project` shape is consistent)
  - `src/components/task/task-details-sidebar.tsx` if it expects PB-specific fields

## Acceptance Criteria

- `bun run type:check` no longer reports errors from `src/pages/task-details.tsx`.
- Task details page renders:
  - header with displayId
  - content and sidebar
  - comments list + composer
- No references to global roles exist in this page.

## Suggested Workflow

1. Replace `authUser.role` checks with org-role checks (`owner`/`member`) or remove if not required.
2. Replace any `.id` usage with `._id`.
3. Normalize display id usage: `const displayId = task.displayId ?? task.display_id ?? ""`.
4. Ensure the `TaskWithDetails` type aligns with what `useTask` returns.
