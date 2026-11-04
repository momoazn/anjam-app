// Landing page constants

export const landing = {
  // Navigation
  loginButton: "ورود",
  dashboard: "داشبورد",
  getStarted: "شروع کار",

  // Brand
  brandName: "سامانه انجام",
  shortBrandName: "انجام",

  // Hero section
  heroDescription:
    "مدیریت تسک برای تیم‌های فارسی‌زبان. بورد، لیست و تقویم شمسی، همگام‌سازی لحظه‌ای و چند سازمان جدا از هم، در یک برنامه.",
  ctaButton: "ثبت‌نام",
  featuresButton: "بررسی قابلیت‌ها",

  // Features section
  featuresTitle: "هرچه برای کار تیمی لازم است",
  featuresSubtitle:
    "انجام کارهای روزمره تیم را ساده نگه می‌دارد: تسک بسازید، به هم بسپارید، درباره‌اش حرف بزنید و پیشرفت را ببینید.",

  features: [
    {
      id: "realtime",
      title: "همگام‌سازی لحظه‌ای",
      description:
        "تغییر هر عضو همان لحظه برای بقیه نمایش داده می‌شود. لازم نیست صفحه را دوباره بارگذاری کنید.",
    },
    {
      id: "organizations",
      title: "سازمان‌ها و لینک دعوت",
      description:
        "برای هر تیم یک سازمان بسازید و اعضا را با لینک دعوت اضافه کنید. داده‌های هر سازمان جدا نگه داشته می‌شود.",
    },
    {
      id: "roles",
      title: "مالک و عضو",
      description:
        "مالک سازمان، اعضا و دعوت‌ها را مدیریت می‌کند. اعضا روی پروژه‌ها و تسک‌ها کار می‌کنند.",
    },
    {
      id: "views",
      title: "بورد، لیست و تقویم",
      description:
        "تسک‌ها را به شکل بورد، لیست یا تقویم ببینید. تاریخ‌ها شمسی هستند.",
    },
    {
      id: "comments",
      title: "نظر، اشاره و واکنش",
      description:
        "زیر هر تسک گفتگو کنید، با @ همکارتان را صدا بزنید و با واکنش پاسخ بدهید.",
    },
    {
      id: "inbox",
      title: "صندوق ورودی و اعلان‌ها",
      description:
        "تسک‌های شما و اشاره‌هایی که به شما شده است در یک جا جمع می‌شود.",
    },
    {
      id: "filters",
      title: "فیلترهای ذخیره‌شده",
      description:
        "فیلتر پرکاربرد را با یک نام ذخیره کنید و هر بار با یک کلیک باز کنید.",
    },
    {
      id: "insights",
      title: "بینش‌ها",
      description:
        "تسک‌های تکمیل‌شده هر هفته، تسک‌های در حال انجام و زمان چرخه را در صفحه بینش‌ها ببینید.",
    },
  ],

  // CTA section
  ctaTitle: "همین امروز شروع کنید",
  ctaDescription:
    "یک سازمان بسازید، همکارانتان را دعوت کنید و اولین تسک را ثبت کنید.",
  quickStart: "ساخت حساب",
  sourceCode: "کد منبع در GitHub",

  // Footer
  footer: {
    allRightsReserved: "تمامی حقوق محفوظ است",
    sourceCode: "کد منبع",
    login: "ورود",
    register: "ثبت‌نام",
  },

  // Mock UI (static illustration, not real data)
  mockUi: {
    columns: {
      todo: "برای انجام",
      inProgress: "در حال انجام",
      done: "انجام شده",
    },
  },
} as const;
