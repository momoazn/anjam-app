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
    <div className="space-y-12" data-animate-stagger>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconShieldLock className="text-primary/60 size-4" />
            <h3 className="text-sm font-black tracking-widest uppercase">
              {settings.security.changePasswordTitle}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onChangePassword)}
            className="max-w-md space-y-6"
          >
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                    {settings.security.oldPassword}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none font-bold focus:ring-0"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                    {settings.security.newPassword}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none font-bold focus:ring-0"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                    {settings.security.confirmPassword}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none font-bold focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
            <div className="pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-12 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
              >
                {form.formState.isSubmitting && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <span className="tracking-widest uppercase">
                  {settings.security.updatePassword}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconActivity className="text-primary/60 size-4" />
            <h3 className="text-sm font-black tracking-widest uppercase">
              {settings.security.activeSessionsTitle}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground/60 text-right text-xs leading-relaxed font-bold tracking-widest uppercase">
            {settings.security.activeSessionsDescription}
          </p>

          {loadingLogs ? (
            <div className="flex justify-center p-12 opacity-20">
              <IconLoader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border">
              {loginLogs && loginLogs.length > 0 ? (
                loginLogs.map((log) => (
                  <div
                    key={log.id}
                    className="group bg-card hover:bg-muted/30 relative flex items-stretch p-4 text-right transition-all"
                  >
                    <div className="border-border/10 bg-muted/5 flex w-12 shrink-0 items-center justify-center border-l">
                      {log.success ? (
                        <IconCheck className="size-4 text-emerald-500" />
                      ) : (
                        <IconX className="size-4 text-rose-500" />
                      )}
                    </div>

                    <div className="flex-1 px-4 py-1">
                      <div className="mb-1 flex items-center justify-end gap-2">
                        <span className="text-muted-foreground/40 text-[8px] font-black tracking-[0.2em] uppercase">
                          Remote_Host
                        </span>
                        <IconServer className="size-2.5 opacity-20" />
                      </div>
                      <p className="text-[11px] font-black tabular-nums">
                        {log.ip_address || "Unknown IP"}
                      </p>
                      <p className="text-muted-foreground/40 mt-1 max-w-[240px] truncate text-[9px] font-bold uppercase">
                        {log.user_agent || "Unknown Device"}
                      </p>
                    </div>

                    <div className="border-border/10 bg-muted/5 flex w-32 shrink-0 flex-col items-center justify-center border-r px-2">
                      <span className="text-muted-foreground/40 mb-1 text-[7px] font-black tracking-[0.2em] uppercase">
                        Auth_Time
                      </span>
                      <div className="text-foreground/60 flex items-center gap-1.5 text-[9px] font-black tabular-nums">
                        <IconClock className="size-2.5 opacity-40" />
                        {digitsEnToFa(
                          new Date(log.created || "").toLocaleString("fa-IR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        )}
                      </div>
                    </div>

                    <div className="bg-primary/20 absolute right-0 bottom-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
                  </div>
                ))
              ) : (
                <div className="bg-card p-12 text-center opacity-30 grayscale">
                  <IconTerminal className="mx-auto mb-4 size-8 stroke-[1]" />
                  <p className="text-[10px] font-black tracking-widest uppercase">
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
