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
import { fa } from "@/constants/text";
import { useUsers } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { FileWithPreview } from "@/hooks/use-file-upload";

type ProjectFieldsProps = {
  control: Control<{
    name: string;
    code: string;
    description?: string;
    assets?: unknown[];
    supervisor?: string;
  }>;
  showDescription?: boolean;
  showAssets?: boolean;
  showSupervisor?: boolean;
  isAdmin?: boolean;
};

export function ProjectFields({
  control,
  showDescription = true,
  showAssets = true,
  showSupervisor = false,
  isAdmin = false,
}: ProjectFieldsProps) {
  const { data: allUsers } = useUsers({
    enabled: showSupervisor && isAdmin,
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
                  {supervisors?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username} ({user.first_name} {user.last_name})
                    </SelectItem>
                  ))}
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
