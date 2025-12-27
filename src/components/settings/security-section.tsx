import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  IconShieldLock,
  IconActivity,
  IconClock,
  IconLoader2,
  IconCheck,
  IconX,
  IconTerminal,
  IconServer,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
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
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
    <div className="space-y-8" data-animate-stagger>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconShieldLock className="text-primary size-4" />
            <h3 className="text-sm font-bold tracking-tight">
              {settings.security.changePasswordTitle}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onChangePassword)}
            className="max-w-md space-y-4"
          >
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-muted-foreground text-[10px] font-bold tracking-tight">
                    {settings.security.oldPassword}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="border-border bg-background h-10 rounded-xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-muted-foreground text-[10px] font-bold tracking-tight">
                    {settings.security.newPassword}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="border-border bg-background h-10 rounded-xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-muted-foreground text-[10px] font-bold tracking-tight">
                    {settings.security.confirmPassword}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="border-border bg-background h-10 rounded-xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-10 gap-2 rounded-xl px-6 font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {form.formState.isSubmitting && (
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <span className="text-[11px] tracking-tight">
                  {settings.security.updatePassword}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconActivity className="text-primary size-4" />
            <h3 className="text-sm font-bold tracking-tight">
              {settings.security.activeSessionsTitle}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-[10px] font-bold tracking-tight">
            {settings.security.activeSessionsDescription}
          </p>

          {loadingLogs ? (
            <div className="flex justify-center p-8 opacity-20">
              <IconLoader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3">
              {loginLogs && loginLogs.length > 0 ? (
                loginLogs.map((log) => (
                  <div
                    key={log.id}
                    className="group border-border/40 bg-card relative flex items-center rounded-[var(--ds-radius-card)] border p-3 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="bg-muted/30 border-border/40 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                      {log.success ? (
                        <IconCheck className="size-4 text-emerald-600" />
                      ) : (
                        <IconX className="size-4 text-rose-600" />
                      )}
                    </div>

                    <div className="flex-1 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground/40 text-[8px] font-bold tracking-tight">
                          Remote_Host
                        </span>
                        <IconServer className="size-2.5 opacity-20" />
                      </div>
                      <p className="text-[11px] font-bold tabular-nums">
                        {log.ip_address || "Unknown IP"}
                      </p>
                      <p className="text-muted-foreground/40 max-w-[240px] truncate text-[9px] font-bold">
                        {log.user_agent || "Unknown Device"}
                      </p>
                    </div>

                    <div className="border-border/10 flex shrink-0 flex-col items-end border-l pl-3">
                      <span className="text-muted-foreground/40 mb-1 text-[7px] font-bold tracking-tight">
                        Auth_Time
                      </span>
                      <div className="text-foreground/60 flex items-center gap-1.5 text-[9px] font-bold tabular-nums">
                        <IconClock className="size-2.5 opacity-40" />
                        {digitsEnToFa(
                          new Date(log.created || "").toLocaleString("fa-IR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-muted/10 border-border/40 rounded-[var(--ds-radius-card)] border border-dashed p-8 text-center grayscale">
                  <IconTerminal className="mx-auto mb-3 size-6 stroke-[1.5] opacity-20" />
                  <p className="text-[10px] font-bold tracking-tight opacity-40">
                    {settings.security.noLoginHistory}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
