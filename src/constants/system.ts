// System-level constants (errors, notifications, settings, helps, timesheet)
import { shared } from "./core";

// Error messages module constants

export const errors = {
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
    keywords: {
      inactive: ["غیرفعال", "inactive"],
      blocked: ["مسدود", "blocked"],
    },
    invalidOption: "گزینه نامعتبر است",
    invalidDate: "تاریخ نامعتبر است",
    numberInvalid: "عدد نامعتبر است",
    estimatedHoursRange: "ساعت باید بین {min} تا {max} باشد",
  },
  notFound: {
    projectNotFound: "پروژه یافت نشد",
    taskNotFound: "تسک یافت نشد",
  },
  permission: {
    onlySuperusers:
      "تنها کاربران ارشد (superuser) می‌توانند این عملیات را انجام دهند",
  },
  boundary: {
    title: "اوه! مشکلی پیش آمده",
    description:
      "یک خطای غیرمنتظره رخ داد. می‌توانید دوباره تلاش کنید یا به صفحه اصلی بروید.",
    tryAgain: "تلاش دوباره",
    goHome: "صفحه اصلی",
  },
} as const;

// Notifications module constants

export const notifications = {
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
    all: shared.all,
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
    delete: shared.delete,
    deleteQueued: "اعلان برای حذف در صف قرار گرفت",
    viewAll: "مشاهده همه",
    clearRead: "پاک کردن خوانده‌شده‌ها",
  },
  groups: {
    today: shared.today,
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
  cancel: shared.cancel,
  mentions: {
    title: "اشاره‌ها",
    description: "در این بخش اشاره‌های مستقیم به شما نمایش داده می‌شود",
    empty: "هنوز کسی شما را مورد اشاره قرار نداده",
    loading: "در حال بارگذاری اشاره‌ها...",
    viewTask: "مشاهده تسک",
    byTask: "در تسک {task}",
  },
} as const;

export const settings = {
  title: "تنظیمات",
  description: "مدیریت حساب کاربری و تنظیمات برنامه",
  navLabel: "بخش‌های تنظیمات",
  tabs: {
    profile: "پروفایل",
    preferences: "ترجیحات",
    about: "درباره برنامه",
  },
  profile: {
    title: "اطلاعات شما",
    description: "نامی که دیگران در برنامه می‌بینند.",
    displayName: "نام نمایشی",
    displayNameHint: "این نام در تسک‌ها و فهرست اعضا نمایش داده می‌شود.",
    displayNameRequired: "نام نمایشی را وارد کنید",
    saveChanges: "ذخیره تغییرات",
    contactTitle: "ایمیل",
    email: "آدرس ایمیل",
    emailNote:
      "ایمیل برای ورود به حساب استفاده می‌شود و از این صفحه تغییر نمی‌کند.",
    toast: {
      updateSuccess: "پروفایل بروزرسانی شد",
      updateSuccessDescription: "اطلاعات شما ذخیره شد.",
      updateError: shared.error,
      updateErrorDescription: "ذخیره اطلاعات انجام نشد. دوباره تلاش کنید.",
    },
  },
  preferences: {
    title: "ترجیحات",
    description: "نمایش برنامه را مطابق سلیقه خود تنظیم کنید.",
    signinRequired: "برای مدیریت این قسمت ابتدا وارد حساب کاربری‌تان شوید",
    activityFeed: {
      label: "فید فعالیت",
      description: "نمایش تاریخچه فعالیت‌ها در صفحات تسک‌ها و پروژه‌ها",
    },
    displayTitle: "نمایش",
    displayDescription: "تم، منطقه زمانی و قالب تاریخ",
    theme: "تم",
    timezone: "منطقه زمانی",
    dateFormat: "قالب تاریخ",
    light: "روشن",
    dark: "تاریک",
    system: "مطابق دستگاه",
    saveSuccess: "ترجیحات ذخیره شد",
    saveError: "ذخیره ترجیحات انجام نشد",
    timezones: {
      auto: "خودکار",
      utc: "UTC (گرینویچ)",
      tehran: "تهران",
      london: "لندن",
      newYork: "نیویورک",
    },
    dateFormats: {
      locale: "مطابق تنظیمات دستگاه",
      ymd: "سال/ماه/روز",
      dmy: "روز/ماه/سال",
      mdy: "ماه/روز/سال",
    },
  },
  about: {
    title: "درباره برنامه",
    description:
      "انجام یک مدیر تسک فارسی و راست‌چین برای تیم‌های کوچک است. پروژه، تسک، برد و تقویم را در یک جا کنار هم می‌گذارد.",
    version: "نسخه",
    sourceCode: "کد منبع در گیت‌هاب",
    stackTitle: "ساخته‌شده با",
    stack: [
      "React و TypeScript",
      "Tailwind CSS و shadcn/ui",
      "Convex و Better Auth",
    ],
  },
} as const;

// Help page content. Keep it short and in sync with the real app.

export const helps = {
  title: "راهنما",
  description: "چند نکته کوتاه برای شروع کار با انجام",
  shortcutsTitle: "میان‌برهای کیبورد",
  shortcuts: {
    general: {
      title: "عمومی",
      items: [
        { keys: ["C"], label: "ایجاد تسک جدید" },
        { keys: ["Ctrl/Cmd", "K"], label: "منوی دستورها و جستجو" },
        { keys: ["/"], label: "باز کردن جستجو" },
        { keys: ["؟"], label: "نمایش میان‌برها" },
      ],
    },
    navigation: {
      title: "رفتن به صفحه (اول G، سپس کلید دوم)",
      items: [
        { keys: ["G", "I"], label: "صندوق ورودی" },
        { keys: ["G", "S"], label: "تسک‌ها" },
        { keys: ["G", "P"], label: "پروژه‌ها" },
        { keys: ["G", "N"], label: "بینش‌ها" },
        { keys: ["G", "V"], label: "فیلترهای ذخیره‌شده" },
      ],
    },
  },
  sections: [
    {
      id: "start",
      title: "شروع کار",
      items: [
        {
          label: "حساب و سازمان",
          text: "با ایمیل و رمز عبور ثبت‌نام کنید. سپس سازمان جدید بسازید یا با لینک دعوت به سازمان تیم خود بپیوندید.",
        },
        {
          label: "پروژه",
          text: "از صفحه «همه پروژه‌ها» یک پروژه بسازید. تسک‌ها داخل پروژه‌ها ثبت می‌شوند.",
        },
        {
          label: "تسک",
          text: "با دکمه «ایجاد سریع» یا کلید C تسک بسازید. عنوان، وضعیت، اولویت، مسئول و مهلت را مشخص کنید.",
        },
        {
          label: "دعوت همکار",
          text: "مالک سازمان از تنظیمات و بخش اعضا لینک دعوت می‌سازد و برای همکاران می‌فرستد.",
        },
      ],
    },
    {
      id: "tasks",
      title: "تسک‌ها",
      items: [
        {
          label: "نمایش",
          text: "تسک‌ها را به شکل لیست، بورد یا تقویم ببینید. تاریخ‌ها شمسی هستند.",
        },
        {
          label: "جزئیات",
          text: "هر تسک زیرتسک، تگ، پیوست و مدت زمان تخمینی دارد.",
        },
        {
          label: "گفتگو",
          text: "زیر هر تسک نظر بگذارید. با @ همکارتان را صدا بزنید تا در صندوق ورودی خبردار شود.",
        },
        {
          label: "فیلتر",
          text: "فیلتر پرکاربرد را با یک نام ذخیره کنید و بعداً از صفحه فیلترهای ذخیره‌شده باز کنید.",
        },
      ],
    },
    {
      id: "roles",
      title: "نقش‌ها",
      items: [
        {
          label: "مالک",
          text: "سازمان را می‌سازد. تنظیمات سازمان، اعضا و لینک‌های دعوت را مدیریت می‌کند.",
        },
        {
          label: "عضو",
          text: "روی پروژه‌ها و تسک‌ها کار می‌کند. هر کسی که با لینک دعوت بیاید «عضو» می‌شود.",
        },
      ],
    },
    {
      id: "trouble",
      title: "مشکل دارید؟",
      items: [
        {
          label: "تسک‌ها یا پروژه‌ها دیده نمی‌شوند",
          text: "سازمان فعال را در بالای منوی کناری بررسی کنید. داده‌های هر سازمان جداست.",
        },
        {
          label: "لینک دعوت کار نمی‌کند",
          text: "ممکن است منقضی، لغو یا پر شده باشد. از مالک بخواهید لینک تازه بسازد.",
        },
        {
          label: "خطا یا اشکال دیدید",
          text: "از «گزارش مشکل» در منوی کناری، آن را در GitHub ثبت کنید.",
        },
      ],
    },
  ],
} as const;
