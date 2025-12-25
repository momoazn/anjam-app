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
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
      <PageHeader
        title={users.create.title}
        description="Provision a new operator node into the system"
        icon={IconUserPlus}
        nodeId="Operator_Provisioning"
      />

      <div className="bg-muted/5 border-border/40 border p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <UserFields control={userFieldsControl} />

            <div className="border-border/20 flex items-center justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="border-border/40 h-12 rounded-none text-[10px] font-black tracking-widest uppercase"
              >
                {common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 gap-3 rounded-none px-8 font-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]"
              >
                {isPending && (
                  <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                <span className="tracking-widest uppercase">
                  {users.create.button}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
