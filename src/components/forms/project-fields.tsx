import { Control } from "react-hook-form";

import { FileUpload } from "@/components/ui/file-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { common, projects } from "@/constants";
import { useUsers, useGroups } from "@/hooks";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { formatUserName } from "@/lib/utils";
import { FormField as GenericFormField } from "./form-field";

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

  const supervisors = allUsers?.filter(
    (user) =>
      user.role === UsersRoleOptions.admin ||
      user.role === UsersRoleOptions.supervisor,
  );

  return (
    <>
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
      />

      {showSupervisor && isAdmin && (
        <FormField
          control={control}
          name="supervisor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{projects.create.form.supervisor}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value === "" ? undefined : field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={projects.create.form.selectSupervisor}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supervisors && supervisors.length > 0 ? (
                    supervisors.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <span>
                          {formatUserName(
                            user.first_name,
                            user.last_name,
                            user.username,
                          )}
                        </span>
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

      {showGroup && (
        <FormField
          control={control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{projects.create.form.group}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isManager}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={projects.create.form.selectGroup}
                    />
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

      {showDescription && (
        <GenericFormField
          control={control}
          name="description"
          label={projects.create.form.description}
          type="textarea"
          placeholder={projects.create.form.descriptionPlaceholder}
          className="min-h-32"
        />
      )}

      {showAssets && (
        <FormField
          control={control}
          name="assets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{projects.create.form.assets}</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value as FileWithPreview[]}
                  onChange={field.onChange}
                  maxSize={52428800}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
