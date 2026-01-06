export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_TYPES = ["task", "bug", "feature", "chore"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export interface Task {
  // Convex primary key
  _id: string;
  // Compatibility alias for PocketBase-style code
  id?: string;
  _creationTime: number;
  projectId: string;
  organizationId: string;
  creatorUserId: string;
  assigneeUserId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: number;
  order: number;
  tags: string[]; // Id<"tags">[]
  displayId: string;
  taskNumber: number;
  estimatedMinutes?: number;
  timeSpentMinutes?: number;
  taskType?: string;
  storyPoints?: number;
  watchers?: string[]; // Id<"users">[]
  deletedAt?: number;
  updatedAt?: number;
}
