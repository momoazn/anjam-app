import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { auth, settings } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { pb } from "@/lib/pocketbase";
import type { UserLoginLogsResponse } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

const passwordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, settings.security.validation.oldPasswordRequired),
    password: z.string().min(8, auth.errors.passwordMinLength),
    passwordConfirm: z.string().min(1, auth.errors.passwordConfirmRequired),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: auth.errors.passwordsMismatch,
    path: ["passwordConfirm"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecuritySection() {
  const user = useAuthUser();
  const { toast } = useToast();

  const form = useForm<PasswordFormValues>({
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
        const res = await pb.send<{
          data: { items: UserLoginLogsResponse[] };
        }>(`/api/v1/users/${user.id}/login-logs`, { method: "GET" });
        return res.data.items;
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const onChangePassword = async (values: PasswordFormValues) => {
    if (!user?.id) return;
    try {
      await pb.collection("users").update(user.id, {
        oldPassword: values.oldPassword,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
      });
      toast({
        title: settings.security.toast.passwordChanged,
        description: settings.security.toast.passwordChangedDescription,
      });
      form.reset();
    } catch {
      toast({
        title: settings.security.toast.passwordError,
        description: settings.security.toast.passwordErrorDescription,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{settings.security.changePasswordTitle}</CardTitle>
          <CardDescription>
            {settings.security.changePasswordDescription}
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
                    <FormLabel>{settings.security.oldPassword}</FormLabel>
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
                    <FormLabel>{settings.security.newPassword}</FormLabel>
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
                    <FormLabel>{settings.security.confirmPassword}</FormLabel>
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
                  {settings.security.updatePassword}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{settings.security.activeSessionsTitle}</CardTitle>
          <CardDescription>
            {settings.security.activeSessionsDescription}
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
                  {settings.security.noLoginHistory}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
