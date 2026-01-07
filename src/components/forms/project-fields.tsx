import { IconUpload } from "@tabler/icons-react";
import { useMemo } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

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
import { formatUserName } from "@/lib/utils";

import { FormField as GenericFormField } from "./form-field";

type ProjectFieldsProps<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>;
  codeMode?: "editable" | "readonly" | "hidden";
  showDescription?: boolean;
  showAssets?: boolean;
  showSupervisor?: boolean;
  isAdmin?: boolean;
};

export function ProjectFields<TFieldValues extends FieldValues = FieldValues>({
  control,
  codeMode,
  showDescription = true,
  showAssets = true,
  showSupervisor = false,
  isAdmin = false,
}: ProjectFieldsProps<TFieldValues>) {
  const resolvedCodeMode = codeMode ?? "readonly";
  const { data: allUsers } = useUsers({
    enabled: showSupervisor && isAdmin,
  });

  const supervisors = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.map((u) => ({
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
          name={"name" as Path<TFieldValues>}
          label={projects.create.form.name}
          type="input"
          required
        />

        {resolvedCodeMode === "hidden" ? null : (
          <GenericFormField
            control={control}
            name={"code" as Path<TFieldValues>}
            label={`${projects.create.form.code} (اختیاری)`}
            type="input"
            required={false}
            placeholder="به صورت خودکار تولید می‌شود"
            disabled={resolvedCodeMode === "readonly"}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {showSupervisor && isAdmin && (
          <GenericFormField
            control={control}
            name={"supervisor" as Path<TFieldValues>}
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
          name={"description" as Path<TFieldValues>}
          label={projects.create.form.description}
          type="textarea"
          placeholder={projects.create.form.descriptionPlaceholder}
          className="min-h-[100px]"
        />
      )}

      {showAssets && (
        <ShadcnFormField
          control={control}
          name={"assets" as Path<TFieldValues>}
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
