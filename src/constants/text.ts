// Optimized localization constants for Persian (Farsi)
// This file contains all text labels used throughout the task management application

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

    // Common button labels
    buttons: {
      ok: "تایید",
      cancel: "انصراف",
      save: "ذخیره",
      delete: "حذف",
      edit: "ویرایش",
      create: "ایجاد",
      update: "به‌روزرسانی",
      close: "بستن",
      add: "افزودن",
      remove: "حذف",
      view: "مشاهده",
      search: "جستجو",
      filter: "فیلتر",
      clear: "پاک کردن",
      export: "صادر",
      import: "ورود",
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
      tooltip: "ایجاد فوری",
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
    placeholder: "جستجو...",
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
      logout: "خروج",
    },
  },

  // Notifications module
  notifications: {
    title: "اعلان‌ها",
    pageTitle: "صفحه اعلان‌ها",
    pageDescription: "مشاهده و مدیریت تمام اعلان‌های شما",
    markAllAsRead: "علامت‌گذاری همه به عنوان خوانده‌شده",
    clearAll: "حذف همه",
    noNotifications: "اعلان جدیدی وجود ندارد",
    emptyState: {
      title: "هیچ اعلانی وجود ندارد",
      description: "وقتی اعلان جدیدی دریافت کنید، اینجا نمایش داده خواهد شد",
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
      task_assigned: "تخصیص تسک",
      project_updated: "به‌روزرسانی پروژه",
      system: "سیستم",
      comment: "نظر",
    },
    actions: {
      markAsRead: "علامت‌گذاری به عنوان خوانده‌شده",
      delete: "حذف",
      viewAll: "مشاهده همه",
      clearRead: "حذف خوانده‌شده‌ها",
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
      markAsRead: "علامت‌گذاری به عنوان خوانده‌شده",
    },
    selected: "انتخاب شده",
    selectAll: "انتخاب همه",
    deselectAll: "لغو انتخاب همه",
    deleteSelected: "حذف انتخاب شده‌ها",
    cancel: "انصراف",
  },

  // Authentication module
  auth: {
    login: {
      title: "ورود",
      username: "نام کاربری",
      password: "رمز عبور",
      loginButton: "ورود",
      registerButton: "ثبت‌نام",
      errors: {
        credentialsRequired: "وارد کردن نام کاربری و رمز عبور الزامی است",
        invalidCredentials: "نام کاربری یا رمز عبور نادرست است",
      },
    },
    register: {
      title: "ثبت‌نام",
      username: "نام کاربری",
      password: "رمز عبور",
      confirmPassword: "تأیید رمز عبور",
      registerButton: "ثبت‌نام",
      loginButton: "بازگشت به ورود",
      initialAdminMessage:
        "برای ایجاد ادمین اولیه، لطفاً نام کاربری و رمز عبور خود را وارد کنید.",
      errors: {
        credentialsRequired: "وارد کردن نام کاربری و رمز عبور الزامی است",
        passwordsMismatch: "رمزهای عبور مطابقت ندارند",
        adminCreationFailed: "خطا در ایجاد ادمین اولیه",
      },
    },
    errors: {
      usernameRequired: "وارد کردن نام کاربری الزامی است",
      passwordRequired: "رمز عبور باید حداقل ۸ کاراکتر باشد",
      passwordConfirmRequired: "وارد کردن تأیید رمز عبور الزامی است",
      passwordsMismatch: "رمزهای عبور مطابقت ندارند",
      firstNameRequired: "وارد کردن نام الزامی است",
      lastNameRequired: "وارد کردن نام خانوادگی الزامی است",
      passwordMinLength: "رمز عبور باید حداقل 8 کاراکتر باشد",
      usernameMinLength: "نام کاربری باید حداقل 3 کاراکتر باشد",
      usernameMaxLength: "نام کاربری نمی‌تواند بیش از 50 کاراکتر باشد",
      passwordMaxLength: "رمز عبور نمی‌تواند بیش از 100 کاراکتر باشد",
      usernameInvalid: "نام کاربری نامعتبر است",
      passwordInvalid: "رمز عبور نامعتبر است",
      userAlreadyExists: "کاربری با این نام کاربری قبلاً وجود دارد",
      invalidCredentials: "نام کاربری یا رمز عبور نادرست است",
      serverError: "خطا در سرور. لطفاً دوباره تلاش کنید",
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
      title: "ایجاد کاربر جدید",
      success: "کاربر با موفقیت ایجاد شد",
      error: "خطا در ایجاد کاربر: {error}",
      errors: {
        usernameRequired: "وارد کردن نام کاربری الزامی است",
        passwordRequired: "رمز عبور باید حداقل ۸ کاراکتر باشد",
        passwordConfirmRequired: "وارد کردن تأیید رمز عبور الزامی است",
        passwordsMismatch: "رمزهای عبور مطابقت ندارند",
      },
    },
    edit: {
      title: "ویرایش کاربر",
      button: "به‌روزرسانی",
    },
    delete: {
      title: "حذف کاربر",
      description: "آیا از حذف این کاربر اطمینان دارید؟",
      button: "حذف",
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
      title: "کاربران پروژه",
      count: "کاربر",
      add: "افزودن کاربر",
      addDialog: {
        title: "افزودن کاربر به پروژه",
        selectPlaceholder: "انتخاب کاربر",
      },
      table: {
        user: "کاربر",
        role: "نقش",
        actions: "عملیات",
      },
      remove: {
        title: "حذف کاربر از پروژه",
        description:
          "آیا از حذف این کاربر اطمینان دارید؟ تسک‌های تخصیص داده شده به این کاربر بدون مسئول خواهند شد ولی تسک‌ها حفظ می‌شوند.",
      },
      addSuccess: "کاربر با موفقیت به پروژه اضافه شد",
      addError: "خطا در افزودن کاربر به پروژه",
      removeSuccess: "کاربر با موفقیت از پروژه حذف شد",
      removeError: "خطا در حذف کاربر از پروژه",
    },
    list: {
      noProjects: "هیچ پروژه‌ای موجود نیست",
      count: "{count} پروژه",
      viewTasks: "مشاهده تسک‌ها",
    },
    create: {
      button: "پروژه جدید",
      title: "ایجاد پروژه جدید",
      description: "یک پروژه جدید به فضای کاری خود اضافه کنید.",
      form: {
        name: "نام",
        nameRequired: "وارد کردن نام الزامی است",
        code: "کد",
        codeLength: "کد باید 3 کاراکتر باشد",
        description: "توضیحات",
        descriptionPlaceholder: "توضیحات و جزئیات پروژه را وارد کنید...",
        assets: "فایل‌های پیوست",
        assetsPlaceholder: "فایل‌های مرتبط با پروژه را بارگذاری کنید",
        supervisor: "سرپرست",
        selectSupervisor: "انتخاب سرپرست",
      },
      submit: "ایجاد پروژه",
      success: "پروژه با موفقیت ایجاد شد",
      error: "خطا در ایجاد پروژه: {error}",
    },
    edit: {
      title: "ویرایش پروژه",
      description: "جزئیات پروژه را به‌روزرسانی کنید.",
      submit: "به‌روزرسانی پروژه",
      success: "پروژه با موفقیت به‌روزرسانی شد",
      error: "خطا در به‌روزرسانی پروژه: {error}",
      fileValidationError:
        "برخی از فایل‌ها قابل بارگذاری نیستند. لطفاً نوع فایل‌ها را بررسی کنید.",
    },
    delete: {
      title: "حذف پروژه",
      confirm:
        "آیا از حذف این پروژه اطمینان دارید؟ با حذف پروژه، تمامی تسک های مربوط به آن نیز حذف خواهند شد.",
      submit: "حذف پروژه",
      success: "پروژه با موفقیت حذف شد",
      error: "خطا در حذف پروژه: {error}",
    },
    details: {
      title: "جزئیات پروژه",
      viewDetails: "مشاهده جزئیات",
      information: "اطلاعات",
      supervisor: "سرپرست",
      createdAt: "تاریخ ایجاد",
      updatedAt: "آخرین به‌روزرسانی",
      description: "توضیحات",
      noDescription: "توضیحاتی برای این پروژه ثبت نشده است.",
      files: "فایل‌های پیوست",
      filesCount: "{count} فایل",
      noFiles: "فایلی برای این پروژه بارگذاری نشده است.",
      statistics: "آمار",
      totalTasks: "تعداد تسک‌ها",
      completedTasks: "تسک‌های تکمیل‌شده",
      inProgressTasks: "تسک‌های در حال انجام",
      totalTimeSpent: "کل زمان صرف شده",
      backToProjects: "بازگشت به پروژه‌ها",
    },
    files: {
      upload: "بارگذاری فایل",
      dropzone: "فایل‌ها را اینجا بکشید یا کلیک کنید",
      dropzoneActive: "فایل‌ها را اینجا رها کنید...",
      selectFiles: "انتخاب فایل‌ها",
      maxSize: "حداکثر حجم: {size}",
      allowedTypes:
        "فرمت‌های مجاز: PDF, تصاویر, اسناد Word/Excel/PowerPoint, فایل‌های متنی (TXT, CSV, JSON, XML)",
      uploading: "در حال بارگذاری...",
      uploadSuccess: "فایل با موفقیت بارگذاری شد",
      uploadError: "خطا در بارگذاری فایل",
      deleteSuccess: "فایل با موفقیت حذف شد",
      deleteError: "خطا در حذف فایل",
      download: "دانلود",
      remove: "حذف",
      preview: "پیش‌نمایش",
      fileName: "نام فایل",
      fileSize: "حجم فایل",
      fileType: "نوع فایل",
      existingFiles: "فایل‌های موجود",
      addNewFiles: "افزودن فایل‌های جدید",
      validation: {
        tooLarge: "حجم فایل بیش از حد مجاز است (حداکثر {max})",
        invalidType:
          "نوع فایل '{fileName}' مجاز نیست. فرمت‌های مجاز: PDF, تصاویر, Word, Excel, PowerPoint, CSV, TXT, JSON, XML",
        uploadFailed: "بارگذاری فایل با خطا مواجه شد",
        mimeTypeError:
          "فایل '{fileName}' دارای فرمت نامعتبر است و قابل بارگذاری نیست",
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
      done: "انجام‌شده",
      canceled: "لغوشده",
    },

    // Task tags
    tags: {
      bug: "اشکال",
      feature: "ویژگی",
      improvement: "بهبود",
    },

    // Filter options
    filters: {
      search: "جستجو بر اساس عنوان تسک...",
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
      searchByTitleOrAssignee: "جستجو بر اساس عنوان یا مسئول تسک...",
      advancedFilters: "فیلترهای پیشرفته:",
      clearFilters: "پاک کردن فیلترها",
      labels: {
        search: "جستجو:",
        status: "وضعیت:",
        priority: "اولویت:",
        assignee: "مسئول:",
        date: "تاریخ:",
        tag: "برچسب:",
      },
      dateLabels: {
        today: "امروز",
        week: "این هفته",
        month: "این ماه",
        overdue: "گذشته‌موعد",
      },
      moreFilters: "{count} دیگر",
    },

    // Empty state messages
    emptyState: {
      noTasksFound: "هیچ تسکی پیدا نشد",
      noTasksFoundDescription:
        "با فیلترهای فعلی هیچ تسکی مطابقت ندارد. لطفاً فیلترها را تغییر دهید یا پاک کنید.",
      noTasksInProject: "هیچ تسکی در این پروژه پیدا نشد",
      noTasksInProjectDescription:
        "با فیلترهای فعلی هیچ تسکی در پروژه «{projectName}» مطابقت ندارد.",
      noTasksYet: "هنوز تسکی وجود ندارد",
      noTasksYetDescription:
        "اولین تسک خود را ایجاد کنید تا مدیریت کارها را شروع کنید.",
      projectNoTasksYet: "این پروژه هنوز تسکی ندارد",
      projectNoTasksYetDescription:
        "اولین تسک را برای پروژه «{projectName}» ایجاد کنید.",
      createFirstTask: "ایجاد اولین تسک",
      noTasksWithFilters: "هیچ تسکی با فیلترهای فعلی مطابقت ندارد.",
      loadingTasks: "در حال بارگذاری تسک‌ها...",
    },

    // Header section
    header: {
      tasksFound: "{count} تسک پیدا شد",
      manageTasks: "مدیریت و پیگیری تسک‌های خود",
      tasksInProject: "{count} تسک در این پروژه",
      manageProjectTasks: "مدیریت تسک‌های این پروژه",
    },

    // Add task dialog
    addTask: {
      title: "افزودن تسک",
      issueTitle: "عنوان تسک",
      description: "توضیحات تسک",
      status: "وضعیت",
      priority: "اولویت",
      assignee: "مسئول",
      unassigned: "اختصاص‌نیافته",
      selectProject: "انتخاب پروژه",
      success: "تسک با موفقیت ایجاد شد",
      error: "خطا در ایجاد تسک: {error}",
      buttons: {
        create: "ایجاد",
        creating: "در حال ایجاد...",
        more: "بیشتر",
        newTask: "تسک جدید",
        newTaskForProject: "تسک جدید برای این پروژه",
      },
    },

    // Task list
    list: {
      noTasks: "هیچ تسک‌ای موجود نیست",
      openMenu: "باز کردن منو",
    },

    // Task details
    details: {
      title: "جزئیات تسک",
      unknownUser: "کاربر ناشناس",
      unknownProject: "پروژه نامشخص",
      timeTracking: {
        title: "زمان صرف شده",
        hours: "ساعت",
        minutes: "دقیقه",
        editTime: "ویرایش زمان",
        saveTime: "ذخیره زمان",
        cancelEdit: "انصراف",
        noTimeTracked: "هنوز زمانی ثبت نشده",
        updateSuccess: "زمان با موفقیت به‌روزرسانی شد",
        updateError: "خطا در به‌روزرسانی زمان",
        invalidInput: "لطفاً مقدار معتبر برای ساعت و دقیقه وارد کنید",
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
      success: "تسک با موفقیت به‌روزرسانی شد",
      error: "خطا در به‌روزرسانی تسک: {error}",
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
        "آیا از حذف این تسک اطمینان دارید؟ پس از حذف، این تسک دیگر در فهرست‌ها نمایش داده نخواهد شد.",
      confirm: "حذف تسک",
      cancel: "انصراف",
      success: "تسک با موفقیت حذف شد",
      error: "خطا در حذف تسک: {error}",
    },
  },

  // Reports module
  reports: {
    title: "گزارش‌ها",
    dashboardTitle: "داشبورد گزارشات",
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
    completedTasks: "تسک‌های تکمیل شده",
    totalTasks: "کل تسک‌ها",
    inProgressTasks: "در حال انجام",
    noData: "هیچ داده‌ای برای نمایش وجود ندارد",
    noTasksFound: "هیچ تسکی یافت نشد",
    project: "پروژه",
    taskStatus: "وضعیت",
    taskPriority: "اولویت",
    taskCompleted: "تکمیل شده",
    completionRate: "نرخ تکمیل",
    name: "نام",
    completedTasksCount: "تعداد تسک‌های تکمیل شده",
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
    assignee: "مجری",
    assignee_plural: "مجریان",
    tags: "برچسب‌ها",
    timePresets: {
      today: "امروز",
      last7Days: "۷ روز گذشته",
      last30Days: "۳۰ روز گذشته",
      currentQuarter: "ربع جاری",
      currentYear: "سال جاری",
      custom: "سفارشی",
    },
    selectProjects: "انتخاب پروژه‌ها",
    selectAssignees: "انتخاب مجریان",
    selectStatuses: "انتخاب وضعیت‌ها",
    selectPriorities: "انتخاب اولویت‌ها",
    to: "تا",
    topPerformers: "برترین مجریان",
    rank: "#",
    onTimeRate: "نرخ به‌ موقع",
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
      assigneeName: "نامشخص",
    },
    range: {
      connector: "تا",
      label: "بازه زمانی:",
    },
    charts: {
      throughput: {
        title: "روند تکمیل تسک‌ها",
        periods: {
          daily: "روزانه",
          weekly: "هفتگی",
        },
        drilldownTitle: "تسک‌های تکمیل شده در {label}",
        noData: "داده‌ای برای نمایش روند تکمیل در این بازه وجود ندارد",
      },
      timeliness: {
        title: "توزیع به‌موقعی تکمیل",
        noData: "هیچ تکمیلِ ثبت‌شده‌ای برای این بازه وجود ندارد",
      },
      priorities: {
        title: "توزیع اولویت‌ها",
        drilldownTitle: "اولویت {name}",
        noData: "هیچ تسکی مطابق فیلترها برای نمایش اولویت‌ها نیست",
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
            quarterly: "ربع‌وار",
            annual: "سالانه",
          },
          drilldownTitle: "تسک‌های تکمیل شده در {label}",
          noData: "داده‌ای برای نمایش روند بهره‌وری در این بازه وجود ندارد",
        },
        performanceTable: {
          title: "جدول عملکرد کارکنان",
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
          noData: "هیچ داده‌ای برای نمایش عملکرد کارکنان وجود ندارد",
          searchPlaceholder: "جستجو بر اساس نام...",
          rowsPerPage: "ردیف در صفحه",
          exportCsv: "صادر به CSV",
        },
        comparisonChart: {
          title: "مقایسه با میانگین تیم",
          vsTeam: "در برابر میانگین تیم",
          noData: "داده‌ای برای مقایسه عملکرد وجود ندارد",
        },
        emptyStates: {
          noEmployees: "هیچ کارمندی برای نمایش گزارش وجود ندارد",
          noData: "هیچ داده‌ای برای نمایش گزارش عملکرد کارکنان وجود ندارد",
          largeDataset:
            "داده‌های زیادی برای پردازش وجود دارد. لطفاً بازه زمانی را محدود کنید.",
        },
        tooltips: {
          totalAssigned:
            "تعداد کل تسک‌های تخصیص‌یافته در بازه زمانی انتخاب‌شده",
          completed: "تعداد تسک‌های تکمیل‌شده در بازه زمانی",
          completionRate: "نسبت تسک‌های تکمیل‌شده به کل تخصیص‌یافته",
          onTimeRate: "نسبت تسک‌های تکمیل‌شده به‌موقع به کل تکمیل‌شده",
          avgTimeToComplete: "میانگین زمان سپری‌شده از ایجاد تا تکمیل تسک‌ها",
          efficiencyScore: "نسبت تسک‌های تکمیل‌شده به کل تخصیص‌یافته",
          overtimeIndicator: "شاخص تقریبی اضافه‌کاری بر اساس مهلت‌ها",
        },
        overtimeAnalysis: {
          title: "تحلیل اضافه‌کاری و بار کاری",
          description: "بررسی الگوهای اضافه‌کاری و توزیع بار کاری کارکنان",
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
          noData: "داده‌ای برای تحلیل اضافه‌کاری وجود ندارد",
        },
        productivityTrends: {
          title: "روندهای بهره‌وری",
          description: "تحلیل روندهای بهره‌وری با قابلیت پیش‌بینی",
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
    overdueTasks: "تسک‌های گذشته‌موعد",
    quickActions: "اقدامات سریع",
    viewAllTasks: "مشاهده همه تسک‌ها",
    manageProjects: "مدیریت پروژه‌ها",
    viewReports: "مشاهده گزارشات",
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
    dateLabel: "تاریخ:",
  },

  // Notification section
  notification: {
    new: "جدید",
    newNotifications: "اعلان‌های جدید اینجا نمایش داده خواهند شد",
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
    completedTasks: "تسک‌های تکمیل‌شده",
    sortByPriority: "مرتب‌سازی بر اساس اولویت",
    newTask: "تسک جدید",
    newTaskForProject: "تسک جدید برای این پروژه",
    addNewTask: "افزودن تسک جدید",
    moreOptions: "گزینه‌های بیشتر",
    sortByDate: "مرتب‌سازی بر اساس تاریخ",
    showCompletedTasks: "نمایش تسک‌های تکمیل‌شده",
  },

  // Comments module
  comments: {
    title: "نظرات",
    empty: {
      noComments: "هنوز نظری ثبت نشده است.",
      beFirst: "اولین نفری باشید که نظر می‌دهد!",
    },
    composer: {
      placeholder: "نظر خود را بنویسید...",
      placeholderDisabled: "برای ارسال نظر وارد شوید",
      send: "ارسال نظر",
    },
    item: {
      deleted: "نظر حذف شده است",
      actions: "اقدامات نظر",
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
    title: "راهنمای استفاده از سیستم",
    description: "راهنمای کامل برای استفاده از امکانات سیستم مدیریت تسک‌ها",
    buttons: {
      faq: "سوالات متداول",
      support: "تماس با پشتیبانی",
    },
    content: {
      dashboard: "داشبورد اصلی آمار و اطلاعات کلی را نمایش می‌دهد",
      gettingStarted: {
        title: "شروع کار با سیستم",
        steps: {
          title: "مراحل شروع کار",
          login: {
            label: "ورود به سیستم",
            description: "با نام کاربری و رمز عبور خود وارد شوید",
          },
          dashboard: {
            label: "آشنایی با داشبورد",
            description: "داشبورد اصلی آمار و اطلاعات کلی را نمایش می‌دهد",
          },
          createProject: {
            label: "ایجاد اولین پروژه",
            description: "از بخش پروژه‌ها، پروژه جدیدی ایجاد کنید",
          },
          addMembers: {
            label: "افزودن اعضا",
            description: "کاربران را به پروژه اضافه کنید",
          },
          createTasks: {
            label: "ایجاد تسک‌ها",
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
        title: "امکانات و ویژگی‌ها",
        userManagement: {
          title: "مدیریت کاربران",
          items: [
            "ایجاد و مدیریت کاربران با نقش‌های مختلف",
            "تعیین دسترسی‌های کاربران",
            "مدیریت عضویت کاربران در پروژه‌ها",
            "تغییر نقش کاربران توسط مدیران سیستم",
            "امکان تغییر اطلاعات شخصی توسط خود کاربر",
          ],
        },
        projectManagement: {
          title: "مدیریت پروژه‌ها",
          items: [
            "ایجاد و مدیریت پروژه‌های مختلف",
            "تعیین سرپرست و اعضای پروژه",
            "مشاهده وضعیت کلی پروژه",
            "دسته‌بندی و مدیریت تسک‌ها",
            "نمایش آمار و وضعیت پیشرفت پروژه",
            "مدیریت دسترسی اعضای پروژه",
          ],
        },
        taskManagement: {
          title: "مدیریت تسک‌ها",
          items: [
            "ایجاد و مدیریت تسک‌ها با جزئیات کامل",
            "تعیین اولویت و وضعیت تسک‌ها",
            "اختصاص تسک به کاربران",
            "تعیین مهلت انجام",
            "دسته‌بندی تسک‌ها بر اساس وضعیت",
            "شماره‌گذاری خودکار تسک‌ها (مثال: PRJ-001)",
            "امکان فیلتر تسک‌ها بر اساس وضعیت و اولویت",
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
        title: "نقش‌های کاربری و دسترسی‌ها",
        admin: {
          title: "مدیر سیستم (Admin)",
          items: [
            "دسترسی کامل به تمام بخش‌های سیستم",
            "ایجاد، ویرایش و حذف کاربران با هر نقشی",
            "نمایش همه پروژه‌ها",
            "ایجاد، ویرایش و حذف تمام تسک‌ها",
            "مدیریت دسترسی‌های کاربران به پروژه‌ها",
            "تغییر نقش کاربران",
          ],
        },
        supervisor: {
          title: "سرپرست (Supervisor)",
          items: [
            "ایجاد و مدیریت پروژه‌های خود",
            "اضافه کردن کاربران به پروژه‌های تحت نظارت",
            "ایجاد و مدیریت تسک‌ها در پروژه‌های تحت نظارت",
            "مشاهده و ویرایش اطلاعات کاربران پروژه‌های تحت نظارت",
            "تعیین وضعیت و اولویت تسک‌ها",
            "مشاهده گزارش عملکرد اعضای پروژه",
            "تعیین مهلت زمانی برای تسک‌ها",
          ],
        },
        employee: {
          title: "کارمند (Employee)",
          items: [
            "مشاهده پروژه‌هایی که در آن‌ها عضو است",
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
            "پروژه‌ها واحدهای اصلی سازماندهی کار در سیستم هستند. هر پروژه شامل:",
          items: [
            "نام پروژه",
            "کد پروژه",
            "سرپرست پروژه",
            "اعضای پروژه",
            "مجموعه‌ای از تسک‌ها",
            "تاریخ ایجاد و آخرین به‌روزرسانی",
          ],
        },
        createEdit: {
          title: "ایجاد و ویرایش پروژه",
          description: "برای ایجاد پروژه جدید:",
          steps: [
            'به بخش "پروژه‌ها" بروید',
            'روی دکمه "پروژه جدید" کلیک کنید',
            "نام پروژه را وارد کنید",
            "کد پروژه را وارد کنید (باید ۳ حرفی و با حروف بزرگ باشد)",
            'دکمه "ایجاد" را بزنید',
          ],
          afterCreate: "پس از ایجاد پروژه می‌توانید:",
          afterSteps: [
            "اعضای پروژه را اضافه کنید",
            "تسک‌های جدید ایجاد کنید",
            "وضعیت کلی پروژه را مشاهده کنید",
            "گزارش‌های پیشرفت را بررسی کنید",
          ],
        },
        members: {
          title: "مدیریت اعضای پروژه",
          items: [
            "افزودن کاربران جدید به پروژه",
            "حذف کاربران از پروژه",
            "مشاهده لیست اعضای فعلی",
            "تعیین دسترسی‌های اعضا",
          ],
        },
        access: {
          title: "دسترسی به پروژه‌ها",
          items: [
            "مدیران سیستم: دسترسی به تمام پروژه‌ها",
            "سرپرستان: دسترسی به پروژه‌های تحت نظارت خود",
            "کارمندان: دسترسی به پروژه‌هایی که در آن‌ها عضو هستند",
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
            "وضعیت (برای انجام، در حال انجام، در انتظار، انجام‌شده، لغوشده و سایر وضعیت‌های فعال)",
            "اولویت (فوری، بالا، متوسط، پایین)",
            "مسئول انجام",
            "مهلت انجام",
          ],
        },
        statuses: {
          title: "وضعیت‌های تسک",
          todo: "برای انجام (Todo): تسک‌های جدید که هنوز شروع نشده‌اند",
          inProgress:
            "در حال انجام (In Progress): تسک‌هایی که در حال حاضر روی آن‌ها کار می‌شود",
          pending:
            "در انتظار (Pending): تسک‌هایی که نیازمند تأیید یا پیش‌شرط دیگری هستند",
          review:
            "در حال بررسی (Review): تسک‌هایی که برای بازبینی یا تأیید ارسال شده‌اند",
          testing:
            "در حال تست (Testing): تسک‌هایی که در مرحله آزمایش قرار دارند",
          ready: "آماده (Ready): تسک‌هایی که آماده تحویل یا اجرا هستند",
          blocked:
            "مسدود شده (Blocked): تسک‌هایی که به دلیل مانع یا وابستگی متوقف شده‌اند",
          onHold: "متوقف شده (On Hold): تسک‌هایی که موقتاً نگه داشته شده‌اند",
          done: "انجام‌شده (Done): تسک‌های تکمیل شده",
          canceled: "لغوشده (Canceled): تسک‌هایی که به هر دلیلی لغو شده‌اند",
        },
        priorities: {
          title: "اولویت‌های تسک",
          urgent: "فوری (Urgent): نیاز به رسیدگی فوری دارد",
          high: "بالا (High): اولویت بالا برای انجام",
          medium: "متوسط (Medium): اولویت معمولی",
          low: "پایین (Low): می‌تواند با تأخیر انجام شود",
        },
        createEdit: {
          title: "ایجاد و ویرایش تسک",
          description: "برای ایجاد تسک جدید:",
          steps: [
            'وارد پروژه مورد نظر شوید یا از بخش "تسک‌ها" استفاده کنید',
            'روی دکمه "افزودن تسک" یا دکمه "+" کلیک کنید',
            "عنوان و توضیحات تسک را وارد کنید",
            "اولویت و وضعیت را تعیین کنید",
            "مسئول انجام را مشخص کنید",
            "در صورت نیاز، مهلت انجام را تعیین کنید",
            'دکمه "ایجاد" را بزنید',
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
            title: "نمی‌توانم وارد سیستم شوم",
            description:
              "نام کاربری و رمز عبور خود را بررسی کنید. در صورت فراموشی، با مدیر سیستم تماس بگیرید.",
          },
          noTasks: {
            title: "تسک‌ها نمایش داده نمی‌شوند",
            description:
              "فیلترهای اعمال شده را بررسی کنید و در صورت نیاز آنها را پاک کنید.",
          },
          cannotCreateTask: {
            title: "نمی‌توانم تسک جدیدی ایجاد کنم",
            description:
              "مطمئن شوید که به پروژه مورد نظر دسترسی دارید و نقش شما اجازه ایجاد تسک را می‌دهد.",
          },
          reportsNotLoading: {
            title: "گزارش‌ها بارگذاری نمی‌شوند",
            description:
              "اتصال اینترنت خود را بررسی کنید و صفحه را مجدداً بارگذاری کنید.",
          },
        },
        support: {
          title: "تماس با پشتیبانی",
          description:
            'در صورت بروز مشکل یا نیاز به راهنمایی بیشتر، از طریق بخش "تماس با پشتیبانی" یا ایمیل با تیم فنی ارتباط برقرار کنید.',
        },
      },
      system: {
        title: "ویژگی‌های پیشرفته سیستم",
        security: {
          title: "امنیت و دسترسی",
          items: [
            "احراز هویت امن کاربران",
            "کنترل دسترسی بر اساس نقش‌های کاربری",
            "رمزگذاری داده‌های حساس",
            "ثبت فعالیت‌های کاربران برای پیگیری",
          ],
        },
        ui: {
          title: "رابط کاربری هوشمند",
          items: [
            "طراحی کاملاً واکنش‌گرا برای موبایل و دسکتاپ",
            "پشتیبانی از تم روشن و تاریک",
            "پشتیبانی کامل از زبان فارسی",
            "کلیدهای میانبر برای دسترسی سریع",
            "دسترسی‌پذیری کامل برای کاربران کم‌توان",
          ],
        },
        performance: {
          title: "کارایی و سرعت",
          items: [
            "بارگذاری سریع صفحات و داده‌ها",
            "به‌روزرسانی خودکار اطلاعات",
            "ذخیره‌سازی محلی برای عملکرد بهتر",
            "همگام‌سازی داده‌ها در زمان واقعی",
          ],
        },
      },
    },
  },

  // Loading states
  loading: {
    application: "در حال بارگذاری برنامه...",
  },

  // Date picker
  datePicker: {
    placeholder: "تاریخ را انتخاب کنید",
  },

  // Error messages
  errors: {
    pageLoad: {
      login: "خطا در بارگذاری صفحه ورود",
      register: "خطا در بارگذاری صفحه ثبت نام",
      dashboard: "خطا در بارگذاری داشبورد",
      projects: "خطا در بارگذاری پروژه‌ها",
      tasks: "خطا در بارگذاری تسک‌ها",
      projectTasks: "خطا در بارگذاری تسک‌ها پروژه",
      users: "خطا در بارگذاری کاربران",
      projectUsers: "خطا در بارگذاری کاربران پروژه",
      reports: "خطا در بارگذاری گزارشات",
      helps: "خطا در بارگذاری راهنما",
      notifications: "خطا در بارگذاری اعلان‌ها",
      notFound: "صفحه یافت نشد",
    },
    boundary: {
      title: "مشکلی پیش آمده",
      description: "خطای غیرمنتظره‌ای رخ داده است. لطفاً دوباره تلاش کنید.",
      tryAgain: "تلاش مجدد",
      reloadPage: "بارگذاری مجدد صفحه",
    },
  },

  // 404 page
  notFound: {
    title: "404",
    message: "صفحه مورد نظر یافت نشد",
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
