// Error messages module constants
import { shared } from "./shared";

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
  },
  notFound: {
    projectNotFound: "پروژه یافت نشد",
    taskNotFound: "تسک یافت نشد",
  },
  operationFailed: {
    addUserToProject: "خطا در افزودن کاربر به پروژه",
    removeUserFromProject: "خطا در حذف کاربر از پروژه",
    saveTimeEntry: "خطا در ذخیره ورود زمانی",
    exportProject: "خطا در خروجی پروژه",
    fetchLoginLogs: "خطا در دریافت سوابق ورود",
    applyFilter: "خطا در اعمال فیلتر",
    loadSavedFilters: "خطا در بارگذاری فیلترهای ذخیره شده",
    saveFilters: "خطا در ذخیره فیلترها",
    subscribeNotifications: "خطا در اشتراک در اعلان‌ها",
    loadNotifications: "نتوانستیم اعلان‌ها را بارگذاری کنیم",
  },
  permission: {
    onlySuperusers:
      "تنها کاربران ارشد (superuser) می‌توانند این عملیات را انجام دهند",
  },
  boundary: {
    title: "اوه! مشکلی پیش آمده",
    description:
      "یک خطای غیرمنتظره رخ داده. نگران نباشید، می‌توانید دوباره تلاش کنید یا صفحه را بارگذاری مجدد کنید",
    tryAgain: shared.retry,
    reloadPage: "بارگذاری مجدد",
  },
} as const;

