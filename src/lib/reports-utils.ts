import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  format,
  isWithinInterval,
  startOfQuarter,
  startOfYear,
} from "date-fns-jalali";
import { faIR } from "date-fns/locale";

import { reports, tasks } from "@/constants";

import type { TaskWithProject } from "./pocketbase";
import type { IsoAutoDateString, UsersRecord } from "./pocketbase-types";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
  UsersRoleOptions,
} from "./pocketbase-types";
// Status labels mapping
// Import centralized status config
import { TASK_STATUS_CONFIG } from "./status-utils";

// Types for chart data
export type StatusDistributionData = {
  name: string;
  value: number;
  status: TasksStatusOptions;
};

export type PriorityDistributionData = {
  name: string;
  value: number;
  priority: string;
};

export type CompletionTrendData = {
  date: string;
  completed: number;
};

export type UserPerformanceData = {
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
};

export type TaskStatsData = {
  statusDistribution: StatusDistributionData[];
  completionTrend: CompletionTrendData[];
  priorityDistribution: PriorityDistributionData[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
};

// Priority labels mapping
const PRIORITY_LABELS = {
  urgent: tasks.priority.urgent,
  high: reports.high,
  medium: reports.medium,
  low: reports.low,
} as const;

// Priority options in order
const PRIORITY_OPTIONS = ["urgent", "high", "medium", "low"] as const;

/**
 * Calculate status distribution for tasks
 */
export function calculateStatusDistribution(
  tasks: TaskWithProject[],
): StatusDistributionData[] {
  return Object.values(TasksStatusOptions).map((status) => ({
    name: TASK_STATUS_CONFIG[status].name,
    value: tasks.filter((task) => task.status === status).length,
    status,
  }));
}

/**
 * Calculate priority distribution for tasks
 */
export function calculatePriorityDistribution(
  tasks: TaskWithProject[],
): PriorityDistributionData[] {
  return PRIORITY_OPTIONS.map((priority) => ({
    name: PRIORITY_LABELS[priority],
    value: tasks.filter((task) => task.priority === priority).length,
    priority,
  }));
}

/**
 * Calculate completion trend over the last 30 days
 */
export function calculateCompletionTrend(
  tasks: TaskWithProject[],
): CompletionTrendData[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completedOverTime = tasks
    .filter(
      (task) =>
        task.status === TasksStatusOptions.done &&
        task.updated &&
        new Date(task.updated) >= thirtyDaysAgo,
    )
    .reduce(
      (acc, task) => {
        if (task.updated) {
          // Use UTC date to avoid timezone issues
          const taskDate = new Date(task.updated);
          const date = format(taskDate, "MMM dd", {
            locale: undefined, // Use default locale to avoid timezone conversion
          });
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

  return Object.entries(completedOverTime).map(([date, count]) => ({
    date,
    completed: count,
  }));
}

/**
 * Calculate user performance statistics
 */
export function calculateUserPerformance(
  users: UsersRecord[],
  tasks: TaskWithProject[],
): UserPerformanceData[] {
  return users
    .filter((user) => user.role && user.role === UsersRoleOptions.employee)
    .map((user) => {
      const userTasks = tasks.filter((task) => task.assignee === user.id);
      const completedTasks = userTasks.filter(
        (task) => task.status === TasksStatusOptions.done,
      );

      return {
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        completionRate: userTasks.length
          ? (completedTasks.length / userTasks.length) * 100
          : 0,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);
}

/**
 * Calculate all task statistics
 */
export function calculateTaskStats(tasks: TaskWithProject[]): TaskStatsData {
  return {
    statusDistribution: calculateStatusDistribution(tasks),
    completionTrend: calculateCompletionTrend(tasks),
    priorityDistribution: calculatePriorityDistribution(tasks),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(
      (task) => task.status === TasksStatusOptions.done,
    ).length,
    inProgressTasks: tasks.filter(
      (task) => task.status === TasksStatusOptions.in_progress,
    ).length,
    pendingTasks: tasks.filter((task) =>
      [TasksStatusOptions.todo, TasksStatusOptions.pending].includes(
        task.status as TasksStatusOptions,
      ),
    ).length,
  };
}

// Time utilities
export function getTimeRange(
  preset: "TODAY" | "7D" | "30D" | "QTD" | "YTD" | "CUSTOM",
  custom?: { start: Date; end: Date },
): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  switch (preset) {
    case "TODAY":
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "7D":
      start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "30D":
      start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "QTD":
      start = startOfQuarter(now);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "YTD":
      start = startOfYear(now);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "CUSTOM":
      if (!custom) throw new Error("Custom range requires start and end dates");
      start = custom.start;
      end = custom.end;
      break;
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }

  return { start, end };
}

// Filtering helpers
export function filterTasksNonTime(
  tasks: TaskWithProject[],
  controls: {
    projectIds?: string[];
    assigneeIds?: string[];
    statuses?: TasksStatusOptions[];
    priorities?: TasksPriorityOptions[];
  },
): TaskWithProject[] {
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

export function filterTasksByControls(
  tasks: TaskWithProject[],
  controls: {
    start: Date;
    end: Date;
    projectIds?: string[];
    assigneeIds?: string[];
    statuses?: TasksStatusOptions[];
    priorities?: TasksPriorityOptions[];
  },
): TaskWithProject[] {
  return tasks.filter((task) => {
    // Project filter
    if (controls.projectIds && controls.projectIds.length > 0) {
      if (!task.project || !controls.projectIds.includes(task.project)) {
        return false;
      }
    }

    // Assignee filter
    if (controls.assigneeIds && controls.assigneeIds.length > 0) {
      if (!task.assignee || !controls.assigneeIds.includes(task.assignee)) {
        return false;
      }
    }

    // Status filter
    if (controls.statuses && controls.statuses.length > 0) {
      if (!controls.statuses.includes(task.status)) {
        return false;
      }
    }

    // Priority filter
    if (controls.priorities && controls.priorities.length > 0) {
      if (!controls.priorities.includes(task.priority)) {
        return false;
      }
    }

    // Time window rule: include if created OR updated falls in range
    const createdInRange =
      task.created &&
      isWithinInterval(new Date(task.created), {
        start: controls.start,
        end: controls.end,
      });
    const updatedInRange =
      task.updated &&
      isWithinInterval(new Date(task.updated), {
        start: controls.start,
        end: controls.end,
      });

    return createdInRange || updatedInRange;
  });
}

// Overview metrics
export function computeOverviewMetrics(params: {
  tasks: TaskWithProject[];
  now: Date;
  range: { start: Date; end: Date };
}): {
  total: number;
  completed: number;
  wip: number;
  overdue: number;
  onTimeRate: number;
} {
  const { tasks, now, range } = params;

  // Total: tasks with created OR updated in range
  const total = tasks.filter((task) => {
    const createdInRange =
      task.created && isWithinInterval(new Date(task.created), range);
    const updatedInRange =
      task.updated && isWithinInterval(new Date(task.updated), range);
    return createdInRange || updatedInRange;
  }).length;

  // Completed: done tasks with updated in range
  const completedTasks = tasks.filter(
    (task) =>
      task.status === "done" &&
      task.updated &&
      isWithinInterval(new Date(task.updated), range),
  );
  const completed = completedTasks.length;

  // WIP: in_progress at now (ignore range)
  const wip = tasks.filter((task) => task.status === "in_progress").length;

  // Overdue: not done and deadline < now
  const overdue = tasks.filter(
    (task) =>
      task.status !== "done" && task.deadline && new Date(task.deadline) < now,
  ).length;

  // On-time rate: among completed, fraction with deadline && updated <= deadline
  const onTimeCompleted = completedTasks.filter(
    (task) =>
      task.deadline &&
      task.updated &&
      new Date(task.updated) <= new Date(task.deadline),
  ).length;
  const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

  return { total, completed, wip, overdue, onTimeRate };
}

// Throughput
export function groupThroughput(
  tasks: TaskWithProject[],
  bucket: "daily" | "weekly",
  range: { start: Date; end: Date },
): Array<{ key: string; label: string; count: number }> {
  const map = new Map<string, number>();

  tasks.forEach((task) => {
    if (task.status === "done" && task.updated) {
      const taskDate = new Date(task.updated);
      if (isWithinInterval(taskDate, range)) {
        let key: string;
        if (bucket === "daily") {
          key = format(taskDate, "yyyy-MM-dd");
        } else {
          // Weekly: ISO week start Monday
          const weekStart = new Date(taskDate);
          const day = taskDate.getDay();
          const diff = taskDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
          weekStart.setDate(diff);
          key = format(weekStart, "yyyy-MM-dd");
        }
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
  });

  // Convert to sorted array with Jalali display labels
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const formattedLabel = format(new Date(key), "MMM dd", { locale: faIR });
      // Convert English digits to Persian in the label
      const labelWithPersianDigits = digitsEnToFa(formattedLabel);
      return {
        key,
        label: labelWithPersianDigits,
        count,
      };
    });
}

// Timeliness classification
export function classifyTimeliness(
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
): { on_time: number; overdue: number; no_deadline: number } {
  const counts = { on_time: 0, overdue: 0, no_deadline: 0 };

  tasks.forEach((task) => {
    if (
      task.status === "done" &&
      task.updated &&
      isWithinInterval(new Date(task.updated), range)
    ) {
      if (!task.deadline) {
        counts.no_deadline++;
      } else if (new Date(task.updated) <= new Date(task.deadline)) {
        counts.on_time++;
      } else {
        counts.overdue++;
      }
    }
  });

  return counts;
}

// Priority distribution
export function countByPriority(
  tasks: TaskWithProject[],
  options?: { onlyOpen?: boolean },
): Array<{ key: TasksPriorityOptions; name: string; value: number }> {
  const counts = new Map<TasksPriorityOptions, number>();

  tasks.forEach((task) => {
    if (options?.onlyOpen && task.status === "done") {
      return; // Skip done tasks if onlyOpen
    }
    counts.set(task.priority, (counts.get(task.priority) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([key, value]) => ({
    key,
    name: PRIORITY_LABELS[key],
    value,
  }));
}

// Leaderboard
export function buildLeaderboard(
  users: UsersRecord[],
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
): Array<{
  userId: string;
  name: string;
  completed: number;
  completionRate: number;
  onTimeRate: number;
}> {
  return users
    .filter((user) => user.role === UsersRoleOptions.employee)
    .map((user) => {
      // Assigned: tasks assigned to user with created or updated in range
      const assigned = tasks.filter(
        (task) =>
          task.assignee === user.id &&
          ((task.created && isWithinInterval(new Date(task.created), range)) ||
            (task.updated && isWithinInterval(new Date(task.updated), range))),
      );

      // Completed: assigned tasks that are done with updated in range
      const completedTasks = assigned.filter(
        (task) =>
          task.status === "done" &&
          task.updated &&
          isWithinInterval(new Date(task.updated), range),
      );

      const completed = completedTasks.length;
      const completionRate =
        Math.max(assigned.length, 1) > 0 ? completed / assigned.length : 0;

      // On-time: among completed, with deadline and updated <= deadline
      const onTimeCompleted = completedTasks.filter(
        (task) =>
          task.deadline &&
          task.updated &&
          new Date(task.updated) <= new Date(task.deadline),
      ).length;
      const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

      return {
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        completed,
        completionRate,
        onTimeRate,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);
}

// -----------------------------
// Employee reporting helpers
// -----------------------------
//
// These helpers are pure, operate on in-memory task/user arrays, and are
// intended for frontend-only aggregation (MVP). They re-use existing helpers
// (isWithinInterval, format) and follow the same range semantics used elsewhere.
//
// Added functions:
// - computeEmployeeBuckets(tasks, users, range, bucket)
// - computeProductivityTrend(userId, tasks, range, bucket)
// - computeEmployeeSummary(userId, tasks, range)
// - computeTeamAverages(users, tasks, range)
//
// Note: CSV export was deferred per request; these helpers focus on data shaping
// for charts and tables.
//
// (Appended by implementation for employee reports)
export type EmployeeBucket = {
  key: string; // machine key (e.g. "2025-10-29" or "2025-W40" or "2025-10")
  label: string; // human display label (localized)
  count: number; // completed count in this bucket
};

export type EmployeeBucketsResult = {
  userId: string;
  name: string;
  buckets: EmployeeBucket[];
  totalCompleted: number;
};

function getBucketKeyAndLabel(
  date: Date,
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
) {
  switch (bucket) {
    case "daily": {
      const key = format(date, "yyyy-MM-dd");
      const formattedLabel = format(date, "MMM dd", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "weekly": {
      // Build week-start (Monday) key
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
      const weekStart = new Date(d);
      weekStart.setDate(diff);
      const key = format(weekStart, "yyyy-MM-dd");
      const formattedLabel = format(weekStart, "MMM dd", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "monthly": {
      const key = format(date, "yyyy-MM");
      const formattedLabel = format(date, "MMM yyyy", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "quarterly": {
      // Use startOfQuarter for label consistency
      const s = startOfQuarter(date);
      const key = `${s.getFullYear()}-Q${Math.floor(s.getMonth() / 3) + 1}`;
      const formattedLabel = format(s, "MMM yyyy", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "annual": {
      const key = String(date.getFullYear());
      return { key, label: digitsEnToFa(key) };
    }
    default: {
      const defaultKey = format(date, "yyyy-MM-dd");
      const defaultFormattedLabel = format(date, "MMM dd", { locale: faIR });
      return {
        key: defaultKey,
        label: digitsEnToFa(defaultFormattedLabel),
      };
    }
  }
}

/**
 * computeEmployeeBuckets
 * For each employee (user), returns counts of completed tasks per bucket
 * (supports daily/weekly/monthly/quarterly/annual). Only counts tasks that are
 * done and updated within the provided range.
 */
export function computeEmployeeBuckets(
  tasks: TaskWithProject[],
  users: UsersRecord[],
  range: { start: Date; end: Date },
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
): EmployeeBucketsResult[] {
  // Build a map userId -> { key -> count }
  const countsByUser = new Map<string, Map<string, number>>();

  tasks.forEach((task) => {
    if (
      task.status !== TasksStatusOptions.done ||
      !task.updated ||
      !task.assignee
    )
      return;
    const updated = new Date(task.updated);
    if (!isWithinInterval(updated, range)) return;

    const { key } = getBucketKeyAndLabel(updated, bucket);
    const userMap =
      countsByUser.get(task.assignee) || new Map<string, number>();
    userMap.set(key, (userMap.get(key) || 0) + 1);
    countsByUser.set(task.assignee, userMap);
  });

  // For deterministic ordering and labels, collect all keys across all users then sort
  const allKeysSet = new Set<string>();
  countsByUser.forEach((m) => {
    m.forEach((_, k) => allKeysSet.add(k));
  });
  const allKeys = Array.from(allKeysSet).sort((a, b) => a.localeCompare(b));

  // Build results for active users (employees). Keep same user ordering as provided.
  const results: EmployeeBucketsResult[] = users
    .filter((u) => u.role === UsersRoleOptions.employee)
    .map((user) => {
      const userMap = countsByUser.get(user.id) || new Map<string, number>();
      const buckets = allKeys.map((k) => {
        // derive a label by parsing key; pick a representative date if possible
        let label = k;
        try {
          if (bucket === "daily" || bucket === "weekly") {
            const formattedLabel = format(new Date(k), "MMM dd", {
              locale: faIR,
            });
            label = digitsEnToFa(formattedLabel);
          } else if (bucket === "monthly") {
            const parts = k.split("-");
            const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
            const formattedLabel = format(dt, "MMM yyyy", { locale: faIR });
            label = digitsEnToFa(formattedLabel);
          } else if (bucket === "quarterly") {
            // k like "2025-Q1"
            label = k;
          } else if (bucket === "annual") {
            label = digitsEnToFa(k);
          }
        } catch {
          /* fallback label = k */
        }
        return { key: k, label, count: userMap.get(k) || 0 };
      });
      const totalCompleted = buckets.reduce((s, b) => s + b.count, 0);
      return {
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        buckets,
        totalCompleted,
      };
    });

  return results;
}

/**
 * computeProductivityTrend
 * Convenience wrapper that returns the bucketed series for a single user.
 */
export function computeProductivityTrend(
  userId: string,
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
): EmployeeBucket[] {
  const userTasks = tasks.filter((t) => t.assignee === userId);
  const bucketsResult = computeEmployeeBuckets(
    userTasks,
    [
      {
        id: userId,
        username: "",
        role: UsersRoleOptions.employee,
        password: "",
        tokenKey: "",
        created: "" as unknown as IsoAutoDateString,
        updated: "" as unknown as IsoAutoDateString,
      } satisfies Partial<UsersRecord> &
        Pick<UsersRecord, "id" | "username" | "role" | "password" | "tokenKey">,
    ],
    range,
    bucket,
  );
  // Since we passed a synthetic user list, bucketsResult[0] will be what we need if exists
  return bucketsResult.length > 0 ? bucketsResult[0].buckets : [];
}

/**
 * computeEmployeeSummary
 * Produces a compact summary for a single employee across the provided range:
 * - totalAssigned (created|updated in range)
 * - completed (done & updated in range)
 * - inProgress (status === in_progress)
 * - overdue (not done and deadline < now)
 * - avgTimeToCompleteDays (avg of completed: updated - created)
 * - efficiencyScore: completed / max(assigned, 1)
 * - onTimeRate: among completed, fraction completed on-time
 */
export type EmployeeSummary = {
  userId: string;
  name: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
  avgTimeToCompleteDays: number;
  efficiencyScore: number;
  onTimeRate: number;
};

export function computeEmployeeSummary(
  userId: string,
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
  users?: UsersRecord[],
): EmployeeSummary {
  const now = new Date();

  const assigned = tasks.filter((task) => {
    if (task.assignee !== userId) return false;
    const createdInRange =
      task.created && isWithinInterval(new Date(task.created), range);
    const updatedInRange =
      task.updated && isWithinInterval(new Date(task.updated), range);
    return !!(createdInRange || updatedInRange);
  });

  const completedTasks = assigned.filter(
    (task) => task.status === TasksStatusOptions.done && task.updated,
  );

  const completed = completedTasks.length;
  const inProgress = tasks.filter(
    (task) =>
      task.assignee === userId &&
      task.status === TasksStatusOptions.in_progress,
  ).length;
  const overdue = tasks.filter(
    (task) =>
      task.assignee === userId &&
      task.status !== TasksStatusOptions.done &&
      task.deadline &&
      new Date(task.deadline) < now,
  ).length;

  // avg time-to-complete in days
  const timeDiffs: number[] = [];
  completedTasks.forEach((task) => {
    if (task.created && task.updated) {
      const created = new Date(task.created).getTime();
      const updated = new Date(task.updated).getTime();
      if (updated >= created) {
        const days = (updated - created) / (1000 * 60 * 60 * 24);
        timeDiffs.push(days);
      }
    }
  });
  const avgTimeToCompleteDays = timeDiffs.length
    ? timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
    : 0;

  const efficiencyScore = assigned.length ? completed / assigned.length : 0;

  // on-time rate among completed
  const onTimeCompleted = completedTasks.filter(
    (task) =>
      task.deadline &&
      task.updated &&
      new Date(task.updated) <= new Date(task.deadline),
  ).length;
  const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

  const user = users?.find((u) => u.id === userId);
  const name = user
    ? user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username
    : userId;

  return {
    userId,
    name,
    totalAssigned: assigned.length,
    completed,
    inProgress,
    overdue,
    avgTimeToCompleteDays,
    efficiencyScore,
    onTimeRate,
  };
}

/**
 * computeTeamAverages
 * Aggregates simple averages across all employees (only users with role employee).
 * Returns averageCompleted, averageCompletionRate, averageOnTimeRate.
 */
export function computeTeamAverages(
  users: UsersRecord[],
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
): {
  averageCompleted: number;
  averageCompletionRate: number; // [0..1]
  averageOnTimeRate: number; // [0..1]
} {
  const employeeUsers = users.filter(
    (u) => u.role === UsersRoleOptions.employee,
  );
  if (employeeUsers.length === 0) {
    return {
      averageCompleted: 0,
      averageCompletionRate: 0,
      averageOnTimeRate: 0,
    };
  }

  let totalCompleted = 0;
  let totalCompletionRate = 0;
  let totalOnTimeRate = 0;

  employeeUsers.forEach((user) => {
    const summary = computeEmployeeSummary(user.id, tasks, range);
    totalCompleted += summary.completed;
    totalCompletionRate += summary.efficiencyScore; // completed / assigned
    totalOnTimeRate += summary.onTimeRate;
  });

  return {
    averageCompleted: totalCompleted / employeeUsers.length,
    averageCompletionRate: totalCompletionRate / employeeUsers.length,
    averageOnTimeRate: totalOnTimeRate / employeeUsers.length,
  };
}

// -----------------------------
// Overtime and Workload Analysis
// -----------------------------

export type OvertimeAnalysis = {
  userId: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgCompletionTime: number; // days
  workloadScore: number; // 0-100, higher = more overloaded
  overtimeIndicator: number; // hours of estimated overtime
};

export type WorkloadDistribution = {
  userId: string;
  name: string;
  activeTasks: number;
  upcomingTasks: number;
  overdueTasks: number;
  capacityUtilization: number; // 0-100%
  workloadLevel: "low" | "medium" | "high" | "critical";
};

/**
 * computeOvertimeAnalysis
 * Analyzes overtime patterns and workload stress indicators for employees.
 * Estimates overtime based on task completion patterns and deadlines.
 */
export function computeOvertimeAnalysis(
  users: UsersRecord[],
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
): OvertimeAnalysis[] {
  const now = new Date();

  return users
    .filter((u) => u.role === UsersRoleOptions.employee)
    .map((user) => {
      const userTasks = tasks.filter((t) => t.assignee === user.id);

      // Tasks in range (created or updated)
      const tasksInRange = userTasks.filter((task) => {
        const createdInRange =
          task.created && isWithinInterval(new Date(task.created), range);
        const updatedInRange =
          task.updated && isWithinInterval(new Date(task.updated), range);
        return createdInRange || updatedInRange;
      });

      // Completed tasks in range
      const completedTasks = tasksInRange.filter(
        (task) =>
          task.status === TasksStatusOptions.done &&
          task.updated &&
          isWithinInterval(new Date(task.updated), range),
      );

      // Overdue tasks (past deadline and not done)
      const overdueTasks = userTasks.filter(
        (task) =>
          task.status !== TasksStatusOptions.done &&
          task.deadline &&
          new Date(task.deadline) < now,
      );

      // Calculate average completion time
      const completionTimes: number[] = [];
      completedTasks.forEach((task) => {
        if (task.created && task.updated) {
          const created = new Date(task.created).getTime();
          const updated = new Date(task.updated).getTime();
          if (updated >= created) {
            const days = (updated - created) / (1000 * 60 * 60 * 24);
            completionTimes.push(days);
          }
        }
      });
      const avgCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
          : 0;

      // Workload score: based on active tasks, overdue tasks, and completion rate
      const activeTasks = userTasks.filter(
        (t) => t.status === TasksStatusOptions.in_progress,
      ).length;
      const completionRate =
        tasksInRange.length > 0
          ? completedTasks.length / tasksInRange.length
          : 0;
      const workloadScore = Math.min(
        100,
        activeTasks * 10 + overdueTasks.length * 15 + (1 - completionRate) * 20,
      );

      // Overtime indicator: estimate based on overdue tasks and completion patterns
      // Assuming 8 hours/day standard work, estimate overtime needed
      const overtimeIndicator =
        overdueTasks.length * 4 + Math.max(0, (activeTasks - 3) * 2);

      return {
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        totalTasks: tasksInRange.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        avgCompletionTime,
        workloadScore,
        overtimeIndicator,
      };
    })
    .sort((a, b) => b.workloadScore - a.workloadScore);
}

/**
 * computeWorkloadDistribution
 * Analyzes current workload distribution across employees.
 */
export function computeWorkloadDistribution(
  users: UsersRecord[],
  tasks: TaskWithProject[],
): WorkloadDistribution[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return users
    .filter((u) => u.role === UsersRoleOptions.employee)
    .map((user) => {
      const userTasks = tasks.filter((t) => t.assignee === user.id);

      // Active tasks (in progress)
      const activeTasks = userTasks.filter(
        (t) => t.status === TasksStatusOptions.in_progress,
      ).length;

      // Upcoming tasks (todo with deadline in next week)
      const upcomingTasks = userTasks.filter(
        (t) =>
          t.status === TasksStatusOptions.todo &&
          t.deadline &&
          new Date(t.deadline) >= now &&
          new Date(t.deadline) <= nextWeek,
      ).length;

      // Overdue tasks
      const overdueTasks = userTasks.filter(
        (t) =>
          t.status !== TasksStatusOptions.done &&
          t.deadline &&
          new Date(t.deadline) < now,
      ).length;

      // Capacity utilization (rough estimate: active + upcoming tasks relative to capacity)
      const estimatedCapacity = 5; // Assume 5 concurrent tasks is full capacity
      const capacityUtilization = Math.min(
        100,
        ((activeTasks + upcomingTasks) / estimatedCapacity) * 100,
      );

      // Workload level classification
      let workloadLevel: "low" | "medium" | "high" | "critical";
      if (capacityUtilization < 40) workloadLevel = "low";
      else if (capacityUtilization < 70) workloadLevel = "medium";
      else if (capacityUtilization < 90) workloadLevel = "high";
      else workloadLevel = "critical";

      return {
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        activeTasks,
        upcomingTasks,
        overdueTasks,
        capacityUtilization,
        workloadLevel,
      };
    })
    .sort((a, b) => b.capacityUtilization - a.capacityUtilization);
}

/**
 * computeProductivityTrends
 * Analyzes productivity trends over time with forecasting capabilities.
 */
export function computeProductivityTrends(
  userId: string,
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
  bucket: "daily" | "weekly" | "monthly",
): {
  historical: EmployeeBucket[];
  trend: "increasing" | "decreasing" | "stable";
  projectedNextPeriod: number;
} {
  const buckets = computeProductivityTrend(userId, tasks, range, bucket);

  if (buckets.length < 2) {
    return {
      historical: buckets,
      trend: "stable",
      projectedNextPeriod: 0,
    };
  }

  // Calculate trend using simple linear regression
  const n = buckets.length;
  const sumX = (n * (n - 1)) / 2; // sum of indices 0 to n-1
  const sumY = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const sumXY = buckets.reduce(
    (sum, bucket, index) => sum + index * bucket.count,
    0,
  );
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // sum of squares of indices

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  let trend: "increasing" | "decreasing" | "stable";
  if (slope > 0.5) trend = "increasing";
  else if (slope < -0.5) trend = "decreasing";
  else trend = "stable";

  // Simple projection for next period
  const lastValue = buckets[buckets.length - 1]?.count || 0;
  const projectedNextPeriod = Math.max(0, lastValue + slope);

  return {
    historical: buckets,
    trend,
    projectedNextPeriod: Math.round(projectedNextPeriod),
  };
}
