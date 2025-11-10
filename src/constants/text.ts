// Optimized localization constants for Persian (Farsi)
// This file contains all text labels used throughout the task management application
// All text has been rewritten to be natural, concise, motivating, and user-friendly

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
  },

  // Navigation menu items
  navigation: {
    allTasks: "همه تسک‌ها",
    dashboard: "داشبورد",
    projects: "پروژه‌ها",
    tasks: "تسک‌ها",
    users: "کاربران",
    reports: "گزارش‌ها",
    helps: "راهنما",
    settings: "تنظیمات",
    notifications: "اعلان‌ها",
    quickCreate: {
      button: "ایجاد سریع",
      tooltip: "ایجاد سریع تسک یا پروژه",
    },
    projectsSection: "پروژه‌ها",
    allProjects: "همه پروژه‌ها",
    recentProjects: "پروژه‌های اخیر",
    starredProjects: "پروژه‌های نشان‌شده",
    taskViews: "نماهای تسک",
    myTasks: "تسک‌های من",
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
        invalidCredentials: "نام کاربری یا رمز عبور اشتباه است. دوباره تلاش کنید",
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
      initialAdminMessage:
        "برای شروع، حساب مدیر سیستم را بسازید. نام کاربری و رمز عبور دلخواهتان را وارد کنید.",
      errors: {
        credentialsRequired: "لطفاً نام کاربری و رمز عبور را وارد کنید",
        passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
        adminCreationFailed: "متأسفانه نتوانستیم حساب مدیر را بسازیم. دوباره تلاش کنید",
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
      userAlreadyExists: "این نام کاربری قبلاً استفاده شده. نام دیگری انتخاب کنید",
      invalidCredentials: "نام کاربری یا رمز عبور اشتباه است",
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
        actions: "عملیات",
      },
      roles: {
        admin: "مدیر",
        supervisor: "سرپرست",
        employee: "کارمند",
      },
    },
    form: {
      firstName: "نام",
      lastName: "نام خانوادگی",
      selectRole: "انتخاب نقش",
      password: "رمز عبور",
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
    },
  },

  // Projects module
  projects: {
    title: "پروژه‌ها",
    projectTasks: "تسک‌های پروژه",
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
      },
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
      noTasksYetDescription:
        "اولین تسکتان را بسازید و کار را شروع کنید",
      projectNoTasksYet: "این پروژه هنوز تسکی ندارد",
      projectNoTasksYetDescription:
        "اولین تسک را برای پروژه «{projectName}» بسازید",
      createFirstTask: "ساخت اولین تسک",
      noTasksWithFilters: "با این فیلترها تسکی پیدا نشد",
      loadingTasks: "در حال بارگذاری تسک‌ها...",
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
      status: "وضعیت",
      priority: "اولویت",
      assignee: "مسئول",
      unassigned: "بدون مسئول",
      selectProject: "انتخاب پروژه",
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
  },

  // Reports module
  reports: {
    title: "گزارش‌ها",
    dashboardTitle: "گزارش‌ها",
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
          avgTimeToComplete:
            "میانگین زمان سپری‌شده از ساخت تا تکمیل تسک‌ها",
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
  helps: {
    title: "راهنما",
    description: "راهنمای کامل استفاده از سیستم مدیریت تسک‌ها",
    buttons: {
      faq: "سوالات متداول",
      support: "تماس با پشتیبانی",
    },
    content: {
      dashboard: "داشبورد اصلی آمار و اطلاعات کلی را نمایش می‌دهد",
      gettingStarted: {
        title: "شروع کار",
        steps: {
          title: "مراحل شروع",
          login: {
            label: "ورود به سیستم",
            description: "با نام کاربری و رمز عبورتان وارد شوید",
          },
          dashboard: {
            label: "آشنایی با داشبورد",
            description: "داشبورد اصلی آمار و اطلاعات کلی را نمایش می‌دهد",
          },
          createProject: {
            label: "ساخت اولین پروژه",
            description: "از بخش پروژه‌ها، پروژه جدیدی بسازید",
          },
          addMembers: {
            label: "افزودن اعضا",
            description: "کاربران را به پروژه اضافه کنید",
          },
          createTasks: {
            label: "ساخت تسک‌ها",
            description: "تسک‌های کاری را تعریف و تخصیص دهید",
          },
        },
        keyboardShortcuts: {
          title: "کلیدهای میانبر",
          focusSearch: "فوکوس روی جستجو",
          newTask: "تسک جدید",
          projects: "پروژه‌ها",
          dashboard: "داشبورد",
        },
      },
      features: {
        title: "امکانات",
        userManagement: {
          title: "مدیریت کاربران",
          items: [
            "ساخت و مدیریت کاربران با نقش‌های مختلف",
            "تعیین دسترسی‌های کاربران",
            "مدیریت عضویت کاربران در پروژه‌ها",
            "تغییر نقش کاربران توسط مدیران",
            "امکان تغییر اطلاعات شخصی توسط خود کاربر",
          ],
        },
        projectManagement: {
          title: "مدیریت پروژه‌ها",
          items: [
            "ساخت و مدیریت پروژه‌های مختلف",
            "تعیین سرپرست و اعضای پروژه",
            "مشاهده وضعیت کلی پروژه",
            "دسته‌بندی و مدیریت تسک‌ها",
            "نمایش آمار و وضعیت پیشرفت",
            "مدیریت دسترسی اعضا",
          ],
        },
        taskManagement: {
          title: "مدیریت تسک‌ها",
          items: [
            "ساخت و مدیریت تسک‌ها با جزئیات کامل",
            "تعیین اولویت و وضعیت",
            "اختصاص تسک به کاربران",
            "تعیین مهلت انجام",
            "دسته‌بندی بر اساس وضعیت",
            "شماره‌گذاری خودکار (مثال: PRJ-001)",
            "امکان فیلتر بر اساس وضعیت و اولویت",
          ],
        },
        ui: {
          title: "رابط کاربری",
          items: [
            "طراحی ساده و کاربرپسند",
            "دسترسی سریع به بخش‌های مختلف",
            "نمایش اطلاعات به صورت سازمان‌یافته",
            "نمایش اعلان‌های سیستمی",
          ],
        },
      },
      roles: {
        title: "نقش‌ها و دسترسی‌ها",
        admin: {
          title: "مدیر سیستم",
          items: [
            "دسترسی کامل به تمام بخش‌ها",
            "ساخت، ویرایش و حذف کاربران",
            "مشاهده همه پروژه‌ها",
            "ساخت، ویرایش و حذف تمام تسک‌ها",
            "مدیریت دسترسی‌های کاربران",
            "تغییر نقش کاربران",
          ],
        },
        supervisor: {
          title: "سرپرست",
          items: [
            "ساخت و مدیریت پروژه‌های خود",
            "اضافه کردن کاربران به پروژه‌های تحت نظارت",
            "ساخت و مدیریت تسک‌ها در پروژه‌های تحت نظارت",
            "مشاهده و ویرایش اطلاعات کاربران پروژه",
            "تعیین وضعیت و اولویت تسک‌ها",
            "مشاهده گزارش عملکرد اعضا",
            "تعیین مهلت زمانی برای تسک‌ها",
          ],
        },
        employee: {
          title: "کارمند",
          items: [
            "مشاهده پروژه‌هایی که عضو است",
            "مشاهده و ویرایش تسک‌های اختصاص داده شده",
            "به‌روزرسانی وضعیت تسک‌های خود",
            "مشاهده سایر اعضای پروژه",
            "دریافت اعلان‌های مربوط به تسک‌های خود",
            "مشاهده تاریخچه فعالیت‌های خود",
          ],
        },
      },
      projects: {
        title: "پروژه‌ها",
        about: {
          title: "درباره پروژه‌ها",
          description:
            "پروژه‌ها واحدهای اصلی سازماندهی کار هستند. هر پروژه شامل:",
          items: [
            "نام پروژه",
            "کد پروژه",
            "سرپرست پروژه",
            "اعضای پروژه",
            "مجموعه‌ای از تسک‌ها",
            "تاریخ ساخت و آخرین تغییر",
          ],
        },
        createEdit: {
          title: "ساخت و ویرایش پروژه",
          description: "برای ساخت پروژه جدید:",
          steps: [
            'به بخش "پروژه‌ها" بروید',
            'روی دکمه "پروژه جدید" کلیک کنید',
            "نام پروژه را وارد کنید",
            "کد پروژه را وارد کنید",
            'دکمه "ساخت پروژه" را بزنید',
          ],
          afterCreate: "بعد از ساخت پروژه می‌توانید:",
          afterSteps: [
            "اعضای پروژه را اضافه کنید",
            "تسک‌های جدید بسازید",
            "وضعیت کلی پروژه را ببینید",
            "گزارش‌های پیشرفت را بررسی کنید",
          ],
        },
        members: {
          title: "مدیریت اعضا",
          items: [
            "افزودن کاربران جدید",
            "حذف کاربران",
            "مشاهده لیست اعضای فعلی",
            "تعیین دسترسی‌های اعضا",
          ],
        },
        access: {
          title: "دسترسی به پروژه‌ها",
          items: [
            "مدیران: دسترسی به تمام پروژه‌ها",
            "سرپرستان: دسترسی به پروژه‌های تحت نظارت",
            "کارمندان: دسترسی به پروژه‌هایی که عضو هستند",
          ],
        },
      },
      tasks: {
        title: "تسک‌ها",
        about: {
          title: "درباره تسک‌ها",
          description: "تسک‌ها واحدهای کاری در هر پروژه هستند. هر تسک شامل:",
          items: [
            "عنوان و توضیحات",
            "شماره منحصر به فرد (مثال: PRJ-001)",
            "وضعیت (برای انجام، در حال انجام، در انتظار، انجام شده، لغو شده و سایر)",
            "اولویت (فوری، بالا، متوسط، پایین)",
            "مسئول انجام",
            "مهلت انجام",
          ],
        },
        statuses: {
          title: "وضعیت‌های تسک",
          todo: "برای انجام: تسک‌های جدید که هنوز شروع نشده‌اند",
          inProgress:
            "در حال انجام: تسک‌هایی که در حال حاضر روی آن‌ها کار می‌شود",
          pending:
            "در انتظار: تسک‌هایی که نیازمند تأیید یا پیش‌شرط دیگری هستند",
          review:
            "در حال بررسی: تسک‌هایی که برای بازبینی یا تأیید ارسال شده‌اند",
          testing: "در حال تست: تسک‌هایی که در مرحله آزمایش قرار دارند",
          ready: "آماده: تسک‌هایی که آماده تحویل یا اجرا هستند",
          blocked:
            "مسدود شده: تسک‌هایی که به دلیل مانع یا وابستگی متوقف شده‌اند",
          onHold: "متوقف شده: تسک‌هایی که موقتاً نگه داشته شده‌اند",
          done: "انجام شده: تسک‌های تکمیل شده",
          canceled: "لغو شده: تسک‌هایی که به هر دلیلی لغو شده‌اند",
        },
        priorities: {
          title: "اولویت‌های تسک",
          urgent: "فوری: نیاز به رسیدگی فوری دارد",
          high: "بالا: اولویت بالا برای انجام",
          medium: "متوسط: اولویت معمولی",
          low: "پایین: می‌تواند با تأخیر انجام شود",
        },
        createEdit: {
          title: "ساخت و ویرایش تسک",
          description: "برای ساخت تسک جدید:",
          steps: [
            'وارد پروژه مورد نظر شوید یا از بخش "تسک‌ها" استفاده کنید',
            'روی دکمه "افزودن تسک" یا دکمه "+" کلیک کنید',
            "عنوان و توضیحات را وارد کنید",
            "اولویت و وضعیت را تعیین کنید",
            "مسئول انجام را مشخص کنید",
            "در صورت نیاز، مهلت انجام را تعیین کنید",
            'دکمه "ساخت تسک" را بزنید',
          ],
        },
        tips: {
          title: "نکات کاربردی",
          filterSearch: {
            title: "فیلتر و جستجو",
            description:
              "از فیلترهای پیشرفته برای یافتن تسک‌های مورد نظر استفاده کنید",
          },
          prioritization: {
            title: "اولویت‌بندی",
            description: "تسک‌های فوری را با اولویت بالا مشخص کنید",
          },
          deadlines: {
            title: "مهلت زمانی",
            description: "همیشه مهلت انجام را مشخص کنید تا تسک‌ها فراموش نشوند",
          },
          statusUpdates: {
            title: "به‌روزرسانی وضعیت",
            description: "وضعیت تسک‌ها را به طور منظم به‌روزرسانی کنید",
          },
        },
      },
      troubleshooting: {
        title: "راهنمای عیب‌یابی",
        problems: {
          title: "مشکلات رایج",
          login: {
            title: "نمی‌توانم وارد شوم",
            description:
              "نام کاربری و رمز عبورتان را بررسی کنید. اگر فراموش کرده‌اید، با مدیر سیستم تماس بگیرید",
          },
          noTasks: {
            title: "تسک‌ها نمایش داده نمی‌شوند",
            description:
              "فیلترهای اعمال شده را بررسی کنید و در صورت نیاز آن‌ها را پاک کنید",
          },
          cannotCreateTask: {
            title: "نمی‌توانم تسک جدید بسازم",
            description:
              "مطمئن شوید که به پروژه مورد نظر دسترسی دارید و نقش شما اجازه ساخت تسک را می‌دهد",
          },
          reportsNotLoading: {
            title: "گزارش‌ها بارگذاری نمی‌شوند",
            description:
              "اتصال اینترنتتان را بررسی کنید و صفحه را دوباره بارگذاری کنید",
          },
        },
        support: {
          title: "تماس با پشتیبانی",
          description:
            'اگر مشکلی دارید یا نیاز به راهنمایی بیشتر دارید، از طریق بخش "تماس با پشتیبانی" یا ایمیل با تیم فنی ارتباط برقرار کنید',
        },
      },
      system: {
        title: "ویژگی‌های پیشرفته",
        security: {
          title: "امنیت و دسترسی",
          items: [
            "احراز هویت امن کاربران",
            "کنترل دسترسی بر اساس نقش‌ها",
            "رمزگذاری داده‌های حساس",
            "ثبت فعالیت‌های کاربران",
          ],
        },
        ui: {
          title: "رابط کاربری",
          items: [
            "طراحی کاملاً واکنش‌گرا برای موبایل و دسکتاپ",
            "پشتیبانی از تم روشن و تاریک",
            "پشتیبانی کامل از زبان فارسی",
            "کلیدهای میانبر برای دسترسی سریع",
            "دسترسی‌پذیری کامل",
          ],
        },
        performance: {
          title: "کارایی و سرعت",
          items: [
            "بارگذاری سریع صفحات",
            "به‌روزرسانی خودکار اطلاعات",
            "ذخیره‌سازی محلی برای عملکرد بهتر",
            "همگام‌سازی در زمان واقعی",
          ],
        },
      },
    },
  },

  // Loading states
  loading: {
    application: "در حال بارگذاری...",
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
