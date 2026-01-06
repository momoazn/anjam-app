import { isWithinInterval } from "date-fns-jalali";

import { tasks } from "@/constants";

import type {
  ConvexTask,
  ConvexTaskPriority,
  ConvexUser,
} from "./types";
import type {
  OverviewMetrics,
  PriorityCount,
  PriorityDistributionData,
  StatusDistributionData,
  TaskStatsData,
  TimelinessClassification,
  UserPerformanceData,
} from "./types";

// Convex task status values
const CONVEX_TASK_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
] as const;

// Priority labels mapping
const PRIORITY_LABELS = {
  urgent: tasks.priority.urgent,
  high: "high",
  medium: "medium",
  low: "low",
} as const;

// Priority options in order
const PRIORITY_OPTIONS = ["urgent", "high", "medium", "low"] as const;

// Status labels mapping for Convex
const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  cancelled: "Cancelled",
};

/**
 * Calculate status distribution for tasks
 */
export function calculateStatusDistribution(
  tasksList: ConvexTask[],
): StatusDistributionData[] {
  return CONVEX_TASK_STATUSES.map((status) => ({
    name: STATUS_LABELS[status] || status,
    value: tasksList.filter((task) => task.status === status).length,
    status,
  }));
}

/**
 * Calculate priority distribution for tasks
 */
export function calculatePriorityDistribution(
  tasksList: ConvexTask[],
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
  users: ConvexUser[],
  tasksList: ConvexTask[],
): UserPerformanceData[] {
  return users
    .map((user) => {
      const userId = user._id || user.id;
      const userTasks = tasksList.filter(
        (task) =>
          task.assigneeUserId === userId || task.assignee === userId,
      );
      const completedTasks = userTasks.filter(
        (task) => task.status === "done",
      );

      return {
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username || "Unknown",
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
export function calculateTaskStats(tasksList: ConvexTask[]): TaskStatsData {
  return {
    statusDistribution: calculateStatusDistribution(tasksList),
    completionTrend: [], // Handled by chart-data module
    priorityDistribution: calculatePriorityDistribution(tasksList),
    totalTasks: tasksList.length,
    completedTasks: tasksList.filter((task) => task.status === "done").length,
    inProgressTasks: tasksList.filter(
      (task) => task.status === "in_progress",
    ).length,
    pendingTasks: tasksList.filter(
      (task) => task.status === "todo" || task.status === "in_review",
    ).length,
  };
}

/**
 * Compute overview metrics for a given time range
 */
export function computeOverviewMetrics(params: {
  tasks: ConvexTask[];
  now: Date;
  range: { start: Date; end: Date };
}): OverviewMetrics {
  const { tasks: tasksList, now, range } = params;

  // Total: tasks with created OR updated in range
  const total = tasksList.filter((task) => {
    const createdInRange = isWithinInterval(
      new Date(task._creationTime),
      range,
    );
    const updatedAt = task.updatedAt ?? task.updated;
    const updatedInRange = updatedAt
      ? isWithinInterval(new Date(updatedAt), range)
      : false;
    return createdInRange || updatedInRange;
  }).length;

  // Completed: done tasks with updated in range
  const completedTasks = tasksList.filter((task) => {
    if (task.status !== "done") return false;
    const updatedAt = task.updatedAt ?? task.updated;
    if (!updatedAt) return false;
    return isWithinInterval(new Date(updatedAt), range);
  });
  const completed = completedTasks.length;

  // WIP: in_progress at now (ignore range)
  const wip = tasksList.filter((task) => task.status === "in_progress").length;

  // Overdue: not done and deadline < now
  const overdue = tasksList.filter((task) => {
    if (task.status === "done") return false;
    if (!task.deadline) return false;
    return new Date(task.deadline) < now;
  }).length;

  // On-time rate: among completed, fraction with deadline && updated <= deadline
  const onTimeCompleted = completedTasks.filter((task) => {
    if (!task.deadline) return false;
    const updatedAt = task.updatedAt ?? task.updated;
    if (!updatedAt) return false;
    return new Date(updatedAt) <= new Date(task.deadline);
  }).length;
  const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

  return { total, completed, wip, overdue, onTimeRate };
}

/**
 * Classify tasks by timeliness (on-time, overdue, no deadline)
 */
export function classifyTimeliness(
  tasksList: ConvexTask[],
  range: { start: Date; end: Date },
): TimelinessClassification {
  const counts = { on_time: 0, overdue: 0, no_deadline: 0 };

  tasksList.forEach((task) => {
    if (task.status !== "done") return;
    const updatedAt = task.updatedAt ?? task.updated;
    if (!updatedAt) return;

    const updatedDate = new Date(updatedAt);
    if (!isWithinInterval(updatedDate, range)) return;

    if (!task.deadline) {
      counts.no_deadline++;
    } else if (updatedDate <= new Date(task.deadline)) {
      counts.on_time++;
    } else {
      counts.overdue++;
    }
  });

  return counts;
}

/**
 * Count tasks by priority
 */
export function countByPriority(
  tasksList: ConvexTask[],
  options?: { onlyOpen?: boolean },
): PriorityCount[] {
  const counts = new Map<string, number>();

  tasksList.forEach((task) => {
    if (options?.onlyOpen && task.status === "done") {
      return; // Skip done tasks if onlyOpen
    }
    counts.set(task.priority, (counts.get(task.priority) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([key, value]) => ({
    key: key as ConvexTaskPriority,
    name: PRIORITY_LABELS[key as ConvexTaskPriority],
    value,
  }));
}
