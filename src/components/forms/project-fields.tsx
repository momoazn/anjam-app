import { IconUpload } from "@tabler/icons-react";
import { useMemo } from "react";
import type { Control } from "react-hook-form";

import { FileUpload } from "@/components/ui/file-upload";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as ShadcnFormField,
} from "@/components/ui/form";
import { projects } from "@/constants";
import { useUsers } from "@/hooks";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { formatUserName } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

import { FormField as GenericFormField } from "./form-field";

type ProjectFieldsProps = {
  control: Control<{
    name: string;
    code: string;
    description?: string;
    assets?: FileWithPreview[];
    supervisor?: string;
  }>;
  codeMode?: "editable" | "readonly" | "hidden";
  showDescription?: boolean;
  showAssets?: boolean;
  showSupervisor?: boolean;
  isAdmin?: boolean;
};

export function ProjectFields({
  control,
  codeMode,
  showDescription = true,
  showAssets = true,
  showSupervisor = false,
  isAdmin = false,
}: ProjectFieldsProps) {
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const resolvedCodeMode =
    codeMode ?? (isProductMode ? "readonly" : "editable");
  const { data: allUsers } = useUsers({
    enabled: showSupervisor && isAdmin,
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

  return (
    <div className="space-y-6 text-right">
      <div
        className={
          resolvedCodeMode === "hidden"
            ? "grid grid-cols-1 gap-4"
            : "grid grid-cols-1 gap-4 md:grid-cols-2"
        }
      >
        <GenericFormField
          control={control}
          name="name"
          label={projects.create.form.name}
          type="input"
          required
        />

        {resolvedCodeMode === "hidden" ? null : (
          <GenericFormField
            control={control}
            name="code"
            label={
              resolvedCodeMode === "readonly" && isProductMode
                ? `${projects.create.form.code} (اختیاری)`
                : projects.create.form.code
            }
            type="input"
            required={!isProductMode}
            placeholder={
              resolvedCodeMode === "readonly" && isProductMode
                ? "به صورت خودکار تولید می‌شود"
                : "e.g. ABC"
            }
            disabled={resolvedCodeMode === "readonly"}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div>

      {showDescription && (
        <GenericFormField
          control={control}
          name="description"
          label={projects.create.form.description}
          type="textarea"
          placeholder={projects.create.form.descriptionPlaceholder}
          className="min-h-[100px]"
        />
      )}

      {showAssets && (
        <ShadcnFormField
          control={control}
          name="assets"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-muted-foreground/60 flex items-center justify-end gap-2 text-[9px] font-bold tracking-tight">
                {projects.create.form.assets}
                <IconUpload className="size-3" />
              </FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value as FileWithPreview[]}
                  onChange={field.onChange}
                  maxSize={52428800}
                />
              </FormControl>
              <FormMessage className="text-[9px] font-bold" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
