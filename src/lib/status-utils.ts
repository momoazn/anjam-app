import {
  Icon,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars4,
  IconAntennaBars5,
  IconCircle,
  IconCircleCheckFilled,
  IconCircleHalf2,
  IconCircleX,
  IconEye,
} from "@tabler/icons-react";

import { tasks } from "@/constants";
import { TaskPriority, TaskStatus } from "@/types/tasks";

export const taskStatusIcons: Record<TaskStatus, Icon> = {
  todo: IconCircle,
  in_progress: IconCircleHalf2,
  in_review: IconEye,
  done: IconCircleCheckFilled,
  cancelled: IconCircleX,
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
];

export const priorityColors: Record<TaskPriority, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  urgent: "text-rose-600 dark:text-rose-400",
};

export const priorityIcons: Record<TaskPriority, Icon> = {
  low: IconAntennaBars2,
  medium: IconAntennaBars3,
  high: IconAntennaBars4,
  urgent: IconAntennaBars5,
};

export interface TaskStatusConfig {
  key: TaskStatus;
  name: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  isCanceled: boolean;
  order: number;
  description?: string;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusConfig> = {
  todo: {
    key: "todo",
    name: tasks.status.todo,
    color: "blue",
    icon: "circle",
    isCompleted: false,
    isCanceled: false,
    order: 1,
    description: "Task is created but not yet started",
  },
  in_progress: {
    key: "in_progress",
    name: tasks.status.in_progress,
    color: "amber",
    icon: "circle-half-2",
    isCompleted: false,
    isCanceled: false,
    order: 2,
    description: "Work is actively being done on this task",
  },
  in_review: {
    key: "in_review",
    name: tasks.status.in_review,
    color: "indigo",
    icon: "eye",
    isCompleted: false,
    isCanceled: false,
    order: 3,
    description: "Task is under review or waiting for approval",
  },
  done: {
    key: "done",
    name: tasks.status.done,
    color: "emerald",
    icon: "check-circle-2",
    isCompleted: true,
    isCanceled: false,
    order: 8,
    description: "Task has been completed successfully",
  },
  cancelled: {
    key: "cancelled",
    name: tasks.status.cancelled,
    color: "gray",
    icon: "x-circle",
    isCompleted: false,
    isCanceled: true,
    order: 9,
    description: "Task has been canceled",
  },
};

export function getTaskStatus(task: { status?: string }): TaskStatusConfig {
  const status = task.status as TaskStatus;
  if (status && status in TASK_STATUS_CONFIG) {
    return TASK_STATUS_CONFIG[status];
  }
  return TASK_STATUS_CONFIG["todo"];
}

export function isTaskCompleted(task: { status?: string }): boolean {
  return getTaskStatus(task).isCompleted;
}

export function isTaskCanceled(task: { status?: string }): boolean {
  return getTaskStatus(task).isCanceled;
}

export function getStatusColorVariant(
  status: TaskStatus,
  variant: "icon" | "background" | "badge" | "border" | "fill",
): string {
  const config = TASK_STATUS_CONFIG[status];
  if (!config) return "text-gray-500"; // Fallback

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

export const statusOrder = TASK_STATUS_ORDER;
