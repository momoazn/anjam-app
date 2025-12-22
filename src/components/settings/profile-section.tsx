import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Camera, Loader2 } from "lucide-react";

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
import { UserAvatar } from "@/components/user-avatar";
import { auth, settings } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/users";
import { pb } from "@/lib/pocketbase";
import type { UsersRecord } from "@/lib/pocketbase-types";
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
        .update<UsersRecord>(user.id, formData);

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
          <CardTitle>{settings.profile.title}</CardTitle>
          <CardDescription>{settings.profile.description}</CardDescription>
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
                        <FormItem>
                          <FormLabel>{settings.profile.firstName}</FormLabel>
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
                          <FormLabel>{settings.profile.lastName}</FormLabel>
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
                        <FormLabel>{settings.profile.username}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" className="text-left" />
                        </FormControl>
                        <FormDescription>
                          {settings.profile.usernameDescription}
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
                  {settings.profile.saveChanges}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{settings.profile.contactTitle}</CardTitle>
          <CardDescription>
            {settings.profile.contactDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>{settings.profile.email}</Label>
            <Input
              value={fullUser.email}
              disabled
              className="bg-muted"
              dir="ltr"
            />
            <p className="text-muted-foreground text-[0.8rem]">
              {settings.profile.emailChangeNote}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
