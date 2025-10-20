import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function Helps() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            راهنمای استفاده از سیستم
          </h1>
          <p className="text-muted-foreground mt-2">
            راهنمای کامل برای استفاده از امکانات سیستم مدیریت تسک‌ها
          </p>
        </div>
        <div className="flex gap-2">
          <button className="hover:bg-muted rounded-md border px-3 py-2 text-sm">
            سوالات متداول
          </button>
          <button className="hover:bg-muted rounded-md border px-3 py-2 text-sm">
            تماس با پشتیبانی
          </button>
        </div>
      </div>
      <Separator className="mb-6" />
      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Getting Started Section */}
        <AccordionItem value="getting-started">
          <AccordionTrigger className="text-lg md:text-xl">
            شروع کار با سیستم
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                مراحل اولیه
              </h3>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  <span className="font-medium">ورود به سیستم:</span> با نام
                  کاربری و رمز عبور خود وارد شوید
                </li>
                <li>
                  <span className="font-medium">آشنایی با داشبورد:</span>{" "}
                  داشبورد اصلی آمار و اطلاعات کلی را نمایش می‌دهد
                </li>
                <li>
                  <span className="font-medium">ایجاد اولین پروژه:</span> از بخش
                  پروژه‌ها، پروژه جدیدی ایجاد کنید
                </li>
                <li>
                  <span className="font-medium">افزودن اعضا:</span> کاربران را
                  به پروژه اضافه کنید
                </li>
                <li>
                  <span className="font-medium">ایجاد تسک‌ها:</span> تسک‌های
                  کاری را تعریف و تخصیص دهید
                </li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                کلیدهای میانبر
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded border p-2">
                  <code className="text-sm">Ctrl/Cmd + K</code>
                  <span className="text-muted-foreground mr-2">
                    : فوکوس روی جستجو
                  </span>
                </div>
                <div className="rounded border p-2">
                  <code className="text-sm">Ctrl/Cmd + N</code>
                  <span className="text-muted-foreground mr-2">: تسک جدید</span>
                </div>
                <div className="rounded border p-2">
                  <code className="text-sm">Ctrl/Cmd + P</code>
                  <span className="text-muted-foreground mr-2">: پروژه‌ها</span>
                </div>
                <div className="rounded border p-2">
                  <code className="text-sm">Ctrl/Cmd + D</code>
                  <span className="text-muted-foreground mr-2">: داشبورد</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features Section */}
        <AccordionItem value="features">
          <AccordionTrigger className="text-lg md:text-xl">
            امکانات و ویژگی‌ها
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">مدیریت کاربران</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>ایجاد و مدیریت کاربران با نقش‌های مختلف</li>
                <li>تعیین دسترسی‌های کاربران</li>
                <li>مدیریت عضویت کاربران در پروژه‌ها</li>
                <li>تغییر نقش کاربران توسط مدیران سیستم</li>
                <li>امکان تغییر اطلاعات شخصی توسط خود کاربر</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">مدیریت پروژه‌ها</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>ایجاد و مدیریت پروژه‌های مختلف</li>
                <li>تعیین سرپرست و اعضای پروژه</li>
                <li>مشاهده وضعیت کلی پروژه</li>
                <li>دسته‌بندی و مدیریت تسک‌ها</li>
                <li>نمایش آمار و وضعیت پیشرفت پروژه</li>
                <li>مدیریت دسترسی اعضای پروژه</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">مدیریت تسک‌ها</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>ایجاد و مدیریت تسک‌ها با جزئیات کامل</li>
                <li>تعیین اولویت و وضعیت تسک‌ها</li>
                <li>اختصاص تسک به کاربران</li>
                <li>تعیین مهلت انجام</li>
                <li>دسته‌بندی تسک‌ها بر اساس وضعیت</li>
                <li>شماره‌گذاری خودکار تسک‌ها (مثال: PRJ-001)</li>
                <li>امکان فیلتر تسک‌ها بر اساس وضعیت و اولویت</li>
                {/* <li>نمایش تاریخچه تغییرات تسک‌ها</li> */}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">رابط کاربری</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>طراحی ساده و کاربرپسند</li>
                <li>دسترسی سریع به بخش‌های مختلف</li>
                <li>نمایش اطلاعات به صورت سازمان‌یافته</li>
                {/* <li>پشتیبانی از زبان فارسی</li>
                <li>رابط کاربری واکنش‌گرا (Responsive)</li> */}
                <li>نمایش اعلان‌های سیستمی</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* User Roles Section */}
        <AccordionItem value="roles">
          <AccordionTrigger className="text-lg md:text-xl">
            نقش‌های کاربری و دسترسی‌ها
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">مدیر سیستم (Admin)</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>دسترسی کامل به تمام بخش‌های سیستم</li>
                <li>ایجاد، ویرایش و حذف کاربران با هر نقشی</li>
                <li>نمایش همه پروژه‌ها</li>
                <li>ایجاد، ویرایش و حذف تمام تسک‌ها</li>
                <li>مدیریت دسترسی‌های کاربران به پروژه‌ها</li>
                <li>تغییر نقش کاربران</li>
                {/* <li>مشاهده گزارش‌های سیستمی</li> */}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                سرپرست (Supervisor)
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>ایجاد و مدیریت پروژه‌های خود</li>
                <li>اضافه کردن کاربران به پروژه‌های تحت نظارت</li>
                <li>ایجاد و مدیریت تسک‌ها در پروژه‌های تحت نظارت</li>
                <li>مشاهده و ویرایش اطلاعات کاربران پروژه‌های تحت نظارت</li>
                <li>تعیین وضعیت و اولویت تسک‌ها</li>
                <li>مشاهده گزارش عملکرد اعضای پروژه</li>
                <li>تعیین مهلت زمانی برای تسک‌ها</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">کارمند (Employee)</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>مشاهده پروژه‌هایی که در آن‌ها عضو است</li>
                <li>مشاهده و ویرایش تسک‌های اختصاص داده شده</li>
                <li>به‌روزرسانی وضعیت تسک‌های خود</li>
                <li>مشاهده سایر اعضای پروژه</li>
                <li>دریافت اعلان‌های مربوط به تسک‌های خود</li>
                <li>مشاهده تاریخچه فعالیت‌های خود</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Projects Section */}
        <AccordionItem value="projects">
          <AccordionTrigger className="text-lg md:text-xl">
            پروژه‌ها
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">درباره پروژه‌ها</h3>
              <p>
                پروژه‌ها واحدهای اصلی سازماندهی کار در سیستم هستند. هر پروژه
                شامل:
              </p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                <li>نام پروژه</li>
                <li>کد پروژه</li>
                <li>سرپرست پروژه</li>
                <li>اعضای پروژه</li>
                <li>مجموعه‌ای از تسک‌ها</li>
                <li>تاریخ ایجاد و آخرین به‌روزرسانی</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                ایجاد و ویرایش پروژه
              </h3>
              <p>برای ایجاد پروژه جدید:</p>
              <ol className="list-inside list-decimal space-y-1 pt-2">
                <li>به بخش "پروژه‌ها" بروید</li>
                <li>روی دکمه "پروژه جدید" کلیک کنید</li>
                <li>نام پروژه را وارد کنید</li>
                <li>کد پروژه را وارد کنید (باید ۳ حرفی و با حروف بزرگ باشد)</li>
                <li>دکمه "ایجاد" را بزنید</li>
              </ol>
              <p className="mt-4">پس از ایجاد پروژه می‌توانید:</p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                <li>اعضای پروژه را اضافه کنید</li>
                <li>تسک‌های جدید ایجاد کنید</li>
                <li>وضعیت کلی پروژه را مشاهده کنید</li>
                <li>گزارش‌های پیشرفت را بررسی کنید</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">مدیریت اعضای پروژه</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>افزودن کاربران جدید به پروژه</li>
                <li>حذف کاربران از پروژه</li>
                <li>مشاهده لیست اعضای فعلی</li>
                <li>تعیین دسترسی‌های اعضا</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">دسترسی به پروژه‌ها</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>مدیران سیستم: دسترسی به تمام پروژه‌ها</li>
                <li>سرپرستان: دسترسی به پروژه‌های تحت نظارت خود</li>
                <li>کارمندان: دسترسی به پروژه‌هایی که در آن‌ها عضو هستند</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tasks Section */}
        <AccordionItem value="tasks">
          <AccordionTrigger className="text-lg md:text-xl">
            تسک‌ها
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">درباره تسک‌ها</h3>
              <p>تسک‌ها واحدهای کاری در هر پروژه هستند. هر تسک شامل:</p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                <li>عنوان و توضیحات</li>
                <li>شماره منحصر به فرد (مثال: PRJ-001)</li>
                <li>وضعیت (برای انجام، در حال انجام، انجام‌شده، لغوشده)</li>
                <li>اولویت (فوری، بالا، متوسط، پایین)</li>
                <li>مسئول انجام</li>
                <li>مهلت انجام</li>
                {/* <li>تاریخ ایجاد و آخرین به‌روزرسانی</li> */}
                {/* <li>ایجادکننده تسک</li> */}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">وضعیت‌های تسک</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <span className="font-medium">برای انجام (Todo):</span>{" "}
                  تسک‌های جدید که هنوز شروع نشده‌اند
                </li>
                <li>
                  <span className="font-medium">
                    در حال انجام (In Progress):
                  </span>{" "}
                  تسک‌هایی که در حال حاضر روی آن‌ها کار می‌شود
                </li>
                <li>
                  <span className="font-medium">انجام‌شده (Done):</span> تسک‌های
                  تکمیل شده
                </li>
                <li>
                  <span className="font-medium">لغوشده (Canceled):</span>{" "}
                  تسک‌هایی که به هر دلیلی لغو شده‌اند
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">اولویت‌های تسک</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <span className="font-medium">فوری (Urgent):</span> نیاز به
                  رسیدگی فوری دارد
                </li>
                <li>
                  <span className="font-medium">بالا (High):</span> اولویت بالا
                  برای انجام
                </li>
                <li>
                  <span className="font-medium">متوسط (Medium):</span> اولویت
                  معمولی
                </li>
                <li>
                  <span className="font-medium">پایین (Low):</span> می‌تواند با
                  تأخیر انجام شود
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                ایجاد و ویرایش تسک
              </h3>
              <p>برای ایجاد تسک جدید:</p>
              <ol className="list-inside list-decimal space-y-1 pt-2">
                <li>
                  وارد پروژه مورد نظر شوید یا از بخش "تسک‌ها" استفاده کنید
                </li>
                <li>روی دکمه "افزودن تسک" یا دکمه "+" کلیک کنید</li>
                <li>عنوان و توضیحات تسک را وارد کنید</li>
                <li>اولویت و وضعیت را تعیین کنید</li>
                <li>مسئول انجام را مشخص کنید</li>
                <li>در صورت نیاز، مهلت انجام را تعیین کنید</li>
                <li>دکمه "ایجاد" را بزنید</li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                نکات کاربردی
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">فیلتر و جستجو</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    از فیلترهای پیشرفته برای یافتن تسک‌های مورد نظر استفاده کنید
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">اولویت‌بندی</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    تسک‌های فوری را با اولویت بالا مشخص کنید
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">مهلت زمانی</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    همیشه مهلت انجام را مشخص کنید تا تسک‌ها فراموش نشوند
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">به‌روزرسانی وضعیت</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    وضعیت تسک‌ها را به طور منظم به‌روزرسانی کنید
                  </p>
                </div>
              </div>
            </div>

            {/* <div>
              <h3 className="mb-2 text-lg font-semibold">مدیریت تسک‌ها</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>تغییر وضعیت تسک با کشیدن و رها کردن (Drag & Drop)</li>
                <li>فیلتر کردن تسک‌ها بر اساس وضعیت</li>
                <li>مرتب‌سازی بر اساس اولویت</li>
                <li>جستجو در تسک‌ها</li>
                <li>مشاهده تاریخچه تغییرات</li>
              </ul>
            </div> */}
          </AccordionContent>
        </AccordionItem>

        {/* Troubleshooting Section */}
        <AccordionItem value="troubleshooting">
          <AccordionTrigger className="text-lg md:text-xl">
            راهنمای عیب‌یابی
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                مشکلات رایج
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    نمی‌توانم وارد سیستم شوم
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    نام کاربری و رمز عبور خود را بررسی کنید. در صورت فراموشی، با
                    مدیر سیستم تماس بگیرید.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    تسک‌ها نمایش داده نمی‌شوند
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    فیلترهای اعمال شده را بررسی کنید و در صورت نیاز آنها را پاک
                    کنید.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    نمی‌توانم تسک جدیدی ایجاد کنم
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    مطمئن شوید که به پروژه مورد نظر دسترسی دارید و نقش شما اجازه
                    ایجاد تسک را می‌دهد.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    گزارش‌ها بارگذاری نمی‌شوند
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    اتصال اینترنت خود را بررسی کنید و صفحه را مجدداً بارگذاری
                    کنید.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                تماس با پشتیبانی
              </h3>
              <p className="text-muted-foreground text-sm">
                در صورت بروز مشکل یا نیاز به راهنمایی بیشتر، از طریق بخش "تماس
                با پشتیبانی" یا ایمیل با تیم فنی ارتباط برقرار کنید.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* System Features Section */}
        <AccordionItem value="system">
          <AccordionTrigger className="text-lg md:text-xl">
            ویژگی‌های پیشرفته سیستم
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                امنیت و دسترسی
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>احراز هویت امن کاربران</li>
                <li>کنترل دسترسی بر اساس نقش‌های کاربری</li>
                <li>رمزگذاری داده‌های حساس</li>
                <li>ثبت فعالیت‌های کاربران برای پیگیری</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                رابط کاربری هوشمند
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>طراحی کاملاً واکنش‌گرا برای موبایل و دسکتاپ</li>
                <li>پشتیبانی از تم روشن و تاریک</li>
                <li>پشتیبانی کامل از زبان فارسی</li>
                <li>کلیدهای میانبر برای دسترسی سریع</li>
                <li>دسترسی‌پذیری کامل برای کاربران کم‌توان</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                کارایی و سرعت
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>بارگذاری سریع صفحات و داده‌ها</li>
                <li>به‌روزرسانی خودکار اطلاعات</li>
                <li>ذخیره‌سازی محلی برای عملکرد بهتر</li>
                <li>همگام‌سازی داده‌ها در زمان واقعی</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
