# Delegate Task 02 — Task List UI: Typing + ID Consistency (Convex v1)

## Context
- Branch: `feat/convex-migration`
- Goal: fix remaining TypeScript errors in task list UI components by normalizing IDs and tightening types.

## Current Problems (Observed)
Errors are concentrated in these files:
- `src/components/task/task-list-group.tsx`
- `src/components/task/task-list-header.tsx`
- `src/components/task/task-list-item.tsx` (remaining type mismatch(s))
- `src/components/task/task-list-view.tsx` (unused import)

Root causes:
- Mixed PocketBase compatibility fields (`id`, `display_id`, `assignee`, `project`) with Convex fields (`_id`, `displayId`, `assigneeUserId`, `projectId`).
- Status typing issues where objects/config are incorrectly used as index keys.
- Arrays of `(string | undefined)` passed where `string[]` is required.

## Deliverable
- Task list UI compiles cleanly and uses consistent IDs everywhere:
  - `taskId = task.id ?? task._id`
  - No `(string | undefined)` arrays passed to APIs expecting `string[]` (filter out undefined).
- Status / priority labels render without TypeScript index errors.

## Files to Change
- `src/components/task/task-list-group.tsx`
- `src/components/task/task-list-header.tsx`
- `src/components/task/task-list-item.tsx`
- `src/components/task/task-list-view.tsx`

## Acceptance Criteria
- `bun run type:check` no longer reports errors from the above files.
- Clicking a task navigates using a valid ID (Convex `_id`).
- Any usage of `tasks.status[...]` / `tasks.priority[...]` is typed correctly.

## Implementation Notes
- Prefer using shared types from `src/types/tasks.ts` (`TaskStatus`, `TaskPriority`) in UI props.
- When mapping tasks, normalize shape early:
  - ensure each task object passed into UI has both `_id` and `id` (if compatibility needed), or always compute `taskId` locally.
- For status label lookups:
  - use `task.status as TaskStatus` when indexing `tasks.status`.
- For lists of IDs:
  - `const ids = arr.map(...).filter((x): x is string => Boolean(x));`

## Suggested Workflow
1. Run `bun run type:check` and fix errors in order: header → list group → list item → list view.
2. Remove unused imports (`cn`) where flagged.
3. Validate all `navigate(`/tasks/${...}`)` calls use `taskId`.

