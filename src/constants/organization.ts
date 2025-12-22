// Organization domain constants (users, groups, projects)

import { shared } from "./core";

// User management module constants
export const users = {
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
      group: "گروه",
      status: "وضعیت",
      accountStatus: "وضعیت حساب",
      failedAttempts: "تلاش ناموفق",
      actions: shared.actions,
    },
    roles: {
      admin: "ادمین",
      manager: "مدیر گروه",
      supervisor: "سرپرست",
      employee: "کارمند",
    },
    status: {
      active: shared.active,
      inactive: shared.inactive,
      blocked: "مسدود",
      ok: "عادی",
    },
  },
  form: {
    firstName: "نام",
    lastName: "نام خانوادگی",
    selectRole: "انتخاب نقش",
    password: "رمز عبور",
    group: shared.group,
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
    deleteError: "خطا در حذف کاربر",
  },
  bulk: {
    toggleActive: "تغییر وضعیت",
    unblock: "رفع مسدودی",
    delete: "حذف گروهی",
    deleteConfirm: "آیا از حذف {count} کاربر مطمئن هستید؟",
    updated: "عملیات گروهی انجام شد",
    deleted: "کاربران حذف شدند",
    error: "عملیات گروهی ناموفق بود",
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
      date: shared.date,
      time: shared.time,
      ip: "آی‌پی",
      status: shared.status,
      reason: "دلیل",
      client: "کلاینت",
    },
    status: {
      success: shared.success,
      failed: "ناموفق",
    },
    empty: "سوابقی یافت نشد",
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
    button: shared.confirm,
    success: "کاربر با موفقیت حذف شد",
    error: "نتوانستیم کاربر را حذف کنیم: {error}",
  },
  errors: {
    notFound: "کاربر یافت نشد",
  },
} as const;

// Groups module constants
export const groups = {
  title: "گروه‌ها",
  code: "کد گروه",
  create: {
    title: "ایجاد گروه جدید",
    button: "ایجاد گروه",
    description: "گروه جدیدی را برای مدیریت پروژه‌ها و کاربران ایجاد کنید",
    success: "گروه با موفقیت ایجاد شد",
    error: "نتوانستیم گروه را ایجاد کنیم",
    formDescription: "اطلاعات گروه را وارد کنید",
  },
  edit: {
    title: "ویرایش گروه",
    button: "ذخیره تغییرات",
    success: "گروه با موفقیت به‌روزرسانی شد",
    error: "نتوانستیم گروه را به‌روزرسانی کنیم",
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
    description: shared.description,
    descriptionPlaceholder: "توضیحات گروه (اختیاری)",
    manager: "مدیر گروه",
    selectManager: "انتخاب مدیر",
    managerModeLabel: "روش تعیین مدیر گروه",
    selectExisting: "انتخاب مدیر موجود",
    createNew: "ساخت مدیر جدید",
  },
  status: {
    active: shared.active,
    inactive: shared.inactive,
  },
  actions: {
    activate: "فعال‌سازی",
    deactivate: "غیرفعال‌سازی",
  },
  stats: {
    users: shared.user,
    projects: shared.project,
    tasks: shared.task,
  },
} as const;

// Projects module constants
export const projects = {
  title: "پروژه‌ها",
  projectTasks: "تسک‌های پروژه",
  activeTasks: "تسک‌های فعال",
  project: shared.project,
  fallbacks: {
    name: shared.project,
    thisProject: "این پروژه",
  },
  users: {
    title: "اعضای پروژه",
    count: shared.user,
    add: "افزودن عضو",
    addDialog: {
      title: "افزودن عضو به پروژه",
      selectPlaceholder: "کاربر را انتخاب کنید",
    },
    table: {
      user: shared.user,
      role: "نقش",
      actions: shared.actions,
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
      description: shared.description,
      descriptionPlaceholder: "درباره این پروژه بنویسید...",
      assets: "فایل‌های پیوست",
      assetsPlaceholder: "فایل‌های مرتبط را اینجا بکشید یا کلیک کنید",
      group: shared.group,
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
    submit: shared.confirm,
    success: "پروژه حذف شد",
    error: "نتوانستیم پروژه را حذف کنیم: {error}",
  },
  details: {
    title: "جزئیات پروژه",
    viewDetails: "مشاهده جزئیات",
    information: "اطلاعات",
    supervisor: "سرپرست",
    createdAt: shared.createdAt,
    updatedAt: shared.updatedAt,
    description: shared.description,
    noDescription: "هنوز توضیحاتی برای این پروژه نوشته نشده",
    files: "فایل‌های پیوست",
    filesCount: "{count} فایل",
    noFiles: "هنوز فایلی بارگذاری نشده",
    statistics: "آمار",
    totalTasks: "تعداد تسک‌ها",
    completedTasks: shared.completed,
    inProgressTasks: shared.inProgress,
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
    uploading: shared.loading,
    uploadSuccess: "فایل با موفقیت بارگذاری شد",
    uploadError: "نتوانستیم فایل را بارگذاری کنیم. دوباره تلاش کنید",
    deleteSuccess: "فایل حذف شد",
    deleteError: "نتوانستیم فایل را حذف کنیم. دوباره تلاش کنید",
    download: shared.download,
    remove: shared.remove,
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
      mimeTypeError: "فرمت فایل «{fileName}» نامعتبر است و قابل بارگذاری نیست",
      maxFiles: "حداکثر {maxFiles} فایل قابل بارگذاری است",
    },
  },
  errors: {
    notFound: "پروژه یافت نشد",
    projectNotFound: "پروژه یافت نشد",
  },
} as const;
