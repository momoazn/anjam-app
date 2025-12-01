import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/user-avatar";
import { fa } from "@/constants/text";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/hooks/users";
import { useAuthActions, useAuthUser } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import { pb } from "@/lib/pocketbase";
import { UsersRecord } from "@/lib/pocketbase-types";
import {
  Loader2,
  User,
  Palette,
  Shield,
  Info,
  Camera,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserLoginLogsResponse } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";

// --- Validation Schemas ---

const profileSchema = z.object({
  username: z.string().min(3, fa.auth.errors.usernameMinLength),
  first_name: z.string().min(1, fa.auth.errors.firstNameRequired),
  last_name: z.string().min(1, fa.auth.errors.lastNameRequired),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
    password: z.string().min(8, fa.auth.errors.passwordMinLength),
    passwordConfirm: z.string().min(1, fa.auth.errors.passwordConfirmRequired),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: fa.auth.errors.passwordsMismatch,
    path: ["passwordConfirm"],
  });

// --- Components ---

function SettingsSidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const menuItems = [
    { id: "profile", label: "پروفایل کاربری", icon: User },
    { id: "appearance", label: "ظاهر و تم", icon: Palette },
    { id: "security", label: "امنیت و ورود", icon: Shield },
    { id: "about", label: "درباره برنامه", icon: Info },
  ];

  return (
    <nav className="flex space-x-2 space-x-reverse lg:flex-col lg:space-y-1 lg:space-x-0">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className={cn(
              "justify-start gap-3",
              activeTab === item.id && "bg-muted font-medium",
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}

function ProfileSection() {
  const user = useAuthUser();
  const { updateUser } = useAuthActions();
  const { data: fullUser, refetch } = useUser({ id: user?.id ?? "" });
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
    },
  });

  React.useEffect(() => {
    if (fullUser) {
      form.reset({
        username: fullUser.username,
        first_name: fullUser.first_name ?? "",
        last_name: fullUser.last_name ?? "",
      });
    }
  }, [fullUser, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user?.id) return;

    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("first_name", values.first_name);
      formData.append("last_name", values.last_name);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // We need to cast formData to any because update expects Partial<Record> but SDK supports FormData
      const updatedRecord = await pb
        .collection("users")
        .update<UsersRecord>(user.id, formData);

      // Invalidate queries handled by useUpdateUser if we used it directly,
      // but here we used pb directly for FormData support.
      // So we should manually invalidate or use the hook if we can pass FormData.
      // Actually useUpdateUser hook accepts Partial<UsersRecord>.
      // Passing FormData to it might break type checking but works at runtime.
      // To be safe and clean, let's just refetch manually.

      refetch();
      updateUser(updatedRecord);
      toast({
        title: "پروفایل بروزرسانی شد",
        description: "اطلاعات شما با موفقیت ذخیره گردید.",
      });
      setAvatarFile(null);
    } catch {
      toast({
        title: "خطا",
        description: "خطایی در ذخیره اطلاعات رخ داد.",
        variant: "destructive",
      });
    }
  };

  if (!fullUser) return <Loader2 className="mx-auto h-8 w-8 animate-spin" />;

  const currentAvatarUrl = previewUrl
    ? previewUrl
    : fullUser.avatar
      ? pb.files.getUrl(fullUser, fullUser.avatar)
      : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات شناسایی</CardTitle>
          <CardDescription>
            تصویر پروفایل و نام نمایشی خود را مدیریت کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="group relative">
                  <UserAvatar
                    user={{ ...fullUser, avatar: currentAvatarUrl }}
                    className="ring-background h-24 w-24 ring-4"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 cursor-pointer rounded-full p-2 shadow-lg transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">تغییر تصویر</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="w-full flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام خانوادگی</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام کاربری</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" className="text-left" />
                        </FormControl>
                        <FormDescription>
                          نام کاربری منحصر به فرد شما در سیستم.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  ذخیره تغییرات
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات تماس</CardTitle>
          <CardDescription>
            ایمیل شما جهت بازیابی رمز عبور و دریافت اعلان‌ها استفاده می‌شود.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>آدرس ایمیل</Label>
            <Input
              value={fullUser.email}
              disabled
              className="bg-muted"
              dir="ltr"
            />
            <p className="text-muted-foreground text-[0.8rem]">
              برای تغییر ایمیل با پشتیبانی تماس بگیرید.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تم برنامه</CardTitle>
          <CardDescription>
            ظاهر برنامه را متناسب با سلیقه خود شخصی‌سازی کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className={cn(
                "flex h-24 flex-col gap-2 border-2",
                theme === "light" && "border-primary bg-primary/5",
              )}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-6 w-6" />
              <span className="font-medium">روشن</span>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "flex h-24 flex-col gap-2 border-2",
                theme === "dark" && "border-primary bg-primary/5",
              )}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-6 w-6" />
              <span className="font-medium">تاریک</span>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "flex h-24 flex-col gap-2 border-2",
                theme === "system" && "border-primary bg-primary/5",
              )}
              onClick={() => setTheme("system")}
            >
              <Laptop className="h-6 w-6" />
              <span className="font-medium">سیستم</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySection() {
  const user = useAuthUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const { data: loginLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["login-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        // Using the custom endpoint defined in main.go
        return await pb.send<UserLoginLogsResponse[]>(
          `/api/tm/users/${user.id}/login-logs`,
          {
            method: "GET",
          },
        );
      } catch {
        // Silently fail - return empty array
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    if (!user?.id) return;
    try {
      await pb.collection("users").update(user.id, {
        oldPassword: values.oldPassword,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
      });
      toast({
        title: "رمز عبور تغییر کرد",
        description: "رمز عبور شما با موفقیت تغییر یافت.",
      });
      form.reset();
    } catch {
      toast({
        title: "خطا",
        description: "رمز عبور فعلی اشتباه است یا خطایی رخ داده.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تغییر رمز عبور</CardTitle>
          <CardDescription>
            برای امنیت بیشتر، رمز عبور قوی انتخاب کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onChangePassword)}
              className="max-w-md space-y-4"
            >
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور فعلی</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور جدید</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تکرار رمز عبور جدید</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  بروزرسانی رمز عبور
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نشست‌های فعال</CardTitle>
          <CardDescription>
            تاریخچه ورودهای اخیر به حساب کاربری شما.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="flex justify-center p-4">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              {loginLogs && loginLogs.length > 0 ? (
                <div className="divide-y">
                  {loginLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {log.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {log.ip_address || "Unknown IP"}
                          </p>
                          <p className="text-muted-foreground max-w-[200px] truncate text-xs sm:max-w-xs">
                            {log.user_agent || "Unknown Device"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(log.created || "").toLocaleString(
                              "fa-IR",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground p-8 text-center">
                  هیچ سابقه ورودی یافت نشد.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>درباره برنامه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-xl">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{fa.app.name}</h3>
              <p className="text-muted-foreground">نسخه ۱.۰.۰</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <p>این برنامه جهت مدیریت پروژه‌ها و تسک‌های تیمی طراحی شده است.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page Component ---

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div dir="rtl" className="min-h-screen pb-10">
      <PageTransition className="container mx-auto max-w-5xl p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">تنظیمات</h1>
          <p className="text-muted-foreground mt-2">
            مدیریت حساب کاربری و تنظیمات برنامه
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-1/4">
            <SettingsSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </aside>

          <div className="flex-1">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "appearance" && <AppearanceSection />}
            {activeTab === "security" && <SecuritySection />}
            {activeTab === "about" && <AboutSection />}
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
