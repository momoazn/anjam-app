import { useMemo } from "react";
import type { Control } from "react-hook-form";

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
import { useGroups } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

export type UserFieldsFormValues = {
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: UsersRoleOptions;
  group?: string;
};

type UserFieldsProps = {
  control: Control<UserFieldsFormValues>;
  isEdit?: boolean;
  editingUserId?: string;
  showGroup?: boolean;
};

export function UserFields({
  control,
  isEdit = false,
  editingUserId,
  showGroup = false,
}: UserFieldsProps) {
  const user = useAuthUser();
  const isEditingSelf = editingUserId === user?.id;
  const isManager = user?.role === UsersRoleOptions.manager;

  // Fetch groups for dropdown
  const { data: groups } = useGroups({
    enabled: showGroup,
  });

  // Get available roles based on current user's role
  const availableRoles = useMemo(() => {
    if (!user) return [];

    if (user.role === UsersRoleOptions.admin) {
      return [
        UsersRoleOptions.admin,
        UsersRoleOptions.manager,
        UsersRoleOptions.supervisor,
        UsersRoleOptions.employee,
      ];
    }

    if (user.role === UsersRoleOptions.manager) {
      return [UsersRoleOptions.supervisor, UsersRoleOptions.employee];
    }

    if (user.role === UsersRoleOptions.supervisor) {
      return [UsersRoleOptions.supervisor, UsersRoleOptions.employee];
    }

    return [UsersRoleOptions.employee];
  }, [user]);

  return (
    <>
      <FormField<UserFieldsFormValues>
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
        <FormField<UserFieldsFormValues>
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

      <FormField<UserFieldsFormValues>
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

      <FormField<UserFieldsFormValues>
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

      {/* Only show role field if user has permission to change roles or if not editing self */}
      {(!isEditingSelf || user?.role === UsersRoleOptions.admin) && (
        <FormField<UserFieldsFormValues>
          control={control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.users.table.columns.role}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger aria-label={fa.users.table.columns.role}>
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
      )}

      {showGroup && (
        <FormField<UserFieldsFormValues>
          control={control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.users.form.group}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isManager} // Managers can only create users in their group
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={fa.users.form.selectGroup} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
