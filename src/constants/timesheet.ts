// Timesheet

export const timesheet = {
  headers: {
    date: "تاریخ",
    taskTitle: "عنوان تسک",
    project: "پروژه",
    minutesSpent: "دقیقه‌های صرف شده",
  },
  noTimeSpent: "زمانی ثبت نشده است",
  emptyStateDescription:
    "برای ثبت تایم‌شیت، روی تسک‌ها زمان ثبت کنید یا یک تسک جدید بسازید.",
  createTaskCta: "ساخت تسک جدید",
  calendarCta: "مشاهده تقویم تسک‌ها",
} as const;
