// Miscellaneous constants that don't fit into other modules
import { shared } from "./core";

export const user = {
  dropdown: {
    account: "حساب کاربری",
    logout: "خروج از حساب",
  },
} as const;

export const notification = {
  new: "جدید",
  newNotifications: "اعلان‌های جدید اینجا نمایش داده می‌شوند",
  unreadCount: "اعلان خوانده نشده",
  notificationsLabel: "اعلان",
  notificationsPanel: "پنل اعلان‌ها",
  showCount: "نمایش {count} از",
  markAsReadLabel: 'علامت‌گذاری اعلان "{title}" به عنوان خوانده شده',
  notificationWord: "اعلان",
} as const;

export const task = {
  editTask: "ویرایش تسک {title}",
  completedTasks: shared.completed,
  sortByPriority: "مرتب‌سازی بر اساس اولویت",
  newTask: "تسک جدید",
  newTaskForProject: "تسک جدید برای این پروژه",
  addNewTask: "افزودن تسک جدید",
  moreOptions: "گزینه‌های بیشتر",
  sortByDate: "مرتب‌سازی بر اساس تاریخ",
  showCompletedTasks: "نمایش تکمیل شده‌ها",
  hours: "ساعت",
  minutes: "دقیقه",
  hour: "ساعت",
  min: "دقیقه",
  quickAdd: "افزودن سریع",
} as const;

export const notFound = {
  title: "404",
  message: "صفحه‌ای که دنبالش می‌گردید پیدا نشد",
  errorCode: "خطای 404",
  lost: "گمشده",
} as const;

// Keyboard shortcuts
export const keyboardShortcuts = {
  keys: {
    c: "C",
    cmd: "Cmd",
    k: "K",
    question: "؟",
    g: "G",
    d: "D",
    i: "I",
    t: "T",
    m: "M",
    p: "P",
    n: "N",
    s: "S",
  },
} as const;

export const inbox = {
  title: "صندوق ورودی",
  description: "پیگیری تسک‌ها و به‌روزرسانی‌های شما",
  loading: "در حال بارگذاری صندوق ورودی...",
  noRecentUpdates: "هیچ به‌روزرسانی در ۷ روز گذشته وجود ندارد",
  noTodos: "چیزی برای انجام ندارید",
  noMentions: "هنوز اشاره‌ای ندارید",
  openRecent: "برای دیدن به‌روزرسانی‌های اخیر باز کنید",
  createTask: "ساخت تسک",
  sections: {
    assigned: "اختصاص داده شده به من",
    mentioned: "اشاره شده",
    recentlyUpdated: "اخیراً به‌روز شده",
  },
  mentionedComingSoon:
    "قابلیت نمایش تسک‌هایی که در آن‌ها به شما اشاره شده به‌زودی اضافه خواهد شد",
  buttons: {
    all: "همه",
    active: "فعال",
    done: "انجام‌شده",
    close: "بستن",
    open: "باز کردن",
  },
} as const;
