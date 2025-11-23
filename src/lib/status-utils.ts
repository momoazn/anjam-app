import { fa } from "@/constants/text";
import type { TasksResponse, TasksStatusOptions } from "./pocketbase-types";

/**
 * Get the status for a task
 */
export function getTaskStatus(task: TasksResponse): {
  key: string;
  name: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  isCanceled: boolean;
} {
  if (task.status) {
    return statusToConfig(task.status);
  }

  // Default fallback
  return {
    key: "todo",
    name: fa.tasks.status.todo,
    color: "gray",
    icon: "circle",
    isCompleted: false,
    isCanceled: false,
  };
}

/**
 * Convert status values to config format
 */
export function statusToConfig(status: TasksStatusOptions): {
  key: string;
  name: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  isCanceled: boolean;
} {
  const configs: Record<
    TasksStatusOptions,
    {
      key: string;
      name: string;
      color: string;
      icon: string;
      isCompleted: boolean;
      isCanceled: boolean;
    }
  > = {
    todo: {
      key: "todo",
      name: fa.tasks.status.todo,
      color: "gray",
      icon: "circle",
      isCompleted: false,
      isCanceled: false,
    },
    in_progress: {
      key: "in_progress",
      name: fa.tasks.status.in_progress,
      color: "blue",
      icon: "progress",
      isCompleted: false,
      isCanceled: false,
    },
    pending: {
      key: "pending",
      name: fa.tasks.status.pending,
      color: "yellow",
      icon: "clock",
      isCompleted: false,
      isCanceled: false,
    },
    done: {
      key: "done",
      name: fa.tasks.status.done,
      color: "green",
      icon: "check",
      isCompleted: true,
      isCanceled: false,
    },
    canceled: {
      key: "canceled",
      name: fa.tasks.status.canceled,
      color: "red",
      icon: "x",
      isCompleted: false,
      isCanceled: true,
    },
    blocked: {
      key: "blocked",
      name: fa.tasks.status.blocked,
      color: "orange",
      icon: "alert-circle",
      isCompleted: false,
      isCanceled: false,
    },
    review: {
      key: "review",
      name: fa.tasks.status.review,
      color: "purple",
      icon: "eye",
      isCompleted: false,
      isCanceled: false,
    },
    testing: {
      key: "testing",
      name: fa.tasks.status.testing,
      color: "indigo",
      icon: "flask",
      isCompleted: false,
      isCanceled: false,
    },
    ready: {
      key: "ready",
      name: fa.tasks.status.ready,
      color: "teal",
      icon: "rocket",
      isCompleted: false,
      isCanceled: false,
    },
    on_hold: {
      key: "on_hold",
      name: fa.tasks.status.on_hold,
      color: "gray",
      icon: "pause",
      isCompleted: false,
      isCanceled: false,
    },
  };

  return configs[status];
}

/**
 * Check if a task is completed (based on status)
 */
export function isTaskCompleted(task: TasksResponse): boolean {
  const status = getTaskStatus(task);
  return status.isCompleted;
}

/**
 * Check if a task is canceled
 */
export function isTaskCanceled(task: TasksResponse): boolean {
  const status = getTaskStatus(task);
  return status.isCanceled;
}

/**
 * Get status color class for Tailwind
 */
export function getStatusColorClass(task: TasksResponse): string {
  const status = getTaskStatus(task);
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    yellow:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    orange:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    purple:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    indigo:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    teal: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  };

  return colorMap[status.color] || colorMap.gray;
}
