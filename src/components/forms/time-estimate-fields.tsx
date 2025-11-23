import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fa } from "@/constants/text";
import type {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";

type TaskFormData = {
  title: string;
  description: string;
  assignee: string;
  priority: TasksPriorityOptions;
  status: TasksStatusOptions;
  project?: string;
  deadline?: Date;
  estimated_hours?: number;
  estimated_minutes?: number;
};

type TimeEstimateFieldsProps = {
  control: Control<TaskFormData>;
};

export function TimeEstimateFields({ control }: TimeEstimateFieldsProps) {
  return (
    <FormItem>
      <FormLabel>{fa.tasks.timeEstimate}</FormLabel>
      <div className="flex gap-4">
        <FormField
          control={control}
          name="estimated_hours"
          render={({ field }) => (
            <FormItem className="flex-1">
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="999"
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="pr-8"
                  />
                </FormControl>
                <div className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                  {fa.common.time.hoursShort}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="estimated_minutes"
          render={({ field }) => (
            <FormItem className="flex-1">
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="pr-8"
                  />
                </FormControl>
                <div className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                  {fa.common.time.minutesShort}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormItem>
  );
}
