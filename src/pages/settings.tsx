import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fa } from "@/constants/text";
import { Bell, Palette, Settings, Shield, User } from "lucide-react";

// Settings sections components
function ProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          نمایه کاربری
        </CardTitle>
        <CardDescription>
          اطلاعات پروفایل و تنظیمات حساب کاربری خود را مدیریت کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">ویرایش پروفایل</p>
            <p className="text-muted-foreground text-sm">
              نام، نام خانوادگی و سایر اطلاعات پروفایل
            </p>
          </div>
          <Button variant="outline" size="sm">
            ویرایش
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">تغییر رمز عبور</p>
            <p className="text-muted-foreground text-sm">
              رمز عبور حساب کاربری خود را تغییر دهید
            </p>
          </div>
          <Button variant="outline" size="sm">
            تغییر رمز
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          اعلان‌ها
        </CardTitle>
        <CardDescription>تنظیمات اعلان‌ها و اطلاع‌رسانی‌ها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>اعلان‌های ایمیل</Label>
            <p className="text-muted-foreground text-sm">
              دریافت اعلان‌های مهم از طریق ایمیل
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>اعلان‌های مرورگر</Label>
            <p className="text-muted-foreground text-sm">
              نمایش اعلان‌های مرورگر برای فعالیت‌ها
            </p>
          </div>
          <Switch />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>اعلان‌های تسک‌ها</Label>
            <p className="text-muted-foreground text-sm">
              اطلاع‌رسانی در مورد تغییرات تسک‌ها
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          نمایش
        </CardTitle>
        <CardDescription>تنظیمات نمایش و ظاهر برنامه</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>تم تاریک</Label>
            <p className="text-muted-foreground text-sm">
              استفاده از تم تاریک برای کاهش خستگی چشم
            </p>
          </div>
          <Switch />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>فونت بزرگ</Label>
            <p className="text-muted-foreground text-sm">
              استفاده از فونت بزرگ‌تر برای بهبود readability
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          امنیت
        </CardTitle>
        <CardDescription>تنظیمات امنیتی حساب کاربری</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">ورود دو مرحله‌ای</p>
            <p className="text-muted-foreground text-sm">
              افزایش امنیت حساب با ورود دو مرحله‌ای
            </p>
          </div>
          <Button variant="outline" size="sm">
            تنظیم
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">دستگاه‌های فعال</p>
            <p className="text-muted-foreground text-sm">
              مدیریت دستگاه‌های وارد شده به حساب
            </p>
          </div>
          <Button variant="outline" size="sm">
            مشاهده
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <Settings className="h-5 w-5 md:h-6 md:w-6" />
          {fa.navigation.settings}
        </h1>
        <p className="text-muted-foreground mt-2">
          تنظیمات حساب کاربری و برنامه را مدیریت کنید
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">پروفایل</TabsTrigger>
          <TabsTrigger value="notifications">اعلان‌ها</TabsTrigger>
          <TabsTrigger value="appearance">نمایش</TabsTrigger>
          <TabsTrigger value="security">امنیت</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
