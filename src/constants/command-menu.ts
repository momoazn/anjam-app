/**
 * Command Menu Constants
 *
 * Persian labels for the keyboard-first command palette (Cmd+K)
 */

export const commandMenu = {
  labels: {
    inbox: "پیام‌ها و اعلانات",
    projects: "پروژه‌های فعال",
    createItem: "ایجاد مورد جدید",
    createProject: "ایجاد پروژه جدید",
    insights: "بینش‌ها",
    settings: "تنظیمات",
    placeholder: "جستجو یا دستور تایپ کنید...",
    noResults: "موردی یافت نشد، لطفاً عبارت دیگری امتحان کنید",
  },

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
    projects: ["projects", "پروژه"] as string[],
    new: ["new", "create", "task", "ایجاد", "تسک", "مورد", "جدید"] as string[],
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

  shortcuts: {
    commandK: "⌘K",
    new: "N",
  },

  ariaLabels: {
    searchInput: "جستجوی دستورات و محتوا",
    commandList: "لیست دستورات",
    navigationHint:
      "برای حرکت از کلیدهای بالا/پایین، برای انتخاب از Enter استفاده کنید",
  },

  navigationInstructions: {
    upDown: "با ↑↓ حرکت کنید",
    enter: "↵ برای انتخاب",
    escape: "esc برای خروج",
    result: "مورد",
    results: "مورد",
  },
} as const;
