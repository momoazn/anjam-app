import { z } from "zod";

import { common, errors } from "@/constants";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/tasks";

export const taskFormSchema = z.object({
  title: z.string().min(1, { message: errors.validation.titleRequired }),
  description: z.string().min(1, { message: common.validation.required }),
  assignee: z.string().min(1, { message: common.validation.required }),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  project: z.string().min(1, { message: common.validation.required }),
  deadline: z.date().optional(),
  estimated_hours: z.number().min(0).max(999).optional(),
  estimated_minutes: z.number().min(0).max(59).optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
