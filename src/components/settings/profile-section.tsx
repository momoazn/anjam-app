import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCamera,
  IconFingerprint,
  IconLoader2,
  IconTerminal,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
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
import { auth, settings } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/users";
import { pb } from "@/lib/pocketbase";
import type { UsersResponse } from "@/lib/pocketbase-types";
import { useAuthActions, useAuthUser } from "@/store/auth-store";

const profileSchema = z.object({
  username: z.string().min(3, auth.errors.usernameMinLength),
  first_name: z.string().min(1, auth.errors.firstNameRequired),
  last_name: z.string().min(1, auth.errors.lastNameRequired),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSection() {
  const user = useAuthUser();
  const { updateUser } = useAuthActions();
  const { data: fullUser, refetch } = useUser({ id: user?.id ?? "" });
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
    },
  });

  useEffect(() => {
    if (fullUser) {
      form.reset({
        username: fullUser.username,
        first_name: fullUser.first_name ?? "",
        last_name: fullUser.last_name ?? "",
      });
    }
  }, [fullUser, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return;

    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("first_name", values.first_name);
      formData.append("last_name", values.last_name);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const updatedRecord = await pb
        .collection("users")
        .update<UsersResponse>(user.id, formData);

      refetch();
      updateUser(updatedRecord);
      toast({
        title: settings.profile.toast.updateSuccess,
        description: settings.profile.toast.updateSuccessDescription,
      });
      setAvatarFile(null);
    } catch {
      toast({
        title: settings.profile.toast.updateError,
        description: settings.profile.toast.updateErrorDescription,
        variant: "destructive",
      });
    }
  };

  if (!fullUser)
    return <IconLoader2 className="mx-auto h-8 w-8 animate-spin opacity-20" />;

  const currentAvatarUrl = previewUrl
    ? previewUrl
    : fullUser.avatar
      ? pb.files.getUrl(fullUser, fullUser.avatar)
      : undefined;

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
                  {currentAvatarUrl ? (
                    <img
                      src={currentAvatarUrl}
                      alt={fullUser.username}
                      className="h-full w-full object-cover transition-all duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <IconUser className="text-muted-foreground/20 size-10" />
                    </div>
                  )}
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest">
                          {settings.profile.firstName}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="focus-visible:ring-primary h-9 rounded-xl border bg-white font-medium shadow-sm focus-visible:ring-1"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest">
                          {settings.profile.lastName}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="focus-visible:ring-primary h-9 rounded-xl border bg-white font-medium shadow-sm focus-visible:ring-1"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-medium" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest">
                          {settings.profile.username}
                        </FormLabel>
                        <IconTerminal className="size-3 opacity-20" />
                      </div>
                      <FormControl>
                        <div className="relative">
                          <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 font-mono text-[10px] font-bold">
                            @
                          </span>
                          <Input
                            {...field}
                            dir="ltr"
                            className="focus-visible:ring-primary h-9 rounded-xl border bg-white pl-7 font-mono text-xs font-medium tracking-tight shadow-sm focus-visible:ring-1"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-[9px] font-medium opacity-40">
                        {settings.profile.usernameDescription}
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
