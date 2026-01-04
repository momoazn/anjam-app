/**
 * Command Menu Constants
 *
 * Persian labels for the keyboard-first command palette (Cmd+K)
 */

export const commandMenu = {
  // Product mode labels
  product: {
    inbox: "پیام‌ها و اعلانات",
    dashboard: "میز کار",
    projects: "پروژه‌های فعال",
    createItem: "ایجاد مورد جدید",
    createProject: "ایجاد پروژه جدید",
    insights: "بینش‌ها",
    settings: "تنظیمات",
    placeholder: "جستجو یا دستور تایپ کنید...",
    noResults: "موردی یافت نشد، لطفاً عبارت دیگری امتحان کنید",
  },

  // Operations mode labels
  operations: {
    myTasks: "مسئولیت‌های من",
    dashboard: "میز کار",
    projects: "پروژه‌های فعال",
    createTask: "ایجاد تسک جدید",
    createProject: "ایجاد پروژه جدید",
    settings: "تنظیمات",
    placeholder: "تایپ کنید...",
    noResults: "موردی یافت نشد، لطفاً عبارت دیگری امتحان کنید",
  },

  // Keywords for search (both modes)
  keywords: {
    inbox: [
      "inbox",
      "tasks",
      "my tasks",
      "صندوق",
      "تسک",
      "پیام",
      "اعلان",
    ] as string[],
    dashboard: ["dashboard", "home", "داشبورد", "میز کار"] as string[],
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

  // Keyboard navigation instructions
  navigationInstructions: {
    upDown: "با ↑↓ حرکت کنید",
    enter: "↵ برای انتخاب",
    escape: "esc برای خروج",
    result: "مورد",
    results: "مورد",
  },
} as const;
