import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function Helps() {
  return (
    <div className="container mx-auto px-8 py-8">
      <h1 className="mb-8 text-3xl font-bold">راهنمای استفاده از سیستم</h1>
      <Separator />
      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Features Section */}
        <AccordionItem value="features">
          <AccordionTrigger className="text-xl">
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
                {/* <li>امکان فیلتر تسک‌ها بر اساس وضعیت و اولویت</li> */}
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
          <AccordionTrigger className="text-xl">
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
          <AccordionTrigger className="text-xl">پروژه‌ها</AccordionTrigger>
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
          <AccordionTrigger className="text-xl">تسک‌ها</AccordionTrigger>
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
              <h3 className="mb-2 text-lg font-semibold">ایجاد و ویرایش تسک</h3>
              <p>برای ایجاد تسک جدید:</p>
              <ol className="list-inside list-decimal space-y-1 pt-2">
                <li>وارد پروژه مورد نظر شوید</li>
                <li>روی دکمه "افزودن تسک" کلیک کنید</li>
                <li>عنوان و توضیحات تسک را وارد کنید</li>
                <li>اولویت و وضعیت را تعیین کنید</li>
                <li>مسئول انجام را مشخص کنید</li>
                <li>در صورت نیاز، مهلت انجام را تعیین کنید</li>
                <li>دکمه "ایجاد" را بزنید</li>
              </ol>
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

        {/* System Features Section */}
        {/* <AccordionItem value="system">
          <AccordionTrigger className="text-xl">
            ویژگی‌های سیستم
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">امنیت</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>احراز هویت کاربران</li>
                <li>کنترل دسترسی بر اساس نقش</li>
                <li>محافظت از داده‌های حساس</li>
                <li>ثبت فعالیت‌های کاربران</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                رابط کاربری پیشرفته
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>طراحی واکنش‌گرا برای تمام دستگاه‌ها</li>
                <li>پشتیبانی از تم روشن و تاریک</li>
                <li>رابط کاربری روان و سریع</li>
                <li>پشتیبانی کامل از زبان فارسی</li>
                <li>قابلیت شخصی‌سازی نمایش</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                پشتیبانی و راهنمایی
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>راهنمای جامع استفاده از سیستم</li>
                <li>پاسخ به سوالات متداول</li>
                <li>اعلان‌های راهنما در بخش‌های مختلف</li>
                <li>نمایش پیام‌های خطا و موفقیت</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">قابلیت‌های عمومی</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>ذخیره خودکار تغییرات</li>
                <li>امکان بازگشت به نسخه‌های قبلی</li>
                <li>گزارش‌گیری از فعالیت‌ها</li>
                <li>پشتیبان‌گیری خودکار از داده‌ها</li>
                <li>همگام‌سازی اطلاعات در زمان واقعی</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem> */}
      </Accordion>
    </div>
  );
}
