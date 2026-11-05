import type { FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalMutation } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { toAuthCtx } from "./utils";

const TEST_USERS = [
  {
    email: "admin@example.com",
    password: "admin12345",
    displayName: "سارا احمدی",
  },
  {
    email: "manager@example.com",
    password: "manager123",
    displayName: "علی رضایی",
  },
  {
    email: "supervisor@example.com",
    password: "supervisor123",
    displayName: "نیلوفر کریمی",
  },
  {
    email: "employee1@example.com",
    password: "employee123",
    displayName: "محمد حسینی",
  },
  {
    email: "employee2@example.com",
    password: "employee123",
    displayName: "مریم صادقی",
  },
] as const;

type UserKey = "admin" | "manager" | "supervisor" | "employee1" | "employee2";

const USER_EMAIL: Record<UserKey, string> = {
  admin: "admin@example.com",
  manager: "manager@example.com",
  supervisor: "supervisor@example.com",
  employee1: "employee1@example.com",
  employee2: "employee2@example.com",
};

const ORG_1 = {
  name: "تیم محصول",
  slug: "product-team",
  description: "فضای کاری تیم محصول انجام",
};

const ORG_2 = {
  name: "تیم پشتیبانی",
  slug: "support-team",
  description: "فضای کاری تیم پشتیبانی",
};

type ProjectKey = "APP" | "WEB" | "OPS";

const PROJECTS: Array<{
  code: ProjectKey;
  name: string;
  description: string;
  supervisor: UserKey;
}> = [
  {
    code: "APP",
    name: "اپ موبایل",
    description: "اپلیکیشن اندروید و iOS برای مدیریت تسک‌ها",
    supervisor: "manager",
  },
  {
    code: "WEB",
    name: "وب‌سایت",
    description: "سایت معرفی محصول، صفحه قیمت‌گذاری و وبلاگ",
    supervisor: "admin",
  },
  {
    code: "OPS",
    name: "زیرساخت",
    description: "استقرار، مانیتورینگ و امنیت سرویس‌ها",
    supervisor: "manager",
  },
];

const TAGS = {
  urgent: { name: "فوری", color: "#EF4444" },
  bug: { name: "باگ", color: "#F97316" },
  design: { name: "طراحی", color: "#8B5CF6" },
  backend: { name: "بک‌اند", color: "#3B82F6" },
  frontend: { name: "فرانت‌اند", color: "#06B6D4" },
  docs: { name: "مستندات", color: "#EAB308" },
  improvement: { name: "بهبود", color: "#22C55E" },
  security: { name: "امنیت", color: "#EC4899" },
} as const;

type TagKey = keyof typeof TAGS;

type Status = "todo" | "in_progress" | "in_review" | "done" | "cancelled";
type Priority = "low" | "medium" | "high" | "urgent";

type SeedComment = {
  by: UserKey;
  text: string;
  hoursAgo: number;
  reactions?: Record<string, UserKey[]>;
  mentions?: UserKey[];
};

type SeedTask = {
  project: ProjectKey;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: UserKey | null;
  creator?: UserKey;
  tags: TagKey[];
  /** Days from today; negative means overdue. */
  due?: number;
  /** Creation time, in days ago. */
  created: number;
  /** Completion time, in days ago (done tasks only). */
  completed?: number;
  subtasks?: Array<[string, boolean]>;
  comments?: SeedComment[];
};

const DAY = 86_400_000;
const HOUR = 3_600_000;

// Deterministic demo tasks. All dates are relative to the seed time.
const TASKS: SeedTask[] = [
  // ---- APP ----
  {
    project: "APP",
    title: "طراحی صفحه ورود و ثبت‌نام",
    description: "طراحی نهایی صفحه‌های ورود، ثبت‌نام و بازیابی رمز عبور.",
    status: "done",
    priority: "high",
    assignee: "employee2",
    tags: ["design"],
    due: -40,
    created: 56,
    completed: 45,
  },
  {
    project: "APP",
    title: "پیاده‌سازی ورود با کد یک‌بار مصرف",
    description: "ورود با پیامک و بررسی کد در سمت سرور.",
    status: "done",
    priority: "high",
    assignee: "employee1",
    tags: ["frontend", "security"],
    due: -37,
    created: 50,
    completed: 33,
  },
  {
    project: "APP",
    title: "اعلان‌های پوش برای تسک‌های جدید",
    description: "ارسال اعلان وقتی تسکی به کاربر محول می‌شود.",
    status: "in_progress",
    priority: "high",
    assignee: "manager",
    tags: ["backend"],
    due: 3,
    created: 20,
    subtasks: [
      ["ذخیره توکن دستگاه در پروفایل", true],
      ["ساخت سرویس ارسال اعلان", false],
      ["تست روی اندروید و iOS", false],
    ],
    comments: [
      {
        by: "admin",
        text: "@manager برای اعلان‌ها از همان سرویس قبلی استفاده کنیم؟",
        hoursAgo: 52,
        mentions: ["manager"],
      },
      {
        by: "manager",
        text: "بله، فقط باید توکن دستگاه را در پروفایل ذخیره کنیم. @employee1 می‌توانی بررسی کنی؟",
        hoursAgo: 49,
        reactions: { "+1": ["admin"], rocket: ["employee1"] },
        mentions: ["employee1"],
      },
      {
        by: "employee1",
        text: "من تا فردا نسخه اولیه را آماده می‌کنم.",
        hoursAgo: 30,
        reactions: { "+1": ["manager", "admin"] },
      },
    ],
  },
  {
    project: "APP",
    title: "حالت تاریک در اپ",
    description: "پشتیبانی از تم تاریک در همه صفحه‌ها.",
    status: "in_review",
    priority: "medium",
    assignee: "employee2",
    tags: ["design", "improvement"],
    due: 2,
    created: 15,
    comments: [
      {
        by: "employee2",
        text: "پیش‌نمایش رنگ‌ها آماده است.",
        hoursAgo: 26,
      },
      {
        by: "admin",
        text: "@employee2 خیلی خوب شده، فقط رنگ دکمه‌ها را کمی روشن‌تر کنید.",
        hoursAgo: 20,
        reactions: { "+1": ["employee2"], heart: ["manager"] },
        mentions: ["employee2"],
      },
    ],
  },
  {
    project: "APP",
    title: "رفع کرش هنگام باز کردن تسک بدون پروژه",
    description: "اپ با تسک‌های قدیمی که پروژه ندارند بسته می‌شود.",
    status: "todo",
    priority: "urgent",
    assignee: "employee1",
    creator: "manager",
    tags: ["bug", "urgent"],
    due: -2,
    created: 6,
    comments: [
      {
        by: "employee1",
        text: "@admin علت کرش مشخص شد: پروژه خالی در پاسخ سرور.",
        hoursAgo: 10,
        mentions: ["admin"],
        reactions: { eyes: ["admin"] },
      },
      {
        by: "admin",
        text: "عالی. لطفاً تا آخر امروز اصلاحیه را بفرست.",
        hoursAgo: 8,
      },
    ],
  },
  {
    project: "APP",
    title: "همگام‌سازی آفلاین لیست تسک‌ها",
    description: "تغییرات حالت آفلاین هنگام اتصال دوباره ارسال شوند.",
    status: "in_progress",
    priority: "high",
    assignee: "admin",
    tags: ["backend"],
    due: 9,
    created: 18,
    subtasks: [
      ["طراحی صف تغییرات محلی", true],
      ["حل تداخل نسخه‌ها", true],
      ["نمایش وضعیت همگام‌سازی", false],
      ["تست در شبکه ضعیف", false],
    ],
  },
  {
    project: "APP",
    title: "بهینه‌سازی زمان بارگذاری صفحه اصلی",
    description: "زمان بارگذاری اولیه از ۴ ثانیه به زیر ۲ ثانیه برسد.",
    status: "todo",
    priority: "medium",
    assignee: "employee1",
    tags: ["improvement"],
    due: 14,
    created: 4,
  },
  {
    project: "APP",
    title: "انتشار نسخه ۱٫۲ در بازار",
    description: "آماده‌سازی توضیحات، تصاویر و ارسال نسخه برای بررسی.",
    status: "todo",
    priority: "high",
    assignee: "admin",
    tags: ["urgent"],
    due: 6,
    created: 3,
    subtasks: [
      ["نوشتن یادداشت انتشار", false],
      ["گرفتن تصاویر جدید", false],
      ["ارسال به بازار", false],
    ],
  },
  {
    project: "APP",
    title: "اصلاح فاصله‌ها در صفحه پروفایل",
    description: "فاصله‌ها و اندازه فونت با سیستم طراحی هماهنگ شود.",
    status: "done",
    priority: "low",
    assignee: "employee2",
    tags: ["design"],
    due: -10,
    created: 22,
    completed: 2,
  },
  {
    project: "APP",
    title: "پشتیبانی از چند زبان",
    description: "فعلاً نیازی نیست؛ بعد از انتشار نسخه ۲ بررسی شود.",
    status: "cancelled",
    priority: "low",
    assignee: "manager",
    tags: [],
    created: 40,
  },
  {
    project: "APP",
    title: "افزودن میان‌بر ویجت در صفحه اصلی گوشی",
    description: "ویجت کوچک برای دیدن تسک‌های امروز.",
    status: "todo",
    priority: "low",
    assignee: "supervisor",
    tags: [],
    created: 2,
  },
  {
    project: "APP",
    title: "بررسی بازخورد کاربران بتا",
    description: "جمع‌بندی بازخوردها و تعیین ۵ مورد مهم برای نسخه بعد.",
    status: "done",
    priority: "medium",
    assignee: "supervisor",
    tags: ["docs"],
    due: -5,
    created: 14,
    completed: 6,
  },
  {
    project: "APP",
    title: "ثبت‌نام در فروشگاه‌های اپ",
    description: "ساخت حساب توسعه‌دهنده و تکمیل اطلاعات شرکت.",
    status: "done",
    priority: "medium",
    assignee: "admin",
    tags: [],
    due: -48,
    created: 52,
    completed: 49,
  },
  // ---- WEB ----
  {
    project: "WEB",
    title: "بازطراحی صفحه فرود",
    description: "صفحه اصلی با تمرکز بر معرفی ویژگی‌ها و دکمه شروع.",
    status: "done",
    priority: "high",
    assignee: "employee2",
    tags: ["design"],
    due: -27,
    created: 48,
    completed: 24,
  },
  {
    project: "WEB",
    title: "افزودن صفحه قیمت‌گذاری",
    description: "نمایش سه پلن و جدول مقایسه ویژگی‌ها.",
    status: "in_progress",
    priority: "medium",
    assignee: "employee2",
    tags: ["frontend"],
    due: 5,
    created: 9,
    subtasks: [
      ["طراحی کارت پلن‌ها", true],
      ["جدول مقایسه", false],
      ["پرسش‌های متداول", false],
    ],
  },
  {
    project: "WEB",
    title: "بهبود سئو و متاتگ‌ها",
    description: "عنوان و توضیح هر صفحه و تگ‌های اشتراک‌گذاری.",
    status: "todo",
    priority: "medium",
    assignee: "manager",
    tags: ["improvement"],
    due: 12,
    created: 5,
  },
  {
    project: "WEB",
    title: "رفع خطای نمایش در مرورگر سافاری",
    description: "منوی بالای صفحه در سافاری iOS درست نمایش داده نمی‌شود.",
    status: "in_review",
    priority: "high",
    assignee: "employee1",
    tags: ["bug"],
    due: 1,
    created: 7,
    comments: [
      {
        by: "employee1",
        text: "@employee2 می‌شود استایل فلکس منو را هم نگاه کنی؟",
        hoursAgo: 40,
        mentions: ["employee2"],
      },
      {
        by: "employee2",
        text: "درستش کردم، منتظر بازبینی هستم.",
        hoursAgo: 18,
        reactions: { heart: ["employee1"], "+1": ["admin"] },
      },
    ],
  },
  {
    project: "WEB",
    title: "نوشتن مستندات API عمومی",
    description: "مستندات نقاط پایانی با نمونه درخواست و پاسخ.",
    status: "in_progress",
    priority: "medium",
    assignee: "admin",
    tags: ["docs", "backend"],
    due: -1,
    created: 25,
  },
  {
    project: "WEB",
    title: "پیاده‌سازی فرم تماس با ما",
    description: "فرم با اعتبارسنجی و ارسال ایمیل به تیم پشتیبانی.",
    status: "done",
    priority: "low",
    assignee: "employee1",
    tags: ["frontend"],
    due: -14,
    created: 30,
    completed: 16,
  },
  {
    project: "WEB",
    title: "افزودن وبلاگ به سایت",
    description: "بخش وبلاگ با دسته‌بندی و جستجو.",
    status: "todo",
    priority: "low",
    assignee: "supervisor",
    tags: [],
    due: 30,
    created: 8,
  },
  {
    project: "WEB",
    title: "کاهش حجم تصاویر صفحه اصلی",
    description: "تبدیل تصاویر به قالب سبک‌تر و بارگذاری تنبل.",
    status: "done",
    priority: "medium",
    assignee: "employee1",
    tags: ["improvement"],
    due: -3,
    created: 12,
    completed: 4,
  },
  {
    project: "WEB",
    title: "گزارش خطای فرم عضویت در موبایل",
    description:
      "کاربران گزارش داده‌اند دکمه ثبت در گوشی‌های کوچک دیده نمی‌شود.",
    status: "todo",
    priority: "urgent",
    assignee: "manager",
    tags: ["bug", "urgent"],
    due: 0,
    created: 1,
    comments: [
      {
        by: "manager",
        text: "این مورد از طرف پشتیبانی هم گزارش شده. @admin اولویتش را بالا بردم.",
        hoursAgo: 3,
        mentions: ["admin"],
      },
    ],
  },
  {
    project: "WEB",
    title: "چک‌لیست دسترس‌پذیری صفحات اصلی",
    description: "بررسی کنتراست رنگ‌ها، برچسب فرم‌ها و ناوبری با کیبورد.",
    status: "todo",
    priority: "medium",
    assignee: "employee2",
    tags: ["design"],
    due: 20,
    created: 2,
  },
  {
    project: "WEB",
    title: "مهاجرت متن‌ها به فایل ترجمه",
    description: "فعلاً لغو شد چون سایت فقط فارسی منتشر می‌شود.",
    status: "cancelled",
    priority: "low",
    assignee: "admin",
    tags: [],
    created: 35,
  },
  {
    project: "WEB",
    title: "تعریف سیستم طراحی مشترک",
    description: "رنگ‌ها، فاصله‌ها و اجزای پایه برای سایت و اپ.",
    status: "done",
    priority: "medium",
    assignee: "employee2",
    tags: ["design"],
    due: -26,
    created: 44,
    completed: 28,
  },
  {
    project: "WEB",
    title: "تحلیل رقبا برای صفحه قیمت‌گذاری",
    description: "مقایسه پلن‌ها و قیمت پنج محصول مشابه.",
    status: "done",
    priority: "low",
    assignee: "supervisor",
    tags: ["docs"],
    due: -7,
    created: 22,
    completed: 8,
  },
  // ---- OPS ----
  {
    project: "OPS",
    title: "راه‌اندازی پایپ‌لاین CI/CD",
    description: "ساخت، تست و استقرار خودکار با هر ادغام.",
    status: "done",
    priority: "high",
    assignee: "manager",
    tags: ["backend"],
    due: -38,
    created: 55,
    completed: 36,
  },
  {
    project: "OPS",
    title: "پشتیبان‌گیری خودکار از پایگاه داده",
    description: "پشتیبان روزانه با نگهداری ۳۰ روزه و تست بازیابی.",
    status: "done",
    priority: "urgent",
    assignee: "employee1",
    tags: ["security", "backend"],
    due: -20,
    created: 40,
    completed: 22,
  },
  {
    project: "OPS",
    title: "مانیتورینگ و هشدار خطاهای سرور",
    description: "داشبورد خطاها و هشدار در کانال تیم.",
    status: "in_progress",
    priority: "high",
    assignee: "manager",
    tags: ["backend", "urgent"],
    due: 4,
    created: 11,
    subtasks: [
      ["انتخاب ابزار مانیتورینگ", true],
      ["تعریف قانون‌های هشدار", false],
      ["اتصال به کانال تیم", false],
    ],
  },
  {
    project: "OPS",
    title: "به‌روزرسانی گواهی‌های SSL",
    description: "گواهی‌های دامنه اصلی منقضی شده‌اند و باید تمدید شوند.",
    status: "todo",
    priority: "urgent",
    assignee: "admin",
    tags: ["security", "urgent"],
    due: -4,
    created: 10,
    comments: [
      {
        by: "admin",
        text: "@supervisor تاریخ انقضای گواهی‌ها را در سند مشترک ثبت کن.",
        hoursAgo: 70,
        mentions: ["supervisor"],
      },
    ],
  },
  {
    project: "OPS",
    title: "کاهش هزینه سرورهای آزمایشی",
    description: "خاموش شدن خودکار محیط‌های آزمایشی در شب و آخر هفته.",
    status: "todo",
    priority: "medium",
    assignee: "supervisor",
    tags: ["improvement"],
    due: 16,
    created: 6,
  },
  {
    project: "OPS",
    title: "مستندسازی روند استقرار",
    description: "راهنمای گام‌به‌گام استقرار و بازگشت به نسخه قبل.",
    status: "in_review",
    priority: "low",
    assignee: "employee2",
    tags: ["docs"],
    due: 7,
    created: 13,
  },
  {
    project: "OPS",
    title: "ارتقای نسخه Node در سرویس‌ها",
    description: "ارتقا به نسخه LTS جدید و اجرای تست‌های کامل.",
    status: "done",
    priority: "medium",
    assignee: "employee1",
    tags: ["backend"],
    due: -8,
    created: 18,
    completed: 9,
  },
  {
    project: "OPS",
    title: "بررسی امنیتی دسترسی‌ها",
    description: "حذف دسترسی‌های اضافه و فعال‌سازی ورود دومرحله‌ای.",
    status: "in_progress",
    priority: "high",
    assignee: "admin",
    tags: ["security"],
    due: 10,
    created: 12,
    subtasks: [
      ["فهرست حساب‌های فعال", true],
      ["حذف دسترسی‌های اضافه", true],
      ["فعال‌سازی ورود دومرحله‌ای", false],
      ["گزارش نهایی", false],
    ],
  },
  {
    project: "OPS",
    title: "تنظیم محدودیت نرخ درخواست‌ها",
    description: "جلوگیری از سوءاستفاده در نقاط پایانی عمومی.",
    status: "done",
    priority: "medium",
    assignee: "manager",
    tags: ["security"],
    due: -2,
    created: 9,
    completed: 1,
  },
  {
    project: "OPS",
    title: "نصب و پیکربندی ابزار لاگ",
    description: "جمع‌آوری لاگ سرویس‌ها در یک نقطه.",
    status: "done",
    priority: "medium",
    assignee: "employee1",
    tags: ["backend"],
    due: -31,
    created: 34,
    completed: 30,
  },
  {
    project: "OPS",
    title: "اصلاح خطای ثبت رویدادها",
    description: "رویدادهای تکراری در لاگ ثبت می‌شدند.",
    status: "done",
    priority: "high",
    assignee: "manager",
    tags: ["bug"],
    due: -10,
    created: 14,
    completed: 12,
  },
  {
    project: "OPS",
    title: "انتقال دامنه به سرویس جدید",
    description: "انتقال بدون قطعی و بررسی رکوردهای DNS.",
    status: "done",
    priority: "high",
    assignee: "admin",
    tags: ["security"],
    due: -40,
    created: 50,
    completed: 41,
  },
];

// Notifications: [recipient, type, title, message, taskIndex, minutesAgo, read]
type SeedNotification = [
  UserKey,
  "task_assigned" | "project_updated" | "system" | "comment",
  string,
  string,
  number | null,
  number,
  boolean,
];

const NOTIFICATIONS: SeedNotification[] = [
  [
    "admin",
    "comment",
    "شما منشن شدید",
    "علی رضایی در یک نظر شما را منشن کرد.",
    21,
    25,
    false,
  ],
  [
    "admin",
    "task_assigned",
    "تسک جدید به شما محول شد",
    "به‌روزرسانی گواهی‌های SSL به شما محول شد.",
    29,
    180,
    false,
  ],
  [
    "admin",
    "comment",
    "نظر جدید",
    "محمد حسینی روی «رفع کرش هنگام باز کردن تسک بدون پروژه» نظر داد.",
    4,
    600,
    false,
  ],
  [
    "admin",
    "project_updated",
    "پروژه به‌روزرسانی شد",
    "توضیحات پروژه «زیرساخت» تغییر کرد.",
    null,
    60 * 30,
    true,
  ],
  [
    "admin",
    "system",
    "به انجام خوش آمدید",
    "فضای کاری «تیم محصول» آماده است.",
    null,
    60 * 24 * 20,
    true,
  ],
  [
    "manager",
    "task_assigned",
    "تسک جدید به شما محول شد",
    "گزارش خطای فرم عضویت در موبایل به شما محول شد.",
    21,
    240,
    false,
  ],
  [
    "manager",
    "comment",
    "شما منشن شدید",
    "سارا احمدی در یک نظر شما را منشن کرد.",
    2,
    60 * 52,
    true,
  ],
  [
    "employee1",
    "comment",
    "شما منشن شدید",
    "علی رضایی در یک نظر شما را منشن کرد.",
    2,
    60 * 49,
    false,
  ],
  [
    "employee2",
    "comment",
    "نظر جدید",
    "سارا احمدی روی «حالت تاریک در اپ» نظر داد.",
    3,
    60 * 20,
    false,
  ],
];

export const writeDevData = internalMutation({
  args: {
    authUsers: v.array(
      v.object({
        email: v.string(),
        authUserId: v.string(),
        displayName: v.string(),
      }),
    ),
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Noon UTC today: stays on the same calendar day in every timezone near Tehran.
    const today = Math.floor(now / DAY) * DAY + 12 * HOUR;

    const createdUsers: Array<{ email: string; userId: Id<"users"> }> = [];
    for (const authUser of args.authUsers) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) =>
          q.eq("authUserId", authUser.authUserId),
        )
        .first();

      if (existing) {
        // Always refresh the display name so the demo shows Persian names.
        if (existing.displayName !== authUser.displayName) {
          await ctx.db.patch(existing._id, {
            displayName: authUser.displayName,
            updatedAt: Date.now(),
          });
        }
        createdUsers.push({ email: authUser.email, userId: existing._id });
        continue;
      }

      const userId = await ctx.db.insert("users", {
        authUserId: authUser.authUserId,
        email: authUser.email,
        displayName: authUser.displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      createdUsers.push({ email: authUser.email, userId });
    }

    const emailToId = new Map<string, Id<"users">>(
      createdUsers.map((u) => [u.email, u.userId]),
    );
    const getUserId = (email: string) => {
      const userId = emailToId.get(email.toLowerCase());
      if (!userId) {
        throw new Error(`Missing seeded user for ${email}`);
      }
      return userId;
    };
    const uid = (key: UserKey) => getUserId(USER_EMAIL[key]);

    if (args.reset) {
      const orgs = [
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", ORG_1.slug))
          .first(),
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", ORG_2.slug))
          .first(),
      ].filter((org): org is NonNullable<typeof org> => org !== null);
      for (const org of orgs) {
        const members = await ctx.db
          .query("organizationMembers")
          .withIndex("by_org", (q) => q.eq("organizationId", org._id))
          .collect();
        for (const member of members) {
          await ctx.db.delete(member._id);
        }
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_org", (q) => q.eq("organizationId", org._id))
          .collect();
        for (const project of projects) {
          const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .collect();
          for (const task of tasks) {
            const comments = await ctx.db
              .query("comments")
              .withIndex("by_taskId", (q) => q.eq("taskId", task._id))
              .collect();
            for (const comment of comments) {
              const mentions = await ctx.db
                .query("mentions")
                .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
                .collect();
              for (const mention of mentions) {
                await ctx.db.delete(mention._id);
              }
              await ctx.db.delete(comment._id);
            }
            const subtasks = await ctx.db
              .query("subtasks")
              .withIndex("by_taskId", (q) => q.eq("taskId", task._id))
              .collect();
            for (const subtask of subtasks) {
              await ctx.db.delete(subtask._id);
            }
            await ctx.db.delete(task._id);
          }
          const counter = await ctx.db
            .query("projectCounters")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .first();
          if (counter) {
            await ctx.db.delete(counter._id);
          }
          await ctx.db.delete(project._id);
        }
        const tags = await ctx.db
          .query("tags")
          .withIndex("by_org", (q) => q.eq("organizationId", org._id))
          .collect();
        for (const tag of tags) {
          await ctx.db.delete(tag._id);
        }
        await ctx.db.delete(org._id);
      }
      for (const { userId } of createdUsers) {
        const notifications = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();
        for (const notification of notifications) {
          await ctx.db.delete(notification._id);
        }
      }
    }

    const upsertOrg = async (orgData: typeof ORG_1) => {
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", orgData.slug))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          name: orgData.name,
          description: orgData.description,
        });
        return existing._id;
      }
      return await ctx.db.insert("organizations", {
        name: orgData.name,
        slug: orgData.slug,
        description: orgData.description,
        active: true,
        plan: "free",
        settings: {},
      });
    };

    const ensureMember = async (
      organizationId: Id<"organizations">,
      userId: Id<"users">,
      role: "owner" | "member",
    ) => {
      const existing = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org_user", (q) =>
          q.eq("organizationId", organizationId).eq("userId", userId),
        )
        .first();
      if (existing) {
        if (existing.role !== role || existing.status !== "active") {
          await ctx.db.patch(existing._id, {
            role,
            status: "active",
            onboardingCompleted: true,
          });
        }
        return existing._id;
      }
      return await ctx.db.insert("organizationMembers", {
        organizationId,
        userId,
        role,
        status: "active",
        onboardingCompleted: true,
        joinedAt: Date.now(),
      });
    };

    const org1Id = await upsertOrg(ORG_1);
    const org2Id = await upsertOrg(ORG_2);

    await ensureMember(org1Id, uid("admin"), "owner");
    await ensureMember(org1Id, uid("manager"), "member");
    await ensureMember(org1Id, uid("supervisor"), "member");
    await ensureMember(org1Id, uid("employee1"), "member");
    await ensureMember(org1Id, uid("employee2"), "member");
    await ensureMember(org2Id, uid("supervisor"), "owner");

    // Projects
    const projectIds = new Map<ProjectKey, Id<"projects">>();
    for (const project of PROJECTS) {
      const existingProject = await ctx.db
        .query("projects")
        .withIndex("by_code", (q) => q.eq("code", project.code))
        .first();
      const projectId: Id<"projects"> =
        existingProject && existingProject.organizationId === org1Id
          ? existingProject._id
          : await ctx.db.insert("projects", {
              organizationId: org1Id,
              name: project.name,
              code: project.code,
              description: project.description,
              supervisorUserId: uid(project.supervisor),
              updatedAt: now,
            });
      projectIds.set(project.code, projectId);
    }
    const projectId = projectIds.get("APP")!;

    // Tags
    const tagIds = new Map<TagKey, Id<"tags">>();
    for (const [key, tag] of Object.entries(TAGS) as Array<
      [TagKey, (typeof TAGS)[TagKey]]
    >) {
      const existingTag = await ctx.db
        .query("tags")
        .withIndex("by_org_name", (q) =>
          q.eq("organizationId", org1Id).eq("name", tag.name),
        )
        .first();
      tagIds.set(
        key,
        existingTag?._id ??
          (await ctx.db.insert("tags", {
            organizationId: org1Id,
            name: tag.name,
            color: tag.color,
            creatorUserId: uid("admin"),
          })),
      );
    }
    const tagId = tagIds.get("urgent")!;

    // Tasks (+ subtasks, comments, mentions)
    const counters = new Map<
      ProjectKey,
      { id: Id<"projectCounters"> | null; next: number }
    >();
    for (const project of PROJECTS) {
      const counter = await ctx.db
        .query("projectCounters")
        .withIndex("by_projectId", (q) =>
          q.eq("projectId", projectIds.get(project.code)!),
        )
        .first();
      counters.set(project.code, {
        id: counter?._id ?? null,
        next: counter?.nextTaskNumber ?? 1,
      });
    }

    const taskIds: Array<Id<"tasks"> | null> = [];
    for (const [index, task] of TASKS.entries()) {
      const pid = projectIds.get(task.project)!;
      const existingTask = await ctx.db
        .query("tasks")
        .withIndex("by_projectId", (q) => q.eq("projectId", pid))
        .filter((q) => q.eq(q.field("title"), task.title))
        .first();
      if (existingTask) {
        taskIds.push(existingTask._id);
        continue;
      }

      const counter = counters.get(task.project)!;
      const taskNumber = counter.next;
      counter.next += 1;

      const createdAt = now - task.created * DAY;
      const completedAt =
        task.status === "done" && task.completed !== undefined
          ? now - task.completed * DAY
          : undefined;
      const updatedAt =
        completedAt ?? Math.max(createdAt, now - ((index % 9) + 1) * 5 * HOUR);

      const taskId = await ctx.db.insert("tasks", {
        projectId: pid,
        organizationId: org1Id,
        creatorUserId: uid(task.creator ?? "admin"),
        assigneeUserId: task.assignee ? uid(task.assignee) : undefined,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.due !== undefined ? today + task.due * DAY : undefined,
        order: (index + 1) * 1024,
        tags: task.tags.map((key) => tagIds.get(key)!),
        displayId: `${task.project}-${taskNumber.toString().padStart(3, "0")}`,
        taskNumber,
        createdAt,
        completedAt,
        updatedAt,
      });
      taskIds.push(taskId);

      for (const [order, [title, isDone]] of (task.subtasks ?? []).entries()) {
        await ctx.db.insert("subtasks", {
          taskId,
          title,
          isDone,
          order: order + 1,
          assigneeUserId: task.assignee ? uid(task.assignee) : undefined,
          updatedAt,
        });
      }

      for (const comment of task.comments ?? []) {
        const reactions = comment.reactions
          ? Object.fromEntries(
              Object.entries(comment.reactions).map(([key, users]) => [
                key,
                users.map((u) => uid(u)),
              ]),
            )
          : undefined;
        const commentId = await ctx.db.insert("comments", {
          taskId,
          userId: uid(comment.by),
          content: comment.text,
          reactions,
        });
        for (const mentioned of comment.mentions ?? []) {
          await ctx.db.insert("mentions", {
            mentionedUserId: uid(mentioned),
            commentId,
            taskId,
            projectId: pid,
            createdAt: now - comment.hoursAgo * HOUR,
          });
        }
      }
    }

    for (const project of PROJECTS) {
      const counter = counters.get(project.code)!;
      if (counter.id) {
        await ctx.db.patch(counter.id, { nextTaskNumber: counter.next });
      } else {
        await ctx.db.insert("projectCounters", {
          projectId: projectIds.get(project.code)!,
          nextTaskNumber: counter.next,
        });
      }
    }

    // Notifications are only added on a fresh seed to avoid duplicates.
    const hasNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", uid("admin")))
      .first();
    if (!hasNotifications) {
      for (const [
        who,
        type,
        title,
        message,
        taskIdx,
        minutesAgo,
        read,
      ] of NOTIFICATIONS) {
        const taskId = taskIdx !== null ? taskIds[taskIdx] : null;
        await ctx.db.insert("notifications", {
          userId: uid(who),
          type,
          title,
          message,
          data: taskId ? { taskId } : undefined,
          read,
          createdAt: now - minutesAgo * 60_000,
        });
      }
    }

    return {
      org1Id,
      org2Id,
      projectId,
      tagId,
    };
  },
});

export const seedDevData = internalAction({
  args: {
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (process.env.ALLOW_DEV_SEED !== "true") {
      throw new Error(
        "Seeding is disabled. Set ALLOW_DEV_SEED=true on a development deployment.",
      );
    }
    const authUsers: Array<{
      email: string;
      authUserId: string;
      displayName: string;
    }> = [];
    const { auth, headers } = await authComponent.getAuth(
      createAuth,
      toAuthCtx(ctx),
    );

    for (const user of TEST_USERS) {
      const email = user.email.toLowerCase();
      const existingAuthUser = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
          model: "user",
          where: [{ field: "email", value: email }],
        },
      );
      const authUser =
        existingAuthUser ??
        (
          await auth.api.signUpEmail({
            body: {
              name: user.displayName,
              email,
              password: user.password,
            },
            headers,
          })
        ).user;
      const authUserId =
        "id" in authUser && authUser.id ? authUser.id : authUser._id;
      authUsers.push({
        email,
        authUserId,
        displayName: user.displayName,
      });
    }

    const writeDevDataRef = "seed:writeDevData" as unknown as FunctionReference<
      "mutation",
      "internal"
    >;
    return await ctx.runMutation(writeDevDataRef, {
      authUsers,
      reset: args.reset ?? false,
    });
  },
});
