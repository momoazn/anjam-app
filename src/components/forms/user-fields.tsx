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
import { auth, common, users } from "@/constants";
import { useGroups } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { FormField as GenericFormField } from "./form-field";

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
      <GenericFormField
        control={control}
        name="username"
        label={auth.login.username}
        type="input"
        required
      />

      {!isEdit && (
        <GenericFormField
          control={control}
          name="password"
          label={auth.login.password}
          type="input"
          placeholder={auth.login.password}
          required
        >
          <Input type="password" />
        </GenericFormField>
      )}

      <GenericFormField
        control={control}
        name="first_name"
        label={users.form.firstName}
        type="input"
        required
      />

      <GenericFormField
        control={control}
        name="last_name"
        label={users.form.lastName}
        type="input"
        required
      />

      {/* Only show role field if user has permission to change roles or if not editing self */}
      {(!isEditingSelf || user?.role === UsersRoleOptions.admin) && (
        <FormField<UserFieldsFormValues>
          control={control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{users.table.columns.role}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger aria-label={users.table.columns.role}>
                    <SelectValue placeholder={users.form.selectRole} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {users.table.roles[role]}
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
              <FormLabel>{users.form.group}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isManager} // Managers can only create users in their group
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={users.form.selectGroup} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups && groups.length > 0 ? (
                    groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty" disabled>
                      {common.messages.noData}
                    </SelectItem>
                  )}
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
