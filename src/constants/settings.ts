// Settings module constants
import { shared } from "./shared";

export const settings = {
  title: "تنظیمات",
  description: "مدیریت حساب کاربری و تنظیمات برنامه",
  tabs: {
    profile: "پروفایل کاربری",
    appearance: "ظاهر و تم",
    security: "امنیت و ورود",
    about: "درباره برنامه",
  },
  profile: {
    title: "اطلاعات شناسایی",
    description: "تصویر پروفایل و نام نمایشی خود را مدیریت کنید.",
    changeImage: "تغییر تصویر",
    firstName: shared.name,
    lastName: "نام خانوادگی",
    username: "نام کاربری",
    usernameDescription: "نام کاربری منحصر به فرد شما در سیستم.",
    saveChanges: "ذخیره تغییرات",
    contactTitle: "اطلاعات تماس",
    contactDescription:
      "ایمیل شما جهت بازیابی رمز عبور و دریافت اعلان‌ها استفاده می‌شود.",
    email: "آدرس ایمیل",
    emailChangeNote: "برای تغییر ایمیل با پشتیبانی تماس بگیرید.",
    toast: {
      updateSuccess: "پروفایل بروزرسانی شد",
      updateSuccessDescription: "اطلاعات شما با موفقیت ذخیره گردید.",
      updateError: shared.error,
      updateErrorDescription: "خطایی در ذخیره اطلاعات رخ داد.",
    },
  },
  appearance: {
    title: "تم برنامه",
    description: "ظاهر برنامه را متناسب با سلیقه خود شخصی‌سازی کنید.",
    light: "روشن",
    dark: "تاریک",
    system: "سیستم",
  },
  security: {
    changePasswordTitle: "تغییر رمز عبور",
    changePasswordDescription: "برای امنیت بیشتر، رمز عبور قوی انتخاب کنید.",
    oldPassword: "رمز عبور فعلی",
    newPassword: "رمز عبور جدید",
    confirmPassword: "تکرار رمز عبور جدید",
    updatePassword: "بروزرسانی رمز عبور",
    activeSessionsTitle: "نشست‌های فعال",
    activeSessionsDescription: "تاریخچه ورودهای اخیر به حساب کاربری شما.",
    noLoginHistory: "هیچ سابقه ورودی یافت نشد.",
    toast: {
      passwordChanged: "رمز عبور تغییر کرد",
      passwordChangedDescription: "رمز عبور شما با موفقیت تغییر یافت.",
      passwordError: shared.error,
      passwordErrorDescription: "رمز عبور فعلی اشتباه است یا خطایی رخ داده.",
      fetchLogsError: "خطا در دریافت سوابق ورود",
    },
    validation: {
      oldPasswordRequired: "رمز عبور فعلی " + shared.required,
    },
  },
  about: {
    title: "درباره برنامه",
    version: "نسخه ۱.۰.۰",
    description: "این برنامه جهت مدیریت پروژه‌ها و تسک‌های تیمی طراحی شده است.",
  },
} as const;
