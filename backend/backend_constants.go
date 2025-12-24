package main

// Backend error and message constants in Persian
// All user-facing Persian text used in the backend API

// Collection name constants
const (
	CollectionUsers         = "users"
	CollectionGroups        = "groups"
	CollectionOrganizations = "organizations"
	CollectionOrgMembers    = "organization_members"
	CollectionProjects      = "projects"
	CollectionTasks         = "tasks"
	CollectionNotifications = "notifications"
	CollectionUserLoginLogs = "user_login_logs"
	CollectionAuditLogs     = "audit_logs"
	CollectionSuperusers    = "_superusers"
	CollectionUsersProjects = "users_projects"
	CollectionComments      = "comments"
	CollectionTags          = "tags"
)

// Configuration constants
const (
	CodeLength                = 3
	MaxCodeGenerationAttempts = 100
	DefaultPageSize           = 50
	MaxPageSize               = 100
	MaxFailedLoginAttempts    = 5
)

// Role constants
const (
	RoleAdmin      = "admin"
	RoleManager    = "manager"
	RoleSupervisor = "supervisor"
	RoleEmployee   = "employee"
)

// =============================================================================
// NEW: Organization-based Role System
// =============================================================================

// Organization Roles
const (
	OrgRoleOwner  = "owner"
	OrgRoleAdmin  = "admin"
	OrgRoleMember = "member"
)

// Project Roles
const (
	ProjectRoleOwner  = "owner"
	ProjectRoleAdmin  = "admin"
	ProjectRoleMember = "member"
	ProjectRoleViewer = "viewer"
)

// Member Status
const (
	MemberStatusInvited   = "invited"
	MemberStatusActive    = "active"
	MemberStatusSuspended = "suspended"
)

// IsValidOrgRole checks if the given role is a valid organization role
func IsValidOrgRole(role string) bool {
	switch role {
	case OrgRoleOwner, OrgRoleAdmin, OrgRoleMember:
		return true
	default:
		return false
	}
}

// IsValidProjectRole checks if the given role is a valid project role
func IsValidProjectRole(role string) bool {
	switch role {
	case ProjectRoleOwner, ProjectRoleAdmin, ProjectRoleMember, ProjectRoleViewer:
		return true
	default:
		return false
	}
}

// CanOrgRoleManageMembers checks if an org role can add/remove members
func CanOrgRoleManageMembers(role string) bool {
	return role == OrgRoleOwner || role == OrgRoleAdmin
}

// CanOrgRoleCreateProjects checks if an org role can create new projects
func CanOrgRoleCreateProjects(role string) bool {
	return role == OrgRoleOwner || role == OrgRoleAdmin
}

// CanProjectRoleManageTasks checks if a project role can create/edit/delete tasks
func CanProjectRoleManageTasks(role string) bool {
	return role == ProjectRoleOwner || role == ProjectRoleAdmin || role == ProjectRoleMember
}

// CanProjectRoleManageMembers checks if a project role can add/remove project members
func CanProjectRoleManageMembers(role string) bool {
	return role == ProjectRoleOwner || role == ProjectRoleAdmin
}

// Task status constants
const (
	TaskStatusTodo       = "todo"
	TaskStatusInProgress = "in_progress"
	TaskStatusDone       = "done"
	TaskStatusCanceled   = "canceled"
	TaskStatusPending    = "pending"
)

// Priority constants
const (
	PriorityLow    = "low"
	PriorityMedium = "medium"
	PriorityHigh   = "high"
)

const (
	// Validation errors
	ErrSupervisorMustBeInSameGroup     = "منتور (supervisor) باید عضو همان گروه پروژه باشد"
	ErrUserAndProjectMustBeInSameGroup = "کاربر و پروژه باید در یک گروه باشند"
	ErrTagsMustBeInSameGroup           = "تگ‌ها باید عضو همان گروه پروژه باشند"
	ErrOnlyAdminCanCreateManagers      = "فقط ادمین می‌تواند مدیر (manager) ایجاد کند"
	ErrOnlyManagersCanBeGroupManagers  = "فقط کاربران با نقش مدیر (manager) می‌توانند مدیر گروه باشند"
	ErrManagerCanOnlyCreateInOwnGroup  = "مدیران فقط می‌توانند کاربران را در گروه خود ایجاد کنند"
	ErrSupervisorsCannotCreateUsers    = "سرپرستان نمی‌توانند کاربر ایجاد کنند"

	// Authentication errors
	ErrAuthRequired                  = "احراز هویت انجام نشده است"
	ErrNoPermissionToChangeStatus    = "مجوز تغییر وضعیت را ندارید"
	ErrNoAccessToProject             = "دسترسی لازم برای این پروژه را ندارید"
	ErrOnlySupervisorCanChangeStatus = "فقط سرپرست پروژه می‌تواند وضعیت‌ها را تغییر دهد"
	ErrCannotDisableStatusInUse      = "امکان غیرفعال‌سازی وضعیتی که در حال استفاده است وجود ندارد"
	ErrUserInactive                  = "حساب کاربری غیرفعال است"
	ErrUserBlocked                   = "حساب کاربری مسدود شده است"
	ErrUserNotFound                  = "کاربر یافت نشد"
	ErrWrongPassword                 = "رمز عبور اشتباه"
	ErrUserNotFoundForLogin          = "کاربر یافت نشد"

	// User management errors
	ErrOnlyAdmin                    = "فقط ادمین مجاز به انجام این عملیات است"
	ErrOnlyAdminCanToggleUserStatus = "فقط ادمین می‌تواند وضعیت فعال/غیرفعال کاربران را تغییر دهد"
	ErrCannotDeactivateSelf         = "نمی‌توانید حساب کاربری خود را غیرفعال کنید"
	ErrCannotDeactivateAdmin        = "نمی‌توان حساب کاربری ادمین را غیرفعال کرد"
	ErrOnlyAdminCanUnblock          = "فقط ادمین می‌تواند کاربران را رفع مسدودی کند"
	ErrCannotViewOtherUserLogs      = "شما مجاز به مشاهده سوابق ورود این کاربر نیستید"
	ErrFailedToUpdateUserStatus     = "خطا در به‌روزرسانی وضعیت کاربر"
	ErrFailedToUnblockUser          = "خطا در رفع مسدودی کاربر"
	ErrFailedToGetLoginLogs         = "خطا در دریافت سوابق ورود"

	// User management success messages
	MsgUserActivated   = "حساب کاربری فعال شد"
	MsgUserDeactivated = "حساب کاربری غیرفعال شد"
	MsgUserUnblocked   = "مسدودی کاربر با موفقیت برداشته شد"

	// Notification messages
	MsgGroupCreated       = "گروه جدید ایجاد شد"
	MsgAssignedToGroup    = "شما به عنوان مدیر گروه %s منصوب شدید"
	MsgAddedToProject     = "افزوده شدن به پروژه: %s"
	MsgAddedToProjectDesc = "شما به پروژه '%s' اضافه شدید"
	MsgTaskAssigned       = "تخصیص تسک: %s"
	MsgTaskAssignedDesc   = "تسک '%s' در پروژه '%s' به شما اختصاص داده شد"
	MsgTaskUpdated        = "به‌روزرسانی تسک: %s"
	MsgTaskStatusChanged  = "وضعیت تسک '%s' از %s به %s تغییر یافت"
	MsgProjectUpdated     = "به‌روزرسانی پروژه: %s"
	MsgProjectUpdatedDesc = "پروژه '%s' به‌روزرسانی شد"
	MsgNewComment         = "نظر جدید روی: %s"
	MsgNewCommentDesc     = "نظر جدید روی تسک '%s': %s"

	// Status translations
	StatusTodo       = "برای انجام"
	StatusInProgress = "در حال انجام"
	StatusDone       = "انجام‌شده"
	StatusCanceled   = "لغوشده"

	// Blocked reason template
	MsgBlockedReason = "حساب به دلیل %d تلاش ناموفق برای ورود مسدود شد"
)
