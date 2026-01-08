import type { Control } from "react-hook-form";

import type { TaskFormData } from "@/components/forms/task-fields-schema";
import DatePicker from "@/components/ui/date-picker";
import {
  FormControl,
  FormItem,
  FormMessage,
  FormField as ShadcnFormField,
} from "@/components/ui/form";

type DateFieldProps = {
  control: Control<TaskFormData>;
};

export function DateField({ control }: DateFieldProps) {
  return (
    <ShadcnFormField
      control={control}
      name="deadline"
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormControl>
            <DatePicker
              date={field.value}
              setDate={field.onChange}
              buttonProps={{
                className:
                  "w-56 h-10 rounded-lg border-none bg-muted/5 shadow-none px-3 py-2 font-bold text-xs tracking-tight focus:ring-0 text-right",
              }}
            />
          </FormControl>
          <FormMessage className="text-xs font-bold" />
        </FormItem>
      )}
    />
  );
}
