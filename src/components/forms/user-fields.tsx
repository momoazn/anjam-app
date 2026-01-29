import { useMemo } from "react";
import type { Control } from "react-hook-form";

import { FormField as GenericFormField } from "@/components/recipes/form-field";
import { auth, users } from "@/constants";
import { useAuthUser, useCurrentOrgRole } from "@/store/app-context-store";

// Convex-compatible role type (organization-level roles)
type UserRole = "owner" | "member";

// Map Convex user to role (using org role or default)
function getUserRole(orgRole: string | null): UserRole {
  if (orgRole === "owner") return "owner";
  return "member";
}

export type UserFieldsFormValues = {
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
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
  const currentOrgRole = useCurrentOrgRole();
  const isEditingSelf = editingUserId === user?._id;

  const userRole = getUserRole(currentOrgRole);

  const availableRoles = useMemo(() => {
    if (!user) return [];

    // In Convex v1, roles are org-level (owner/member)
    // Only owners can manage members
    if (userRole === "owner") {
      return [{ value: "member", label: users.table.roles.employee }];
    }

    // Members can't change roles
    return [];
  }, [user, userRole, users.table.roles.employee]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GenericFormField
          control={control}
          name="firstName"
          label={users.form.firstName}
          type="input"
          required
        />
        <GenericFormField
          control={control}
          name="lastName"
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
        {(!isEditingSelf || userRole === "owner") &&
          availableRoles.length > 0 && (
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
