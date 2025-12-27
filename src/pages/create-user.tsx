import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconUserPlus } from "@tabler/icons-react";
import { useForm, type Control } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";

import {
  UserFields,
  type UserFieldsFormValues,
} from "@/components/forms/user-fields";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { auth, common, users } from "@/constants";
import { useCreateUser } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

const formSchema = z.object({
  username: z.string().min(1, { message: auth.errors.usernameRequired }),
  password: z.string().min(8, { message: auth.errors.passwordMinLength }),
  first_name: z.string().min(1, { message: auth.errors.firstNameRequired }),
  last_name: z.string().min(1, { message: auth.errors.lastNameRequired }),
  role: z.nativeEnum(UsersRoleOptions),
});

export default function CreateUser() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const isAdmin = user?.role === UsersRoleOptions.admin;
  const isManager = user?.role === UsersRoleOptions.manager;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      role: UsersRoleOptions.employee,
    },
  });

  const userFieldsControl = form.control as Control<UserFieldsFormValues>;

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

  const canCreateUsers = isAdmin || isManager;
  if (!canCreateUsers) {
    return <Navigate to="/users" replace />;
  }

  return (
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-[var(--ds-spacing-cardPadding)]">
      <PageHeader
        title={users.create.title}
        description="Add a new user to the system"
        icon={IconUserPlus}
      />

      <div className="bg-card border-border/40 rounded-[var(--ds-radius-card)] border p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <UserFields control={userFieldsControl} />

            <div className="border-border/10 flex items-center justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="h-11 rounded-xl px-6 font-medium transition-all"
              >
                {common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 gap-2 rounded-xl px-8 font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              >
                {isPending && (
                  <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                <span>{users.create.button}</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
