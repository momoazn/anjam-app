import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SettingsCard } from "@/components/settings/settings-card";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { settings } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/users";
import { api } from "@/lib/convex";
import { useAuthActions, useAuthUser } from "@/store/app-context-store";

const profileSchema = z.object({
  displayName: z.string().trim().min(1, settings.profile.displayNameRequired),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSection() {
  const user = useAuthUser();
  const { updateUser } = useAuthActions();
  const { data: fullUser } = useUser({ id: user?._id ?? "" });
  const { toast } = useToast();
  const updateProfile = useMutation(api.users.updateProfile);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "" },
  });

  useEffect(() => {
    if (fullUser) form.reset({ displayName: fullUser.displayName || "" });
  }, [fullUser, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?._id) return;
    try {
      await updateProfile({ displayName: values.displayName });
      updateUser({ ...user, displayName: values.displayName });
      toast({
        title: settings.profile.toast.updateSuccess,
        description: settings.profile.toast.updateSuccessDescription,
      });
    } catch {
      toast({
        title: settings.profile.toast.updateError,
        description: settings.profile.toast.updateErrorDescription,
        variant: "destructive",
      });
    }
  };

  if (!fullUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SettingsCard
        title={settings.profile.title}
        description={settings.profile.description}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{settings.profile.displayName}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="name" />
                  </FormControl>
                  <FormDescription>
                    {settings.profile.displayNameHint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <IconLoader2 className="size-4 animate-spin" />
                )}
                {settings.profile.saveChanges}
              </Button>
            </div>
          </form>
        </Form>
      </SettingsCard>

      <SettingsCard title={settings.profile.contactTitle}>
        <div className="space-y-2">
          <span className="text-sm font-medium">{settings.profile.email}</span>
          <div
            dir="ltr"
            className="bg-muted/50 text-muted-foreground flex h-9 items-center rounded-md border px-3 font-mono text-sm"
          >
            {fullUser.email}
          </div>
          <p className="text-muted-foreground text-sm">
            {settings.profile.emailNote}
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}
