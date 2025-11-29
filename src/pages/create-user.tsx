import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { UserFields } from "@/components/forms/user-fields";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { fa } from "@/constants/text";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useCreateUser } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";

const formSchema = z.object({
  username: z.string().min(1, { message: fa.auth.errors.usernameRequired }),
  password: z.string().min(8, { message: fa.auth.errors.passwordMinLength }),
  first_name: z.string().min(1, { message: fa.auth.errors.firstNameRequired }),
  last_name: z.string().min(1, { message: fa.auth.errors.lastNameRequired }),
  role: z.nativeEnum(UsersRoleOptions),
  group: z.string().optional(),
});

export default function CreateUser() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const isAdmin = user?.role === UsersRoleOptions.admin;
  const isManager = user?.role === UsersRoleOptions.manager;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      role: UsersRoleOptions.employee,
      group: "",
    },
  });

  const { mutate: createUser, isPending } = useCreateUser({
    onSuccess: () => {
      navigate("/users");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createUser({
      ...values,
      username: values.username.trim().toLowerCase(),
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      password: values.password.trim(),
      passwordConfirm: values.password.trim(),
    } as Parameters<typeof createUser>[0] & { passwordConfirm: string });
  }

  const handleCancel = () => {
    navigate("/users");
  };

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fa.users.create.title}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.users.create.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <UserFields
                control={form.control}
                showGroup={isAdmin || isManager}
              />
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
                  {fa.users.create.button}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
