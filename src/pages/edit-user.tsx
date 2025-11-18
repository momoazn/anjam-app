import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { UserFields } from "@/components/forms/user-fields";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useUpdateUser, useUser } from "@/hooks";

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  role: z.nativeEnum(UsersRoleOptions),
});

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useUser({
    id: id ?? "",
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      role: UsersRoleOptions.employee,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username.trim().toLowerCase(),
        first_name: user.first_name.trim(),
        last_name: user.last_name.trim(),
        role: user.role,
      });
    }
  }, [form, user]);

  const { mutate: updateUser, isPending } = useUpdateUser({
    onSuccess: () => {
      navigate("/users");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    updateUser({ id: user.id, updates: values });
  }

  const handleCancel = () => {
    navigate("/users");
  };

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">{fa.users.errors.notFound}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/users")}
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              {fa.common.buttons.back}
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fa.users.edit.title}</h1>
          <p className="text-muted-foreground">
            {fa.common.buttons.view} {user.first_name} {user.last_name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.users.edit.title}</CardTitle>
          <CardDescription>
            {fa.common.buttons.view} @{user.username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <UserFields control={form.control} isEdit={true} />
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  {fa.common.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                  ) : null}
                  {fa.users.edit.button}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
