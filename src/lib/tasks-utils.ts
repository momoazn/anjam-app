import {
  Icon,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars4,
  IconAntennaBars5,
  IconCircle,
  IconCircleCheck,
  IconCircleHalf2,
  IconCircleX,
} from "@tabler/icons-react";

import { TasksPriorityOptions, TasksStatusOptions } from "./pocketbase-types";

export const priorityColors: Record<TasksPriorityOptions, string> = {
  low: "text-green-500 dark:text-green-400",
  medium: "text-yellow-500 dark:text-yellow-400",
  high: "text-orange-500 dark:text-orange-400",
  urgent: "text-red-500 dark:text-red-400",
};

export const priorityIcons: Record<TasksPriorityOptions, Icon> = {
  low: IconAntennaBars2,
  medium: IconAntennaBars3,
  high: IconAntennaBars4,
  urgent: IconAntennaBars5,
};

export const statusLabels: Record<TasksStatusOptions, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

export const taskStatusBgColors: Record<TasksStatusOptions, string> = {
  todo: "bg-slate-50 dark:bg-slate-800/50",
  in_progress: "bg-yellow-50 dark:bg-yellow-900/30",
  done: "bg-purple-50 dark:bg-purple-900/30",
  canceled: "bg-gray-100 dark:bg-gray-800/50",
};

export const taskStatusColors: Record<TasksStatusOptions, string> = {
  todo: "text-gray-400 dark:text-gray-500",
  in_progress: "text-yellow-500 dark:text-yellow-400",
  done: "text-purple-600 dark:text-purple-400",
  canceled: "text-gray-500 dark:text-gray-400",
};

// Higher-contrast badge backgrounds for statuses (WCAG-friendly)
export const taskStatusBadgeSolids: Record<TasksStatusOptions, string> = {
  todo: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  in_progress: "bg-yellow-500 text-white dark:bg-yellow-500 dark:text-white",
  done: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
  canceled: "bg-gray-500 text-white dark:bg-gray-400 dark:text-white",
};

export const taskStatusIcons: Record<TasksStatusOptions, Icon> = {
  todo: IconCircle,
  in_progress: IconCircleHalf2,
  done: IconCircleCheck,
  canceled: IconCircleX,
};

export const statusOrder: TasksStatusOptions[] = [
  TasksStatusOptions.todo,
  TasksStatusOptions.in_progress,
  TasksStatusOptions.done,
  TasksStatusOptions.canceled,
];
