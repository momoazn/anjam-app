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
  low: "text-green-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-red-500",
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
  todo: "bg-slate-50",
  in_progress: "bg-yellow-50",
  done: "bg-purple-50",
  canceled: "bg-gray-100",
};

export const taskStatusColors: Record<TasksStatusOptions, string> = {
  todo: "text-gray-400",
  in_progress: "text-yellow-500",
  done: "text-purple-600",
  canceled: "text-gray-500",
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
