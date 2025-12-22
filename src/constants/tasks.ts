// Task domain constants (tasks, comments, tags, saved filters)

import { shared } from "./core";

// Tasks module constants
export const tasks = {
  title: "تسک‌ها",
  allTasks: "همه تسک‌ها",
  board: {
    title: "برد تسک‌ها",
  },
  pagination: {
    range: "نمایش {start} تا {end} از {total}",
    perPage: "{count} در صفحه",
    prev: "قبلی",
    next: "بعدی",
    page: "صفحه {page} از {total}",
  },
  // Task list
  list: {
    noTasks: "تسکی وجود ندارد",
    openMenu: "باز کردن منو",
  },

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
  },

  // Task forms
  form: {
    title: "عنوان تسک",
    description: shared.description,
    descriptionPlaceholder: "توضیحات تسک را وارد کنید",
    project: shared.project,
    assignee: shared.assignee,
    priority: shared.priority,
    status: shared.status,
    deadline: shared.deadline,
    tag: "برچسب",
    tags: "برچسب‌ها",
    addTag: "افزودن برچسب",
    selectTags: "انتخاب برچسب‌ها",
    selectAssignee: "انتخاب مسئول",
    selectPriority: "انتخاب اولویت",
    selectStatus: "انتخاب وضعیت",
    selectProject: "انتخاب پروژه",
    deadlinePlaceholder: "انتخاب تاریخ",
    estimate: "برآورد زمان",
    hours: "ساعت",
    minutes: "دقیقه",
    createTag: "ایجاد برچسب",
  },

  // Task details
  details: {
    title: "جزئیات تسک",
    description: shared.description,
    status: shared.status,
    priority: shared.priority,
    assignee: shared.assignee,
    deadline: shared.deadline,
    createdAt: shared.createdAt,
    updatedAt: shared.updatedAt,
    tags: "برچسب‌ها",
    timeSpent: "زمان صرف شده",
    estimated: "زمان برآورد",
    minutes: "دقیقه",
    hours: "ساعت",
  },

  // Task actions
  actions: {
    edit: "ویرایش تسک",
    delete: "حذف تسک",
    assign: "تخصیص تسک",
    changeStatus: "تغییر وضعیت",
    addComment: "افزودن نظر",
    addTag: "افزودن برچسب",
    archive: "آرشیو",
  },

  // Task notifications
  notifications: {
    taskAssigned: "تسک جدیدی به شما اختصاص داده شد",
    taskUpdated: "تسک شما به‌روزرسانی شد",
    taskCompleted: "تسک شما تکمیل شد",
    taskCanceled: "تسک شما لغو شد",
  },

  // Task page
  page: {
    title: "تسک‌ها",
    description: "مدیریت و پیگیری تسک‌ها",
    createTask: "ایجاد تسک جدید",
    deleteConfirm: "آیا از حذف این تسک مطمئن هستید؟",
    deleteButton: shared.delete,
    cancelButton: shared.cancel,
    deletingButton: shared.deleting,
  },

  // Task stats
  stats: {
    totalTasks: "تعداد کل تسک‌ها",
    completedTasks: shared.completed,
    pendingTasks: shared.pending,
    overdueTasks: "گذشته‌موعد",
  },

  // Task cards
  cards: {
    descriptionCardTitle: shared.description,
    actionsCardTitle: shared.actions,
    editButton: shared.edit,
    taskTimeline: {
      title: "زمان‌بندی تسک",
      start: "شروع",
      due: "موعد",
      status: shared.status,
    },
    timeTracking: {
      title: "ثبت زمان",
      timeSpent: "زمان صرف شده",
      estimate: "برآورد",
      logTime: "ثبت زمان",
      saveTime: shared.save,
      cancelEdit: shared.cancel,
    },
    comments: {
      title: "نظرات",
      placeholder: "نظر خود را بنویسید...",
      post: "ارسال",
      save: shared.save,
      saving: shared.saving,
      cancel: shared.cancel,
    },
    history: {
      title: "تاریخچه تغییرات",
    },
    delete: {
      title: "حذف تسک",
      description: "آیا مطمئن هستید که می‌خواهید این تسک را حذف کنید؟",
      confirm: shared.delete,
      cancel: shared.cancel,
      deleting: shared.deleting,
    },
  },
} as const;

// Comments module constants
export const comments = {
  title: "نظرات",
  empty: {
    noComments: "هنوز نظری ثبت نشده",
    beFirst: "اولین نفری باشید که نظر می‌دهد!",
  },
  composer: {
    placeholder: "نظرتان را بنویسید...",
    placeholderDisabled: "برای ارسال نظر وارد شوید",
    send: "ارسال",
  },
  item: {
    deleted: "این نظر حذف شده",
    actions: "گزینه‌های نظر",
    edit: shared.edit,
    delete: shared.delete,
    deleting: shared.deleting,
    editPlaceholder: "ویرایش نظر...",
    saving: shared.saving,
    save: shared.save,
    cancel: shared.cancel,
    edited: "· ویرایش شده",
  },
} as const;

// Tags Management module constants
export const tagsManagement = {
  title: "مدیریت برچسب‌ها",
  description: "مدیریت برچسب‌های تسک‌ها",
  addTag: "افزودن برچسب",
  createTag: "ایجاد برچسب",
  editTag: "ویرایش برچسب",
  deleteTag: "حذف برچسب",
  tagName: "نام برچسب",
  tagColor: "رنگ برچسب",
  selectColor: "انتخاب رنگ",
  loading: shared.loading,
  noTags: "هیچ برچسبی وجود ندارد",
  noTagsDescription: "برچسب ایجاد کنید تا بتوانید تسک‌ها را دسته‌بندی کنید",
  createFirstTag: "ایجاد اولین برچسب",
  namePlaceholder: "نام برچسب را وارد کنید...",
  colorLabel: "رنگ",
  nameLabel: shared.name,
  actionsLabel: shared.actions,
  editButton: shared.edit,
  deleteButton: shared.delete,
  cancelButton: shared.cancel,
  saveButton: shared.save,
  createButton: shared.create,
  tagsList: "لیست برچسب‌ها",
  tagsCount: "{count} برچسب",
  deleteConfirm: {
    title: "حذف برچسب؟",
    description:
      "آیا مطمئن هستید که می‌خواهید این برچسب را حذف کنید؟ این عمل قابل بازگشت نیست.",
    cancel: shared.cancel,
    confirm: shared.delete,
  },
  toast: {
    created: "برچسب با موفقیت ایجاد شد",
    updated: "برچسب با موفقیت به‌روزرسانی شد",
    deleted: "برچسب با موفقیت حذف شد",
    createError: "خطا در ایجاد برچسب",
    updateError: "خطا در به‌روزرسانی برچسب",
    deleteError: "خطا در حذف برچسب",
  },
  validation: {
    nameRequired: "نام برچسب " + shared.required,
    colorRequired: "رنگ برچسب " + shared.required,
  },
  colors: {
    gray: "خاکستری",
    red: "قرمز",
    orange: "نارنجی",
    yellow: "زرد",
    green: "سبز",
    blue: "آبی",
    purple: "بنفش",
    pink: "صورتی",
  },
} as const;

// Saved filters module constants
export const savedFilters = {
  title: "فیلترهای ذخیره شده",
  saveCurrentFilter: "ذخیره فیلتر فعلی",
  myFilters: "فیلترهای من",
  noSavedFilters: "هیچ فیلتر ذخیره شده‌ای ندارید",
  activeFilters: "فیلترهای فعال",
  noActiveFilters: "بدون فیلتر",
  manage: "مدیریت فیلترها",
  default: "پیش‌فرض",
  setAsDefault: "تنظیم به عنوان پیش‌فرض",
  removeDefault: "حذف از پیش‌فرض",
  createdAt: "ایجاد شده در",
  saveDialog: {
    title: "ذخیره فیلتر",
    description: "فیلتر فعلی خود را با یک نام ذخیره کنید",
    nameLabel: "نام فیلتر",
    namePlaceholder: "مثلاً: تسک‌های اولویت بالا",
    setAsDefault: "تنظیم به عنوان فیلتر پیش‌فرض",
  },
  deleteDialog: {
    title: "حذف فیلتر؟",
    description: "آیا مطمئن هستید که می‌خواهید فیلتر «{name}» را حذف کنید؟",
  },
  manageDialog: {
    title: "مدیریت فیلترهای ذخیره شده",
    description: "فیلترهای خود را مشاهده، ویرایش و حذف کنید",
  },
  criteria: {
    search: shared.search,
    status: shared.status,
    priority: shared.priority,
    assignee: shared.assignee,
    date: shared.date,
    tag: "برچسب",
    noFilter: "بدون فیلتر",
  },
  toast: {
    saved: "فیلتر با موفقیت ذخیره شد",
    updated: "فیلتر با موفقیت به‌روزرسانی شد",
    deleted: "فیلتر با موفقیت حذف شد",
    defaultSet: "فیلتر پیش‌فرض تنظیم شد",
    defaultRemoved: "فیلتر پیش‌فرض حذف شد",
    applied: "فیلتر اعمال شد",
    saveError: "خطا در ذخیره فیلتر",
    updateError: "خطا در به‌روزرسانی فیلتر",
    deleteError: "خطا در حذف فیلتر",
    applyError: "خطا در اعمال فیلتر",
    setDefaultError: "خطا در تنظیم فیلتر پیش‌فرض",
  },
} as const;
