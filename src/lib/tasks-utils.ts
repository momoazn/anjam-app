import {
  Icon,
  IconAlertCircle,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars4,
  IconAntennaBars5,
  IconCircle,
  IconCircleCheck,
  IconCircleHalf2,
  IconCircleX,
  IconClock,
  IconEye,
  IconPlayerPause,
  IconTestPipe,
} from "@tabler/icons-react";

import { fa } from "@/constants/text";
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
  todo: fa.tasks.status.todo,
  in_progress: fa.tasks.status.in_progress,
  pending: fa.tasks.status.pending,
  done: fa.tasks.status.done,
  canceled: fa.tasks.status.canceled,
  blocked: fa.tasks.status.blocked,
  review: fa.tasks.status.review,
  testing: fa.tasks.status.testing,
  ready: fa.tasks.status.ready,
  on_hold: fa.tasks.status.on_hold,
};

export const taskStatusBgColors: Record<TasksStatusOptions, string> = {
  todo: "bg-slate-50 dark:bg-slate-800/50",
  in_progress: "bg-yellow-50 dark:bg-yellow-900/30",
  pending: "bg-orange-50 dark:bg-orange-900/30",
  done: "bg-purple-50 dark:bg-purple-900/30",
  canceled: "bg-gray-100 dark:bg-gray-800/50",
  blocked: "bg-red-50 dark:bg-red-900/30",
  review: "bg-blue-50 dark:bg-blue-900/30",
  testing: "bg-indigo-50 dark:bg-indigo-900/30",
  ready: "bg-emerald-50 dark:bg-emerald-900/30",
  on_hold: "bg-slate-100 dark:bg-slate-900/40",
};

export const taskStatusColors: Record<TasksStatusOptions, string> = {
  todo: "text-gray-400 dark:text-gray-500",
  in_progress: "text-yellow-500 dark:text-yellow-400",
  pending: "text-orange-500 dark:text-orange-400",
  done: "text-purple-600 dark:text-purple-400",
  canceled: "text-gray-500 dark:text-gray-400",
  blocked: "text-red-500 dark:text-red-400",
  review: "text-blue-500 dark:text-blue-400",
  testing: "text-indigo-500 dark:text-indigo-400",
  ready: "text-emerald-600 dark:text-emerald-400",
  on_hold: "text-slate-500 dark:text-slate-400",
};

// Higher-contrast badge backgrounds for statuses (WCAG-friendly)
export const taskStatusBadgeSolids: Record<TasksStatusOptions, string> = {
  todo: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  in_progress: "bg-yellow-500 text-white dark:bg-yellow-500 dark:text-white",
  pending: "bg-orange-500 text-white dark:bg-orange-500 dark:text-white",
  done: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
  canceled: "bg-gray-500 text-white dark:bg-gray-400 dark:text-white",
  blocked: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
  review: "bg-blue-500 text-white dark:bg-blue-500 dark:text-white",
  testing: "bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white",
  ready: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white",
  on_hold: "bg-slate-500 text-white dark:bg-slate-500 dark:text-white",
};

export const taskStatusIcons: Record<TasksStatusOptions, Icon> = {
  todo: IconCircle,
  in_progress: IconCircleHalf2,
  pending: IconClock,
  done: IconCircleCheck,
  canceled: IconCircleX,
  blocked: IconAlertCircle,
  review: IconEye,
  testing: IconTestPipe,
  ready: IconCircleCheck,
  on_hold: IconPlayerPause,
};

export const statusOrder: TasksStatusOptions[] = [
  TasksStatusOptions.todo,
  TasksStatusOptions.in_progress,
  TasksStatusOptions.pending,
  TasksStatusOptions.done,
  TasksStatusOptions.canceled,
  TasksStatusOptions.blocked,
  TasksStatusOptions.review,
  TasksStatusOptions.testing,
  TasksStatusOptions.ready,
  TasksStatusOptions.on_hold,
];
