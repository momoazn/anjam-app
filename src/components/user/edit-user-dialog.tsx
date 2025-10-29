import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

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
import { UsersResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { useEntityUpdateMutation } from "@/hooks/use-entity-mutation";
import { UserFields } from "@/components/forms/user-fields";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  role: z.nativeEnum(UsersRoleOptions),
});

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UsersResponse | null;
};

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
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

  const { mutate: updateUser, isPending } = useEntityUpdateMutation({
    collection: "users",
    successMessage: fa.users.edit.success,
    errorMessage: fa.users.edit.error,
    invalidateQueries: ["users"],
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    updateUser({ id: user.id, updates: values });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fa.users.edit.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <UserFields control={form.control} isEdit={true} />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                ) : null}
                {fa.users.edit.button}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
