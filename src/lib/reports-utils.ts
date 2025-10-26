import {
  format,
  isWithinInterval,
  startOfQuarter,
  startOfYear,
} from "date-fns-jalali";
import { fa } from "date-fns/locale";
import type { TaskWithProject } from "./pocketbase";
import type { UsersRecord } from "./pocketbase-types";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
  UsersRoleOptions,
} from "./pocketbase-types";

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

// Status labels mapping
const STATUS_LABELS: Record<TasksStatusOptions, string> = {
  [TasksStatusOptions.todo]: "در انتظار",
  [TasksStatusOptions.in_progress]: "در حال انجام",
  [TasksStatusOptions.done]: "تکمیل شده",
  [TasksStatusOptions.canceled]: "لغو شده",
};

// Priority labels mapping
const PRIORITY_LABELS = {
  urgent: "فوری",
  high: "اولویت بالا",
  medium: "اولویت متوسط",
  low: "اولویت پایین",
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
    name: STATUS_LABELS[status],
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
    pendingTasks: tasks.filter(
      (task) => task.status === TasksStatusOptions.todo,
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
    .map(([key, count]) => ({
      key,
      label: format(new Date(key), "MMM dd", { locale: fa }),
      count,
    }));
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
