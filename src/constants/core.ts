// Core application constants (shared labels, UI strings, and base copy)

export const app = {
  name: "انجام",
} as const;

// Shared constants used across multiple modules
export const shared = {
  // Common action buttons
  cancel: "انصراف",
  save: "ذخیره",
  delete: "حذف",
  edit: "ویرایش",
  create: "ایجاد",
  update: "به‌روزرسانی",
  close: "بستن",
  ok: "باشه",
  submit: "تایید",
  back: "بازگشت",
  retry: "تلاش مجدد",
  view: "مشاهده",
  add: "افزودن",
  remove: "حذف",
  select: "انتخاب",
  clear: "پاک کردن",
  search: "جستجو",
  filter: "فیلتر",
  export: "خروجی",
  import: "ورودی",
  download: "دانلود",
  upload: "آپلود",

  // Loading states
  saving: "در حال ذخیره...",
  creating: "در حال ایجاد...",
  updating: "در حال به‌روزرسانی...",
  deleting: "در حال حذف...",
  loading: "در حال بارگذاری...",

  // Common states
  active: "فعال",
  inactive: "غیرفعال",
  enabled: "فعال",
  disabled: "غیرفعال",
  success: "موفق",
  error: "خطا",
  warning: "هشدار",
  info: "اطلاعات",
  pending: "در انتظار",
  completed: "تکمیل شده",
  done: "انجام شده",
  canceled: "لغو شده",
  inProgress: "در حال انجام",

  // Common labels
  name: "نام",
  code: "کد",
  description: "توضیحات",
  status: "وضعیت",
  priority: "اولویت",
  assignee: "مسئول",
  project: "پروژه",
  task: "تسک",
  user: "کاربر",
  group: "گروه",
  date: "تاریخ",
  time: "زمان",
  deadline: "مهلت",
  created: "ایجاد شده",
  updated: "به‌روزرسانی",
  createdAt: "تاریخ ایجاد",
  updatedAt: "آخرین به‌روزرسانی",
  actions: "عملیات",
  all: "همه",
  none: "هیچ‌کدام",
  yes: "بله",
  no: "خیر",
  total: "کل",
  today: "امروز",
  previous: "قبلی",
  next: "بعدی",
  more: "بیشتر",
  preview: "پیش‌نمایش",
  confirm: "تایید",
  required: "الزامی است",
  notFound: "یافت نشد",
  noData: "داده‌ای وجود ندارد",
  noName: "بدون نام",
} as const;

// Common strings used across multiple components
export const common = {
  cancel: shared.cancel,
  submit: shared.submit,
  delete: shared.delete,
  save: shared.save,
  undo: "بازگردانی",
  saving: shared.saving,
  edit: shared.edit,
  create: shared.create,
  creating: shared.creating,
  update: shared.update,
  updating: shared.updating,
  loading: shared.loading,
  theme: {
    switchToLight: "روشن کردن صفحه",
    switchToDark: "تاریک کردن صفحه",
  },

  // Common button labels
  buttons: {
    ok: shared.ok,
    cancel: shared.cancel,
    save: shared.save,
    delete: shared.delete,
    edit: shared.edit,
    create: shared.create,
    update: "ذخیره تغییرات",
    close: shared.close,
    add: shared.add,
    remove: shared.remove,
    view: shared.view,
    search: shared.search,
    filter: shared.filter,
    clear: shared.clear,
    export: shared.export,
    import: shared.import,
    download: shared.download,
    upload: shared.upload,
    select: shared.select,
    selected: "انتخاب شده",
    all: shared.all,
    none: shared.none,
    yes: shared.yes,
    no: shared.no,
    multiSelect: "انتخاب چندتایی",
    cancelSelection: "لغو انتخاب",
    backToList: "بازگشت به لیست",
    back: shared.back,
    retry: shared.retry,
  },
  connectors: {
    and: "و",
  },

  // Validation messages
  validation: {
    required: shared.required,
  },

  // Common error/info messages
  messages: {
    notFound: shared.notFound,
    noData: shared.noData,
    noName: shared.noName,
    quickActions: "عملیات سریع",
  },
  pagination: {
    page: "صفحه",
    of: "از",
    previous: shared.previous,
    next: shared.next,
    loginAttemptsLabel: "تلاش‌های ورود به سیستم",
  },

  // Common state labels
  states: {
    active: shared.active,
    inactive: shared.inactive,
    enabled: shared.enabled,
    disabled: shared.disabled,
    visible: "نمایان",
    hidden: "مخفی",
    success: shared.success,
    error: shared.error,
    warning: shared.warning,
    info: shared.info,
    pending: shared.pending,
    completed: shared.completed,
    inProgress: shared.inProgress,
    done: shared.done,
    canceled: shared.canceled,
  },

  // Date/time helpers
  time: {
    today: shared.today,
    previous: shared.previous,
    next: shared.next,
    hoursShort: "ساعت",
    minutesShort: "دقیقه",
  },

  // Misc
  today: shared.today,
  previous: shared.previous,
  next: shared.next,
  more: shared.more,
  preview: shared.preview,
  total: shared.total,
  completed: shared.completed,
  pending: shared.pending,
} as const;

// Loading states
export const loading = {
  application: "در حال بارگذاری...",
  notifications: "در حال بارگذاری اعلان‌ها...",
} as const;

// UI Elements & Accessibility
export const ui = {
  toggleSidebar: "بازکردن/بستن منوی کناری",
  breadcrumb: "راه‌نمای صفحه",
  pageLoadError: {
    refreshMessage: "لطفاً صفحه را رفرش کنید یا دوباره تلاش کنید",
  },
} as const;

export const datePicker = {
  placeholder: "تاریخ را انتخاب کنید",
} as const;

export const navigationLabels = {
  timesheet: "تایم‌شیت",
  ownership: "مالکیت",
  time: "زمان",
  status: "وضعیت",
  workspace: "فضای کاری",
  admin: "مدیریت",
} as const;

export const themeLabels = {
  dark: "حالت تیره",
  light: "حالت روشن",
  system: "حالت سیستم",
} as const;
