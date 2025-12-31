/**
 * Task status icons mapping
 *
 * Extracted from status-utils.ts as part of Priority 5 refactoring
 */
import {
  Icon,
  IconAlertCircle,
  IconCircle,
  IconCircleCheckFilled,
  IconCircleHalf2,
  IconCircleX,
  IconClock,
  IconEye,
  IconFlask,
  IconPlayerPause,
} from "@tabler/icons-react";

import { TasksStatusOptions } from "./pocketbase-types";

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

export const TASK_STATUS_ORDER: TasksStatusOptions[] = [
  TasksStatusOptions.todo,
  TasksStatusOptions.in_progress,
  TasksStatusOptions.pending,
  TasksStatusOptions.review,
  TasksStatusOptions.testing,
  TasksStatusOptions.done,
  TasksStatusOptions.blocked,
  TasksStatusOptions.on_hold,
  TasksStatusOptions.canceled,
];
