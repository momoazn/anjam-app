/**
 * Comprehensive task status and priority utilities
 *
 * This file consolidates all status-related functionality including:
 * - Status configuration and validation
 * - Color schemes and theming
 * - Icon mappings
 * - Priority utilities
 * - UI component mappings
 */

import {
  Icon,
  IconAlertCircle,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars4,
  IconAntennaBars5,
  IconCircle,
  IconCircleCheckFilled,
  IconCircleHalf2,
  IconCircleX,
  IconClock,
  IconEye,
  IconFlask,
  IconPlayerPause,
} from "@tabler/icons-react";

import { fa } from "@/constants/text";
import {
  TasksPriorityOptions,
  TasksResponse,
  TasksStatusOptions,
} from "./pocketbase-types";

/**
 * Task status configuration with comprehensive metadata
 */
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

/**
 * Centralized task status configuration
 * Order reflects typical workflow progression
 */
export const TASK_STATUS_CONFIG: Record<TasksStatusOptions, TaskStatusConfig> =
  {
    todo: {
      key: TasksStatusOptions.todo,
      name: fa.tasks.status.todo,
      color: "slate",
      icon: "circle",
      isCompleted: false,
      isCanceled: false,
      order: 1,
      description: "Task is created but not yet started",
    },
    in_progress: {
      key: TasksStatusOptions.in_progress,
      name: fa.tasks.status.in_progress,
      color: "blueSubtle",
      icon: "circle-half-2",
      isCompleted: false,
      isCanceled: false,
      order: 2,
      description: "Work is actively being done on this task",
    },
    review: {
      key: TasksStatusOptions.review,
      name: fa.tasks.status.review,
      color: "purpleSubtle",
      icon: "eye",
      isCompleted: false,
      isCanceled: false,
      order: 3,
      description: "Task is under review or waiting for approval",
    },
    testing: {
      key: TasksStatusOptions.testing,
      name: fa.tasks.status.testing,
      color: "slateSubtle",
      icon: "flask",
      isCompleted: false,
      isCanceled: false,
      order: 4,
      description: "Task is being tested or validated",
    },
    pending: {
      key: TasksStatusOptions.pending,
      name: fa.tasks.status.pending,
      color: "amberSubtle",
      icon: "clock",
      isCompleted: false,
      isCanceled: false,
      order: 5,
      description: "Task is waiting for something before proceeding",
    },
    blocked: {
      key: TasksStatusOptions.blocked,
      name: fa.tasks.status.blocked,
      color: "redSubtle",
      icon: "alert-circle",
      isCompleted: false,
      isCanceled: false,
      order: 6,
      description: "Task cannot proceed due to an obstacle",
    },
    on_hold: {
      key: TasksStatusOptions.on_hold,
      name: fa.tasks.status.on_hold,
      color: "slateSubtle",
      icon: "pause",
      isCompleted: false,
      isCanceled: false,
      order: 7,
      description: "Task is temporarily paused",
    },
    done: {
      key: TasksStatusOptions.done,
      name: fa.tasks.status.done,
      color: "greenSubtle",
      icon: "check-circle-2",
      isCompleted: true,
      isCanceled: false,
      order: 8,
      description: "Task has been completed successfully",
    },
    canceled: {
      key: TasksStatusOptions.canceled,
      name: fa.tasks.status.canceled,
      color: "graySubtle",
      icon: "x-circle",
      isCompleted: false,
      isCanceled: true,
      order: 9,
      description: "Task has been canceled",
    },
  };

/**
 * Ordered list of task statuses (by workflow order)
 */
export const TASK_STATUS_ORDER: TasksStatusOptions[] = [
  TasksStatusOptions.todo,
  TasksStatusOptions.in_progress,
  TasksStatusOptions.review,
  TasksStatusOptions.testing,
  TasksStatusOptions.pending,
  TasksStatusOptions.blocked,
  TasksStatusOptions.on_hold,
  TasksStatusOptions.done,
  TasksStatusOptions.canceled,
];

/**
 * Get the status configuration for a task
 * Falls back to 'todo' status if the task status is undefined or invalid
 */
export function getTaskStatus(task: TasksResponse): TaskStatusConfig {
  const status = task.status;
  if (status && status in TASK_STATUS_CONFIG) {
    return TASK_STATUS_CONFIG[status];
  }
  // Fallback to todo status for missing or invalid status values
  return TASK_STATUS_CONFIG[TasksStatusOptions.todo];
}

/**
 * Color class mappings for consistent styling across light/dark themes
 * Includes both bold and subtle variants for different use cases
 */
export const STATUS_COLOR_CLASSES: Record<string, string> = {
  // Bold colors (existing)
  slate: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",

  // Subtle colors with hints of color (dimmed but distinguishable)
  slateSubtle:
    "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  blueSubtle: "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  greenSubtle:
    "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300",
  purpleSubtle:
    "bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  amberSubtle:
    "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  redSubtle: "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300",
  neutralSubtle:
    "bg-neutral-50 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
  graySubtle: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

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
  return STATUS_COLOR_CLASSES[status.color] || STATUS_COLOR_CLASSES.slate;
}

/**
 * Get all available task statuses in workflow order
 */
export function getAllTaskStatuses(): TaskStatusConfig[] {
  return TASK_STATUS_ORDER.map((status) => TASK_STATUS_CONFIG[status]);
}

/**
 * Get status by key
 */
export function getStatusByKey(key: TasksStatusOptions): TaskStatusConfig {
  return TASK_STATUS_CONFIG[key];
}

/**
 * Generate color variants for a status based on its base color
 */
export function getStatusColorVariant(
  status: TasksStatusOptions,
  variant: "icon" | "background" | "badge",
): string {
  const config = TASK_STATUS_CONFIG[status];
  const baseColor = config.color;

  // Map base colors to their variants
  // Remove "Subtle" suffix if present to get the base color name
  const colorName = baseColor.replace("Subtle", "");

  switch (variant) {
    case "icon":
      // For icon colors, use a consistent pattern
      return `text-${colorName}-700 dark:text-${colorName}-300`;

    case "background":
      // For background colors, use light background with dark mode variant
      return `bg-${colorName}-50 dark:bg-${colorName}-900/30`;

    case "badge":
      // For solid badges, use bold colors with dark mode variant
      return `bg-${colorName}-600 text-white dark:bg-${colorName}-500 dark:text-white`;

    default:
      return "text-gray-500";
  }
}

/**
 * Check if a status represents an active working state
 */
export function isActiveStatus(status: TasksStatusOptions): boolean {
  const config = TASK_STATUS_CONFIG[status];
  return !config.isCompleted && !config.isCanceled && status !== "on_hold";
}

/**
 * Check if a status represents a terminal state (completed or canceled)
 */
export function isTerminalStatus(status: TasksStatusOptions): boolean {
  const config = TASK_STATUS_CONFIG[status];
  return config.isCompleted || config.isCanceled;
}

// ============================================================================
// PRIORITY UTILITIES
// ============================================================================

/**
 * Priority color mappings for task priority indicators
 */
export const priorityColors: Record<TasksPriorityOptions, string> = {
  low: "text-green-500 dark:text-green-400",
  medium: "text-yellow-500 dark:text-yellow-400",
  high: "text-orange-500 dark:text-orange-400",
  urgent: "text-red-500 dark:text-red-400",
};

/**
 * Priority icon mappings for task priority indicators
 */
export const priorityIcons: Record<TasksPriorityOptions, Icon> = {
  low: IconAntennaBars2,
  medium: IconAntennaBars3,
  high: IconAntennaBars4,
  urgent: IconAntennaBars5,
};

// ============================================================================
// STATUS-DERIVED MAPPINGS (for UI components)
// ============================================================================

/**
 * Status icons mapped to the centralized configuration
 */
export const taskStatusIcons: Record<TasksStatusOptions, Icon> = {
  [TasksStatusOptions.todo]: IconCircle,
  [TasksStatusOptions.in_progress]: IconCircleHalf2,
  [TasksStatusOptions.review]: IconEye,
  [TasksStatusOptions.testing]: IconFlask,
  [TasksStatusOptions.pending]: IconClock,
  [TasksStatusOptions.blocked]: IconAlertCircle,
  [TasksStatusOptions.on_hold]: IconPlayerPause,
  [TasksStatusOptions.done]: IconCircleCheckFilled,
  [TasksStatusOptions.canceled]: IconCircleX,
};

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Re-export the status order from the centralized configuration
 */
export const statusOrder = TASK_STATUS_ORDER;

/**
 * Utility function to get status config (for backward compatibility)
 * @deprecated Use getStatusByKey instead
 */
export function getStatusConfig(status: TasksStatusOptions) {
  return TASK_STATUS_CONFIG[status];
}
