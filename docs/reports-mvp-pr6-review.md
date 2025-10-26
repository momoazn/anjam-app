# PR #6 — Reports MVP Implementation Review and Fix Guide

This document reviews PR #6 (branch: `feat/reports`) implementing the Reports MVP described in `docs/reports-mvp.md` and `docs/reports-mvp-implementation-guide.md`. It lists issues found, why they’re problems per spec, and exact, low‑risk fixes with concrete code edits. It is written so a simpler model can apply the changes reliably.

## Scope Reviewed

- Specs: `docs/reports-mvp.md`, `docs/reports-mvp-implementation-guide.md`
- Changed files (git diff origin/main...feat/reports):
  - `package.json`
  - `src/components/reports/*` (7 components)
  - `src/hooks/query-keys.ts`
  - `src/hooks/tasks.ts`
  - `src/lib/reports-utils.ts`
  - `src/pages/reports.tsx`

## Overall Assessment

- Architecture matches spec: new `reports` page orchestrates small components; data via hooks; client‑side aggregations in `src/lib/reports-utils.ts`.
- Data fetching: `useTasks({ mode: 'full', expandFields: 'project,assignee' })` aligns with guide.
- MVP features present: filters bar, overview cards, throughput chart, timeliness donut, priority distribution, leaderboard, shared drill‑down.
- Build and typecheck pass. Lint shows warnings only.

However, a few correctness bugs and completeness gaps remain. Fixes below are ordered by impact.

---

## Issue 1: Debounce value not destructured (filters never update)

- Location: `src/pages/reports.tsx:60`
- Current:
  ```ts
  const debouncedFilters = useDebounce(filtersState, 200);
  ```
- Problem:
  - `useDebounce` returns a tuple `[value, controls]`. Without array destructuring, `debouncedFilters` is an array, so `debouncedFilters.timeRange` and `debouncedFilters.filters` are undefined at runtime. This breaks time range and filters across the entire page.
- Spec tie‑in: Filters must affect all charts with 200ms debounce.
- Fix (one line change):
  ```ts
  const [debouncedFilters] = useDebounce(filtersState, 200);
  ```
- How to verify:
  - Change any filter; charts and totals refresh after ~200ms without console errors.

---

## Issue 2: Throughput drill‑down predicate mismatches chart labels (no results)

- Locations:
  - Producer: `src/lib/reports-utils.ts` (`groupThroughput`) returns `{ date: string; count: number }` with `date` as display label (`"MMM dd"`).
  - Consumer: `src/pages/reports.tsx:215–225` compares clicked `date` (display label) against `format(updated, 'yyyy/MM/dd')` (machine key) — they never match.
- Fix plan: Introduce a stable machine key for the bucket and carry both key and label through the chart.

### Step A: Change throughput data shape

- File: `src/lib/reports-utils.ts`
- Replace return shape from:
  ```ts
  Array<{ date: string; count: number }>;
  ```
  to:
  ```ts
  Array<{ key: string; label: string; count: number }>;
  ```
- Implementation details:
  - Keep `key` as ISO date string for the day (daily) or ISO week start date (weekly), both formatted `yyyy-MM-dd`.
  - Keep `label` as Jalali display (`"MMM dd"`).
  - Example mapping:
    ```ts
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({
        key, // e.g. '2025-03-21'
        label: format(new Date(key), "MMM dd", { locale: undefined }),
        count,
      }));
    ```

### Step B: Update chart props and usage

- File: `src/components/reports/throughput-chart.tsx`
  - Update props:
    ```ts
    type Props = {
      data: Array<{ key: string; label: string; count: number }>;
      bucket?: "daily" | "weekly";
      onBarClick?: (key: string) => void;
    };
    ```
  - Bind X axis to `label`; pass `entry.key` to `onBarClick`:
    ```tsx
    <XAxis dataKey="label" ... />
    ...
    <Bar ... onClick={(entry) => onBarClick?.(entry.key)} />
    ```
  - Add `tickFormatter={(label) => digitsEnToFa(label as string)}` to X axis (see Issue 4).

### Step C: Fix drill‑down predicate

- File: `src/pages/reports.tsx`
  - Adjust handler at lines ~212–227:
    ```ts
    <ThroughputChart
      data={throughputData}
      bucket={bucket}
      onBarClick={(key) =>
        handleDrilldown(
          `تسک‌های تکمیل شده در ${key}`,
          (task) => {
            if (task.status !== 'done' || !task.updated) return false;
            const updated = new Date(task.updated);
            if (bucket === 'daily') {
              return format(updated, 'yyyy-MM-dd') === key;
            } else {
              // Weekly: match if updated within [weekStart, weekStart+6d 23:59:59]
              const weekStart = new Date(key);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              weekEnd.setHours(23, 59, 59, 999);
              return updated >= weekStart && updated <= weekEnd;
            }
          },
        )
      }
    />
    ```

---

## Issue 3: WIP and Overdue incorrectly time‑filtered

- Problem:
  - `computeOverviewMetrics` correctly ignores time range for WIP and Overdue, but it receives `filteredTasks` that were already time‑window filtered by `filterTasksByControls`.
  - Result: WIP/Overdue counts exclude tasks outside the selected time window, contradicting the spec.
- Spec: “WIP: status=in_progress at query time (ignore range)”, “Overdue: status!=done AND deadline < now”.

### Fix Option (minimal + explicit)

1. Add a non‑temporal filter helper.

- File: `src/lib/reports-utils.ts`
  ```ts
  export function filterTasksNonTime(
    tasks: TasksRecord[],
    controls: {
      projectIds?: string[];
      assigneeIds?: string[];
      statuses?: TasksStatusOptions[];
      priorities?: TasksPriorityOptions[];
    },
  ): TasksRecord[] {
    return tasks.filter((task) => {
      if (
        controls.projectIds?.length &&
        !controls.projectIds.includes(task.project ?? "")
      )
        return false;
      if (
        controls.assigneeIds?.length &&
        !controls.assigneeIds.includes(task.assignee ?? "")
      )
        return false;
      if (controls.statuses?.length && !controls.statuses.includes(task.status))
        return false;
      if (
        controls.priorities?.length &&
        !controls.priorities.includes(task.priority)
      )
        return false;
      return true;
    });
  }
  ```

2. Use it only for WIP/Overdue (and still use time window for total/completed).

- File: `src/pages/reports.tsx`

  - Keep `filteredTasks` (time‑windowed) for total, completed, throughput, timeliness, and priority.
  - Compute a `filteredTasksNonTime` with the same project/assignee/status/priority filters but no time range, then compute `wip` and `overdue` from that.
  - One way is to call `computeOverviewMetrics` twice, or split the metrics. Simple approach:

    ```ts
    const filteredNonTime = useMemo(() => {
      if (!tasks) return [];
      return filterTasksNonTime(tasks, {
        projectIds: debouncedFilters.filters.projectIds,
        assigneeIds: debouncedFilters.filters.assigneeIds,
        statuses: debouncedFilters.filters.statuses,
        priorities: debouncedFilters.filters.priorities,
      });
    }, [tasks, debouncedFilters.filters]);

    const overviewMetrics = useMemo(() => {
      if (!filteredTasks) return null;
      const base = computeOverviewMetrics({
        tasks: filteredTasks,
        now: new Date(),
        range: timeRange,
      });
      const wip = filteredNonTime.filter(
        (t) => t.status === "in_progress",
      ).length;
      const overdue = filteredNonTime.filter(
        (t) =>
          t.status !== "done" &&
          t.deadline &&
          new Date(t.deadline) < new Date(),
      ).length;
      return { ...base, wip, overdue };
    }, [filteredTasks, filteredNonTime, timeRange]);
    ```

---

## Issue 4: X‑axis labels not rendered with Persian digits (RTL requirement)

- Location: `src/components/reports/throughput-chart.tsx`
- Spec: “All metrics and charts render with RTL labels and Persian digits.”
- Fix: Add `tickFormatter={(v) => digitsEnToFa(String(v))}` to the X axis and ensure labels use the Jalali display label already provided.
  ```tsx
  <XAxis
    dataKey="label"
    angle={-45}
    textAnchor="end"
    tick={{ fontSize: 10 }}
    height={60}
    className="text-muted-foreground"
    tickFormatter={(v) => digitsEnToFa(String(v))}
  />
  ```

---

## Issue 5: Weekly drill‑down not implemented

- Location: `src/pages/reports.tsx:221–225` contains `// weekly not implemented` guard.
- Fix: Implement the weekly predicate using the bucket key (see Issue 2 Step C). This ensures clicking a weekly bar opens correct filtered tasks.
- Test:
  - Switch to Weekly, click a bar; drawer shows only tasks with `status=done` whose `updated` is within the 7‑day span of that bucket.

---

## Issue 6: Drill‑down table missing Tags column

- Location: `src/components/reports/drilldown-drawer.tsx:79–86`
- Spec: Drawer table columns include “Tags”.
- Fix:
  - Add a header cell “برچسب‌ها”.
  - Render `row.tags` (string array) as a comma-separated list or simple badges.
  - Example minimal change:
    ```tsx
    // Header
    <TableHead>برچسب‌ها</TableHead>
    // Body cell
    <TableCell>{row.tags?.length ? row.tags.join(', ') : '—'}</TableCell>
    ```

---

## Nice‑to‑Have (Non‑blocking for MVP)

- Add “Custom” time range in Filters Bar to match the full guide (presets are sufficient for MVP).
- Add `onlyOpen` toggle to Priority distribution (guide suggests optional behavior).

---

## Patch Checklist (apply in order)

1. Fix debounce destructuring

   - Edit: `src/pages/reports.tsx:60`
   - Change to `const [debouncedFilters] = useDebounce(filtersState, 200);`

2. Unify throughput data shape and drill‑down

   - Edit: `src/lib/reports-utils.ts` → `groupThroughput` returns `{ key, label, count }`.
   - Edit: `src/components/reports/throughput-chart.tsx` → props and axes use `label`; `onBarClick(entry.key)`.
   - Edit: `src/pages/reports.tsx` → update `onBarClick` predicate to use `key` (daily equality, weekly week‑range).

3. Correct WIP/Overdue range handling

   - Add: `filterTasksNonTime` to `src/lib/reports-utils.ts`.
   - Edit: `src/pages/reports.tsx` to compute `wip`/`overdue` from non‑time‑filtered tasks while keeping time‑filtered data for other metrics.

4. Localize X‑axis digits

   - Edit: `src/components/reports/throughput-chart.tsx` → `XAxis.tickFormatter` with `digitsEnToFa`.

5. Show Tags in Drill‑down
   - Edit: `src/components/reports/drilldown-drawer.tsx` → add header + cell for tags.

---

## Quick Test Plan

- Filters

  - Change each preset; data updates after ~200ms without errors.
  - Apply project/assignee/status/priority filters; all charts and tables reflect filters consistently.

- Overview cards

  - WIP and Overdue counts remain stable across different time presets (unless non‑time filters change).
  - On‑time rate equals fraction of completed tasks (done, updated in range) with `deadline && updated <= deadline`.

- Throughput chart

  - Daily: click a bar shows done tasks whose `updated` date equals that day; X labels show Persian digits.
  - Weekly: click a bar shows done tasks whose `updated` lies within that 7‑day period.

- Timeliness donut

  - Slices match on‑time/overdue/no‑deadline counts among done tasks within range.
  - Clicking a slice opens a drawer filtered to corresponding tasks.

- Priority distribution

  - Slices reflect priority counts of filtered tasks; clicking opens drawer filtered by priority.

- Leaderboard

  - Shows top 5 employees by completionRate; clicking a row opens drawer filtered by assignee.

- Drill‑down drawer
  - Table columns include Title, Status, Priority, Deadline, Age (days), Assignee, Project, Tags.

---

## Rationale vs. Spec

- Debounce fix satisfies the 200ms debounce acceptance criterion.
- Using stable `key` and readable `label` prevents string‑format mismatches and enables correct daily/weekly drill‑downs.
- Splitting non‑time vs. time‑filtered datasets matches the spec definitions of WIP/Overdue vs. totals/completed.
- X‑axis digit localization and existing RTL labels meet the “RTL + Persian digits” requirement.
- Adding Tags column aligns the drawer table with the MVP UI spec.

---

## Notes

- No schema or server changes required; all fixes are client‑side and low risk.
- Keep changes minimal and isolated to the noted files to reduce regression risk.
