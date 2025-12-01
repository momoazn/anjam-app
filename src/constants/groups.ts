// Groups module constants
import { shared } from "./shared";

export const groups = {
  title: "گروه‌ها",
  code: "کد گروه",
  create: {
    title: "ایجاد گروه جدید",
    button: "ایجاد گروه",
    description: "گروه جدیدی را برای مدیریت پروژه‌ها و کاربران ایجاد کنید",
    success: "گروه با موفقیت ایجاد شد",
    formDescription: "اطلاعات گروه را وارد کنید",
  },
  edit: {
    title: "ویرایش گروه",
    button: "ذخیره تغییرات",
  },
  delete: {
    title: "حذف گروه",
    description:
      "آیا از حذف گروه {name} اطمینان دارید؟ این عمل قابل بازگشت نیست.",
  },
  list: {
    count: "{count} گروه",
    empty: "هیچ گروهی یافت نشد",
  },
  form: {
    name: "نام گروه",
    namePlaceholder: "نام گروه را وارد کنید",
    description: shared.description,
    descriptionPlaceholder: "توضیحات گروه (اختیاری)",
    manager: "مدیر گروه",
    selectManager: "انتخاب مدیر",
  },
  status: {
    active: shared.active,
    inactive: shared.inactive,
  },
  actions: {
    activate: "فعال‌سازی",
    deactivate: "غیرفعال‌سازی",
  },
  stats: {
    users: shared.user,
    projects: shared.project,
    tasks: shared.task,
  },
} as const;
