package main

// Backend error and message constants in Persian
// All user-facing Persian text used in the backend API

const (
	// Validation errors
	ErrSupervisorMustBeInSameGroup = "منتور (supervisor) باید عضو همان گروه پروژه باشد"
	ErrUserAndProjectMustBeInSameGroup = "کاربر و پروژه باید در یک گروه باشند"
	ErrOnlyAdminCanCreateManagers = "فقط ادمین می‌تواند مدیر (manager) ایجاد کند"
	ErrOnlyManagersCanBeGroupManagers = "فقط کاربران با نقش مدیر (manager) می‌توانند مدیر گروه باشند"
	ErrManagerCanOnlyCreateInOwnGroup = "مدیران فقط می‌توانند کاربران را در گروه خود ایجاد کنند"
	ErrSupervisorsCannotCreateUsers = "سرپرستان نمی‌توانند کاربر ایجاد کنند"

	// Authentication errors
	ErrAuthRequired = "احراز هویت انجام نشده است"
	ErrNoPermissionToChangeStatus = "مجوز تغییر وضعیت را ندارید"
	ErrNoAccessToProject = "دسترسی لازم برای این پروژه را ندارید"
	ErrOnlySupervisorCanChangeStatus = "فقط سرپرست پروژه می‌تواند وضعیت‌ها را تغییر دهد"
	ErrCannotDisableStatusInUse = "امکان غیرفعال‌سازی وضعیتی که در حال استفاده است وجود ندارد"
	ErrUserInactive = "حساب کاربری غیرفعال است"
	ErrUserBlocked = "حساب کاربری مسدود شده است"
	ErrUserNotFound = "کاربر یافت نشد"
	ErrWrongPassword = "رمز عبور اشتباه"
	ErrUserNotFoundForLogin = "کاربر یافت نشد"

	// User management errors
	ErrOnlyAdminCanToggleUserStatus = "فقط ادمین می‌تواند وضعیت فعال/غیرفعال کاربران را تغییر دهد"
	ErrCannotDeactivateSelf = "نمی‌توانید حساب کاربری خود را غیرفعال کنید"
	ErrCannotDeactivateAdmin = "نمی‌توان حساب کاربری ادمین را غیرفعال کرد"
	ErrOnlyAdminCanUnblock = "فقط ادمین می‌تواند کاربران را رفع مسدودی کند"
	ErrCannotViewOtherUserLogs = "شما مجاز به مشاهده سوابق ورود این کاربر نیستید"
	ErrFailedToUpdateUserStatus = "خطا در به‌روزرسانی وضعیت کاربر"
	ErrFailedToUnblockUser = "خطا در رفع مسدودی کاربر"
	ErrFailedToGetLoginLogs = "خطا در دریافت سوابق ورود"

	// User management success messages
	MsgUserActivated = "حساب کاربری فعال شد"
	MsgUserDeactivated = "حساب کاربری غیرفعال شد"
	MsgUserUnblocked = "مسدودی کاربر با موفقیت برداشته شد"

	// Notification messages
	MsgGroupCreated = "گروه جدید ایجاد شد"
	MsgAssignedToGroup = "شما به عنوان مدیر گروه %s منصوب شدید"
	MsgAddedToProject = "افزوده شدن به پروژه: %s"
	MsgAddedToProjectDesc = "شما به پروژه '%s' اضافه شدید"
	MsgTaskAssigned = "تخصیص تسک: %s"
	MsgTaskAssignedDesc = "تسک '%s' در پروژه '%s' به شما اختصاص داده شد"
	MsgTaskUpdated = "به‌روزرسانی تسک: %s"
	MsgTaskStatusChanged = "وضعیت تسک '%s' از %s به %s تغییر یافت"
	MsgProjectUpdated = "به‌روزرسانی پروژه: %s"
	MsgProjectUpdatedDesc = "پروژه '%s' به‌روزرسانی شد"
	MsgNewComment = "نظر جدید روی: %s"
	MsgNewCommentDesc = "نظر جدید روی تسک '%s': %s"

	// Status translations
	StatusTodo = "برای انجام"
	StatusInProgress = "در حال انجام"
	StatusDone = "انجام‌شده"
	StatusCanceled = "لغوشده"

	// Blocked reason template
	MsgBlockedReason = "حساب به دلیل %d تلاش ناموفق برای ورود مسدود شد"
)
