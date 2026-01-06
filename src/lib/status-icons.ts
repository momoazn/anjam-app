import {
  Icon,
  IconCircle,
  IconCircleCheckFilled,
  IconCircleHalf2,
  IconCircleX,
  IconEye,
} from "@tabler/icons-react";

import { TaskStatus } from "@/types/tasks";

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
