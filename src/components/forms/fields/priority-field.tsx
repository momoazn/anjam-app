import type { Control } from "react-hook-form";

import type { TaskFormData } from "@/components/forms/task-fields-schema";
import { FormItem, FormField as ShadcnFormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { tasks } from "@/constants";
import { priorityColors, priorityIcons } from "@/lib/status-utils";
import { cn } from "@/lib/utils";

const TASK_PRIORITY_VALUES = ["low", "medium", "high", "urgent"] as const;

type PriorityFieldProps = {
  control: Control<TaskFormData>;
};

export function PriorityField({ control }: PriorityFieldProps) {
  return (
    <ShadcnFormField
      control={control}
      name="priority"
      render={({ field }) => {
        const value =
          (field.value as (typeof TASK_PRIORITY_VALUES)[number]) || "medium";
        const PriorityIcon = priorityIcons[value];
        const priorityColor = priorityColors[value];
        return (
          <FormItem className="space-y-0">
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-muted/5 w-56 rounded-lg border-none px-3 py-2 text-right text-xs font-bold tracking-tight focus:ring-0">
                <div className="flex items-center justify-end gap-2">
                  <span>{tasks.priority[value]}</span>
                  <PriorityIcon className={cn("size-4", priorityColor)} />
                </div>
              </SelectTrigger>
              <SelectContent className="border-border bg-card rounded-lg border">
                {TASK_PRIORITY_VALUES.map((p) => {
                  const ItemIcon = priorityIcons[p];
                  const itemColor = priorityColors[p];
                  return (
                    <SelectItem key={p} value={p} className="text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <ItemIcon className={cn("size-4", itemColor)} />
                        <span>{tasks.priority[p]}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormItem>
        );
      }}
    />
  );
}
