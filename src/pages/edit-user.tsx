import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconUserEdit } from "@tabler/icons-react";
import { useEffect } from "react";
import { useForm, type Control } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router-dom";
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
import { useUpdateUser, useUser } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { handlePocketBaseError } from "@/lib/error-handler";
import { useAuthUser } from "@/store/auth-store";

const formSchema = z.object({
  username: z.string().min(1, { message: auth.errors.usernameRequired }),
  first_name: z.string().min(1, { message: auth.errors.firstNameRequired }),
  last_name: z.string().min(1, { message: auth.errors.lastNameRequired }),
  role: z.nativeEnum(UsersRoleOptions),
  password: z.string().optional(),
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
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      role: UsersRoleOptions.employee,
      password: "",
    },
  });

  const userFieldsControl = form.control as Control<UserFieldsFormValues>;

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role as UsersRoleOptions,
        password: "",
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

  const handleCancel = () => {
    navigate("/users");
  };

  if (!isAdmin && !isManager && authUser?.id !== id) {
    return <Navigate to="/users" replace />;
  }

  if (!user && !isLoading) {
    return <Navigate to="/users" replace />;
  }

  return (
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
      <PageHeader
        title={users.edit.title}
        description={`Update information for user :: ${user?.username || id}`}
        icon={IconUserEdit}
      />

      <div className="bg-muted/5 border-border/40 border p-8 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-20">
            <IconLoader2 className="h-12 w-12 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <UserFields
                control={userFieldsControl}
                isEdit
                editingUserId={id}
              />

              <div className="border-border/20 flex items-center justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="border-border/40 h-12 rounded-none text-[10px] font-black tracking-tight uppercase"
                >
                  {common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 gap-3 rounded-none px-8 font-black shadow-md transition-all   hover:shadow-lg active:scale-95 "
                >
                  {isPending && (
                    <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                  )}
                  <span className="tracking-tight uppercase">
                    {users.edit.button}
                  </span>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </PageTransition>
  );
}
