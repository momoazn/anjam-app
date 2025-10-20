import { format } from "date-fns-jalali";
import { TasksStatusOptions, UsersRoleOptions } from "./pocketbase-types";
import type { TasksRecord, UsersRecord } from "./pocketbase-types";

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
const PRIORITY_LABELS: Record<string, string> = {
  urgent: "فوری",
  high: "اولویت بالا",
  medium: "اولویت متوسط",
  low: "اولویت پایین",
};

// Priority options in order
const PRIORITY_OPTIONS = ["urgent", "high", "medium", "low"] as const;

/**
 * Calculate status distribution for tasks
 */
export function calculateStatusDistribution(
  tasks: TasksRecord[],
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
  tasks: TasksRecord[],
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
  tasks: TasksRecord[],
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
          const date = format(new Date(task.updated), "jMMM jdd");
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

  return Object.entries(completedOverTime).map(([date, count]) => ({
    date,
    completed: count as number,
  }));
}

/**
 * Calculate user performance statistics
 */
export function calculateUserPerformance(
  users: UsersRecord[],
  tasks: TasksRecord[],
): UserPerformanceData[] {
  return users
    .filter((user) => user.role === UsersRoleOptions.employee)
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
export function calculateTaskStats(tasks: TasksRecord[]): TaskStatsData {
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
