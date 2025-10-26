# Reports Page – Improvement Proposal

This proposal outlines concrete improvements to evolve the current Reports page from basic/broken to a useful, actionable analytics hub. No code in this document—only scope and design of what to add.

## Current Gaps

- Buttons with no behavior (date filter, export).
- No time window control or presets; metrics lack context.
- No segmentation (by project, assignee, tag) or comparisons.
- Only shallow task counts and a simple trend; no delivery/flow insights.
- User chart shows only completion rate; no workload or timeliness.
- No drill-downs, saved views, or clear empty/loading states.

## Core Enhancements

- Time window + presets
  - Today, 7D, 14D, 30D, Quarter, YTD, Custom range.
  - Compare vs previous period toggle (Δ% and sparkline).
- Global filters
  - Project(s), assignee(s), status, priority, tag(s), supervisor.
  - “My team only” for supervisors; respect role-based access.
- Export and sharing
  - Export CSV/XLSX for tables; PNG/PDF for charts; “Copy link” with query params.
  - Print-friendly report.

## Task Health & Delivery

- Throughput: completed tasks per day/week (bar/sparkline, avg).
- Lead time: created→done average/median; percentiles (P50/P75/P90).
- Cycle time: in_progress→done average/median; percentiles.
- On-time completion rate: done before deadline; overdue count/rate.
- Aging WIP: tasks in progress grouped by age buckets (0–2d, 3–5d, 6–10d, 10+d).
- Backlog health: tasks in todo by priority; oldest item age; days since last triage.
- Overdue pipeline: not-done past deadline by priority and assignee.
- Cumulative Flow Diagram (CFD): area chart for todo/in_progress/done over time.
- Burndown/Burnup (per project, with scope change line when available).
- WIP count and WIP-limit breach signal (configurable later).

## Individual Performance

- Per-user KPIs
  - Assigned vs completed count; throughput (per week).
  - Completion timeliness: on-time rate, overdue count.
  - Average lead/cycle time; SLA breach count (deadline misses).
  - In-progress load now vs 7D avg (workload balance).
  - Reassignment count (handoffs) as friction signal.
  - Comment activity count (engagement proxy).
- Leaderboard views
  - By on-time completion rate, throughput, and cycle time.
- Drill-down
  - Click a user → table of their recent tasks with status, deadlines, age, tags.

## Team/Project Insights

- Project comparisons: throughput, on-time rate, median cycle time, backlog growth.
- Trend cards with vs previous period deltas.
- Priority distribution: stacked bars by project or assignee.
- Tag/topic hotspots: top tags by volume and overdue rate.
- Workload distribution: stacked chart by assignee and status (balance view).
- “Focus” metric: % tasks completed without churn (approximate via status changes).

## Better Visuals & UX

- Metric cards: value, delta, mini sparkline, context tooltip.
- Chart polish: percent vs absolute toggles; legend click-to-hide; RTL-aware labels; Persian digits.
- Empty/zero states: explanatory messages and suggested filters.
- Saved views: store filter + time range + layout as a named report.
- Loading skeletons and consistent error toasts.

## Data Model Extensions (Phase 2+)

- Task fields to add
  - `started_at` (first entry to in_progress)
  - `done_at` (final done time, immutable)
  - `estimate` or `story_points` (optional numeric)
- Event history (audit log)
  - `task_id`, `from_status`, `to_status`, `changed_at`
  - Enables accurate time-in-status, churn, CFD, and aging WIP.
- SLA config (per project): lead/cycle time targets or deadline policy.

Notes (current schema approximations):

- Lead time ≈ `updated` at done − `created`.
- Cycle time ≈ `updated` at done − first time entered in_progress (needs `started_at`; otherwise approximated by last status change).
- On-time flag = `done_at`/`updated` ≤ `deadline`.

## Reports to Add (Initial Set)

- Overview
  - Total tasks, completed, WIP, overdue, on-time rate, median cycle time (with Δ).
- Throughput trend (daily/weekly) + moving average.
- Completion timeliness donut: on-time vs overdue vs no-deadline.
- Aging WIP bars by bucket; clickable to list tasks.
- Priority distribution stacked by status (health snapshot).
- Individual leaderboard (toggle metric: on-time, throughput, cycle time).
- Project comparison table (sortable with badges and Δ).

## Interactions & Drill-downs

- Click any chart segment → filtered task table drawer (columns: status, priority, deadline, age, assignee, project, tags).
- Hover tooltips with exact values and deltas.
- Deep links preserve filters/time range via query params.

## Export & Automation

- CSV/XLSX exports: task table (with current filters), leaderboard, project comparison.
- PNG/PDF export per chart and whole report.
- Future: scheduled email export of report snapshots.

## Performance & Security

- Client-side aggregation for up to ~5–10k tasks; paginate tables.
- Scope data by role:
  - Employee: self-only performance + anonymized team averages.
  - Supervisor/Admin: full team/project views.
- Cache by query key (time range + filters); debounce filter changes.

## Phased Implementation Plan

- Phase 1 (Leverage current schema)
  - Add time range + presets; global filters; working export buttons (CSV, PNG).
  - Implement: Overview metrics, Throughput trend, On-time donut, Priority distribution, Individual leaderboard (completion rate + throughput).
  - Add drill-down drawer for any segment/user.
- Phase 2 (Data model and deeper insights)
  - Add `started_at`/`done_at`; optional `story_points`.
  - Add event history; compute accurate cycle time, time-in-status, CFD, aging WIP.
  - Add SLA targets and on-time vs SLA metrics.
- Phase 3 (Comparisons, saved views, automation)
  - Project comparison page; saved report presets; schedule exports; advanced charts (CFD, burndown).
