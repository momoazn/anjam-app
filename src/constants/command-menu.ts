/**
 * Command Menu Constants
 *
 * Persian labels for the keyboard-first command palette (Cmd+K)
 */

export const commandMenu = {
  // Product mode labels
  product: {
    inbox: "صندوق ورودی",
    dashboard: "داشبورد",
    projects: "پروژه‌ها",
    createItem: "ایجاد مورد جدید",
    createProject: "ایجاد پروژه جدید",
    insights: "بینش‌ها",
    settings: "تنظیمات",
    placeholder: "جستجو یا دستور تایپ کنید...",
    noResults: "نتیجه‌ای یافت نشد.",
  },

  // Operations mode labels
  operations: {
    myTasks: "تسک‌های من",
    dashboard: "داشبورد",
    projects: "پروژه‌ها",
    createTask: "ایجاد تسک جدید",
    createProject: "ایجاد پروژه جدید",
    settings: "تنظیمات",
    placeholder: "تایپ کنید...",
    noResults: "نتیجه‌ای یافت نشد.",
  },

  // Keywords for search (both modes)
  keywords: {
    inbox: ["inbox", "tasks", "my tasks", "صندوق", "تسک"] as string[],
    dashboard: ["dashboard", "home", "داشبورد"] as string[],
    projects: ["projects", "پروژه"] as string[],
    new: [
      "new",
      "create",
      "task",
      "issue",
      "ایجاد",
      "تسک",
      "مورد",
      "جدید",
    ] as string[],
    insights: [
      "insights",
      "reports",
      "analytics",
      "views",
      "بینش",
      "گزارش",
    ] as string[],
    settings: ["settings", "preferences", "تنظیمات"] as string[],
  },

  // Keyboard shortcuts
  shortcuts: {
    commandK: "⌘K",
    new: "N",
  },

  // Accessibility labels
  ariaLabels: {
    searchInput: "جستجوی دستورات و محتوا",
    commandList: "لیست دستورات",
    navigationHint:
      "برای حرکت از کلیدهای بالا/پایین، برای انتخاب از Enter استفاده کنید",
  },
} as const;
