import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCamera,
  IconFingerprint,
  IconLoader2,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  displayName: z.string().min(1, "Display name is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileSectionSkeleton() {
  return (
    <div className="space-y-8" data-animate-stagger>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconUserCircle className="text-primary size-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="bg-border h-px flex-1" />
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />

          <div className="w-full flex-1 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-2 w-48" />
            </div>
          </div>
        </div>

        <div className="border-border flex justify-end border-t pt-4">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSection() {
  const user = useAuthUser();
  const { updateUser } = useAuthActions();
  const { data: fullUser } = useUser({ id: user?._id ?? "" });
  const { toast } = useToast();

  const updateProfile = useMutation(api.users.updateProfile);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
    },
  });

  useEffect(() => {
    if (fullUser) {
      form.reset({
        displayName: fullUser.displayName || "",
      });
    }
  }, [fullUser, form]);

  const handleAvatarChange = () => {
    // File uploads are out of scope for v1 - just show toast
    toast({
      title: "Coming soon",
      description: "Avatar uploads will be available in a future update.",
    });
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?._id) return;

    try {
      // Update displayName
      await updateProfile({
        displayName: values.displayName,
      });

      // Refresh user data
      updateUser({
        ...user,
        displayName: values.displayName,
      });

      toast({
        title: settings.profile.toast.updateSuccess,
        description: settings.profile.toast.updateSuccessDescription,
      });
    } catch (error) {
      toast({
        title: settings.profile.toast.updateError,
        description:
          error instanceof Error
            ? error.message
            : settings.profile.toast.updateErrorDescription,
        variant: "destructive",
      });
    }
  };

  if (!fullUser) return <ProfileSectionSkeleton />;

  return (
    <div className="space-y-8" data-animate-stagger>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconUserCircle className="text-primary size-4" />
            <h3 className="text-sm font-bold tracking-tight">
              {settings.profile.title}
            </h3>
          </div>
          <div className="bg-border h-px flex-1" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-start gap-8 lg:flex-row">
              <div className="group relative shrink-0">
                <div className="bg-muted relative aspect-square h-24 w-24 overflow-hidden rounded-2xl border shadow-sm">
                  <div className="flex h-full w-full items-center justify-center">
                    <IconUser className="text-muted-foreground/20 size-10" />
                  </div>
                  <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-emerald-500" />
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="active:bg-muted hover:bg-muted absolute -bottom-2 -left-2 cursor-pointer rounded-full border bg-white p-2 shadow-sm transition-all"
                >
                  <IconCamera className="h-3.5 w-3.5" />
                  <span className="sr-only">
                    {settings.profile.changeImage}
                  </span>
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
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest">
                        Display Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="focus-visible:ring-primary h-9 rounded-xl border bg-white font-medium shadow-sm focus-visible:ring-1"
                        />
                      </FormControl>
                      <FormDescription className="text-[9px] font-medium opacity-40">
                        This is how you appear to others in the app
                      </FormDescription>
                      <FormMessage className="text-[10px] font-medium" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-border flex justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-primary text-primary-foreground h-10 gap-2 rounded-xl border px-6 font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {form.formState.isSubmitting && (
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <span className="text-[11px] tracking-tight">
                  {settings.profile.saveChanges}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconFingerprint className="text-primary size-4" />
            <h3 className="text-sm font-bold tracking-tight">
              {settings.profile.contactTitle}
            </h3>
          </div>
          <div className="bg-border h-px flex-1" />
        </div>

        <div className="bg-muted/30 rounded-2xl border p-4 shadow-sm">
          <div className="grid gap-2">
            <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest">
              {settings.profile.email}
            </span>
            <div className="flex h-9 items-center rounded-lg border bg-white px-3 font-mono text-xs font-medium tracking-tight opacity-60">
              {fullUser.email}
            </div>
            <p className="text-muted-foreground/40 font-mono text-[9px] font-medium tracking-tight">
              {settings.profile.emailChangeNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
