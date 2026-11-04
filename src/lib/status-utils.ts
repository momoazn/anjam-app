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

type StatusClassVariant =
  | "icon"
  | "background"
  | "badge"
  | "border"
  | "borderTop"
  | "bar";

// Static class map: Tailwind cannot see classes built with template strings.
const STATUS_CLASSES: Record<string, Record<StatusClassVariant, string>> = {
  blue: {
    icon: "text-blue-600 dark:text-blue-400",
    background: "bg-blue-500/10",
    border: "border-blue-500/20",
    borderTop: "border-t-blue-500",
    bar: "bg-blue-500",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400",
    background: "bg-amber-500/10",
    border: "border-amber-500/20",
    borderTop: "border-t-amber-500",
    bar: "bg-amber-500",
    badge:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  indigo: {
    icon: "text-indigo-600 dark:text-indigo-400",
    background: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    borderTop: "border-t-indigo-500",
    bar: "bg-indigo-500",
    badge:
      "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400",
    background: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    borderTop: "border-t-emerald-500",
    bar: "bg-emerald-500",
    badge:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  gray: {
    icon: "text-gray-600 dark:text-gray-400",
    background: "bg-gray-500/10",
    border: "border-gray-500/20",
    borderTop: "border-t-gray-500",
    bar: "bg-gray-500",
    badge: "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/20",
  },
};

export function getStatusColorVariant(
  status: TaskStatus,
  variant: StatusClassVariant | "fill",
): string {
  const config = TASK_STATUS_CONFIG[status];
  if (!config) return "text-gray-500"; // Fallback

  const colorName = config.color;

  if (variant !== "fill") {
    return (STATUS_CLASSES[colorName] ?? STATUS_CLASSES.gray)[variant];
  }

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
