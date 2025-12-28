/**
 * Comprehensive task status and priority utilities
 *
 * This file consolidates all status-related functionality including:
 * - Status configuration and validation
 * - Color schemes and theming
 * - UI component mappings
 *
 * Icons and priority-specific utilities have been extracted to:
 * - status-icons.ts: Task status icon mappings
 * - status-priority.ts: Priority color and icon mappings
 */

import { tasks } from "@/constants";
import { TasksResponse, TasksStatusOptions } from "./pocketbase-types";
import { TASK_STATUS_ORDER } from "./status-icons";

// Import icon and priority utilities from extracted modules
export { taskStatusIcons, TASK_STATUS_ORDER } from "./status-icons";
export { priorityColors, priorityIcons } from "./status-priority";

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
  return getStatusColorVariant(status.key, "background");
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
      // Map status colors to approximate oklch values for charts
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
