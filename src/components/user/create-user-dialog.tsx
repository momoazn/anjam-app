import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { fa } from "@/constants/text";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { UserFields } from "@/components/forms/user-fields";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, { message: fa.auth.errors.usernameRequired }),
  // Use explicit min-length message for clarity
  password: z.string().min(8, { message: fa.auth.errors.passwordMinLength }),
  first_name: z.string().min(1, { message: fa.auth.errors.firstNameRequired }),
  last_name: z.string().min(1, { message: fa.auth.errors.lastNameRequired }),
  role: z.nativeEnum(UsersRoleOptions),
});

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Validate and clear errors as user types for better UX
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      role: UsersRoleOptions.employee,
    },
  });

  const { mutate: createUser, isPending } = useEntityMutation({
    collection: "users",
    successMessage: fa.users.create.success,
    errorMessage: fa.users.create.error,
    invalidateQueries: ["users"],
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
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
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fa.users.create.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <UserFields control={form.control} />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {fa.users.create.button}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
