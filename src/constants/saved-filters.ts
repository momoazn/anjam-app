// Saved filters module constants
import { shared } from "./shared";

export const savedFilters = {
  title: "فیلترهای ذخیره شده",
  saveCurrentFilter: "ذخیره فیلتر فعلی",
  myFilters: "فیلترهای من",
  noSavedFilters: "هیچ فیلتر ذخیره شده‌ای ندارید",
  activeFilters: "فیلترهای فعال",
  noActiveFilters: "بدون فیلتر",
  manage: "مدیریت فیلترها",
  default: "پیش‌فرض",
  setAsDefault: "تنظیم به عنوان پیش‌فرض",
  removeDefault: "حذف از پیش‌فرض",
  createdAt: "ایجاد شده در",
  saveDialog: {
    title: "ذخیره فیلتر",
    description: "فیلتر فعلی خود را با یک نام ذخیره کنید",
    nameLabel: "نام فیلتر",
    namePlaceholder: "مثلاً: تسک‌های اولویت بالا",
    setAsDefault: "تنظیم به عنوان فیلتر پیش‌فرض",
  },
  deleteDialog: {
    title: "حذف فیلتر؟",
    description: "آیا مطمئن هستید که می‌خواهید فیلتر «{name}» را حذف کنید؟",
  },
  manageDialog: {
    title: "مدیریت فیلترهای ذخیره شده",
    description: "فیلترهای خود را مشاهده، ویرایش و حذف کنید",
  },
  criteria: {
    search: shared.search,
    status: shared.status,
    priority: shared.priority,
    assignee: shared.assignee,
    date: shared.date,
    tag: "برچسب",
    noFilter: "بدون فیلتر",
  },
  toast: {
    saved: "فیلتر با موفقیت ذخیره شد",
    updated: "فیلتر با موفقیت به‌روزرسانی شد",
    deleted: "فیلتر با موفقیت حذف شد",
    defaultSet: "فیلتر پیش‌فرض تنظیم شد",
    defaultRemoved: "فیلتر پیش‌فرض حذف شد",
    applied: "فیلتر اعمال شد",
    saveError: "خطا در ذخیره فیلتر",
    updateError: "خطا در به‌روزرسانی فیلتر",
    deleteError: "خطا در حذف فیلتر",
    applyError: "خطا در اعمال فیلتر",
    setDefaultError: "خطا در تنظیم فیلتر پیش‌فرض",
  },
} as const;
