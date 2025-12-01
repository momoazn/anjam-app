// User management module constants
import { shared } from "./shared";

export const users = {
  title: "کاربران",
  list: {
    count: "{count} کاربر",
  },
  table: {
    columns: {
      user: "کاربر",
      username: "نام کاربری",
      email: "ایمیل",
      role: "نقش",
      status: "وضعیت",
      accountStatus: "وضعیت حساب",
      failedAttempts: "تلاش ناموفق",
      actions: shared.actions,
    },
    roles: {
      admin: "مدیر",
      manager: "مدیر گروه",
      supervisor: "سرپرست",
      employee: "کارمند",
    },
    status: {
      active: shared.active,
      inactive: shared.inactive,
      blocked: "مسدود",
      ok: "عادی",
    },
  },
  form: {
    firstName: "نام",
    lastName: "نام خانوادگی",
    selectRole: "انتخاب نقش",
    password: "رمز عبور",
    group: shared.group,
    selectGroup: "انتخاب گروه",
  },
  actions: {
    activate: "فعال‌سازی",
    deactivate: "غیرفعال‌سازی",
    unblock: "رفع مسدودی",
    viewLogs: "سوابق ورود",
    activateSuccess: "حساب کاربری فعال شد",
    deactivateSuccess: "حساب کاربری غیرفعال شد",
    unblockSuccess: "مسدودی کاربر برداشته شد",
    activateError: "خطا در فعال‌سازی حساب کاربری",
    deactivateError: "خطا در غیرفعال‌سازی حساب کاربری",
    unblockError: "خطا در رفع مسدودی کاربر",
    cannotDeactivateAdmin: "نمی‌توان حساب ادمین را غیرفعال کرد",
    toggleStatusError: "خطا در تغییر وضعیت کاربر",
    fetchLogsError: "خطا در دریافت سوابق ورود",
  },
  pendingActivation: {
    title: "حساب شما در انتظار تأیید است",
    message:
      "حساب کاربری شما با موفقیت ایجاد شد، اما هنوز توسط مدیر فعال نشده است.",
    instruction: "لطفاً با مدیر سیستم تماس بگیرید تا حساب شما را فعال کنند.",
    backToLogin: "بازگشت به صفحه ورود",
  },
  loginLogs: {
    title: "سوابق ورود {name}",
    columns: {
      date: shared.date,
      time: shared.time,
      ip: "آی‌پی",
      status: shared.status,
      reason: "دلیل",
    },
    status: {
      success: shared.success,
      failed: "ناموفق",
    },
    empty: "هیچ سابقه ورودی ثبت نشده است",
    loadMore: "بارگذاری بیشتر",
  },
  create: {
    button: "کاربر جدید",
    title: "افزودن کاربر جدید",
    success: "عالی! کاربر جدید با موفقیت اضافه شد",
    error: "نتوانستیم کاربر را اضافه کنیم: {error}",
    errors: {
      usernameRequired: "نام کاربری را وارد کنید",
      passwordRequired: "رمز عبور باید حداقل ۸ کاراکتر باشد",
      passwordConfirmRequired: "لطفاً رمز عبور را دوباره وارد کنید",
      passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
    },
  },
  edit: {
    title: "ویرایش کاربر",
    button: "ذخیره تغییرات",
  },
  delete: {
    title: "حذف کاربر",
    description: "مطمئنید که می‌خواهید این کاربر را حذف کنید؟",
    button: shared.confirm,
    success: "کاربر با موفقیت حذف شد",
    error: "نتوانستیم کاربر را حذف کنیم: {error}",
  },
  errors: {
    notFound: "کاربر یافت نشد",
  },
} as const;
