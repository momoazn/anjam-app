# Delegate Task 01 — Task Details Content Cleanup (Convex v1)

## Context
- Branch: `feat/convex-migration`
- Goal: make `src/components/task/task-details-content.tsx` compile cleanly and match v1 scope.
- v1 scope note: time tracking / time entries / subtasks are **out of scope** (they were removed).

## Current Problems (Observed)
- `src/components/task/task-details-content.tsx` still contains many unused imports and unused props related to removed time tracking.
- There are remaining type errors caused by:
  - passing `number` values to helpers expecting `string`
  - using `task.id` even though Convex primary key is `_id` and `id` may be optional in compatibility wrappers.

## Deliverable
- A clean, minimal `TaskDetailsContent` component that:
  - renders task core info + description + comments tab
  - does **not** include time tracking/subtasks UI
  - uses a single consistent task id value computed as `taskId = task.id ?? task._id`
  - compiles with TypeScript strict checks

## Files to Change
- `src/components/task/task-details-content.tsx`

## Acceptance Criteria
- `bun run type:check` no longer reports errors from `src/components/task/task-details-content.tsx`.
- No references to removed time tracking components remain in this file.
- Comments flow still works (composer + list still render) and uses valid IDs.

## Implementation Notes
- Reduce the prop surface:
  - Remove time tracking props from `TaskDetailsContentProps` if unused.
  - Remove `handleTimeEntrySave` if unused.
- Ensure any call sites of `TaskDetailsContent` are updated accordingly (search for `<TaskDetailsContent` usage).
- For any “number passed where string required”:
  - Identify the helper signature and pass the expected type (e.g. convert number timestamp to ISO string if helper expects string).

## Suggested Workflow
1. `bun run type:check` and focus only on errors from `task-details-content.tsx`.
2. Remove unused imports/props until TS6133 errors disappear.
3. Introduce `const taskId = task.id ?? task._id;` and use it consistently in child props.
4. Re-run `bun run type:check` and confirm this file is clean.

