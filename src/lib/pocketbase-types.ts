// PocketBase type shims for Convex migration
// These types provide backward compatibility for components still being migrated

// Task types (Convex uses snake_case field names in UI layer)
export type TaskWithProject = {
  id: string;
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "in_review" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeUserId?: string;
  assignee?: {
    id: string;
    _id: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    username?: string;
  };
  projectId: string;
  project?: {
    id: string;
    _id: string;
    name: string;
    code: string;
  };
  created: string;
  updated?: string;
  display_id: string;
  createdAt: number;
  updatedAt?: number;
};

export type TasksStatusOptions = typeof TASKS_STATUS_OPTIONS;
export const TASKS_STATUS_OPTIONS = {
  todo: "todo",
  in_progress: "in_progress",
  in_review: "in_review",
  done: "done",
  cancelled: "cancelled",
} as const;

// For backward compatibility with code using 'canceled'
export const TASKS_STATUS_OPTIONS_COMPAT = {
  ...TASKS_STATUS_OPTIONS,
  canceled: "cancelled",
} as const;

export type TasksPriorityOptions = typeof TASKS_PRIORITY_OPTIONS;
export const TASKS_PRIORITY_OPTIONS = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
} as const;

// User types
export type UsersResponse = {
  id: string;
  _id: string;
  email: string;
  username?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
  created: string;
  updated?: string;
};

export type UsersRoleOptions = typeof USERS_ROLE_OPTIONS;
export const USERS_ROLE_OPTIONS = {
  admin: "admin",
  employee: "employee",
  supervisor: "supervisor",
  manager: "manager",
} as const;

// Project types
export type ProjectsResponse = {
  id: string;
  _id: string;
  name: string;
  code: string;
  description?: string;
  supervisorUserId?: string;
  supervisor?: UsersResponse;
  organizationId: string;
  created: string;
  updated?: string;
};

export type ProjectWithSupervisor = ProjectsResponse;

// Organization types
export type OrganizationsResponse = {
  id: string;
  _id: string;
  name: string;
  slug: string;
  description?: string;
  plan: string;
  active: boolean;
  created: string;
  updated?: string;
};

// Comment types
export type CommentsResponse = {
  id: string;
  _id: string;
  taskId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  created: string;
  updated?: string;
};

// Tag types
export type TagsResponse = {
  id: string;
  _id: string;
  name: string;
  color?: string;
  organizationId: string;
  created: string;
};

// Notification types
export type NotificationsRecord = {
  id: string;
  _id: string;
  userId: string;
  type: "task_assigned" | "project_updated" | "system" | "comment";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: number;
  created: string;
};

// Audit log types
export type AuditLogsResponse = {
  id: string;
  _id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  created: string;
};

// Time entry types
export type TimeEntriesResponse = {
  id: string;
  _id: string;
  taskId: string;
  userId: string;
  minutes: number;
  note?: string;
  startedAt?: string;
  created: string;
  updated?: string;
};

// Login log types
export type UserLoginLogsResponse = {
  id: string;
  _id: string;
  userId: string;
  ip: string;
  userAgent: string;
  success: boolean;
  created: string;
};

// Date type helper
export type IsoAutoDateString = string;

// Collection names (for reference)
export const Collections = {
  users: "users",
  organizations: "organizations",
  projects: "projects",
  tasks: "tasks",
  comments: "comments",
  tags: "tags",
  notifications: "notifications",
} as const;
