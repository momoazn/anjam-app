import { Control } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { fa } from "@/constants/text";
import { FileWithPreview } from "@/hooks/use-file-upload";

type ProjectFieldsProps = {
  control: Control<{
    name: string;
    code: string;
    description?: string;
    assets?: FileWithPreview[];
  }>;
  showDescription?: boolean;
  showAssets?: boolean;
};

export function ProjectFields({
  control,
  showDescription = true,
  showAssets = true,
}: ProjectFieldsProps) {
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
                  value={field.value}
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
