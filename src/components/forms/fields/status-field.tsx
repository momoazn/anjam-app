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
import {
  TASK_STATUS_CONFIG,
  getStatusColorVariant,
  taskStatusIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";

const TASK_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

const statusOptions = TASK_STATUSES.map((status) => ({
  value: status,
  label: TASK_STATUS_CONFIG[status as TaskStatus]?.name || status,
}));

type StatusFieldProps = {
  control: Control<TaskFormData>;
};

export function StatusField({ control }: StatusFieldProps) {
  return (
    <ShadcnFormField
      control={control}
      name="status"
      render={({ field }) => {
        const value = (field.value as TaskStatus) || "todo";
        const StatusIcon = taskStatusIcons[value] || taskStatusIcons.todo;
        const statusColor = getStatusColorVariant(value, "icon");
        return (
          <FormItem className="space-y-0">
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-muted/5 w-56 rounded-lg border-none px-3 py-2 text-right text-xs font-bold tracking-tight focus:ring-0">
                <div className="flex items-center justify-end gap-2">
                  <span>
                    {TASK_STATUS_CONFIG[value as TaskStatus]?.name ??
                      value ??
                      tasks.form.status}
                  </span>
                  <StatusIcon className={cn("size-4", statusColor)} />
                </div>
              </SelectTrigger>
              <SelectContent className="border-border bg-card rounded-lg border">
                {statusOptions.map((option) => {
                  const itemStatus = option.value as TaskStatus;
                  const ItemIcon =
                    taskStatusIcons[itemStatus] || taskStatusIcons.todo;
                  const itemColor = getStatusColorVariant(itemStatus, "icon");
                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <ItemIcon className={cn("size-4", itemColor)} />
                        <span>{option.label}</span>
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
