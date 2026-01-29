import { useMemo } from "react";
import type { Control } from "react-hook-form";

import type { TaskFormData } from "@/components/forms/task-fields-schema";
import { FormItem, FormField as ShadcnFormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasks } from "@/constants";
import { useProjectUsers, useUsers } from "@/hooks/users";
import { formatUserName } from "@/lib/utils";

type AssigneeFieldProps = {
  control: Control<TaskFormData>;
  projectId?: string;
};

export function AssigneeField({ control, projectId }: AssigneeFieldProps) {
  const { data: projectUsers } = useProjectUsers({
    projectId: projectId || "",
  });
  const { data: users } = useUsers({ enabled: !projectId });

  const assignees = projectId ? projectUsers : users;

  const assigneeOptions = useMemo(() => {
    const unassignedLabel = String(tasks.addTask.unassigned);
    const opts = [{ value: unassignedLabel, label: unassignedLabel }];
    if (assignees) {
      assignees.forEach((u) => {
        const firstName = (u as { firstName?: string }).firstName;
        const lastName = (u as { lastName?: string }).lastName;
        opts.push({
          value: (u as { _id?: string })._id || "",
          label: formatUserName(
            firstName,
            lastName,
            (u as { username?: string }).username,
          ),
        });
      });
    }
    return opts;
  }, [assignees]);

  return (
    <ShadcnFormField
      control={control}
      name="assignee"
      render={({ field }) => (
        <FormItem className="space-y-0">
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="bg-muted/5 w-56 rounded-lg border-none px-3 py-2 text-right text-xs font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.addTask.unassigned} />
            </SelectTrigger>
            <SelectContent className="border-border bg-card rounded-lg border">
              {assigneeOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs font-bold"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
