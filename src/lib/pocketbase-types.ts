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
  AuditLogs = "audit_logs",
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
export type IsoAutoDateString = string & { readonly autodate: unique symbol };
export type RecordIdString = string;
export type FileNameString = string & { readonly filename: unique symbol };
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
  created: IsoAutoDateString;
  fingerprint: string;
  id: string;
  recordRef: string;
  updated: IsoAutoDateString;
};

export type ExternalauthsRecord = {
  collectionRef: string;
  created: IsoAutoDateString;
  id: string;
  provider: string;
  providerId: string;
  recordRef: string;
  updated: IsoAutoDateString;
};

export type MfasRecord = {
  collectionRef: string;
  created: IsoAutoDateString;
  id: string;
  method: string;
  recordRef: string;
  updated: IsoAutoDateString;
};

export type OtpsRecord = {
  collectionRef: string;
  created: IsoAutoDateString;
  id: string;
  password: string;
  recordRef: string;
  sentTo?: string;
  updated: IsoAutoDateString;
};

export type SuperusersRecord = {
  created: IsoAutoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  password: string;
  tokenKey: string;
  updated: IsoAutoDateString;
  verified?: boolean;
};

export enum AuditLogsActorTypeOptions {
  "user" = "user",
  "system" = "system",
  "api_token" = "api_token",
}

export enum AuditLogsClientOptions {
  "web" = "web",
  "cli" = "cli",
  "automation" = "automation",
  "unknown" = "unknown",
}

export enum AuditLogsActionOptions {
  "create" = "create",
  "update" = "update",
  "delete" = "delete",
}

export enum AuditLogsResultOptions {
  "success" = "success",
  "failure" = "failure",
}
export type AuditLogsRecord<Tchanges = unknown> = {
  action: AuditLogsActionOptions;
  actor?: RecordIdString;
  actor_role?: string;
  actor_type: AuditLogsActorTypeOptions;
  changes?: null | Tchanges;
  client?: AuditLogsClientOptions;
  created: IsoAutoDateString;
  id: string;
  ip_address?: string;
  message?: string;
  request_id?: string;
  resource: string;
  resource_id: string;
  result: AuditLogsResultOptions;
};

export type CommentsRecord = {
  content: HTMLString;
  created: IsoAutoDateString;
  deleted_at?: string;
  id: string;
  task: RecordIdString;
  updated: IsoAutoDateString;
  user: RecordIdString;
};

export type GroupsRecord = {
  active?: boolean;
  created: IsoAutoDateString;
  description?: HTMLString;
  id: string;
  manager?: RecordIdString;
  name: string;
  updated: IsoAutoDateString;
};

export enum NotificationsTypeOptions {
  "task_assigned" = "task_assigned",
  "project_updated" = "project_updated",
  "system" = "system",
  "comment" = "comment",
}
export type NotificationsRecord<Tdata = unknown> = {
  created: IsoAutoDateString;
  data?: null | Tdata;
  id: string;
  message: string;
  read?: boolean;
  title: string;
  type: NotificationsTypeOptions;
  updated: IsoAutoDateString;
  user: RecordIdString;
};

export type ProjectsRecord = {
  assets?: FileNameString[];
  code: string;
  created: IsoAutoDateString;
  description?: HTMLString;
  group: RecordIdString;
  id: string;
  name: string;
  supervisor?: RecordIdString;
  updated: IsoAutoDateString;
};

export type TagsRecord = {
  color?: string;
  created: IsoAutoDateString;
  group: RecordIdString;
  id: string;
  name: string;
  updated: IsoAutoDateString;
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
  created: IsoAutoDateString;
  creator: RecordIdString;
  deadline?: IsoDateString;
  deleted_at?: string;
  description?: HTMLString;
  display_id?: string;
  estimated_minutes?: number;
  id: string;
  order?: number;
  priority: TasksPriorityOptions;
  project: RecordIdString;
  status: TasksStatusOptions;
  tags?: RecordIdString[];
  time_spent_minutes?: number;
  title: string;
  updated: IsoAutoDateString;
};

export type UserLoginLogsRecord = {
  created: IsoAutoDateString;
  failure_reason?: string;
  id: string;
  ip_address?: string;
  success?: boolean;
  updated: IsoAutoDateString;
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
  avatar?: FileNameString;
  blocked?: boolean;
  blocked_at?: string;
  blocked_reason?: string;
  created: IsoAutoDateString;
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
  updated: IsoAutoDateString;
  username: string;
  verified?: boolean;
};

export type UsersProjectsRecord = {
  created: IsoAutoDateString;
  id: string;
  project: RecordIdString;
  updated: IsoAutoDateString;
  user: RecordIdString;
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
export type AuditLogsResponse<Tchanges = unknown, Texpand = unknown> = Required<
  AuditLogsRecord<Tchanges>
> &
  BaseSystemFields<Texpand>;
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
  audit_logs: AuditLogsRecord;
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
  audit_logs: AuditLogsResponse;
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

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<
  {
    // Omit AutoDate fields
    [K in keyof T as Extract<T[K], IsoAutoDateString> extends never
      ? K
      : never]: T[K] extends infer U // Convert FileNameString to File
      ? U extends FileNameString | FileNameString[]
        ? U extends any[]
          ? File[]
          : File
        : U
      : never;
  },
  "id"
>;

// Create type for Auth collections
export type CreateAuth<T> = {
  id?: RecordIdString;
  email: string;
  emailVisibility?: boolean;
  password: string;
  passwordConfirm: string;
  verified?: boolean;
} & ProcessCreateAndUpdateFields<T>;

// Create type for Base collections
export type CreateBase<T> = {
  id?: RecordIdString;
} & ProcessCreateAndUpdateFields<T>;

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
  Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
  email?: string;
  emailVisibility?: boolean;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
  verified?: boolean;
};

// Update type for Base collections
export type UpdateBase<T> = Partial<
  Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>;

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
  CollectionResponses[T] extends AuthSystemFields
    ? CreateAuth<CollectionRecords[T]>
    : CreateBase<CollectionRecords[T]>;

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
  CollectionResponses[T] extends AuthSystemFields
    ? UpdateAuth<CollectionRecords[T]>
    : UpdateBase<CollectionRecords[T]>;

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
  collection<T extends keyof CollectionResponses>(
    idOrName: T,
  ): RecordService<CollectionResponses[T]>;
} & PocketBase;
