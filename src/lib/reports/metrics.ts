import { isWithinInterval } from "date-fns-jalali";

import { tasks } from "@/constants";

import type { TaskWithProject } from "../pocketbase";
import type { TasksPriorityOptions, UsersRecord } from "../pocketbase-types";
import { TasksStatusOptions } from "../pocketbase-types";
import { TASK_STATUS_CONFIG } from "../status-utils";
import type {
  OverviewMetrics,
  PriorityCount,
  PriorityDistributionData,
  StatusDistributionData,
  TaskStatsData,
  TimelinessClassification,
  UserPerformanceData,
} from "./types";

// Priority labels mapping
const PRIORITY_LABELS = {
  urgent: tasks.priority.urgent,
  high: "high",
  medium: "medium",
  low: "low",
} as const;

// Priority options in order
const PRIORITY_OPTIONS = ["urgent", "high", "medium", "low"] as const;

/**
 * Calculate status distribution for tasks
 */
export function calculateStatusDistribution(
  tasksList: TaskWithProject[],
): StatusDistributionData[] {
  return Object.values(TasksStatusOptions).map((status) => ({
    name: TASK_STATUS_CONFIG[status].name,
    value: tasksList.filter((task) => task.status === status).length,
    status,
  }));
}

/**
 * Calculate priority distribution for tasks
 */
export function calculatePriorityDistribution(
  tasksList: TaskWithProject[],
): PriorityDistributionData[] {
  return PRIORITY_OPTIONS.map((priority) => ({
    name: PRIORITY_LABELS[priority],
    value: tasksList.filter((task) => task.priority === priority).length,
    priority,
  }));
}

/**
 * Calculate user performance statistics
 */
export function calculateUserPerformance(
  users: UsersRecord[],
  tasksList: TaskWithProject[],
): UserPerformanceData[] {
  return users
    .filter((user) => user.role && user.role === "employee")
    .map((user) => {
      const userTasks = tasksList.filter((task) => task.assignee === user.id);
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
export function calculateTaskStats(
  tasksList: TaskWithProject[],
): TaskStatsData {
  return {
    statusDistribution: calculateStatusDistribution(tasksList),
    completionTrend: [], // Handled by chart-data module
    priorityDistribution: calculatePriorityDistribution(tasksList),
    totalTasks: tasksList.length,
    completedTasks: tasksList.filter(
      (task) => task.status === TasksStatusOptions.done,
    ).length,
    inProgressTasks: tasksList.filter(
      (task) => task.status === TasksStatusOptions.in_progress,
    ).length,
    pendingTasks: tasksList.filter((task) =>
      [TasksStatusOptions.todo, TasksStatusOptions.pending].includes(
        task.status as TasksStatusOptions,
      ),
    ).length,
  };
}

/**
 * Compute overview metrics for a given time range
 */
export function computeOverviewMetrics(params: {
  tasks: TaskWithProject[];
  now: Date;
  range: { start: Date; end: Date };
}): OverviewMetrics {
  const { tasks: tasksList, now, range } = params;

  // Total: tasks with created OR updated in range
  const total = tasksList.filter((task) => {
    const createdInRange =
      task.created && isWithinInterval(new Date(task.created), range);
    const updatedInRange =
      task.updated && isWithinInterval(new Date(task.updated), range);
    return createdInRange || updatedInRange;
  }).length;

  // Completed: done tasks with updated in range
  const completedTasks = tasksList.filter(
    (task) =>
      task.status === "done" &&
      task.updated &&
      isWithinInterval(new Date(task.updated), range),
  );
  const completed = completedTasks.length;

  // WIP: in_progress at now (ignore range)
  const wip = tasksList.filter((task) => task.status === "in_progress").length;

  // Overdue: not done and deadline < now
  const overdue = tasksList.filter(
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

/**
 * Classify tasks by timeliness (on-time, overdue, no deadline)
 */
export function classifyTimeliness(
  tasksList: TaskWithProject[],
  range: { start: Date; end: Date },
): TimelinessClassification {
  const counts = { on_time: 0, overdue: 0, no_deadline: 0 };

  tasksList.forEach((task) => {
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

/**
 * Count tasks by priority
 */
export function countByPriority(
  tasksList: TaskWithProject[],
  options?: { onlyOpen?: boolean },
): PriorityCount[] {
  const counts = new Map<TasksPriorityOptions, number>();

  tasksList.forEach((task) => {
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
