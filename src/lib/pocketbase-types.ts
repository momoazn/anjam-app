/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export enum Collections {
  Authorigins = "_authOrigins",
  Externalauths = "_externalAuths",
  Mfas = "_mfas",
  Otps = "_otps",
  Superusers = "_superusers",
  Comments = "comments",
  Groups = "groups",
  Notifications = "notifications",
  Projects = "projects",
  Tags = "tags",
  Tasks = "tasks",
  UserLoginLogs = "user_login_logs",
  Users = "users",
  UsersProjects = "users_projects",
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

type ExpandType<T> = unknown extends T
  ? T extends unknown
    ? { expand?: unknown }
    : { expand: T }
  : { expand: T };

// System fields
export type BaseSystemFields<T = unknown> = {
  id: RecordIdString;
  collectionId: string;
  collectionName: Collections;
} & ExpandType<T>;

export type AuthSystemFields<T = unknown> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type AuthoriginsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  fingerprint: string;
  id: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type ExternalauthsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  provider: string;
  providerId: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type MfasRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  method: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type OtpsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  password: string;
  recordRef: string;
  sentTo?: string;
  updated?: IsoDateString;
};

export type SuperusersRecord = {
  created?: IsoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  password: string;
  tokenKey: string;
  updated?: IsoDateString;
  verified?: boolean;
};

export type CommentsRecord = {
  content?: HTMLString;
  created?: IsoDateString;
  deleted_at?: string;
  id: string;
  task?: RecordIdString;
  updated?: IsoDateString;
  user?: RecordIdString;
};

export type GroupsRecord = {
  active?: boolean;
  created?: IsoDateString;
  description?: HTMLString;
  id: string;
  manager: RecordIdString;
  name: string;
  updated?: IsoDateString;
};

export enum NotificationsTypeOptions {
  "task_assigned" = "task_assigned",
  "project_updated" = "project_updated",
  "system" = "system",
  "comment" = "comment",
}
export type NotificationsRecord<Tdata = unknown> = {
  created?: IsoDateString;
  data?: null | Tdata;
  id: string;
  message: string;
  read?: boolean;
  title: string;
  type: NotificationsTypeOptions;
  updated?: IsoDateString;
  user: RecordIdString;
};

export type ProjectsRecord = {
  assets?: string[];
  code?: string;
  created?: IsoDateString;
  description?: HTMLString;
  group: RecordIdString;
  id: string;
  name?: string;
  supervisor?: RecordIdString;
  updated?: IsoDateString;
};

export type TagsRecord = {
  color?: string;
  created?: IsoDateString;
  id: string;
  name?: string;
  updated?: IsoDateString;
};

export enum TasksPriorityOptions {
  "low" = "low",
  "medium" = "medium",
  "high" = "high",
  "urgent" = "urgent",
}

export enum TasksStatusOptions {
  "todo" = "todo",
  "in_progress" = "in_progress",
  "pending" = "pending",
  "done" = "done",
  "canceled" = "canceled",
  "blocked" = "blocked",
  "review" = "review",
  "testing" = "testing",
  "on_hold" = "on_hold",
}
export type TasksRecord = {
  assignee?: RecordIdString;
  created?: IsoDateString;
  creator: RecordIdString;
  deadline?: IsoDateString;
  deleted_at?: string;
  description?: HTMLString;
  display_id?: string;
  estimated_hours?: number;
  estimated_minutes?: number;
  id: string;
  order?: number;
  priority: TasksPriorityOptions;
  project: RecordIdString;
  status: TasksStatusOptions;
  tags?: RecordIdString[];
  time_spent_minutes?: number;
  title?: string;
  updated?: IsoDateString;
};

export type UserLoginLogsRecord = {
  created?: IsoDateString;
  failure_reason?: string;
  id: string;
  ip_address?: string;
  success?: boolean;
  updated?: IsoDateString;
  user: RecordIdString;
  user_agent?: string;
};

export enum UsersRoleOptions {
  "admin" = "admin",
  "manager" = "manager",
  "supervisor" = "supervisor",
  "employee" = "employee",
}
export type UsersRecord = {
  active?: boolean;
  avatar?: string;
  blocked?: boolean;
  blocked_at?: string;
  blocked_reason?: string;
  created?: IsoDateString;
  email?: string;
  emailVisibility?: boolean;
  failed_login_attempts?: number;
  first_name?: string;
  group?: RecordIdString;
  id: string;
  last_name?: string;
  password: string;
  role: UsersRoleOptions;
  tokenKey: string;
  updated?: IsoDateString;
  username: string;
  verified?: boolean;
};

export type UsersProjectsRecord = {
  created?: IsoDateString;
  id: string;
  project?: RecordIdString;
  updated?: IsoDateString;
  user?: RecordIdString;
};

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> =
  Required<AuthoriginsRecord> & BaseSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> =
  Required<ExternalauthsRecord> & BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> &
  BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> &
  BaseSystemFields<Texpand>;
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> &
  AuthSystemFields<Texpand>;
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> &
  BaseSystemFields<Texpand>;
export type GroupsResponse<Texpand = unknown> = Required<GroupsRecord> &
  BaseSystemFields<Texpand>;
export type NotificationsResponse<
  Tdata = unknown,
  Texpand = unknown,
> = Required<NotificationsRecord<Tdata>> & BaseSystemFields<Texpand>;
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> &
  BaseSystemFields<Texpand>;
export type TagsResponse<Texpand = unknown> = Required<TagsRecord> &
  BaseSystemFields<Texpand>;
export type TasksResponse<Texpand = unknown> = Required<TasksRecord> &
  BaseSystemFields<Texpand>;
export type UserLoginLogsResponse<Texpand = unknown> =
  Required<UserLoginLogsRecord> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
  AuthSystemFields<Texpand>;
export type UsersProjectsResponse<Texpand = unknown> =
  Required<UsersProjectsRecord> & BaseSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  _authOrigins: AuthoriginsRecord;
  _externalAuths: ExternalauthsRecord;
  _mfas: MfasRecord;
  _otps: OtpsRecord;
  _superusers: SuperusersRecord;
  comments: CommentsRecord;
  groups: GroupsRecord;
  notifications: NotificationsRecord;
  projects: ProjectsRecord;
  tags: TagsRecord;
  tasks: TasksRecord;
  user_login_logs: UserLoginLogsRecord;
  users: UsersRecord;
  users_projects: UsersProjectsRecord;
};

export type CollectionResponses = {
  _authOrigins: AuthoriginsResponse;
  _externalAuths: ExternalauthsResponse;
  _mfas: MfasResponse;
  _otps: OtpsResponse;
  _superusers: SuperusersResponse;
  comments: CommentsResponse;
  groups: GroupsResponse;
  notifications: NotificationsResponse;
  projects: ProjectsResponse;
  tags: TagsResponse;
  tasks: TasksResponse;
  user_login_logs: UserLoginLogsResponse;
  users: UsersResponse;
  users_projects: UsersProjectsResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: "_authOrigins"): RecordService<AuthoriginsResponse>;
  collection(idOrName: "_externalAuths"): RecordService<ExternalauthsResponse>;
  collection(idOrName: "_mfas"): RecordService<MfasResponse>;
  collection(idOrName: "_otps"): RecordService<OtpsResponse>;
  collection(idOrName: "_superusers"): RecordService<SuperusersResponse>;
  collection(idOrName: "comments"): RecordService<CommentsResponse>;
  collection(idOrName: "groups"): RecordService<GroupsResponse>;
  collection(idOrName: "notifications"): RecordService<NotificationsResponse>;
  collection(idOrName: "projects"): RecordService<ProjectsResponse>;
  collection(idOrName: "tags"): RecordService<TagsResponse>;
  collection(idOrName: "tasks"): RecordService<TasksResponse>;
  collection(idOrName: "user_login_logs"): RecordService<UserLoginLogsResponse>;
  collection(idOrName: "users"): RecordService<UsersResponse>;
  collection(idOrName: "users_projects"): RecordService<UsersProjectsResponse>;
};
