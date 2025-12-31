package main

// This file is a thin re-export of config/constants.go for backward compatibility.
// All constants should be defined in config/constants.go.

import "anjam/config"

// Collection name constants
const (
	CollectionUsers          = config.CollectionUsers
	CollectionOrganizations  = config.CollectionOrganizations
	CollectionOrgMembers     = config.CollectionOrgMembers
	CollectionOrgInvites     = config.CollectionOrgInvites
	CollectionProjects       = config.CollectionProjects
	CollectionTasks          = config.CollectionTasks
	CollectionNotifications  = config.CollectionNotifications
	CollectionUserLoginLogs  = config.CollectionUserLoginLogs
	CollectionAuditLogs      = config.CollectionAuditLogs
	CollectionSuperusers     = config.CollectionSuperusers
	CollectionProjectMembers = config.CollectionProjectMembers
	CollectionComments       = config.CollectionComments
	CollectionTags           = config.CollectionTags
)

// Configuration constants
const (
	CodeLength                = config.CodeLength
	MaxCodeGenerationAttempts = config.MaxCodeGenerationAttempts
	DefaultPageSize           = config.DefaultPageSize
	MaxPageSize               = config.MaxPageSize
	MaxFailedLoginAttempts    = config.MaxFailedLoginAttempts
)

// Invite configuration constants
const (
	InviteTokenLength    = config.InviteTokenLength
	InviteExpirationDays = config.InviteExpirationDays
	InviteDefaultMaxUses = config.InviteDefaultMaxUses
)

// Role constants
const (
	RoleAdmin      = config.RoleAdmin
	RoleManager    = config.RoleManager
	RoleSupervisor = config.RoleSupervisor
	RoleEmployee   = config.RoleEmployee
)

// Organization Roles
const (
	OrgRoleOwner  = config.OrgRoleOwner
	OrgRoleAdmin  = config.OrgRoleAdmin
	OrgRoleMember = config.OrgRoleMember
)

// Project Roles
const (
	ProjectRoleOwner  = config.ProjectRoleOwner
	ProjectRoleAdmin  = config.ProjectRoleAdmin
	ProjectRoleMember = config.ProjectRoleMember
	ProjectRoleViewer = config.ProjectRoleViewer
)

// Member Status
const (
	MemberStatusInvited   = config.MemberStatusInvited
	MemberStatusActive    = config.MemberStatusActive
	MemberStatusSuspended = config.MemberStatusSuspended
)

// Task status constants
const (
	TaskStatusTodo       = config.TaskStatusTodo
	TaskStatusInProgress = config.TaskStatusInProgress
	TaskStatusDone       = config.TaskStatusDone
	TaskStatusCanceled   = config.TaskStatusCanceled
	TaskStatusPending    = config.TaskStatusPending
)

// Priority constants
const (
	PriorityLow    = config.PriorityLow
	PriorityMedium = config.PriorityMedium
	PriorityHigh   = config.PriorityHigh
)

// Validation errors
const ErrTagsMustBeInSameOrganization = config.ErrTagsMustBeInSameOrganization

// Authentication errors
const (
	ErrAuthRequired                  = config.ErrAuthRequired
	ErrNoPermissionToChangeStatus    = config.ErrNoPermissionToChangeStatus
	ErrNoAccessToProject             = config.ErrNoAccessToProject
	ErrOnlySupervisorCanChangeStatus = config.ErrOnlySupervisorCanChangeStatus
	ErrPermissionDenied              = config.ErrPermissionDenied
	ErrCannotDisableStatusInUse      = config.ErrCannotDisableStatusInUse
	ErrUserInactive                  = config.ErrUserInactive
	ErrUserBlocked                   = config.ErrUserBlocked
	ErrUserNotFound                  = config.ErrUserNotFound
	ErrWrongPassword                 = config.ErrWrongPassword
)

// User management errors
const (
	ErrOnlyAdmin                    = config.ErrOnlyAdmin
	ErrOnlyAdminCanToggleUserStatus = config.ErrOnlyAdminCanToggleUserStatus
	ErrCannotDeactivateSelf         = config.ErrCannotDeactivateSelf
	ErrCannotDeactivateAdmin        = config.ErrCannotDeactivateAdmin
	ErrOnlyAdminCanUnblock          = config.ErrOnlyAdminCanUnblock
	ErrCannotViewOtherUserLogs      = config.ErrCannotViewOtherUserLogs
	ErrFailedToUpdateUserStatus     = config.ErrFailedToUpdateUserStatus
	ErrFailedToUnblockUser          = config.ErrFailedToUnblockUser
	ErrFailedToGetLoginLogs         = config.ErrFailedToGetLoginLogs
	ErrInvalidTaskStatus            = config.ErrInvalidTaskStatus
	ErrCannotReopenFinalStatus      = config.ErrCannotReopenFinalStatus
)

// User management success messages
const (
	MsgUserActivated   = config.MsgUserActivated
	MsgUserDeactivated = config.MsgUserDeactivated
	MsgUserUnblocked   = config.MsgUserUnblocked
)

// Notification messages
const (
	MsgGroupCreated       = config.MsgGroupCreated
	MsgAssignedToGroup    = config.MsgAssignedToGroup
	MsgAddedToProject     = config.MsgAddedToProject
	MsgAddedToProjectDesc = config.MsgAddedToProjectDesc
	MsgTaskAssigned       = config.MsgTaskAssigned
	MsgTaskAssignedDesc   = config.MsgTaskAssignedDesc
	MsgTaskUpdated        = config.MsgTaskUpdated
	MsgTaskStatusChanged  = config.MsgTaskStatusChanged
	MsgProjectUpdated     = config.MsgProjectUpdated
	MsgProjectUpdatedDesc = config.MsgProjectUpdatedDesc
	MsgNewComment         = config.MsgNewComment
	MsgNewCommentDesc     = config.MsgNewCommentDesc
)

// Status translations
const (
	StatusTodo       = config.StatusTodo
	StatusInProgress = config.StatusInProgress
	StatusDone       = config.StatusDone
	StatusCanceled   = config.StatusCanceled
)

// Blocked reason template
const MsgBlockedReason = config.MsgBlockedReason

// Invite errors
const (
	ErrInviteNotFound         = config.ErrInviteNotFound
	ErrInviteExpired          = config.ErrInviteExpired
	ErrInviteExhausted        = config.ErrInviteExhausted
	ErrInviteRevoked          = config.ErrInviteRevoked
	ErrEmailAlreadyRegistered = config.ErrEmailAlreadyRegistered
	ErrOrgNameRequired        = config.ErrOrgNameRequired
	ErrInvalidInviteRole      = config.ErrInvalidInviteRole
	ErrFailedToCreateUser     = config.ErrFailedToCreateUser
	ErrFailedToCreateOrg      = config.ErrFailedToCreateOrg
	ErrFailedToCreateInvite   = config.ErrFailedToCreateInvite
	ErrNotOrgAdmin            = config.ErrNotOrgAdmin
)

// Invite success messages
const (
	MsgInviteCreated       = config.MsgInviteCreated
	MsgInviteRevoked       = config.MsgInviteRevoked
	MsgRegistrationSuccess = config.MsgRegistrationSuccess
	MsgWelcomeToOrg        = config.MsgWelcomeToOrg
	MsgWelcomeToOrgDesc    = config.MsgWelcomeToOrgDesc
)

// Re-export helper functions from config package
func IsValidOrgRole(role string) bool {
	return config.IsValidOrgRole(role)
}

func IsValidProjectRole(role string) bool {
	return config.IsValidProjectRole(role)
}

func CanOrgRoleManageMembers(role string) bool {
	return config.CanOrgRoleManageMembers(role)
}

func CanOrgRoleCreateProjects(role string) bool {
	return config.CanOrgRoleCreateProjects(role)
}

func CanProjectRoleManageTasks(role string) bool {
	return config.CanProjectRoleManageTasks(role)
}

func CanProjectRoleManageMembers(role string) bool {
	return config.CanProjectRoleManageMembers(role)
}
