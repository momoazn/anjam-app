// Tasks module constants
import { shared } from "./shared";

export const tasks = {
  title: "تسک‌ها",
  allTasks: "همه تسک‌ها",

  // Task priority levels
  priority: {
    urgent: "فوری",
    high: "بالا",
    medium: "متوسط",
    low: "پایین",
  },

  // Task status options
  status: {
    todo: "برای انجام",
    in_progress: shared.inProgress,
    pending: shared.pending,
    review: "در حال بررسی",
    testing: "در حال تست",
    ready: "آماده",
    blocked: "مسدود شده",
    on_hold: "متوقف شده",
    done: shared.done,
    canceled: shared.canceled,
  },

  // Task tags
  tags: {
    bug: "اشکال",
    feature: "ویژگی",
    improvement: "بهبود",
  },

  // Filter options
  filters: {
    search: "جستجو در تسک‌ها...",
    status: shared.status,
    priority: shared.priority,
    assignee: shared.assignee,
    date: shared.date,
    tag: "برچسب",
    allStatuses: "همه وضعیت‌ها",
    allPriorities: "همه اولویت‌ها",
    allAssignees: "همه مسئولین",
    allDates: "همه تاریخ‌ها",
    allTags: "همه برچسب‌ها",
    today: shared.today,
    thisWeek: "این هفته",
    thisMonth: "این ماه",
    overdue: "گذشته‌موعد",
    activeFilters: "فیلترهای فعال:",
    clearAll: "پاک کردن همه",
    searchByTitleOrAssignee: "جستجو بر اساس عنوان یا مسئول...",
    advancedFilters: "فیلترهای پیشرفته",
    clearFilters: "پاک کردن فیلترها",
    labels: {
      search: shared.search,
      status: shared.status,
      priority: shared.priority,
      assignee: shared.assignee,
      date: shared.date,
      tag: "برچسب",
    },
    dateLabels: {
      today: shared.today,
      week: "این هفته",
      month: "این ماه",
      overdue: "گذشته‌موعد",
    },
    moreFilters: "{count} مورد دیگر",
  },

  // Empty state messages
  emptyState: {
    noTasksFound: "تسکی پیدا نشد",
    noTasksFoundDescription:
      "با فیلترهای فعلی تسکی پیدا نشد. فیلترها را تغییر دهید یا پاک کنید",
    noTasksInProject: "تسکی در این پروژه نیست",
    noTasksInProjectDescription:
      "با فیلترهای فعلی تسکی در پروژه «{projectName}» پیدا نشد",
    noTasksYet: "هنوز تسکی نساخته‌اید",
    noTasksYetDescription: "اولین تسکتان را بسازید و کار را شروع کنید",
    projectNoTasksYet: "این پروژه هنوز تسکی ندارد",
    projectNoTasksYetDescription:
      "اولین تسک را برای پروژه «{projectName}» بسازید",
    createFirstTask: "ساخت اولین تسک",
    noTasksWithFilters: "با این فیلترها تسکی پیدا نشد",
    loadingTasks: "در حال بارگذاری تسک‌ها...",
  },

  // Calendar view
  calendar: {
    title: "تقویم تسک‌ها",
    description: "مشاهده تسک‌ها بر اساس تاریخ سررسید",
    noTasks: "هیچ تسکی با تاریخ سررسید وجود ندارد",
    noTasksDescription:
      "تسک‌هایی که تاریخ سررسید دارند در این تقویم نمایش داده می‌شوند",
    monthView: "نمای ماهانه",
    weekView: "نمای هفتگی",
    dayView: "نمای روزانه",
    today: shared.today,
    previousMonth: "ماه قبلی",
    nextMonth: "ماه بعدی",
    tasksThisMonth: "تسک‌های این ماه",
    completedTasks: shared.completed,
    pendingTasks: shared.pending,
    overdueTasks: "گذشته‌موعد",
  },

  // Bulk actions
  bulkActions: {
    selectedCount: "{count} تسک انتخاب شده",
    assignPlaceholder: "اختصاص دادن",
    statusPlaceholder: "تغییر وضعیت",
    priorityPlaceholder: "تغییر اولویت",
    deleteButton: shared.delete,
    deleteDialogTitle: "حذف {count} تسک؟",
    deleteDialogDescription:
      "این عملیات قابل بازگشت نیست. آیا مطمئن هستید که می‌خواهید این تسک‌ها را حذف کنید?",
    cancelButton: shared.cancel,
    deletingButton: shared.deleting,
    assignSuccess: "{count} تسک با موفقیت اختصاص داده شد",
    assignError: "خطا در اختصاص تسک‌ها",
    statusSuccess: "وضعیت {count} تسک تغییر کرد",
    statusError: "خطا در تغییر وضعیت",
    prioritySuccess: "اولویت {count} تسک تغییر کرد",
    priorityError: "خطا در تغییر اولویت",
    deleteSuccess: "{count} تسک حذف شد",
    deleteError: "خطا در حذف تسک‌ها",
  },

  // Header section
  header: {
    tasksFound: "{count} تسک پیدا شد",
    manageTasks: "تسک‌هایتان را مدیریت کنید",
    tasksInProject: "{count} تسک در این پروژه",
    manageProjectTasks: "تسک‌های این پروژه",
  },

  // Add task dialog
  addTask: {
    title: "ساخت تسک جدید",
    issueTitle: "عنوان تسک",
    description: shared.description,
    descriptionProject: "توضیحات پروژه",
    status: shared.status,
    priority: shared.priority,
    assignee: shared.assignee,
    unassigned: "بدون مسئول",
    selectProject: "انتخاب پروژه",
    deadline: "مهلت انجام",
    success: "عالی! تسک جدیدتان آماده است",
    error: "نتوانستیم تسک را بسازیم: {error}",
    buttons: {
      create: "ساخت تسک",
      creating: "در حال ساخت...",
      more: shared.more,
      newTask: "تسک جدید",
      newTaskForProject: "تسک جدید برای این پروژه",
    },
  },

  // Task list
  list: {
    noTasks: "تسکی وجود ندارد",
    openMenu: "باز کردن منو",
  },

  // Task details
  details: {
    title: "جزئیات تسک",
    unknownUser: "بدون مسئول",
    unknownProject: "بدون پروژه",
    backToList: "بازگشت به لیست وظایف",
    detailsCardTitle: "جزئیات",
    assigneeLabel: "مسئول:",
    projectLabel: "پروژه:",
    deadlineLabel: "مهلت:",
    displayIdLabel: "شناسه نمایش:",
    descriptionCardTitle: shared.description,
    quickInfoCardTitle: "اطلاعات سریع",
    statusLabel: "وضعیت:",
    priorityLabel: "اولویت:",
    createdLabel: "ایجاد شده:",
    updatedLabel: "بروزرسانی:",
    actionsCardTitle: shared.actions,
    editTaskButton: "ویرایش وظیفه",
    deleteTaskButton: "حذف وظیفه",
    editButton: shared.edit,
    timeTracking: {
      title: "زمان صرف شده",
      hours: "ساعت",
      minutes: "دقیقه",
      editTime: "ویرایش زمان",
      saveTime: shared.save,
      cancelEdit: shared.cancel,
      noTimeTracked: "هنوز زمانی ثبت نشده",
      updateSuccess: "زمان به‌روزرسانی شد",
      updateError: "نتوانستیم زمان را به‌روزرسانی کنیم",
      invalidInput: "لطفاً ساعت و دقیقه را به درستی وارد کنید",
      exceedsEstimate:
        "زمان وارد شده از برآورد زمانی ({hours}h {minutes}m) بیشتر است",
    },
    buttons: {
      save: shared.save,
      saving: shared.saving,
      cancel: shared.cancel,
      delete: "حذف تسک",
      deleting: shared.deleting,
    },
  },

  // Edit task
  edit: {
    title: "ویرایش تسک",
    success: "تغییرات با موفقیت ذخیره شد",
    error: "نتوانستیم تغییرات را ذخیره کنیم: {error}",
    buttons: {
      save: shared.save,
      saving: shared.saving,
      cancel: shared.cancel,
    },
  },

  // Delete task
  delete: {
    title: "حذف تسک",
    description:
      "مطمئنید که می‌خواهید این تسک را حذف کنید؟ بعد از حذف، دیگر در فهرست‌ها نمایش داده نمی‌شود.",
    confirm: shared.confirm,
    cancel: shared.cancel,
    success: "تسک حذف شد",
    error: "نتوانستیم تسک را حذف کنیم: {error}",
  },

  // Errors
  errors: {
    notFound: "وظیفه یافت نشد",
  },

  // Task-specific
  addNewTask: "افزودن تسک جدید",
  moreOptions: "گزینه‌های بیشتر",
  sortByPriority: "مرتب‌سازی براساس اولویت",
  sortByDate: "مرتب‌سازی براساس تاریخ",
  showCompletedTasks: "نمایش تسک‌های انجام شده",
  editTask: "ویرایش '{title}'",
  timeSpent: "زمان صرف شده",
  timeEstimate: "برآورد زمان",
} as const;

