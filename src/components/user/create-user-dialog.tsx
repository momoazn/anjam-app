import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { useMemo } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(1, { message: TEXT.auth.errors.usernameRequired }),
  password: z.string().min(8, { message: TEXT.auth.errors.passwordRequired }),
  first_name: z
    .string()
    .min(1, { message: TEXT.auth.errors.firstNameRequired }),
  last_name: z.string().min(1, { message: TEXT.auth.errors.lastNameRequired }),
  role: z.nativeEnum(UsersRoleOptions),
});

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      role: UsersRoleOptions.employee,
    },
  });

  // Get available roles based on current user's role
  const availableRoles = useMemo(() => {
    if (!user) return [];

    if (user.role === UsersRoleOptions.admin) {
      return [
        UsersRoleOptions.admin,
        UsersRoleOptions.supervisor,
        UsersRoleOptions.employee,
      ];
    }

    if (user.role === UsersRoleOptions.supervisor) {
      return [UsersRoleOptions.supervisor, UsersRoleOptions.employee];
    }

    return [UsersRoleOptions.employee];
  }, [user]);

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return pb.collection("users").create({
        ...values,
        username: values.username.trim().toLowerCase(),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        password: values.password.trim(),
        passwordConfirm: values.password.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset();
      onOpenChange(false);
      toast.success(TEXT.users.create.success);
    },
    onError: () => {
      toast.error(TEXT.users.create.error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createUser(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TEXT.users.create.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TEXT.users.table.columns.username}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TEXT.auth.login.password}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{TEXT.users.form.firstName}</FormLabel>
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
                    <FormLabel>{TEXT.users.form.lastName}</FormLabel>
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TEXT.users.table.columns.role}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={TEXT.users.form.selectRole} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {TEXT.users.table.roles[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {TEXT.users.create.button}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
