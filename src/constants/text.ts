// Optimized localization constants for Persian (Farsi)
// This file contains all text labels used throughout the task management application
// All text has been rewritten to be natural, concise, motivating, and user-friendly
//
// NOTE: This file is being modularized. New code should import from @/constants/index.ts
// This file is kept for backward compatibility and will be gradually phased out.

import { helps } from "./helps";

// Shared constant strings to avoid duplication
const SHARED_LABELS = {
  // Common actions
  cancel: "انصراف",
  save: "ذخیره",
  delete: "حذف",
  edit: "ویرایش",
  create: "ایجاد",
  close: "بستن",
  add: "افزودن",
  remove: "حذف",
  all: "همه",
  
  // Loading/async states
  saving: "در حال ذخیره...",
  creating: "در حال ایجاد...",
  updating: "در حال به‌روزرسانی...",
  loading: "در حال بارگذاری...",
  deleting: "در حال حذف...",
  
  // Common status labels
  active: "فعال",
  inactive: "غیرفعال",
  completed: "تکمیل شده",
  pending: "در انتظار",
  inProgress: "در حال انجام",
  success: "موفق",
  error: "خطا",
  
  // Time units
  hours: "ساعت",
  minutes: "دقیقه",
  
  // Pagination
  previous: "قبلی",
  next: "بعدی",
  today: "امروز",
} as const;

export const fa = {
  // Application-level configuration
  app: {
    name: "مدیر تسک‌ها",
  },

  // ============ COMMON/SHARED ============
  // Common strings used across multiple components
  common: {
    cancel: SHARED_LABELS.cancel,
    submit: "تایید",
    delete: SHARED_LABELS.delete,
    save: SHARED_LABELS.save,
    saving: SHARED_LABELS.saving,
    edit: SHARED_LABELS.edit,
    create: SHARED_LABELS.create,
    creating: SHARED_LABELS.creating,
    update: "به‌روزرسانی",
    updating: SHARED_LABELS.updating,
    loading: SHARED_LABELS.loading,
    theme: {
      switchToLight: "روشن کردن صفحه",
      switchToDark: "تاریک کردن صفحه",
    },

    // Common button labels
    buttons: {
      ok: "باشه",
      cancel: SHARED_LABELS.cancel,
      save: SHARED_LABELS.save,
      delete: SHARED_LABELS.delete,
      edit: SHARED_LABELS.edit,
      create: SHARED_LABELS.create,
      update: "ذخیره تغییرات",
      close: SHARED_LABELS.close,
      add: SHARED_LABELS.add,
      remove: SHARED_LABELS.remove,
      view: "مشاهده",
      search: "جستجو",
      filter: "فیلتر",
      clear: "پاک کردن",
      export: "خروجی",
      import: "ورودی",
      download: "دانلود",
      upload: "آپلود",
      select: "انتخاب",
      selected: "انتخاب شده",
      all: SHARED_LABELS.all,
      none: "هیچ‌کدام",
      yes: "بله",
      no: "خیر",
      multiSelect: "انتخاب چندتایی",
      cancelSelection: "لغو انتخاب",
      backToList: "بازگشت به لیست",
      back: "بازگشت",
      retry: "تلاش مجدد",
    },

    // Validation messages
    validation: {
      required: "این فیلد الزامی است",
    },

    // Common error/info messages
    messages: {
      notFound: "یافت نشد",
      noData: "داده‌ای موجود نیست",
      noName: "بدون نام",
      quickActions: "عملیات سریع",
    },

    // Common state labels
    states: {
      active: SHARED_LABELS.active,
      inactive: SHARED_LABELS.inactive,
      enabled: SHARED_LABELS.active,
      disabled: SHARED_LABELS.inactive,
      visible: "نمایان",
      hidden: "مخفی",
      success: SHARED_LABELS.success,
      error: SHARED_LABELS.error,
      warning: "هشدار",
      info: "اطلاعات",
      pending: SHARED_LABELS.pending,
      completed: SHARED_LABELS.completed,
      inProgress: SHARED_LABELS.inProgress,
      done: "انجام شده",
      canceled: "لغو شده",
    },

    // Pagination
    pagination: {
      page: "صفحه",
      of: "از",
      previous: SHARED_LABELS.previous,
      next: SHARED_LABELS.next,
      loginAttemptsLabel: "تلاش‌های ورود به سیستم",
    },

    // Calendar and date-related
    today: SHARED_LABELS.today,
    previous: SHARED_LABELS.previous,
    next: SHARED_LABELS.next,
    more: "بیشتر",
    preview: "پیش‌نمایش",

    time: {
      hoursShort: SHARED_LABELS.hours,
      minutesShort: SHARED_LABELS.minutes,
    },

    connectors: {
      and: "و",
    },

    // Status labels
    total: "کل",
    completed: SHARED_LABELS.completed,
    pending: SHARED_LABELS.pending,
  },

  // ============ NAVIGATION ============
  // Navigation menu items
  navigation: {
    allTasks: "همه تسک‌ها",
    dashboard: "داشبورد",
    groups: "گروه‌ها",
    projects: "پروژه‌ها",
    tasks: "تسک‌ها",
    users: "کاربران",
    reports: "گزارش‌ها",
    helps: "راهنما",
    settings: "تنظیمات",
    notifications: "اعلان‌ها",
    tags: "تگ‌ها",
    taskCalendar: "تقویم تسک‌ها",
    myTasks: "تسک‌های من",
    auditLogs: "سوابق تغییرات",
    quickCreate: {
      button: "ایجاد سریع",
      tooltip: "ایجاد سریع تسک یا پروژه",
    },
    projectsSection: "پروژه‌ها",
    allProjects: "همه پروژه‌ها",
    recentProjects: "پروژه‌های اخیر",
    starredProjects: "پروژه‌های نشان‌شده",
    taskViews: "نماهای تسک",
    dueToday: "سررسید امروز",
    overdue: "گذشته‌موعد",
    inProgress: SHARED_LABELS.inProgress,
  },

  // ============ QUICK ACTIONS ============
  // Create new items
  create: {
    newTask: "تسک جدید",
    newProject: "پروژه جدید",
  },

  // Search functionality
  search: {
    placeholder: "جستجو در تسک‌ها و پروژه‌ها...",
  },

  // Header section
  header: {
    title: "مدیر تسک‌ها",
    addNewTask: "افزودن تسک جدید",
    addNewProject: "پروژه جدید",
  },

  // User dropdown menu
  user: {
    dropdown: {
      account: "حساب کاربری",
      logout: "خروج از حساب",
    },
  },

  // ============ NOTIFICATIONS ============
  // Notifications module
  notifications: {
    title: "اعلان‌ها",
    pageTitle: "اعلان‌ها",
    pageDescription: "همه اعلان‌هایتان را در یکجا ببینید",
    markAllAsRead: "خواندن همه",
    clearAll: "پاک کردن همه",
    noNotifications: "اعلان جدیدی ندارید",
    emptyState: {
      title: "هیچ اعلانی ندارید",
      description: "وقتی اعلان جدیدی برایتان بیاید، اینجا نمایش داده می‌شود",
    },
    filters: {
      all: SHARED_LABELS.all,
      unread: "خوانده نشده",
      read: "خوانده شده",
    },
    sort: {
      newest: "جدیدترین",
      oldest: "قدیمی‌ترین",
    },
    types: {
      task_assigned: "تسک جدید",
      project_updated: "به‌روزرسانی پروژه",
      system: "سیستم",
      comment: "نظر جدید",
    },
    actions: {
      markAsRead: "خوانده شد",
      delete: SHARED_LABELS.delete,
      viewAll: "مشاهده همه",
      clearRead: "پاک کردن خوانده‌شده‌ها",
    },
    groups: {
      today: SHARED_LABELS.today,
      yesterday: "دیروز",
      thisWeek: "این هفته",
      older: "قدیمی‌تر",
    },
    stats: {
      total: "کل اعلان‌ها",
      unread: "خوانده نشده",
      read: "خوانده شده",
      deletable: "قابل حذف",
    },
    buttons: {
      markAsRead: "خوانده شد",
    },
    selected: "انتخاب شده",
    selectAll: "انتخاب همه",
    deselectAll: "لغو انتخاب",
    deleteSelected: "حذف انتخاب‌شده‌ها",
    cancel: SHARED_LABELS.cancel,
  },

  // Single notification (separate from notifications list)
  notification: {
    new: "جدید",
    newNotifications: "اعلان‌های جدید اینجا نمایش داده می‌شوند",
    unreadCount: "اعلان خوانده نشده",
    notificationsLabel: "اعلان",
    notificationsPanel: "پنل اعلان‌ها",
    showCount: "نمایش {count} از",
    markAsReadLabel: 'علامت‌گذاری اعلان "{title}" به عنوان خوانده شده',
    notificationWord: "اعلان",
  },

  // ============ AUTHENTICATION ============
  // Authentication module
  auth: {
    login: {
      title: "ورود به سیستم",
      username: "نام کاربری",
      password: "رمز عبور",
      loginButton: "ورود",
      loggingIn: "در حال ورود...",
      registerButton: "ثبت‌نام",
      errors: {
        credentialsRequired: "لطفاً نام کاربری و رمز عبور را وارد کنید",
        invalidCredentials:
          "نام کاربری یا رمز عبور اشتباه است. دوباره تلاش کنید",
      },
    },
    register: {
      title: "ایجاد حساب کاربری",
      username: "نام کاربری",
      password: "رمز عبور",
      confirmPassword: "تکرار رمز عبور",
      registerButton: "ایجاد حساب",
      registering: "در حال ایجاد حساب...",
      loginButton: "بازگشت به ورود",
      success: "حساب کاربری با موفقیت ایجاد شد",
      initialAdminMessage:
        "برای شروع، حساب ادمین سیستم را بسازید. نام کاربری و رمز عبور دلخواهتان را وارد کنید.",
      errors: {
        credentialsRequired: "لطفاً نام کاربری و رمز عبور را وارد کنید",
        passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
        adminCreationFailed:
          "متأسفانه نتوانستیم حساب ادمین را بسازیم. دوباره تلاش کنید",
      },
    },
    errors: {
      usernameRequired: "نام کاربری را وارد کنید",
      passwordRequired: "رمز عبور باید حداقل ۸ کاراکتر باشد",
      passwordConfirmRequired: "لطفاً رمز عبور را دوباره وارد کنید",
      passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
      firstNameRequired: "نام را وارد کنید",
      lastNameRequired: "نام خانوادگی را وارد کنید",
      passwordMinLength: "رمز عبور باید حداقل ۸ کاراکتر باشد",
      usernameMinLength: "نام کاربری باید حداقل ۳ کاراکتر باشد",
      usernameMaxLength: "نام کاربری نمی‌تواند بیشتر از ۵۰ کاراکتر باشد",
      passwordMaxLength: "رمز عبور نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد",
      usernameInvalid: "نام کاربری معتبر نیست",
      passwordInvalid: "رمز عبور معتبر نیست",
      userAlreadyExists:
        "این نام کاربری قبلاً استفاده شده. نام دیگری انتخاب کنید",
      invalidCredentials: "نام کاربری یا رمز عبور اشتباه است",
      userInactive:
        "حساب کاربری شما غیرفعال است. لطفاً با ادمین سیستم تماس بگیرید",
      userBlocked:
        "حساب کاربری شما مسدود شده است. لطفاً با ادمین سیستم تماس بگیرید",
      serverError: "مشکلی پیش آمده. چند لحظه صبر کنید و دوباره تلاش کنید",
    },
  },

  // ============ USER MANAGEMENT ============
  // User management module
  users: {
    title: "کاربران",
    list: {
      count: "{count} کاربر",
    },
    table: {
      columns: {
        user: "کاربر",
        username: "نام کاربری",
        email: "ایمیل",
        role: "نقش",
        status: "وضعیت",
        accountStatus: "وضعیت حساب",
        failedAttempts: "تلاش ناموفق",
        actions: "عملیات",
      },
      roles: {
        admin: "ادمین",
        manager: "مدیر گروه",
        supervisor: "سرپرست",
        employee: "کارمند",
      },
      status: {
        active: SHARED_LABELS.active,
        inactive: SHARED_LABELS.inactive,
        blocked: "مسدود",
        ok: "عادی",
      },
    },
    form: {
      firstName: "نام",
      lastName: "نام خانوادگی",
      selectRole: "انتخاب نقش",
      password: "رمز عبور",
      group: "گروه",
      selectGroup: "انتخاب گروه",
    },
    actions: {
      activate: "فعال‌سازی",
      deactivate: "غیرفعال‌سازی",
      unblock: "رفع مسدودی",
      viewLogs: "سوابق ورود",
      activateSuccess: "حساب کاربری فعال شد",
      deactivateSuccess: "حساب کاربری غیرفعال شد",
      unblockSuccess: "مسدودی کاربر برداشته شد",
      activateError: "خطا در فعال‌سازی حساب کاربری",
      deactivateError: "خطا در غیرفعال‌سازی حساب کاربری",
      unblockError: "خطا در رفع مسدودی کاربر",
      cannotDeactivateAdmin: "نمی‌توان حساب ادمین را غیرفعال کرد",
      toggleStatusError: "خطا در تغییر وضعیت کاربر",
      fetchLogsError: "خطا در دریافت سوابق ورود",
    },
    pendingActivation: {
      title: "حساب شما در انتظار تأیید است",
      message:
        "حساب کاربری شما با موفقیت ایجاد شد، اما هنوز توسط ادمین فعال نشده است.",
      instruction: "لطفاً با ادمین سیستم تماس بگیرید تا حساب شما را فعال کنند.",
      backToLogin: "بازگشت به صفحه ورود",
    },
    loginLogs: {
      title: "سوابق ورود {name}",
      description: "جزئیات تلاش‌های ورود",
      columns: {
        date: "تاریخ",
        time: "زمان",
        ip: "آی‌پی",
        status: "وضعیت",
        reason: "دلیل",
      },
      status: {
        success: SHARED_LABELS.success,
        failed: "ناموفق",
      },
      empty: "هیچ سابقه ورودی ثبت نشده است",
      loadMore: "بارگذاری بیشتر",
    },
    create: {
      button: "کاربر جدید",
      title: "افزودن کاربر جدید",
      success: "عالی! کاربر جدید با موفقیت اضافه شد",
      error: "نتوانستیم کاربر را اضافه کنیم: {error}",
      errors: {
        usernameRequired: "نام کاربری را وارد کنید",
        passwordRequired: "رمز عبور باید حداقل ۸ کاراکتر باشد",
        passwordConfirmRequired: "لطفاً رمز عبور را دوباره وارد کنید",
        passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
      },
    },
    edit: {
      title: "ویرایش کاربر",
      button: "ذخیره تغییرات",
    },
    delete: {
      title: "حذف کاربر",
      description: "مطمئنید که می‌خواهید این کاربر را حذف کنید؟",
      button: "بله، حذف کن",
      success: "کاربر با موفقیت حذف شد",
      error: "نتوانستیم کاربر را حذف کنیم: {error}",
    },
    errors: {
      notFound: "کاربر یافت نشد",
    },
  },

  // ============ GROUPS ============
  // Groups module
  groups: {
    title: "گروه‌ها",
    code: "کد گروه",
    create: {
      title: "ایجاد گروه جدید",
      button: "ایجاد گروه",
      description: "گروه جدیدی را برای مدیریت پروژه‌ها و کاربران ایجاد کنید",
      success: "گروه با موفقیت ایجاد شد",
      error: "خطایی رخ داد. دوباره تلاش کنید",
      formDescription: "اطلاعات گروه را وارد کنید",
    },
    edit: {
      title: "ویرایش گروه",
      button: "ذخیره تغییرات",
    },
    delete: {
      title: "حذف گروه",
      description:
        "آیا از حذف گروه {name} اطمینان دارید؟ این عمل قابل بازگشت نیست.",
    },
    list: {
      count: "{count} گروه",
      empty: "هیچ گروهی یافت نشد",
    },
    form: {
      name: "نام گروه",
      namePlaceholder: "نام گروه را وارد کنید",
      description: "توضیحات",
      descriptionPlaceholder: "توضیحات گروه (اختیاری)",
      manager: "مدیر گروه",
      selectManager: "انتخاب مدیر",
    },
    status: {
      active: SHARED_LABELS.active,
      inactive: SHARED_LABELS.inactive,
    },
    actions: {
      activate: "فعال‌سازی",
      deactivate: "غیرفعال‌سازی",
    },
    stats: {
      users: "کاربر",
      projects: "پروژه",
      tasks: "وظیفه",
    },
  },

  // ============ PROJECTS ============
  // Projects module
  projects: {
    title: "پروژه‌ها",
    projectTasks: "تسک‌های پروژه",
    activeTasks: "تسک‌های فعال",
    project: "پروژه",
    fallbacks: {
      name: "پروژه",
      thisProject: "این پروژه",
    },
    users: {
      title: "اعضای پروژه",
      count: "کاربر",
      add: "افزودن عضو",
      addDialog: {
        title: "افزودن عضو به پروژه",
        selectPlaceholder: "کاربر را انتخاب کنید",
      },
      table: {
        user: "کاربر",
        role: "نقش",
        actions: "عملیات",
      },
      remove: {
        title: "حذف عضو از پروژه",
        description:
          "با حذف این کاربر، تسک‌هایش بدون مسئول می‌شوند اما خود تسک‌ها باقی می‌مانند. مطمئنید که می‌خواهید ادامه دهید؟",
      },
      addSuccess: "عالی! عضو جدید به پروژه اضافه شد",
      addError: "نتوانستیم عضو را اضافه کنیم. دوباره تلاش کنید",
      removeSuccess: "عضو از پروژه حذف شد",
      removeError: "نتوانستیم عضو را حذف کنیم. دوباره تلاش کنید",
    },
    list: {
      noProjects: "هنوز پروژه‌ای نساخته‌اید",
      count: "{count} پروژه",
      viewTasks: "مشاهده تسک‌ها",
    },
    create: {
      button: "پروژه جدید",
      title: "ساخت پروژه جدید",
      description: "پروژه جدیدتان را بسازید و کار را شروع کنید",
      form: {
        name: "نام پروژه",
        nameRequired: "نام پروژه را وارد کنید",
        code: "کد پروژه",
        codeRequired: "کد پروژه را وارد کنید",
        codeLength: "کد پروژه باید ۳ کاراکتر باشد",
        description: "توضیحات",
        descriptionPlaceholder: "درباره این پروژه بنویسید...",
        group: "گروه",
        selectGroup: "انتخاب گروه",
        manager: "مدیر پروژه",
        selectManager: "انتخاب مدیر",
      },
      success: "عالی! پروژه جدید شما آماده است",
      error: "نتوانستیم پروژه را بسازیم: {error}",
    },
    edit: {
      title: "ویرایش پروژه",
      button: "ذخیره تغییرات",
      success: "تغییرات با موفقیت ذخیره شد",
      error: "نتوانستیم تغییرات را ذخیره کنیم: {error}",
    },
    delete: {
      title: "حذف پروژه",
      description:
        "مطمئنید که می‌خواهید این پروژه را حذف کنید؟ تمام تسک‌های آن نیز حذف می‌شوند. این عمل قابل بازگشت نیست.",
      confirm: "بله، حذف کن",
      cancel: SHARED_LABELS.cancel,
      success: "پروژه حذف شد",
      error: "نتوانستیم پروژه را حذف کنیم: {error}",
    },
    errors: {
      notFound: "پروژه یافت نشد",
      loadFailed: "نتوانستیم پروژه‌ها را بارگذاری کنیم",
    },
  },

  // Project section (condensed properties)
  project: {
    progress: "پیشرفت پروژه",
    completedTasks: "تسک تکمیل شده",
    tasks: "تسک‌ها",
    users: "کاربران",
    of: "از",
  },

  // ============ TASKS ============
  // Tasks module
  tasks: {
    title: "تسک‌ها",
    allTasks: "همه تسک‌ها",
    priorities: {
      urgent: "فوری",
      high: "بالا",
      medium: "متوسط",
      low: "پایین",
    },
    status: {
      todo: "برای انجام",
      inProgress: SHARED_LABELS.inProgress,
      review: "در حال بررسی",
      testing: "در حال تست",
      ready: "آماده",
      completed: SHARED_LABELS.completed,
      canceled: "لغو شده",
    },
    filters: {
      searchByTitleOrAssignee: "جستجو بر اساس عنوان یا مسئول...",
      advancedFilters: "فیلترهای پیشرفته",
      clearFilters: "پاک کردن فیلترها",
      labels: {
        search: "جستجو",
        status: "وضعیت",
        priority: "اولویت",
        assignee: "مسئول",
        date: "تاریخ",
        tag: "برچسب",
      },
      dateLabels: {
        today: SHARED_LABELS.today,
        week: "این هفته",
        month: "این ماه",
        overdue: "گذشته‌موعد",
      },
      moreFilters: "{count} مورد دیگر",
    },
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
    pagination: {
      range: "{start} تا {end} از {total} تسک",
      perPage: "{count} مورد در هر صفحه",
      page: "صفحه {page} از {total}",
      prev: "قبلی",
      next: "بعدی",
    },
    calendar: {
      title: "تقویم تسک‌ها",
      description: "مشاهده تسک‌ها بر اساس تاریخ سررسید",
      noTasks: "هیچ تسکی با تاریخ سررسید وجود ندارد",
      noTasksDescription:
        "تسک‌هایی که تاریخ سررسید دارند در این تقویم نمایش داده می‌شوند",
      weekdayShort: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
      monthView: "نمای ماهانه",
      weekView: "نمای هفتگی",
      dayView: "نمای روزانه",
      today: SHARED_LABELS.today,
      previousMonth: "ماه قبل",
      nextMonth: "ماه بعد",
      tasksThisMonth: "تسک‌های این ماه",
      completedTasks: SHARED_LABELS.completed,
      pendingTasks: SHARED_LABELS.pending,
      overdueTasks: "گذشته‌موعد",
    },
    bulkActions: {
      selectedCount: "{count} تسک انتخاب شده",
      assignPlaceholder: "اختصاص دادن",
      statusPlaceholder: "تغییر وضعیت",
      priorityPlaceholder: "تغییر اولویت",
      deleteButton: SHARED_LABELS.delete,
      deleteDialogTitle: "حذف {count} تسک؟",
      deleteDialogDescription:
        "این عملیات قابل بازگشت نیست. آیا مطمئن هستید که می‌خواهید این تسک‌ها را حذف کنید؟",
      cancelButton: SHARED_LABELS.cancel,
      deletingButton: SHARED_LABELS.deleting,
      assignSuccess: "{count} تسک با موفقیت اختصاص داده شد",
      assignError: "خطا در اختصاص تسک‌ها",
      statusSuccess: "وضعیت {count} تسک تغییر کرد",
      statusError: "خطا در تغییر وضعیت",
      prioritySuccess: "اولویت {count} تسک تغییر کرد",
      priorityError: "خطا در تغییر اولویت",
      deleteSuccess: "{count} تسک حذف شد",
      deleteError: "خطا در حذف تسک‌ها",
    },
    header: {
      tasksFound: "{count} تسک پیدا شد",
      manageTasks: "تسک‌هایتان را مدیریت کنید",
      tasksInProject: "{count} تسک در این پروژه",
      manageProjectTasks: "تسک‌های این پروژه",
    },
    addTask: {
      title: "ساخت تسک جدید",
      issueTitle: "عنوان تسک",
      description: "توضیحات",
      descriptionProject: "توضیحات پروژه",
      status: "وضعیت",
      priority: "اولویت",
      assignee: "مسئول",
      unassigned: "بدون مسئول",
      selectProject: "انتخاب پروژه",
      deadline: "مهلت انجام",
      success: "عالی! تسک جدیدتان آماده است",
      error: "نتوانستیم تسک را بسازیم: {error}",
      buttons: {
        create: "ساخت تسک",
        creating: SHARED_LABELS.creating,
        more: "بیشتر",
        newTask: "تسک جدید",
        newTaskForProject: "تسک جدید برای این پروژه",
      },
    },
    list: {
      noTasks: "تسکی وجود ندارد",
      openMenu: "باز کردن منو",
    },
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
      descriptionCardTitle: "توضیحات",
      quickInfoCardTitle: "اطلاعات سریع",
      statusLabel: "وضعیت:",
      priorityLabel: "اولویت:",
      createdLabel: "ایجاد شده:",
      updatedLabel: "بروزرسانی:",
      actionsCardTitle: "عملیات",
      editTaskButton: "ویرایش وظیفه",
      deleteTaskButton: "حذف وظیفه",
      editButton: SHARED_LABELS.edit,
      timeTracking: {
        title: "زمان صرف شده",
        hours: SHARED_LABELS.hours,
        minutes: SHARED_LABELS.minutes,
        editTime: "ویرایش زمان",
        saveTime: "ذخیره",
        cancelEdit: SHARED_LABELS.cancel,
        noTimeTracked: "هنوز زمانی ثبت نشده",
        updateSuccess: "زمان به‌روزرسانی شد",
        updateError: "نتوانستیم زمان را به‌روزرسانی کنیم",
        invalidInput: "لطفاً ساعت و دقیقه را به درستی وارد کنید",
        exceedsEstimate:
          "زمان وارد شده از برآورد زمانی ({hours}h {minutes}m) بیشتر است",
      },
      buttons: {
        save: SHARED_LABELS.save,
        saving: SHARED_LABELS.saving,
        cancel: SHARED_LABELS.cancel,
        delete: SHARED_LABELS.delete,
        deleting: SHARED_LABELS.deleting,
      },
    },
    edit: {
      title: "ویرایش تسک",
      success: "تغییرات با موفقیت ذخیره شد",
      error: "نتوانستیم تغییرات را ذخیره کنیم: {error}",
      buttons: {
        save: SHARED_LABELS.save,
        saving: SHARED_LABELS.saving,
        cancel: SHARED_LABELS.cancel,
      },
    },
    delete: {
      title: "حذف تسک",
      description:
        "مطمئنید که می‌خواهید این تسک را حذف کنید؟ بعد از حذف، دیگر در فهرست‌ها نمایش داده نمی‌شود.",
      confirm: "بله، حذف کن",
      cancel: SHARED_LABELS.cancel,
      success: "تسک حذف شد",
      error: "نتوانستیم تسک را حذف کنیم: {error}",
    },
    errors: {
      notFound: "وظیفه یافت نشد",
    },
    addNewTask: "افزودن تسک جدید",
    moreOptions: "گزینه‌های بیشتر",
    sortByPriority: "مرتب‌سازی براساس اولویت",
    sortByDate: "مرتب‌سازی براساس تاریخ",
    showCompletedTasks: "نمایش تسک‌های انجام شده",
    editTask: "ویرایش '{title}'",
    timeSpent: "زمان صرف شده",
    timeEstimate: "برآورد زمان",
  },

  // ============ REPORTS ============
  // Reports module
  reports: {
    title: "گزارش‌ها",
    dashboardTitle: "گزارش‌ها",
    tabs: {
      overview: "مرور",
      team: "تیم",
      individuals: "افراد",
      insights: "بینش‌ها",
    },
    aria: {
      filters: "فیلترها",
      timelinessChart: "راهنمای نمودار زمان‌بندی",
      prioritiesChart: "راهنمای نمودار اولویت‌ها",
    },
    taskCount: "{count} تسک",
    completed: SHARED_LABELS.completed,
    inProgress: SHARED_LABELS.inProgress,
    canceled: "لغو شده",
    high: "اولویت بالا",
    medium: "اولویت متوسط",
    low: "اولویت پایین",
    tasks: "تسک‌ها",
    projects: "پروژه‌ها",
    status: "وضعیت",
    priority: "اولویت",
    clearFilters: "پاک کردن فیلترها",
    completedTasks: SHARED_LABELS.completed,
    totalTasks: "کل تسک‌ها",
    inProgressTasks: SHARED_LABELS.inProgress,
    noData: "داده‌ای برای نمایش نیست",
    noTasksFound: "تسکی پیدا نشد",
    project: "پروژه",
    taskStatus: "وضعیت",
    taskPriority: "اولویت",
    taskCompleted: SHARED_LABELS.completed,
    completionRate: "نرخ تکمیل",
    name: "نام",
    completedTasksCount: "تعداد تکمیل شده",
    todo: "برای انجام",
    pending: SHARED_LABELS.pending,
  },

  // ============ DASHBOARD ============
  // Dashboard module
  dashboard: {
    title: "داشبورد",
    greeting: "خوش آمدید",
    greetingMessage: "بر داشبورد شما خوش آمدید!",
    progress: "پیشرفت پروژه",
    completedTasks: "تسک تکمیل شده",
    cards: {
      todayDue: "امروز سررسید",
      completionRate: "نرخ تکمیل",
      completedThisWeek: "تکمیل این هفته",
      recentNotifications: "اعلان‌های اخیر",
      noNewNotifications: "اعلان جدیدی وجود ندارد",
      quickActions: "اقدامات سریع",
      myTasks: "وظایف من",
      tasksCalendar: "تقویم وظایف",
      notifications: "اعلان‌ها",
      viewAll: "مشاهده همه",
      progress: "پیشرفت",
      completed: SHARED_LABELS.completed,
      remaining: "باقی مانده",
      taskStatusDistribution: "توزیع وضعیت وظایف",
      productivityTrend: "روند بهره‌وری (۷ روز)",
      dayLabel: "روز: {label}",
      recentActivity: "فعالیت‌های اخیر",
      noProject: "بدون پروژه",
      noActivityFound: "فعالیتی یافت نشد",
      overdueTasks: "وظایف سررسید گذشته",
    },
    welcome: {
      employee: "خوش آمدید {firstName} {lastName} عزیز!",
      supervisor: "خوش آمدید سرپرست {firstName} {lastName}!",
      admin: "خوش آمدید ادمین {firstName} {lastName}!",
      employeeSubtitle: "وضعیت وظایف و پروژه‌های شما را مشاهده کنید",
      supervisorSubtitle: "وضعیت تیم و پروژه‌ها را نظارت کنید",
      adminSubtitle: "نمای کلی سیستم و گزارش‌ها را مشاهده کنید",
    },
  },

  // ============ COMMENTS ============
  // Comments module
  comments: {
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
      edit: SHARED_LABELS.edit,
      delete: SHARED_LABELS.delete,
      deleting: SHARED_LABELS.deleting,
      editPlaceholder: "ویرایش نظر...",
      saving: SHARED_LABELS.saving,
      save: SHARED_LABELS.save,
      cancel: SHARED_LABELS.cancel,
      edited: "· ویرایش شده",
    },
  },

  // ============ TAGS ============
  // Tags Management
  tagsManagement: {
    title: "مدیریت برچسب‌ها",
    description: "مدیریت برچسب‌های تسک‌ها",
    addTag: "افزودن برچسب",
    createTag: "ایجاد برچسب",
    editTag: "ویرایش برچسب",
    deleteTag: "حذف برچسب",
    tagName: "نام برچسب",
    tagColor: "رنگ برچسب",
    selectColor: "انتخاب رنگ",
    loading: SHARED_LABELS.loading,
    noTags: "هیچ برچسبی وجود ندارد",
    noTagsDescription: "برچسب ایجاد کنید تا بتوانید تسک‌ها را دسته‌بندی کنید",
    createFirstTag: "ایجاد اولین برچسب",
    namePlaceholder: "نام برچسب را وارد کنید...",
    colorLabel: "رنگ",
    nameLabel: "نام",
    actionsLabel: "عملیات",
    editButton: SHARED_LABELS.edit,
    deleteButton: SHARED_LABELS.delete,
    cancelButton: SHARED_LABELS.cancel,
    saveButton: SHARED_LABELS.save,
    createButton: SHARED_LABELS.create,
    tagsList: "لیست برچسب‌ها",
    tagsCount: "{count} برچسب",
    deleteConfirm: {
      title: "حذف برچسب؟",
      description:
        "آیا مطمئن هستید که می‌خواهید این برچسب را حذف کنید؟ این عمل قابل بازگشت نیست.",
      cancel: SHARED_LABELS.cancel,
      confirm: SHARED_LABELS.delete,
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
      nameRequired: "نام برچسب الزامی است",
      colorRequired: "رنگ برچسب الزامی است",
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
  },

  // ============ FILTERS ============
  // Saved filters and custom views
  savedFilters: {
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
      search: "جستجو",
      status: "وضعیت",
      priority: "اولویت",
      assignee: "مسئول",
      date: "تاریخ",
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
  },

  // ============ SETTINGS ============
  // Settings module
  settings: {
    title: "تنظیمات",
    description: "مدیریت حساب کاربری و تنظیمات برنامه",
    tabs: {
      profile: "پروفایل کاربری",
      appearance: "ظاهر و تم",
      security: "امنیت و ورود",
      about: "درباره برنامه",
    },
    profile: {
      title: "اطلاعات شناسایی",
      description: "تصویر پروفایل و نام نمایشی خود را مدیریت کنید.",
      changeImage: "تغییر تصویر",
      firstName: "نام",
      lastName: "نام خانوادگی",
      username: "نام کاربری",
      usernameDescription: "نام کاربری منحصر به فرد شما در سیستم.",
      saveChanges: "ذخیره تغییرات",
      contactTitle: "اطلاعات تماس",
      contactDescription:
        "ایمیل شما جهت بازیابی رمز عبور و دریافت اعلان‌ها استفاده می‌شود.",
      email: "آدرس ایمیل",
      emailChangeNote: "برای تغییر ایمیل با پشتیبانی تماس بگیرید.",
      toast: {
        updateSuccess: "پروفایل بروزرسانی شد",
        updateSuccessDescription: "اطلاعات شما با موفقیت ذخیره گردید.",
        updateError: SHARED_LABELS.error,
        updateErrorDescription: "خطایی در ذخیره اطلاعات رخ داد.",
      },
    },
    appearance: {
      title: "تم برنامه",
      description: "ظاهر برنامه را متناسب با سلیقه خود شخصی‌سازی کنید.",
      light: "روشن",
      dark: "تاریک",
      system: "سیستم",
    },
    security: {
      changePasswordTitle: "تغییر رمز عبور",
      changePasswordDescription: "برای امنیت بیشتر، رمز عبور قوی انتخاب کنید.",
      oldPassword: "رمز عبور فعلی",
      newPassword: "رمز عبور جدید",
      confirmPassword: "تکرار رمز عبور جدید",
      updatePassword: "بروزرسانی رمز عبور",
      activeSessionsTitle: "نشست‌های فعال",
      activeSessionsDescription: "تاریخچه ورودهای اخیر به حساب کاربری شما.",
      noLoginHistory: "هیچ سابقه ورودی یافت نشد.",
      toast: {
        passwordChanged: "رمز عبور تغییر کرد",
        passwordChangedDescription: "رمز عبور شما با موفقیت تغییر یافت.",
        passwordError: SHARED_LABELS.error,
        passwordErrorDescription: "رمز عبور فعلی اشتباه است یا خطایی رخ داده.",
        fetchLogsError: "خطا در دریافت سوابق ورود",
      },
      validation: {
        oldPasswordRequired: "رمز عبور فعلی الزامی است",
      },
    },
    about: {
      title: "درباره برنامه",
      version: "نسخه ۱.۰.۰",
      description:
        "این برنامه جهت مدیریت پروژه‌ها و تسک‌های تیمی طراحی شده است.",
    },
  },

  // ============ AUDIT LOGS ============
  // Audit Logs
  auditLogs: {
    title: "سوابق تغییرات",
    description: "مشاهده تمام تغییرات انجام شده در سیستم",
    table: {
      timestamp: "زمان",
      actor: "انجام‌دهنده",
      action: "عملیات",
      resource: "منبع",
      resourceId: "شناسه منبع",
      client: "کلاینت",
      message: "پیام",
      changes: "تغییرات",
      requestId: "شناسه درخواست",
      ipAddress: "آدرس IP",
      noChanges: "بدون تغییر",
      viewChanges: "مشاهده تغییرات",
      hideChanges: "پنهان کردن تغییرات",
    },
    filters: {
      resource: "نوع منبع",
      resourceId: "شناسه منبع",
      actor: "انجام‌دهنده",
      action: "عملیات",
      client: "کلاینت",
      dateFrom: "از تاریخ",
      dateTo: "تا تاریخ",
      search: "جستجو در پیام یا شناسه درخواست",
      clear: "پاک کردن فیلترها",
      all: SHARED_LABELS.all,
      allPlaceholder: SHARED_LABELS.all,
    },
    actions: {
      create: SHARED_LABELS.create,
      update: "به‌روزرسانی",
      delete: SHARED_LABELS.delete,
    },
    clients: {
      web: "مرورگر",
      cli: "خط فرمان",
      automation: "خودکار",
      unknown: "نامشخص",
    },
    resources: {
      tasks: "تسک‌ها",
      projects: "پروژه‌ها",
      users: "کاربران",
      task: "تسک",
      project: "پروژه",
    },
    empty: {
      title: "سابقه‌ای یافت نشد",
      description: "هنوز هیچ تغییری در سیستم ثبت نشده است.",
      noResults: "نتیجه‌ای با فیلترهای انتخابی یافت نشد.",
      empty: "خالی",
    },
    errors: {
      loadFailed: "خطا در بارگذاری سوابق",
      loadHistoryFailed: "خطا در بارگذاری تاریخچه",
    },
    labels: {
      before: "قبل:",
      after: "بعد:",
    },
    actorTypes: {
      system: "سیستم",
      unknown: "نامشخص",
    },
    activityStream: {
      title: "تاریخچه تغییرات",
      empty: "هیچ تغییری ثبت نشده است",
      created: "{actor} این {resource} را ایجاد کرد",
      updated: "{actor} {field} را از {old} به {new} تغییر داد",
      deleted: "{actor} این {resource} را حذف کرد",
      changed: "{actor} {field} را تغییر داد",
      defaultMessage: "{actor} عملیات {action} را انجام داد",
      by: "توسط",
      at: "در",
      showDetails: "نمایش جزئیات",
      hideDetails: "پنهان کردن جزئیات",
    },
  },

  // ============ MY TASKS ============
  // My Tasks page
  myTasks: {
    title: "تسک‌های من",
    description: "همه تسک‌های اختصاص داده شده به شما",
    tabs: {
      active: SHARED_LABELS.active,
      completed: SHARED_LABELS.completed,
      byProject: "بر اساس پروژه",
    },
    stats: {
      active: SHARED_LABELS.active,
      completed: SHARED_LABELS.completed,
      overdue: "گذشته‌موعد",
      canceled: "لغو شده",
    },
    empty: {
      noTasks: "تسکی ندارید",
      noTasksDescription: "هیچ تسکی به شما اختصاص داده نشده است",
      noActiveTasks: "تسک فعالی ندارید",
      noActiveTasksDescription: "همه تسک‌های شما انجام شده یا لغو شده‌اند",
      noCompletedTasks: "هنوز تسکی را تکمیل نکرده‌اید",
      noCompletedTasksDescription:
        "تسک‌های تکمیل شده در اینجا نمایش داده می‌شوند",
      noTasksFallback: "تسکی ندارید",
      noTasksDescriptionFallback: "هیچ تسکی به شما اختصاص داده نشده است",
      noActiveTasksFallback: "تسک فعالی ندارید",
      noActiveTasksDescriptionFallback:
        "همه تسک‌های شما انجام شده یا لغو شده‌اند",
      noCompletedTasksFallback: "هنوز تسکی را تکمیل نکرده‌اید",
      noCompletedTasksDescriptionFallback:
        "تسک‌های تکمیل شده در اینجا نمایش داده می‌شوند",
    },
  },

  // ============ HELP & DOCUMENTATION ============
  // Help documentation
  helps,

  // ============ LOADING & UI ============
  // Loading states
  loading: {
    application: SHARED_LABELS.loading,
    notifications: "در حال بارگذاری اعلان‌ها...",
  },

  // UI Navigation
  navigationLabels: {
    timesheet: "تایم‌شیت",
  },

  // Timesheet
  timesheet: {
    headers: {
      date: "تاریخ",
      taskTitle: "عنوان تسک",
      project: "پروژه",
      minutesSpent: "دقیقه‌های صرف شده",
    },
    noTimeSpent: "هیچ",
  },

  // UI Elements & Accessibility
  ui: {
    toggleSidebar: "بازکردن/بستن منوی کناری",
    breadcrumb: "راه‌نمای صفحه",
    pageLoadError: {
      refreshMessage: "لطفاً صفحه را رفرش کنید یا دوباره تلاش کنید",
    },
  },

  // Date picker
  datePicker: {
    placeholder: "تاریخ را انتخاب کنید",
  },

  // Chart labels
  charts: {
    dateLabel: "تاریخ",
  },

  // ============ ERRORS ============
  // Error messages
  errors: {
    pageLoad: {
      login: "نتوانستیم صفحه ورود را بارگذاری کنیم",
      register: "نتوانستیم صفحه ثبت‌نام را بارگذاری کنیم",
      dashboard: "نتوانستیم داشبورد را بارگذاری کنیم",
      projects: "نتوانستیم پروژه‌ها را بارگذاری کنیم",
      tasks: "نتوانستیم تسک‌ها را بارگذاری کنیم",
      projectTasks: "نتوانستیم تسک‌های پروژه را بارگذاری کنیم",
      users: "نتوانستیم کاربران را بارگذاری کنیم",
      projectUsers: "نتوانستیم اعضای پروژه را بارگذاری کنیم",
      reports: "نتوانستیم گزارش‌ها را بارگذاری کنیم",
      helps: "نتوانستیم راهنما را بارگذاری کنیم",
      notifications: "نتوانستیم اعلان‌ها را بارگذاری کنیم",
      notFound: "صفحه پیدا نشد",
    },
    validation: {
      titleRequired: "عنوان الزامی است",
      projectIdRequired: "شناسه پروژه الزامی است",
      estimatedHoursRange: "ساعت برآورد باید بین ۰ تا ۹۹۹ باشد",
      estimatedMinutesRange: "دقیقه برآورد باید بین ۰ تا ۵۹ باشد",
      numberInvalid: "لطفاً مقدار عددی معتبر وارد کنید",
      invalidOption: "گزینه انتخاب شده معتبر نیست",
      invalidDate: "تاریخ نامعتبر است",
      keywords: {
        inactive: ["غیرفعال", "غيرفعال"],
        blocked: ["مسدود", "حساب کاربری"],
      },
    },
    notFound: {
      projectNotFound: "پروژه یافت نشد",
      taskNotFound: "تسک یافت نشد",
    },
    operationFailed: {
      addUserToProject: "خطا در افزودن کاربر به پروژه",
      removeUserFromProject: "خطا در حذف کاربر از پروژه",
      saveTimeEntry: "خطا در ذخیره ورود زمانی",
      exportProject: "خطا در خروجی پروژه",
      fetchLoginLogs: "خطا در دریافت سوابق ورود",
      applyFilter: "خطا در اعمال فیلتر",
      loadSavedFilters: "خطا در بارگذاری فیلترهای ذخیره شده",
      saveFilters: "خطا در ذخیره فیلترها",
      subscribeNotifications: "خطا در اشتراک در اعلان‌ها",
      loadNotifications: "نتوانستیم اعلان‌ها را بارگذاری کنیم",
    },
    permission: {
      onlySuperusers:
        "تنها کاربران ارشد (superuser) می‌توانند این عملیات را انجام دهند",
    },
    boundary: {
      title: "اوه! مشکلی پیش آمده",
      description:
        "یک خطای غیرمنتظره رخ داده. نگران نباشید، می‌توانید دوباره تلاش کنید یا صفحه را بارگذاری مجدد کنید",
      tryAgain: "تلاش مجدد",
      reloadPage: "بارگذاری مجدد",
    },
  },

  // ============ OTHER PAGES ============
  // 404 page
  notFound: {
    title: "404",
    message: "صفحه‌ای که دنبالش می‌گردید پیدا نشد",
  },

  // Task-related labels (legacy, use tasks.* instead)
  task: {
    editTask: "ویرایش تسک {title}",
    completedTasks: SHARED_LABELS.completed,
    sortByPriority: "مرتب‌سازی بر اساس اولویت",
    newTask: "تسک جدید",
    newTaskForProject: "تسک جدید برای این پروژه",
    addNewTask: "افزودن تسک جدید",
    moreOptions: "گزینه‌های بیشتر",
    sortByDate: "مرتب‌سازی بر اساس تاریخ",
    showCompletedTasks: "نمایش تکمیل شده‌ها",
    logTime: "ثبت زمان",
    timeSpent: "زمان صرف شده",
    estimatedHours: "ساعت برآورد",
    estimatedMinutes: "دقیقه برآورد",
    hours: SHARED_LABELS.hours,
    minutes: SHARED_LABELS.minutes,
    hour: "ساعت",
    min: "دقیقه",
    quickAdd: "افزودن سریع",
    addTime: "افزودن زمان",
    editTime: "ویرایش زمان",
    noTimeLogged: "زمانی ثبت نشده",
  },
} as const;

// Type helper for better TypeScript support
export type FaKey = keyof typeof fa;
export type FaNestedKey<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? `${string & K}.${FaNestedKey<T[K]>}`
        : string & K;
    }[keyof T]
  : never;

export type FaPath = FaNestedKey<typeof fa>;

// Alias for more intuitive usage
export const text = fa;
