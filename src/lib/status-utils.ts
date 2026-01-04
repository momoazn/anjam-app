import { tasks } from "@/constants";

import { TasksResponse, TasksStatusOptions } from "./pocketbase-types";
import { TASK_STATUS_ORDER } from "./status-icons";

export { taskStatusIcons, TASK_STATUS_ORDER } from "./status-icons";
export { priorityColors, priorityIcons } from "./status-priority";

export interface TaskStatusConfig {
  key: TasksStatusOptions;
  name: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  isCanceled: boolean;
  order: number;
  description?: string;
}

export const TASK_STATUS_CONFIG: Record<TasksStatusOptions, TaskStatusConfig> =
  {
    todo: {
      key: TasksStatusOptions.todo,
      name: tasks.status.todo,
      color: "blue",
      icon: "circle",
      isCompleted: false,
      isCanceled: false,
      order: 1,
      description: "Task is created but not yet started",
    },
    in_progress: {
      key: TasksStatusOptions.in_progress,
      name: tasks.status.in_progress,
      color: "amber",
      icon: "circle-half-2",
      isCompleted: false,
      isCanceled: false,
      order: 2,
      description: "Work is actively being done on this task",
    },
    review: {
      key: TasksStatusOptions.review,
      name: tasks.status.review,
      color: "indigo",
      icon: "eye",
      isCompleted: false,
      isCanceled: false,
      order: 3,
      description: "Task is under review or waiting for approval",
    },
    testing: {
      key: TasksStatusOptions.testing,
      name: tasks.status.testing,
      color: "cyan",
      icon: "flask",
      isCompleted: false,
      isCanceled: false,
      order: 4,
      description: "Task is being tested or validated",
    },
    pending: {
      key: TasksStatusOptions.pending,
      name: tasks.status.pending,
      color: "purple",
      icon: "clock",
      isCompleted: false,
      isCanceled: false,
      order: 5,
      description: "Task is waiting for something before proceeding",
    },
    blocked: {
      key: TasksStatusOptions.blocked,
      name: tasks.status.blocked,
      color: "rose",
      icon: "alert-circle",
      isCompleted: false,
      isCanceled: false,
      order: 6,
      description: "Task cannot proceed due to an obstacle",
    },
    on_hold: {
      key: TasksStatusOptions.on_hold,
      name: tasks.status.on_hold,
      color: "slate",
      icon: "pause",
      isCompleted: false,
      isCanceled: false,
      order: 7,
      description: "Task is temporarily paused",
    },
    done: {
      key: TasksStatusOptions.done,
      name: tasks.status.done,
      color: "emerald",
      icon: "check-circle-2",
      isCompleted: true,
      isCanceled: false,
      order: 8,
      description: "Task has been completed successfully",
    },
    canceled: {
      key: TasksStatusOptions.canceled,
      name: tasks.status.canceled,
      color: "gray",
      icon: "x-circle",
      isCompleted: false,
      isCanceled: true,
      order: 9,
      description: "Task has been canceled",
    },
  };

export function getTaskStatus(task: TasksResponse): TaskStatusConfig {
  const status = task.status;
  if (status && status in TASK_STATUS_CONFIG) {
    return TASK_STATUS_CONFIG[status];
  }
  return TASK_STATUS_CONFIG[TasksStatusOptions.todo];
}

export function isTaskCompleted(task: TasksResponse): boolean {
  return getTaskStatus(task).isCompleted;
}

export function isTaskCanceled(task: TasksResponse): boolean {
  return getTaskStatus(task).isCanceled;
}

export function getStatusColorClass(task: TasksResponse): string {
  return getStatusColorVariant(getTaskStatus(task).key, "background");
}

export function getAllTaskStatuses(): TaskStatusConfig[] {
  return TASK_STATUS_ORDER.map((status) => TASK_STATUS_CONFIG[status]);
}

export function getStatusByKey(key: TasksStatusOptions): TaskStatusConfig {
  return TASK_STATUS_CONFIG[key];
}

export function getStatusColorVariant(
  status: TasksStatusOptions,
  variant: "icon" | "background" | "badge" | "border" | "fill",
): string {
  const config = TASK_STATUS_CONFIG[status];
  const colorName = config.color;

  switch (variant) {
    case "icon":
      return `text-${colorName}-600 dark:text-${colorName}-400`;
    case "background":
      return `bg-${colorName}-500/10`;
    case "border":
      return `border-${colorName}-500/20`;
    case "badge":
      return `bg-${colorName}-500/15 text-${colorName}-700 dark:text-${colorName}-300 border-${colorName}-500/20`;
    case "fill": {
      const fillColors: Record<string, string> = {
        blue: "oklch(0.6 0.12 250)",
        amber: "oklch(0.75 0.15 70)",
        emerald: "oklch(0.65 0.15 160)",
        purple: "oklch(0.6 0.15 300)",
        rose: "oklch(0.6 0.18 25)",
        indigo: "oklch(0.55 0.15 270)",
        cyan: "oklch(0.7 0.12 200)",
        slate: "oklch(0.6 0.05 240)",
        gray: "oklch(0.6 0.02 240)",
      };
      return fillColors[colorName] || "oklch(0.6 0.05 240)";
    }
    default:
      return "text-gray-500";
  }
}

export function isActiveStatus(status: TasksStatusOptions): boolean {
  const config = TASK_STATUS_CONFIG[status];
  return !config.isCompleted && !config.isCanceled && status !== "on_hold";
}

export function isTerminalStatus(status: TasksStatusOptions): boolean {
  return (
    TASK_STATUS_CONFIG[status].isCompleted ||
    TASK_STATUS_CONFIG[status].isCanceled
  );
}

export const statusOrder = TASK_STATUS_ORDER;

export function getStatusConfig(status: TasksStatusOptions) {
  return TASK_STATUS_CONFIG[status];
}
