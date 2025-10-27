import { useMemo } from "react";
import { Control } from "react-hook-form";

import {
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
import { fa } from "@/constants/text";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

type UserFieldsProps = {
  control: Control<{
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UsersRoleOptions;
  }>;
  isEdit?: boolean;
};

export function UserFields({ control, isEdit = false }: UserFieldsProps) {
  const user = useAuthUser();

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

  return (
    <>
      <FormField
        control={control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.auth.login.username}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!isEdit && (
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.auth.login.password}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.users.form.firstName}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.users.form.lastName}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.users.table.columns.role}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={fa.users.form.selectRole} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {fa.users.table.roles[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
