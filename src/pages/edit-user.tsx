import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { UserFields } from "@/components/forms/user-fields";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fa } from "@/constants/text";
import { useUpdateUser, useUser } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { handlePocketBaseError } from "@/lib/error-handler";
import { useAuthUser } from "@/store/auth-store";

const formSchema = z.object({
  username: z.string().min(1, { message: fa.auth.errors.usernameRequired }),
  first_name: z.string().min(1, { message: fa.auth.errors.firstNameRequired }),
  last_name: z.string().min(1, { message: fa.auth.errors.lastNameRequired }),
  role: z.nativeEnum(UsersRoleOptions),
  group: z.string().optional(),
});

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const authUser = useAuthUser();
  const isAdmin = authUser?.role === UsersRoleOptions.admin;
  const isManager = authUser?.role === UsersRoleOptions.manager;

  const { data: user, isLoading } = useUser({
    id: id || "",
    enabled: Boolean(id),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      role: UsersRoleOptions.employee,
      group: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role as UsersRoleOptions,
        group: user.group || "",
      });
    }
  }, [user, form]);

  const { mutate: updateUser, isPending } = useUpdateUser({
    onSuccess: () => {
      navigate("/users");
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!id) return;
    updateUser({
      id,
      updates: {
        ...values,
        username: values.username.trim().toLowerCase(),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
      },
    });
  }

  if (!isAdmin && !isManager && authUser?.id !== id) {
    return <Navigate to="/users" replace />;
  }

  if (!user && !isLoading) {
    return <Navigate to="/users" replace />;
  }

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fa.users.edit.title}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.users.edit.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <UserFields
              control={form.control}
              isEdit
              editingUserId={id}
              showGroup={isAdmin || isManager}
            />
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
                disabled={isPending}
              >
                {fa.common.cancel}
              </Button>
              <Button type="submit" disabled={isPending || isLoading}>
                {isPending ? (
                  <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                ) : null}
                {fa.users.edit.button}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
