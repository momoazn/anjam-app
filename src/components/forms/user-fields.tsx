import { useMemo } from "react";
import type { Control } from "react-hook-form";

import { auth, users } from "@/constants";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { FormField as GenericFormField } from "./form-field";

export type UserFieldsFormValues = {
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: UsersRoleOptions;
};

type UserFieldsProps = {
  control: Control<UserFieldsFormValues>;
  isEdit?: boolean;
  editingUserId?: string;
};

export function UserFields({
  control,
  isEdit = false,
  editingUserId,
}: UserFieldsProps) {
  const user = useAuthUser();
  const isEditingSelf = editingUserId === user?.id;

  const availableRoles = useMemo(() => {
    if (!user) return [];

    if (user.role === UsersRoleOptions.admin) {
      return [
        { value: UsersRoleOptions.admin, label: users.table.roles.admin },
        { value: UsersRoleOptions.manager, label: users.table.roles.manager },
        {
          value: UsersRoleOptions.supervisor,
          label: users.table.roles.supervisor,
        },
        { value: UsersRoleOptions.employee, label: users.table.roles.employee },
      ];
    }

    if (user.role === UsersRoleOptions.manager) {
      return [
        {
          value: UsersRoleOptions.supervisor,
          label: users.table.roles.supervisor,
        },
        { value: UsersRoleOptions.employee, label: users.table.roles.employee },
      ];
    }

    if (user.role === UsersRoleOptions.supervisor) {
      return [
        {
          value: UsersRoleOptions.supervisor,
          label: users.table.roles.supervisor,
        },
        { value: UsersRoleOptions.employee, label: users.table.roles.employee },
      ];
    }

    return [
      { value: UsersRoleOptions.employee, label: users.table.roles.employee },
    ];
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            required
            placeholder="••••••••"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(!isEditingSelf || user?.role === UsersRoleOptions.admin) && (
          <GenericFormField
            control={control}
            name="role"
            label={users.table.columns.role}
            type="select"
            options={availableRoles}
            required
          />
        )}
      </div>
    </div>
  );
}
