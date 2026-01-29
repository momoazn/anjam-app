import type { Control } from "react-hook-form";

import type { TaskFormData } from "@/components/forms/task-fields-schema";
import { TagPicker } from "@/components/task/tag-picker";
import {
  FormControl,
  FormItem,
  FormMessage,
  FormField as ShadcnFormField,
} from "@/components/ui/form";

type TagsFieldProps = {
  control: Control<TaskFormData>;
};

export function TagsField({ control }: TagsFieldProps) {
  return (
    <ShadcnFormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormControl>
            <TagPicker
              selectedTagIds={field.value || []}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage className="text-xs font-bold" />
        </FormItem>
      )}
    />
  );
}
