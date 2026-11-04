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

export interface Task {
  _id: string;
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
  taskType?: string;
  storyPoints?: number;
  watchers?: string[]; // Id<"users">[]
  deletedAt?: number;
  updatedAt?: number;
  createdAt?: number;
  completedAt?: number;
}

export interface TaskWithProject extends Task {
  project?: {
    _id: string;
    id?: string;
    name: string;
    code: string;
  } | null;
  assignee?: {
    _id: string;
    displayName?: string;
    email?: string;
    image?: string;
  } | null;
  creator?: {
    _id: string;
    displayName?: string;
    email?: string;
    image?: string;
  } | null;
  displayId: string;
  updatedAt?: number;
}

export interface TaskWithDetails extends Task {
  project?: {
    _id: string;
    id?: string;
    name: string;
    code: string;
  } | null;
  assignee?: {
    _id: string;
    displayName?: string;
    email?: string;
    image?: string;
  } | null;
  creator?: {
    _id: string;
    displayName?: string;
    email?: string;
    image?: string;
  } | null;
  displayId: string;
  updatedAt?: number;
}
