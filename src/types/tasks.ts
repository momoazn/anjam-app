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

export interface TaskWithProject extends Task {
  project?: {
    _id: string;
    id?: string;
    name: string;
    code: string;
  } | null;
  assignee?: {
    _id: string;
    id?: string;
    username?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    image?: string;
    avatar?: string;
  } | null;
  creator?: {
    _id: string;
    id?: string;
    username?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    image?: string;
    avatar?: string;
  } | null;
  display_id?: string;
  updated?: string;
  created?: string;
  expand?: {
    project?: any;
    assignee?: any;
    creator?: any;
    tags?: any[];
  };
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
    id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
  } | null;
  creator?: {
    _id: string;
    id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  // Compatibility fields for transition from PocketBase
  display_id?: string;
  created?: string;
  updated?: string;
  expand?: {
    project?: any;
    assignee?: any;
    creator?: any;
    task?: any;
    comment?: any;
  };
}
