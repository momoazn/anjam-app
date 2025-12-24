import { useMemo } from "react";
import type { Control } from "react-hook-form";

import { FileUpload } from "@/components/ui/file-upload";
import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { projects } from "@/constants";
import { useUsers, useGroups } from "@/hooks";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { formatUserName } from "@/lib/utils";
import { FormField as GenericFormField } from "./form-field";
import { IconUpload } from "@tabler/icons-react";

type ProjectFieldsProps = {
  control: Control<{
    name: string;
    code: string;
    description?: string;
    assets?: FileWithPreview[];
    supervisor?: string;
    group?: string;
  }>;
  showDescription?: boolean;
  showAssets?: boolean;
  showSupervisor?: boolean;
  showGroup?: boolean;
  isAdmin?: boolean;
  isManager?: boolean;
};

export function ProjectFields({
  control,
  showDescription = true,
  showAssets = true,
  showSupervisor = false,
  showGroup = false,
  isAdmin = false,
  isManager = false,
}: ProjectFieldsProps) {
  const { data: allUsers } = useUsers({
    enabled: showSupervisor && isAdmin,
  });

  const { data: groups } = useGroups({
    enabled: showGroup,
  });

  const supervisors = useMemo(() => {
    if (!allUsers) return [];
    return allUsers
      .filter(
        (u) =>
          u.role === UsersRoleOptions.admin ||
          u.role === UsersRoleOptions.supervisor,
      )
      .map((u) => ({
        value: u.id,
        label: formatUserName(u.first_name, u.last_name, u.username),
      }));
  }, [allUsers]);

  const groupOptions = useMemo(() => {
    if (!groups) return [];
    return groups.map((g) => ({ value: g.id, label: g.name }));
  }, [groups]);

  return (
    <div className="space-y-8 text-right">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GenericFormField
          control={control}
          name="name"
          label={projects.create.form.name}
          type="input"
          required
        />

        <GenericFormField
          control={control}
          name="code"
          label={projects.create.form.code}
          type="input"
          required
          placeholder="e.g. ABC"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {showSupervisor && isAdmin && (
          <GenericFormField
            control={control}
            name="supervisor"
            label={projects.create.form.supervisor}
            type="select"
            options={supervisors}
            placeholder={projects.create.form.selectSupervisor}
          />
        )}

        {showGroup && (
          <GenericFormField
            control={control}
            name="group"
            label={projects.create.form.group}
            type="select"
            options={groupOptions}
            disabled={isManager}
            placeholder={projects.create.form.selectGroup}
          />
        )}
      </div>

      {showDescription && (
        <GenericFormField
          control={control}
          name="description"
          label={projects.create.form.description}
          type="textarea"
          placeholder={projects.create.form.descriptionPlaceholder}
        />
      )}

      {showAssets && (
        <ShadcnFormField
          control={control}
          name="assets"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-muted-foreground/60 flex items-center justify-end gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
                {projects.create.form.assets}
                <IconUpload className="size-3.5" />
              </FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value as FileWithPreview[]}
                  onChange={field.onChange}
                  maxSize={52428800}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
