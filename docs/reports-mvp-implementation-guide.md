# Reports MVP — Implementation Guide

A detailed, explicit guide to implement the MVP reports with the current schema and libraries. This is written to be unambiguous and easy to follow.

## Goals (MVP)

Implement the following with minimal risk, using existing data and UI kits:

- Time range presets + basic filters (project, assignee, status, priority)
- Overview metric cards
- Throughput Trend (daily/weekly)
- Completion Timeliness Donut (On‑time / Overdue / No‑deadline)
- Priority Distribution (by priority)
- Individual Leaderboard (Top 5)
- Shared Drill‑down Drawer (filtered task table)

## Tech Constraints and Decisions

- Keep current schema; do not add backend fields.
- Use `updated` timestamp of tasks with `status=done` as the completion time.
- Use `deadline` if present to determine timeliness.
- Use local time for grouping and comparisons; format display via `date-fns-jalali` and `digitsEnToFa`.
- Respect role scoping in `useTasks` (employees see only their tasks). Additional filters are client-side.
- Prefer client-side aggregations for now; ensure pagination/limits are sufficient (see Data Fetching).

## Data Fetching

- Tasks: Prefer full list up to reasonable limits to get accurate aggregates.
  - Option A (quick): increase page size in `useTasks` or parameterize to fetch more than 200.
  - Option B (better): add a `getFullList` path behind a flag when filters are light.
- Users: Already uses `getFullList` in `useUsers`.
- Always expand: `project,assignee` for labels in charts/tables.

Suggested change in `src/hooks/tasks.ts` (design, not code):

- Add optional `mode: 'paged' | 'full'` (default `'full'` for reports).
- When `mode==='full'`, call `getFullList<TaskWithProject>({ batch: 500, filter, sort, expand })`.

## Filters and Time Range

- Time Presets: Today, 7D, 30D, Quarter, YTD, Custom.
- Filters: Project (multi), Assignee (multi), Status (multi), Priority (multi).
- State Shape (example):
  - `timeRange: { preset: '7D' | '30D' | 'QTD' | 'YTD' | 'CUSTOM', start?: Date, end?: Date }`
  - `filters: { projectIds: string[], assigneeIds: string[], statuses: TasksStatusOptions[], priorities: TasksPriorityOptions[] }`

Time range definitions (inclusive of start 00:00, inclusive of end 23:59:59):

- Today: start = today 00:00, end = now
- 7D: start = now - 6 days at 00:00, end = now
- 30D: start = now - 29 days at 00:00, end = now
- Quarter (QTD): start = first day of current quarter 00:00, end = now
- YTD: start = Jan 1 00:00, end = now

## UI Architecture (files and responsibilities)

Create small, focused components under `src/components/reports/` and keep `src/pages/reports.tsx` as an orchestrator.

- `src/components/reports/filters-bar.tsx`

  - Props: `value`, `onChange`, `projects`, `users`
  - Renders time presets and multi-selects for project, assignee, status, priority.
  - Debounce `onChange` by 200ms.

- `src/components/reports/metric-cards.tsx`

  - Props: `{ totals: { total: number; completed: number; wip: number; overdue: number; onTimeRate: number } }`
  - Renders 4–5 small cards with RTL labels and Persian digits.

- `src/components/reports/throughput-chart.tsx`

  - Props: `{ data: Array<{ date: string; count: number }>, bucket: 'daily' | 'weekly' }`
  - Recharts Bar or Line; X is date label (Jalali format), Y is count.

- `src/components/reports/timeliness-donut.tsx`

  - Props: `{ data: Array<{ name: string; value: number; key: 'on_time' | 'overdue' | 'no_deadline' }> }`
  - Recharts Pie with legend and tooltip.

- `src/components/reports/priority-distribution.tsx`

  - Props: `{ data: Array<{ name: string; value: number; key: TasksPriorityOptions }> }`
  - Recharts Bar or Pie (keep consistent with existing chart style).

- `src/components/reports/leaderboard.tsx`

  - Props: `{ rows: Array<{ userId: string; name: string; completed: number; completionRate: number; onTimeRate: number }> }`
  - Sortable by `completionRate` default; display top 5.

- `src/components/reports/drilldown-drawer.tsx`
  - Props: `{ open: boolean; onOpenChange: (v:boolean)=>void; rows: TaskRow[]; title: string }`
  - `TaskRow` fields: `id,title,status,priority,deadline,ageDays,assigneeName,projectName,tags[]`.
  - Contains a `Table`.

`src/pages/reports.tsx`

- Owns state for time range and filters.
- Uses `useTasks({ expandFields: 'project,assignee', mode:'full' })` and `useUsers()`.
- Computes derived datasets via new utils (see below) and passes to components.

## Utilities (to add/extend in src/lib/reports-utils.ts)

Add the following pure functions with exact signatures and behavior. All dates are `Date` objects, and results are plain objects/arrays.

1. Time utilities

- `getTimeRange(preset: 'TODAY'|'7D'|'30D'|'QTD'|'YTD'|'CUSTOM', custom?: {start:Date; end:Date}): { start: Date; end: Date }`
  - Returns normalized start 00:00:00 and end 23:59:59.

2. Filtering helpers

- `filterTasksByControls(tasks: TasksRecord[], controls: { start: Date; end: Date; projectIds?: string[]; assigneeIds?: string[]; statuses?: TasksStatusOptions[]; priorities?: TasksPriorityOptions[] }): TasksRecord[]`
  - Project/assignee/status/priority: simple inclusion filters.
  - Time window rule: include if any of these hold:
    - `status === done` and `updated` in range (for completion-based metrics), OR
    - `created` in range (for totals trend/overview), OR
    - When computing WIP/Overdue now, ignore range (use current status vs now).
  - Note: expose knobs by passing a mode flag from callers (see per-metric logic below).

3. Overview metrics

- `computeOverviewMetrics(params: { tasks: TasksRecord[]; now: Date; range: { start: Date; end: Date } }): { total: number; completed: number; wip: number; overdue: number; onTimeRate: number }`
  - total: count of tasks with `created` OR `updated` within range (prefer `created` if present; fallback to `updated`).
  - completed: `status=done` AND `updated` within range.
  - wip: `status=in_progress` at `now` (ignore range).
  - overdue: `status!=done` AND `deadline && deadline < now`.
  - onTimeRate: among tasks counted in `completed`, fraction with `deadline && updated <= deadline`.

4. Throughput

- `groupThroughput(tasks: TasksRecord[], bucket: 'daily'|'weekly', range: {start:Date; end:Date}): Array<{ date: string; count: number }>`
  - Consider only `status=done` and `updated` within range.
  - Group by day (yyyy-MM-dd) or week (ISO week start Monday). Label with Jalali short date for display.

5. Timeliness classification

- `classifyTimeliness(tasks: TasksRecord[], range: {start:Date; end:Date}): { on_time: number; overdue: number; no_deadline: number }`
  - Consider only `status=done` and `updated` within range.
  - If `!deadline` → `no_deadline`.
  - Else `updated <= deadline` → `on_time`; otherwise `overdue`.

6. Priority distribution

- `countByPriority(tasks: TasksRecord[], options?: { onlyOpen?: boolean }): Array<{ key: TasksPriorityOptions; name: string; value: number }>`
  - If `onlyOpen`, count where `status in (todo,in_progress)`; else count all.
  - Use Persian labels from existing mapping.

7. Leaderboard

- `buildLeaderboard(users: UsersRecord[], tasks: TasksRecord[], range: {start:Date; end:Date}): Array<{ userId: string; name: string; completed: number; completionRate: number; onTimeRate: number }>`
  - For each employee user:
    - `assigned` = tasks with `assignee === user.id` and (created in range OR updated in range); use this as denominator for completionRate (simple, consistent).
    - `completed` = `assigned` with `status=done` and `updated` in range.
    - `completionRate` = `completed / max(assigned,1)`.
    - `onTimeRate` = among `completed`, fraction with `deadline && updated <= deadline`.
  - Sort by `completionRate` desc; return top 5.

## Pseudocode Snippets

Overview metrics

```
now = new Date()
completedInRange = tasks.filter(t => t.status==='done' && inRange(t.updated, range))
completed = completedInRange.length
onTime = completedInRange.filter(t => t.deadline && t.updated <= t.deadline).length
onTimeRate = completed ? onTime / completed : 0
wip = tasks.filter(t => t.status==='in_progress').length
overdue = tasks.filter(t => t.status!=='done' && t.deadline && t.deadline < now).length
total = tasks.filter(t => inRange(t.created ?? t.updated, range)).length
return { total, completed, wip, overdue, onTimeRate }
```

Throughput (daily)

```
map = {}
for t in tasks:
  if t.status==='done' and inRange(t.updated, range):
    key = formatDateKey(t.updated, 'daily') // e.g., yyyy-MM-dd
    map[key] = (map[key] || 0) + 1
return mapToSeries(map) // sorted by date ascending with display labels
```

Timeliness classification

```
counts = { on_time:0, overdue:0, no_deadline:0 }
for t in tasks:
  if t.status==='done' and inRange(t.updated, range):
    if !t.deadline: counts.no_deadline++
    else if t.updated <= t.deadline: counts.on_time++
    else counts.overdue++
return counts
```

Leaderboard

```
rows = []
for u in users if u.role==='employee':
  assigned = tasks.filter(t => t.assignee===u.id && (inRange(t.created, range) || inRange(t.updated, range)))
  completed = assigned.filter(t => t.status==='done' && inRange(t.updated, range))
  onTimeCompleted = completed.filter(t => t.deadline && t.updated <= t.deadline)
  rows.push({
    userId: u.id,
    name: formatName(u),
    completed: completed.length,
    completionRate: completed.length / max(assigned.length,1),
    onTimeRate: onTimeCompleted.length / max(completed.length,1),
  })
return rows.sort(descBy('completionRate')).slice(0,5)
```

## Event Wiring & Drill‑Downs

- Each chart/card click should set a `drilldown` state `{ title, predicate }` and open the drawer.
- The drawer filters the original un-aggregated tasks with `predicate` and maps to `TaskRow` for display.
- Predicates examples:
  - Throughput bar on 1403/01/10 → `t.status==='done' && isSameDay(t.updated,'1403/01/10')`.
  - Timeliness ‘Overdue’ → `t.status==='done' && t.deadline && t.updated > t.deadline && inRange(t.updated,range)`.
  - Priority ‘urgent’ → `t.priority==='urgent'` (optionally combine with onlyOpen).
  - Leaderboard row for user U → `t.assignee===U && (inRange(t.created,range) || inRange(t.updated,range))`.

## Accessibility, i18n, RTL

- Use RTL-aware axis labels and legends.
- Apply `digitsEnToFa` for all numeric label outputs.
- Provide `aria-label` on interactive chart regions (bars/slices) with counts.

## Error/Empty/Loading States

- Loading: reuse existing skeletons and the `Loader2` indicator.
- Empty: show descriptive ‘No data in this range’ hints and suggest broadening filters.
- Error: show toast via existing `sonner` UI with retry.

## Testing Checklist

Manual smoke tests:

- Filters: changing project/assignee/status/priority updates all widgets consistently.
- Time presets: Today/7D/30D/QTD/YTD produce expected date windows.
- Throughput: counts match the number of `done` tasks when inspecting the filtered table.
- Timeliness donut: sum equals number of completed in range; classification rules hold.
- Leaderboard: top 5 reflect correct completion and on‑time rates.
- Drill‑down: each click opens a drawer with the correct filtered tasks.
- RTL and Persian digits applied across UI.

## Implementation Order (Tasks)

1. Data plumbing

- Extend `useTasks` to support `mode:'full'` and fetch expanded tasks.
- Ensure `useUsers` is available and cached.

2. Filters & state

- Add `filters-bar.tsx`; wire page state and debounce updates.

3. Overview metrics

- Add `computeOverviewMetrics`; render `metric-cards.tsx` with values (digits Fa).

4. Throughput chart

- Add `groupThroughput` util; render `throughput-chart.tsx` with daily default and weekly toggle.

5. Timeliness donut

- Add `classifyTimeliness` util; render `timeliness-donut.tsx`.

6. Priority distribution

- Add `countByPriority` util; render `priority-distribution.tsx`.

7. Leaderboard

- Add `buildLeaderboard` util; render `leaderboard.tsx` (top 5).

8. Drill‑down drawer

- Add `drilldown-drawer.tsx`; wire click handlers for all widgets.

10. Polish & QA

- RTL labels, digits Fa, tooltips, legends, empty/loading states, performance check.

## Acceptance Criteria

- All widgets update within 200ms after filter changes (debounced).
- Metrics/charts are consistent and sum checks hold (e.g., donut vs completed).
- Drill‑down reflects exact selection context.
- No backend/schema changes; respects role scoping in hooks.
- `bun run web:check` passes.

## Notes and Edge Cases

- Tasks without `deadline` are counted in `no_deadline` for the donut; they don’t affect on‑time rate directly.
- If `updated` is missing (unlikely), skip such tasks from completion-based metrics.
- If datasets exceed client capacity, consider switching reports fetch to paginated queries plus server-side aggregation in a later phase.
- The existing `CompletionTrendChart` and `PriorityDistributionChart` in `src/pages/reports.tsx` can be reused by adapting inputs to match MVP definitions to reduce churn.
