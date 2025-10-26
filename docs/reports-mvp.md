# Reports MVP — High-Impact, Low-Effort

A minimal, focused plan to upgrade the Reports page with the most impactful insights using the current schema (no backend/schema changes). Designed to be shipped quickly and safely.

## Purpose

Deliver actionable reporting fast by adding a small set of clear metrics, simple charts, and essential drill‑downs that work with existing data.

## Scope (MVP)

Included:

- Time range presets and basic filters (project, assignee, status, priority).
- Key metrics cards and 3 small charts.
- Single drill‑down table drawer for any segment.

Excluded (later phases):

- New fields (`started_at`, `done_at`), CFD/burndown, SLA targets, saved views, scheduled reports.

## MVP Reports & UI

1. Overview Metrics (cards)

- Total Tasks: count of all tasks in range.
- Completed: count with `status=done` in range.
- WIP: count with `status=in_progress` in range.
- Overdue: count where `status!=done` and `deadline < now`.
- On‑Time Rate: `done && updated <= deadline` divided by all `done`.

2. Throughput Trend (last 30 days by default)

- Line or bar chart: tasks completed per day.
- Toggle daily/weekly buckets.

3. Completion Timeliness Donut

- Slices: On‑time (done <= deadline), Overdue (done > deadline), No deadline.

4. Priority Distribution

- Stacked bars by priority: `urgent/high/medium/low` for current statuses.

5. Individual Leaderboard (Top 5)

- Columns: User, Completed (count), Completion Rate (`done/assigned`), On‑Time Rate (as above).
- Sort by Completion Rate by default.

6. Drill‑down Drawer (shared)

- Clicking any chart segment or user opens a drawer with a filtered task table.
- Columns: Title, Status, Priority, Deadline, Age, Assignee, Project, Tags.

## Filters & Controls

- Time Presets: Today, 7D, 30D, Quarter, YTD, Custom.
- Filters: Project, Assignee, Status, Priority. Respect role scoping already in hooks.

## Data Definitions (current schema only)

- In Range: `created` OR `updated` falls in selected time window (use `updated` for completion trend).
- On‑Time (done): `status=done` AND `deadline` exists AND `updated <= deadline`.
- Throughput: number of tasks with `status=done` grouped by day (or week) using `updated`.
- WIP: `status=in_progress` at query time (not historical).
- Overdue: `status!=done` AND `deadline < now`.

## Implementation Order (1–2 day slices)

1. Controls & Filters

- Add time presets and simple filter bar; wire to existing queries.

2. Overview Metrics

- Compute totals from filtered tasks; add cards with small deltas hidden for MVP.

3. Throughput Trend

- Group done tasks by day using `updated`; render bar/line.

4. Timeliness Donut

- Classify done tasks into On‑time / Overdue / No‑deadline.

5. Priority Distribution

- Count by priority (all statuses or toggle to only open).

6. Leaderboard + Drill‑down

- Compute per‑user completed, completion and on‑time rates; top 5 table.

## Acceptance Criteria

- Filters affect all cards/charts consistently within 200ms debounce.
- All metrics and charts render with RTL labels and Persian digits.
- Clicking any segment/user opens a correct filtered drawer table.
- No schema or server changes required; works with current hooks.
