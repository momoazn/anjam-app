import { z } from "zod";
import { errors, common } from "@/constants";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";

export const taskFormSchema = z.object({
  title: z.string().min(1, { message: errors.validation.titleRequired }),
  description: z.string().min(1, { message: common.validation.required }),
  assignee: z.string().min(1, { message: common.validation.required }),
  priority: z.nativeEnum(TasksPriorityOptions),
  status: z.nativeEnum(TasksStatusOptions),
  project: z.string().optional(),
  deadline: z.date().optional(),
  estimated_hours: z.number().min(0).max(999).optional(),
  estimated_minutes: z.number().min(0).max(59).optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
