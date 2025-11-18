import type {
  TasksResponse,
  StatusConfigsResponse,
  TasksStatusOptions,
} from "./pocketbase-types";

/**
 * Get the effective status for a task, preferring status_config over legacy status
 */
export function getTaskStatus(
  task: TasksResponse<{
    status_config?: StatusConfigsResponse;
  }>,
): {
  key: string;
  name: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  isCanceled: boolean;
} {
  // Prefer status_config if available (new system)
  if (task.expand?.status_config) {
    const config = task.expand.status_config;
    return {
      key: config.key,
      name: config.name,
      color: config.color,
      icon: config.icon,
      isCompleted: config.is_completed || false,
      isCanceled: config.is_canceled || false,
    };
  }

  // Fallback to legacy status field
  if (task.status) {
    return legacyStatusToConfig(task.status);
  }

  // Default fallback
  return {
    key: "todo",
    name: "To Do",
    color: "gray",
    icon: "circle",
    isCompleted: false,
    isCanceled: false,
  };
}

/**
 * Convert legacy status values to status config format
 */
function legacyStatusToConfig(status: TasksStatusOptions): {
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
      name: "To Do",
      color: "gray",
      icon: "circle",
      isCompleted: false,
      isCanceled: false,
    },
    in_progress: {
      key: "in_progress",
      name: "In Progress",
      color: "blue",
      icon: "progress",
      isCompleted: false,
      isCanceled: false,
    },
    pending: {
      key: "pending",
      name: "Pending",
      color: "yellow",
      icon: "clock",
      isCompleted: false,
      isCanceled: false,
    },
    done: {
      key: "done",
      name: "Done",
      color: "green",
      icon: "check",
      isCompleted: true,
      isCanceled: false,
    },
    canceled: {
      key: "canceled",
      name: "Canceled",
      color: "red",
      icon: "x",
      isCompleted: false,
      isCanceled: true,
    },
    blocked: {
      key: "blocked",
      name: "Blocked",
      color: "orange",
      icon: "alert-circle",
      isCompleted: false,
      isCanceled: false,
    },
    review: {
      key: "review",
      name: "In Review",
      color: "purple",
      icon: "eye",
      isCompleted: false,
      isCanceled: false,
    },
    testing: {
      key: "testing",
      name: "Testing",
      color: "indigo",
      icon: "flask",
      isCompleted: false,
      isCanceled: false,
    },
    ready: {
      key: "ready",
      name: "Ready",
      color: "teal",
      icon: "rocket",
      isCompleted: false,
      isCanceled: false,
    },
    on_hold: {
      key: "on_hold",
      name: "On Hold",
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
export function isTaskCompleted(
  task: TasksResponse<{
    status_config?: StatusConfigsResponse;
  }>,
): boolean {
  const status = getTaskStatus(task);
  return status.isCompleted;
}

/**
 * Check if a task is canceled
 */
export function isTaskCanceled(
  task: TasksResponse<{
    status_config?: StatusConfigsResponse;
  }>,
): boolean {
  const status = getTaskStatus(task);
  return status.isCanceled;
}

/**
 * Get status color class for Tailwind
 */
export function getStatusColorClass(
  task: TasksResponse<{
    status_config?: StatusConfigsResponse;
  }>,
): string {
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
