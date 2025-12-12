// Optimized localization constants for Persian (Farsi)
// This file contains all text labels used throughout the task management application
// All text has been rewritten to be natural, concise, motivating, and user-friendly
//
// NOTE: This file is being modularized. New code should import from @/constants/index.ts
// This file is kept for backward compatibility and will be gradually phased out.

import { helps } from "./helps";

export const fa = {
  // Application-level configuration
  app: {
    name: "مدیر تسک‌ها",
  },

  // Common strings used across multiple components
  common: {
    cancel: "انصراف",
    submit: "تایید",
    delete: "حذف",
    save: "ذخیره",
    saving: "در حال ذخیره...",
    edit: "ویرایش",
    create: "ایجاد",
    creating: "در حال ایجاد...",
    update: "به‌روزرسانی",
    updating: "در حال به‌روزرسانی...",
    loading: "در حال بارگذاری...",
    theme: {
      switchToLight: "روشن کردن صفحه",
      switchToDark: "تاریک کردن صفحه",
    },

    // Common button labels
    buttons: {
      ok: "باشه",
      cancel: "انصراف",
      save: "ذخیره",
      delete: "حذف",
      edit: "ویرایش",
      create: "ایجاد",
      update: "ذخیره تغییرات",
      close: "بستن",
      add: "افزودن",
      remove: "حذف",
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
      all: "همه",
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
      active: "فعال",
      inactive: "غیرفعال",
      enabled: "فعال",
      disabled: "غیرفعال",
      visible: "نمایان",
      hidden: "مخفی",
      success: "موفق",
      error: "خطا",
      warning: "هشدار",
      info: "اطلاعات",
      pending: "در انتظار",
      completed: "تکمیل شده",
      inProgress: "در حال انجام",
      done: "انجام شده",
      canceled: "لغو شده",
    },

    // Pagination
    pagination: {
      page: "صفحه",
      of: "از",
      previous: "قبلی",
      next: "بعدی",
      loginAttemptsLabel: "تلاش‌های ورود به سیستم",
    },

    // Calendar and date-related
    today: "امروز",
    previous: "قبلی",
    next: "بعدی",
    more: "بیشتر",

    time: {
      hoursShort: "ساعت",
      minutesShort: "دقیقه",
    },

    // Status labels
    total: "کل",
    completed: "انجام شده",
    pending: "در انتظار",
  },

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
    inProgress: "در حال انجام",
  },

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
      all: "همه",
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
      delete: "حذف",
      viewAll: "مشاهده همه",
      clearRead: "پاک کردن خوانده‌شده‌ها",
    },
    groups: {
      today: "امروز",
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
    cancel: "انصراف",
  },

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
        active: "فعال",
        inactive: "غیرفعال",
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
      columns: {
        date: "تاریخ",
        time: "زمان",
        ip: "آی‌پی",
        status: "وضعیت",
        reason: "دلیل",
      },
      status: {
        success: "موفق",
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

  // Groups module
  groups: {
    title: "گروه‌ها",
    code: "کد گروه",
    create: {
      title: "ایجاد گروه جدید",
      button: "ایجاد گروه",
      description: "گروه جدیدی را برای مدیریت پروژه‌ها و کاربران ایجاد کنید",
      success: "گروه با موفقیت ایجاد شد",
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
      active: "فعال",
      inactive: "غیرفعال",
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
        assets: "فایل‌های پیوست",
        assetsPlaceholder: "فایل‌های مرتبط را اینجا بکشید یا کلیک کنید",
        group: "گروه",
        selectGroup: "انتخاب گروه",
        supervisor: "سرپرست",
        selectSupervisor: "سرپرست را انتخاب کنید",
      },
      submit: "ساخت پروژه",
      success: "عالی! پروژه جدیدتان آماده است",
      error: "نتوانستیم پروژه را بسازیم: {error}",
    },
    edit: {
      title: "ویرایش پروژه",
      description: "اطلاعات پروژه را به‌روزرسانی کنید",
      submit: "ذخیره تغییرات",
      success: "تغییرات با موفقیت ذخیره شد",
      error: "نتوانستیم تغییرات را ذخیره کنیم: {error}",
      fileValidationError:
        "بعضی از فایل‌ها قابل بارگذاری نیستند. لطفاً نوع فایل‌ها را بررسی کنید",
    },
    delete: {
      title: "حذف پروژه",
      confirm:
        "مطمئنید که می‌خواهید این پروژه را حذف کنید؟ با حذف پروژه، همه تسک‌هایش هم حذف می‌شوند.",
      submit: "بله، حذف کن",
      success: "پروژه حذف شد",
      error: "نتوانستیم پروژه را حذف کنیم: {error}",
    },
    details: {
      title: "جزئیات پروژه",
      viewDetails: "مشاهده جزئیات",
      information: "اطلاعات",
      supervisor: "سرپرست",
      createdAt: "تاریخ ساخت",
      updatedAt: "آخرین تغییر",
      description: "توضیحات",
      noDescription: "هنوز توضیحاتی برای این پروژه نوشته نشده",
      files: "فایل‌های پیوست",
      filesCount: "{count} فایل",
      noFiles: "هنوز فایلی بارگذاری نشده",
      statistics: "آمار",
      totalTasks: "تعداد تسک‌ها",
      completedTasks: "تکمیل شده",
      inProgressTasks: "در حال انجام",
      totalTimeSpent: "کل زمان صرف شده",
      backToProjects: "بازگشت به پروژه‌ها",
    },
    files: {
      upload: "بارگذاری فایل",
      dropzone: "فایل‌ها را اینجا بکشید یا کلیک کنید",
      dropzoneActive: "رها کنید...",
      selectFiles: "انتخاب فایل",
      maxSize: "حداکثر حجم: {size}",
      allowedTypes:
        "فرمت‌های مجاز: PDF، تصاویر، Word، Excel، PowerPoint، TXT، CSV، JSON، XML",
      uploading: "در حال بارگذاری...",
      uploadSuccess: "فایل با موفقیت بارگذاری شد",
      uploadError: "نتوانستیم فایل را بارگذاری کنیم. دوباره تلاش کنید",
      deleteSuccess: "فایل حذف شد",
      deleteError: "نتوانستیم فایل را حذف کنیم. دوباره تلاش کنید",
      download: "دانلود",
      remove: "حذف",
      preview: "پیش‌نمایش",
      fileName: "نام فایل",
      fileSize: "حجم فایل",
      fileType: "نوع فایل",
      existingFiles: "فایل‌های موجود",
      addNewFiles: "افزودن فایل جدید",
      validation: {
        tooLarge: "فایل خیلی بزرگ است. حداکثر حجم: {max}",
        invalidType:
          "فرمت فایل «{fileName}» مجاز نیست. فرمت‌های مجاز: PDF، تصاویر، Word، Excel، PowerPoint، CSV، TXT، JSON، XML",
        uploadFailed: "بارگذاری فایل ناموفق بود. دوباره تلاش کنید",
        mimeTypeError:
          "فرمت فایل «{fileName}» نامعتبر است و قابل بارگذاری نیست",
        maxFiles: "حداکثر {maxFiles} فایل قابل بارگذاری است",
      },
    },
    errors: {
      notFound: "پروژه یافت نشد",
      projectNotFound: "پروژه یافت نشد",
    },
  },

  // Task management module
  tasks: {
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
      in_progress: "در حال انجام",
      pending: "در انتظار",
      review: "در حال بررسی",
      testing: "در حال تست",
      ready: "آماده",
      blocked: "مسدود شده",
      on_hold: "متوقف شده",
      done: "انجام شده",
      canceled: "لغو شده",
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
      status: "وضعیت",
      priority: "اولویت",
      assignee: "مسئول",
      date: "تاریخ",
      tag: "برچسب",
      allStatuses: "همه وضعیت‌ها",
      allPriorities: "همه اولویت‌ها",
      allAssignees: "همه مسئولین",
      allDates: "همه تاریخ‌ها",
      allTags: "همه برچسب‌ها",
      today: "امروز",
      thisWeek: "این هفته",
      thisMonth: "این ماه",
      overdue: "گذشته‌موعد",
      activeFilters: "فیلترهای فعال:",
      clearAll: "پاک کردن همه",
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
        today: "امروز",
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
      today: "امروز",
      previousMonth: "ماه قبل",
      nextMonth: "ماه بعد",
      tasksThisMonth: "تسک‌های این ماه",
      completedTasks: "انجام شده",
      pendingTasks: "در انتظار",
      overdueTasks: "گذشته‌موعد",
    },

    // Bulk actions
    bulkActions: {
      selectedCount: "{count} تسک انتخاب شده",
      assignPlaceholder: "اختصاص دادن",
      statusPlaceholder: "تغییر وضعیت",
      priorityPlaceholder: "تغییر اولویت",
      deleteButton: "حذف",
      deleteDialogTitle: "حذف {count} تسک؟",
      deleteDialogDescription:
        "این عملیات قابل بازگشت نیست. آیا مطمئن هستید که می‌خواهید این تسک‌ها را حذف کنید?",
      cancelButton: "انصراف",
      deletingButton: "در حال حذف...",
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
        creating: "در حال ساخت...",
        more: "بیشتر",
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
      descriptionCardTitle: "توضیحات",
      quickInfoCardTitle: "اطلاعات سریع",
      statusLabel: "وضعیت:",
      priorityLabel: "اولویت:",
      createdLabel: "ایجاد شده:",
      updatedLabel: "بروزرسانی:",
      actionsCardTitle: "عملیات",
      editTaskButton: "ویرایش وظیفه",
      deleteTaskButton: "حذف وظیفه",
      editButton: "ویرایش",
      timeTracking: {
        title: "زمان صرف شده",
        hours: "ساعت",
        minutes: "دقیقه",
        editTime: "ویرایش زمان",
        saveTime: "ذخیره",
        cancelEdit: "انصراف",
        noTimeTracked: "هنوز زمانی ثبت نشده",
        updateSuccess: "زمان به‌روزرسانی شد",
        updateError: "نتوانستیم زمان را به‌روزرسانی کنیم",
        invalidInput: "لطفاً ساعت و دقیقه را به درستی وارد کنید",
        exceedsEstimate:
          "زمان وارد شده از برآورد زمانی ({hours}h {minutes}m) بیشتر است",
      },
      buttons: {
        save: "ذخیره",
        saving: "در حال ذخیره...",
        cancel: "انصراف",
        delete: "حذف تسک",
        deleting: "در حال حذف...",
      },
    },

    // Edit task
    edit: {
      title: "ویرایش تسک",
      success: "تغییرات با موفقیت ذخیره شد",
      error: "نتوانستیم تغییرات را ذخیره کنیم: {error}",
      buttons: {
        save: "ذخیره",
        saving: "در حال ذخیره...",
        cancel: "انصراف",
      },
    },

    // Delete task
    delete: {
      title: "حذف تسک",
      description:
        "مطمئنید که می‌خواهید این تسک را حذف کنید؟ بعد از حذف، دیگر در فهرست‌ها نمایش داده نمی‌شود.",
      confirm: "بله، حذف کن",
      cancel: "انصراف",
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
  },

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
    completed: "تکمیل شده",
    inProgress: "در حال انجام",
    canceled: "لغو شده",
    high: "اولویت بالا",
    medium: "اولویت متوسط",
    low: "اولویت پایین",
    tasks: "تسک‌ها",
    projects: "پروژه‌ها",
    status: "وضعیت",
    priority: "اولویت",
    clearFilters: "پاک کردن فیلترها",
    completedTasks: "تکمیل شده",
    totalTasks: "کل تسک‌ها",
    inProgressTasks: "در حال انجام",
    noData: "داده‌ای برای نمایش نیست",
    noTasksFound: "تسکی پیدا نشد",
    project: "پروژه",
    taskStatus: "وضعیت",
    taskPriority: "اولویت",
    taskCompleted: "تکمیل شده",
    completionRate: "نرخ تکمیل",
    name: "نام",
    completedTasksCount: "تعداد تکمیل شده",
    todo: "برای انجام",
    pending: "در انتظار",
    blocked: "مسدود شده",
    review: "در حال بررسی",
    testing: "در حال تست",
    ready: "آماده",
    on_hold: "متوقف شده",
    deadline: "مهلت",
    age: "سن",
    ageUnit: "(روز)",
    assignee: "مسئول",
    assignee_plural: "مسئولین",
    tags: "برچسب‌ها",
    timePresets: {
      today: "امروز",
      last7Days: "۷ روز گذشته",
      last30Days: "۳۰ روز گذشته",
      currentQuarter: "سه‌ماهه جاری",
      currentYear: "سال جاری",
      custom: "سفارشی",
    },
    selectProjects: "انتخاب پروژه‌ها",
    selectAssignees: "انتخاب مسئولین",
    selectStatuses: "انتخاب وضعیت‌ها",
    selectPriorities: "انتخاب اولویت‌ها",
    to: "تا",
    topPerformers: "بهترین عملکردها",
    rank: "#",
    onTimeRate: "نرخ به‌موقعی",
    totalTasksCard: "کل تسک‌ها",
    overdue: "گذشته مهلت",
    onTime: "به‌موقع",
    noDeadline: "بدون مهلت",
    chart: {
      timeliness: {
        onTime: "به‌موقع",
        overdue: "گذشته مهلت",
        noDeadline: "بدون مهلت",
      },
    },
    fallbacks: {
      taskTitle: "بدون عنوان",
      projectName: "نامشخص",
      assigneeName: "بدون مسئول",
    },
    range: {
      connector: "تا",
      label: "بازه زمانی",
    },
    exportProject: "خروجی اکسل",
    exportingProject: "در حال خروجی...",
    exportProjectSuccess: "خروجی با موفقیت آماده شد",
    exportProjectError: "نتوانستیم خروجی بگیریم",
    exportProjectNoTasks:
      "این پروژه تسکی ندارد. آیا می‌خواهید فایل خالی خروجی بگیرید؟",
    exportProjectSuccessWithCount: "خروجی {count} تسک با موفقیت آماده شد",
    excel: {
      workbookTitle: "گزارش پروژه - {projectName}",
      workbookSubject: "تسک‌های پروژه {projectCode}",
      workbookAuthor: "سیستم مدیریت تسک",
      workbookComments: "صادر شده در تاریخ {date}",
      sheetProjectDetails: "جزئیات پروژه",
      sheetProjectTasks: "تسک‌های پروژه",
      columns: {
        name: "نام",
        code: "کد",
        description: "توضیحات",
        supervisor: "سرپرست",
        createdAt: "تاریخ ایجاد",
        updatedAt: "آخرین به‌روزرسانی",
        taskNumber: "شماره",
        taskTitle: "عنوان",
        taskStatus: "وضعیت",
        taskPriority: "اولویت",
        taskAssignee: "مسئول",
        taskDeadline: "مهلت",
        taskTimeSpent: "زمان صرف شده (دقیقه)",
        taskDescription: "توضیحات",
      },
      noTasksMessage: "این پروژه تسکی ندارد",
      fallbackProjectName: "بدون نام",
    },
    projectsExportSection: "خروجی پروژه‌ها",
    projectDetails: "جزئیات پروژه",
    projectTasks: "تسک‌های پروژه",
    noTasksInProject: "این پروژه تسکی ندارد",
    charts: {
      throughput: {
        title: "روند تکمیل تسک‌ها",
        periods: {
          daily: "روزانه",
          weekly: "هفتگی",
        },
        drilldownTitle: "تسک‌های تکمیل شده در {label}",
        noData: "داده‌ای برای این بازه وجود ندارد",
      },
      timeliness: {
        title: "توزیع به‌موقعی تکمیل",
        noData: "تکمیل ثبت‌شده‌ای برای این بازه وجود ندارد",
      },
      priorities: {
        title: "توزیع اولویت‌ها",
        drilldownTitle: "اولویت {name}",
        noData: "تسکی مطابق فیلترها پیدا نشد",
      },
      users: {
        drilldownTitle: "تسک‌های {firstName} {lastName}",
      },
      employee: {
        sectionTitle: "گزارش عملکرد کارکنان",
        overviewCards: {
          totalAssigned: "کل تخصیص‌یافته",
          completed: "تکمیل شده",
          inProgress: "در حال انجام",
          overdue: "گذشته‌موعد",
          avgTimeToComplete: "میانگین زمان تکمیل",
          efficiencyScore: "امتیاز کارایی",
          onTimeRate: "نرخ به‌موقعی",
          overtimeIndicator: "شاخص اضافه‌کاری",
        },
        productivityChart: {
          title: "روند بهره‌وری",
          periods: {
            daily: "روزانه",
            weekly: "هفتگی",
            monthly: "ماهانه",
            quarterly: "سه‌ماهه",
            annual: "سالانه",
          },
          drilldownTitle: "تسک‌های تکمیل شده در {label}",
          noData: "داده‌ای برای این بازه وجود ندارد",
        },
        performanceTable: {
          title: "عملکرد کارکنان",
          exportCsvComingSoon: "این ویژگی به زودی اضافه خواهد شد",
          columns: {
            name: "نام",
            totalAssigned: "کل تخصیص‌یافته",
            completed: "تکمیل شده",
            completionRate: "نرخ تکمیل",
            onTimeRate: "نرخ به‌موقعی",
            avgTimeToComplete: "میانگین زمان تکمیل",
            efficiencyScore: "امتیاز کارایی",
          },
          drilldownTitle: "تسک‌های {name}",
          noData: "داده‌ای برای نمایش نیست",
          searchPlaceholder: "جستجو بر اساس نام...",
          rowsPerPage: "ردیف در صفحه",
          exportCsv: "خروجی CSV",
        },
        comparisonChart: {
          title: "مقایسه با میانگین تیم",
          vsTeam: "در برابر میانگین تیم",
          noData: "داده‌ای برای مقایسه وجود ندارد",
        },
        emptyStates: {
          noEmployees: "کارمندی برای نمایش نیست",
          noData: "داده‌ای برای نمایش گزارش نیست",
          largeDataset:
            "داده‌های زیادی برای پردازش وجود دارد. لطفاً بازه زمانی را کوچکتر کنید",
        },
        tooltips: {
          totalAssigned:
            "تعداد کل تسک‌های تخصیص‌یافته در بازه زمانی انتخاب‌شده",
          completed: "تعداد تسک‌های تکمیل‌شده در بازه زمانی",
          completionRate: "نسبت تسک‌های تکمیل‌شده به کل تخصیص‌یافته",
          onTimeRate: "نسبت تسک‌های تکمیل‌شده به‌موقع به کل تکمیل‌شده",
          avgTimeToComplete: "میانگین زمان سپری‌شده از ساخت تا تکمیل تسک‌ها",
          efficiencyScore: "نسبت تسک‌های تکمیل‌شده به کل تخصیص‌یافته",
          overtimeIndicator: "برآورد ساعات اضافه‌کاری مورد نیاز",
        },
        overtimeAnalysis: {
          title: "تحلیل اضافه‌کاری و بار کاری",
          description: "بررسی الگوهای اضافه‌کاری و توزیع بار کاری",
          chartTitle: "شاخص‌های اضافه‌کاری",
          workloadChartTitle: "توزیع بار کاری",
          columns: {
            name: "نام",
            totalTasks: "کل تسک‌ها",
            completedTasks: "تکمیل شده",
            overdueTasks: "گذشته‌موعد",
            avgCompletionTime: "میانگین زمان تکمیل",
            workloadScore: "امتیاز بار کاری",
            overtimeIndicator: "شاخص اضافه‌کاری",
            activeTasks: "تسک‌های فعال",
            upcomingTasks: "تسک‌های پیش رو",
            capacityUtilization: "استفاده از ظرفیت",
            workloadLevel: "سطح بار کاری",
          },
          workloadLevels: {
            low: "کم",
            medium: "متوسط",
            high: "زیاد",
            critical: "بحرانی",
          },
          tooltips: {
            workloadScore:
              "امتیاز بار کاری بر اساس تسک‌های فعال، گذشته‌موعد و نرخ تکمیل",
            overtimeIndicator: "برآورد ساعات اضافه‌کاری مورد نیاز",
            capacityUtilization: "درصد استفاده از ظرفیت کاری",
            workloadLevel: "سطح بار کاری بر اساس استفاده از ظرفیت",
          },
          noData: "داده‌ای برای تحلیل وجود ندارد",
        },
        productivityTrends: {
          title: "روندهای بهره‌وری",
          description: "تحلیل روندهای بهره‌وری با پیش‌بینی",
          chartTitle: "روند بهره‌وری با پیش‌بینی",
          trendLabels: {
            increasing: "افزایشی",
            decreasing: "کاهشی",
            stable: "پایدار",
          },
          projectedNextPeriod: "پیش‌بینی دوره بعدی",
          noData: "داده‌ای برای تحلیل روندها وجود ندارد",
        },
      },
    },
  },

  // Dashboard module
  dashboard: {
    taskStatus: "وضعیت تسک‌ها",
    title: "داشبورد",
    newTask: "تسک جدید",
    taskShort: "تسک",
    projectSummary: "خلاصه پروژه‌ها",
    recentTasks: "تسک‌های اخیر",
    overdueTasks: "گذشته‌موعد",
    quickActions: "اقدامات سریع",
    viewAllTasks: "مشاهده همه تسک‌ها",
    manageProjects: "مدیریت پروژه‌ها",
    viewReports: "مشاهده گزارش‌ها",
    tasksCompleted: "٪{percentage} تکمیل شده",
    of: "از",
    stats: {
      totalTasks: "کل تسک‌ها",
      completed: "تکمیل شده",
      inProgress: "در حال انجام",
      pending: "در انتظار",
      overdue: "گذشته‌موعد",
    },
    chart: {
      count: "تعداد",
    },
    fallbacks: {
      noDate: "بدون تاریخ",
      noDeadline: "ندارد",
    },
    welcome: {
      employee: "خوش آمدید {firstName} {lastName} عزیز!",
      supervisor: "خوش آمدید سرپرست {firstName} {lastName}!",
      admin: "خوش آمدید ادمین {firstName} {lastName}!",
      employeeSubtitle: "وضعیت وظایف و پروژه‌های شما را مشاهده کنید",
      supervisorSubtitle: "وضعیت تیم و پروژه‌ها را نظارت کنید",
      adminSubtitle: "نمای کلی سیستم و گزارش‌ها را مشاهده کنید",
    },
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
      completed: "تکمیل شده",
      remaining: "باقی مانده",
      taskStatusDistribution: "توزیع وضعیت وظایف",
      productivityTrend: "روند بهره‌وری (۷ روز)",
      dayLabel: "روز: {label}",
      recentActivity: "فعالیت‌های اخیر",
      noProject: "بدون پروژه",
      noActivityFound: "فعالیتی یافت نشد",
      overdueTasks: "وظایف سررسید گذشته",
    },
  },

  // Project section
  project: {
    progress: "پیشرفت پروژه",
    completedTasks: "تسک تکمیل شده",
    tasks: "تسک‌ها",
    users: "کاربران",
    of: "از",
  },

  // Chart labels
  charts: {
    dateLabel: "تاریخ",
  },

  // Notification section
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

  // Task-related labels
  task: {
    editTask: "ویرایش تسک {title}",
    completedTasks: "تکمیل شده",
    sortByPriority: "مرتب‌سازی بر اساس اولویت",
    newTask: "تسک جدید",
    newTaskForProject: "تسک جدید برای این پروژه",
    addNewTask: "افزودن تسک جدید",
    moreOptions: "گزینه‌های بیشتر",
    sortByDate: "مرتب‌سازی بر اساس تاریخ",
    showCompletedTasks: "نمایش تکمیل شده‌ها",
    // Time tracking
    logTime: "ثبت زمان",
    timeSpent: "زمان صرف شده",
    estimatedHours: "ساعت برآورد",
    estimatedMinutes: "دقیقه برآورد",
    hours: "ساعت",
    minutes: "دقیقه",
    hour: "ساعت",
    min: "دقیقه",
    quickAdd: "افزودن سریع",
    addTime: "افزودن زمان",
    editTime: "ویرایش زمان",
    noTimeLogged: "زمانی ثبت نشده",
  },

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
      edit: "ویرایش",
      delete: "حذف",
      deleting: "در حال حذف...",
      editPlaceholder: "ویرایش نظر...",
      saving: "در حال ذخیره...",
      save: "ذخیره",
      cancel: "انصراف",
      edited: "· ویرایش شده",
    },
  },

  // Help documentation
  helps,

  // Loading states
  loading: {
    application: "در حال بارگذاری...",
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

  // 404 page
  notFound: {
    title: "404",
    message: "صفحه‌ای که دنبالش می‌گردید پیدا نشد",
  },

  // My Tasks page
  myTasks: {
    title: "تسک‌های من",
    description: "همه تسک‌های اختصاص داده شده به شما",
    tabs: {
      active: "فعال",
      completed: "انجام شده",
      byProject: "بر اساس پروژه",
    },
    stats: {
      active: "فعال",
      completed: "انجام شده",
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
    loading: "در حال بارگذاری...",
    noTags: "هیچ برچسبی وجود ندارد",
    noTagsDescription: "برچسب ایجاد کنید تا بتوانید تسک‌ها را دسته‌بندی کنید",
    createFirstTag: "ایجاد اولین برچسب",
    namePlaceholder: "نام برچسب را وارد کنید...",
    colorLabel: "رنگ",
    nameLabel: "نام",
    actionsLabel: "عملیات",
    editButton: "ویرایش",
    deleteButton: "حذف",
    cancelButton: "انصراف",
    saveButton: "ذخیره",
    createButton: "ایجاد",
    tagsList: "لیست برچسب‌ها",
    tagsCount: "{count} برچسب",
    deleteConfirm: {
      title: "حذف برچسب؟",
      description:
        "آیا مطمئن هستید که می‌خواهید این برچسب را حذف کنید؟ این عمل قابل بازگشت نیست.",
      cancel: "انصراف",
      confirm: "حذف",
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
        updateError: "خطا",
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
        passwordError: "خطا",
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
