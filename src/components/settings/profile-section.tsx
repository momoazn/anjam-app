import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  IconCamera,
  IconLoader2,
  IconTerminal,
  IconUserCircle,
  IconFingerprint,
} from "@tabler/icons-react";

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
import { UserAvatar } from "@/components/user-avatar";
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
    <div className="space-y-12" data-animate-stagger>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconUserCircle className="text-primary/60 size-4" />
            <h3 className="text-sm font-black tracking-tight uppercase">
              {settings.profile.title}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="flex flex-col items-start gap-10 lg:flex-row">
              <div className="group relative shrink-0">
                <div className="relative">
                  <UserAvatar
                    user={{ ...fullUser, avatar: currentAvatarUrl }}
                    className="border-border/40 h-32 w-32 rounded-none border shadow-sm"
                  />
                  <div className="border-background absolute -end-1 -bottom-1 h-3 w-3 border bg-emerald-500" />
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="bg-card border-border hover:bg-muted absolute -start-2 -bottom-2 cursor-pointer border p-2 shadow-md transition-all   active:shadow-none"
                >
                  <IconCamera className="h-4 w-4" />
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

              <div className="w-full flex-1 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                          {settings.profile.firstName}
                        </FormLabel>
                        <FormControl>
                          <Input
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
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                          {settings.profile.lastName}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none font-bold focus:ring-0"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                          {settings.profile.username}
                        </FormLabel>
                        <IconTerminal className="size-3 opacity-20" />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          dir="ltr"
                          className="border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none text-left font-mono text-xs font-black tracking-tight uppercase focus:ring-0"
                        />
                      </FormControl>
                      <FormDescription className="text-right text-[9px] font-bold uppercase opacity-40">
                        {settings.profile.usernameDescription}
                      </FormDescription>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-border/20 flex justify-end border-t pt-6">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-12 gap-3 rounded-none px-8 font-black shadow-md transition-all   hover:shadow-lg active:scale-95 "
              >
                {form.formState.isSubmitting && (
                  <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                <span className="tracking-tight uppercase">
                  {settings.profile.saveChanges}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconFingerprint className="text-primary/60 size-4" />
            <h3 className="text-sm font-black tracking-tight uppercase">
              {settings.profile.contactTitle}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="bg-muted/10 border-border/40 space-y-4 border p-6">
          <div className="grid gap-2 text-right">
            <span className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
              {settings.profile.email}
            </span>
            <div className="bg-muted/20 border-border/20 flex h-11 items-center border px-4 font-mono text-xs font-black tracking-tight uppercase opacity-60">
              {fullUser.email}
            </div>
            <p className="text-muted-foreground/40 text-[9px] font-black tracking-tight uppercase">
              {settings.profile.emailChangeNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
