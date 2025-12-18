import { Control } from "react-hook-form";

import { FileUpload } from "@/components/ui/file-upload";
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
import { Textarea } from "@/components/ui/textarea";
import { fa } from "@/constants";
import { useUsers, useGroups } from "@/hooks";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { formatUserName } from "@/lib/utils";

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
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.projects.create.form.name}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.projects.create.form.code}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showSupervisor && isAdmin && (
        <FormField
          control={control}
          name="supervisor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.projects.create.form.supervisor}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={fa.projects.create.form.selectSupervisor}
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
                      {fa.common.messages.noData}
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
              <FormLabel>{fa.projects.create.form.group}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isManager}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={fa.projects.create.form.selectGroup}
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
                      {fa.common.messages.noData}
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
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.projects.create.form.description}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={fa.projects.create.form.descriptionPlaceholder}
                  className="min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showAssets && (
        <FormField
          control={control}
          name="assets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.projects.create.form.assets}</FormLabel>
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
