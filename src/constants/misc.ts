// Miscellaneous constants that don't fit into other modules
import { shared } from "./core";

export const create = {
  newTask: "تسک جدید",
  newProject: "پروژه جدید",
} as const;

export const search = {
  placeholder: "جستجو در تسک‌ها و پروژه‌ها...",
} as const;

export const header = {
  title: "مدیر تسک‌ها",
  addNewTask: "افزودن تسک جدید",
  addNewProject: "پروژه جدید",
} as const;

export const user = {
  dropdown: {
    account: "حساب کاربری",
    logout: "خروج از حساب",
  },
} as const;

export const project = {
  progress: "پیشرفت پروژه",
  completedTasks: "تسک تکمیل شده",
  tasks: "تسک‌ها",
  users: "کاربران",
  of: "از",
} as const;

export const charts = {
  dateLabel: shared.date,
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
} as const;

export const notFound = {
  title: "404",
  message: "صفحه‌ای که دنبالش می‌گردید پیدا نشد",
} as const;

export const myTasks = {
  title: "تسک‌های من",
  description: "همه تسک‌های اختصاص داده شده به شما",
  tabs: {
    active: shared.active,
    completed: shared.completed,
    byProject: "بر اساس پروژه",
  },
  stats: {
    active: shared.active,
    completed: shared.completed,
    overdue: "گذشته‌موعد",
    canceled: shared.canceled,
  },
  empty: {
    noTasks: "تسکی ندارید",
    noTasksDescription: "هیچ تسکی به شما اختصاص داده نشده است",
    noActiveTasks: "تسک فعالی ندارید",
    noActiveTasksDescription: "همه تسک‌های شما انجام شده یا لغو شده‌اند",
    noCompletedTasks: "هنوز تسکی را تکمیل نکرده‌اید",
    noCompletedTasksDescription:
      "تسک‌های تکمیل شده در اینجا نمایش داده می‌شوند",
    // Legacy fallback entries kept for backward compatibility
    noTasksFallback: "تسکی ندارید",
    noTasksDescriptionFallback: "هیچ تسکی به شما اختصاص داده نشده است",
    noActiveTasksFallback: "تسک فعالی ندارید",
    noActiveTasksDescriptionFallback:
      "همه تسک‌های شما انجام شده یا لغو شده‌اند",
    noCompletedTasksFallback: "هنوز تسکی را تکمیل نکرده‌اید",
    noCompletedTasksDescriptionFallback:
      "تسک‌های تکمیل شده در اینجا نمایش داده می‌شوند",
  },
} as const;
