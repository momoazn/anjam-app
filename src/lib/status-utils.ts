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

const STATUS_COLOR_SUFFIX = "Subtle";

const getStatusColorBase = (color: string) =>
  color.endsWith(STATUS_COLOR_SUFFIX)
    ? color.slice(0, -STATUS_COLOR_SUFFIX.length)
    : color;

const isSubtleStatusColor = (color: string) =>
  color.endsWith(STATUS_COLOR_SUFFIX);

const getStatusColorClassName = (color: string) => {
  const base = getStatusColorBase(color);
  if (isSubtleStatusColor(color)) {
    return `bg-${base}-50 text-${base}-700 dark:bg-${base}-900 dark:text-${base}-300`;
  }
  return `bg-${base}-100 text-${base}-800 dark:bg-${base}-800 dark:text-${base}-200`;
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
  return getStatusColorClassName(status.color);
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
  const colorName = getStatusColorBase(config.color);

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
