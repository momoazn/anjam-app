/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Comments = "comments",
	Notifications = "notifications",
	Projects = "projects",
	StatusConfigs = "status_configs",
	Tags = "tags",
	Tasks = "tasks",
	Users = "users",
	UsersProjects = "users_projects",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type CommentsRecord = {
	content?: HTMLString
	created: IsoAutoDateString
	deleted_at?: string
	id: string
	task?: RecordIdString
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum NotificationsTypeOptions {
	"task_assigned" = "task_assigned",
	"project_updated" = "project_updated",
	"system" = "system",
	"comment" = "comment",
}
export type NotificationsRecord<Tdata = unknown> = {
	created: IsoAutoDateString
	data?: null | Tdata
	id: string
	message: string
	read?: boolean
	title: string
	type: NotificationsTypeOptions
	updated: IsoAutoDateString
	user: RecordIdString
}

export type ProjectsRecord = {
	assets?: FileNameString[]
	code?: string
	created: IsoAutoDateString
	description?: HTMLString
	id: string
	name?: string
	supervisor?: RecordIdString
	updated: IsoAutoDateString
}

export type StatusConfigsRecord = {
	color?: string
	created: IsoAutoDateString
	enabled?: boolean
	icon?: string
	id: string
	is_canceled?: boolean
	is_completed?: boolean
	key: string
	name: string
	order: number
	project: RecordIdString
	updated: IsoAutoDateString
}

export type TagsRecord = {
	color?: string
	created: IsoAutoDateString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export enum TasksPriorityOptions {
	"low" = "low",
	"medium" = "medium",
	"high" = "high",
	"urgent" = "urgent",
}

export enum TasksStatusOptions {
	"todo" = "todo",
	"in_progress" = "in_progress",
	"done" = "done",
	"canceled" = "canceled",
}
export type TasksRecord = {
	assignee?: RecordIdString
	created: IsoAutoDateString
	creator: RecordIdString
	deadline?: IsoDateString
	description?: HTMLString
	display_id?: string
	id: string
	order?: number
	priority: TasksPriorityOptions
	project: RecordIdString
	status?: TasksStatusOptions
	status_config?: RecordIdString
	tags?: RecordIdString[]
	time_spent_minutes?: number
	title?: string
	updated: IsoAutoDateString
}

export enum UsersRoleOptions {
	"admin" = "admin",
	"supervisor" = "supervisor",
	"employee" = "employee",
}
export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email?: string
	emailVisibility?: boolean
	first_name?: string
	id: string
	last_name?: string
	password: string
	role: UsersRoleOptions
	tokenKey: string
	updated: IsoAutoDateString
	username: string
	verified?: boolean
}

export type UsersProjectsRecord = {
	created: IsoAutoDateString
	id: string
	project?: RecordIdString
	updated: IsoAutoDateString
	user?: RecordIdString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> & BaseSystemFields<Texpand>
export type NotificationsResponse<Tdata = unknown, Texpand = unknown> = Required<NotificationsRecord<Tdata>> & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> & BaseSystemFields<Texpand>
export type StatusConfigsResponse<Texpand = unknown> = Required<StatusConfigsRecord> & BaseSystemFields<Texpand>
export type TagsResponse<Texpand = unknown> = Required<TagsRecord> & BaseSystemFields<Texpand>
export type TasksResponse<Texpand = unknown> = Required<TasksRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type UsersProjectsResponse<Texpand = unknown> = Required<UsersProjectsRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	comments: CommentsRecord
	notifications: NotificationsRecord
	projects: ProjectsRecord
	status_configs: StatusConfigsRecord
	tags: TagsRecord
	tasks: TasksRecord
	users: UsersRecord
	users_projects: UsersProjectsRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	comments: CommentsResponse
	notifications: NotificationsResponse
	projects: ProjectsResponse
	status_configs: StatusConfigsResponse
	tags: TagsResponse
	tasks: TasksResponse
	users: UsersResponse
	users_projects: UsersProjectsResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
