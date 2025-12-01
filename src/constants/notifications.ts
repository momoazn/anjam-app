// Notifications module constants
import { shared } from "./shared";

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
} as const;
