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
import { useProjects } from "@/hooks/projects";

type ProjectFieldProps = {
  control: Control<TaskFormData>;
};

export function ProjectField({ control }: ProjectFieldProps) {
  const { data: projects } = useProjects();

  const projectOptions = useMemo(() => {
    if (!projects) return [];
    return projects.map((p) => ({ value: p._id, label: p.name }));
  }, [projects]);

  return (
    <ShadcnFormField
      control={control}
      name="project"
      render={({ field }) => (
        <FormItem className="space-y-0">
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="bg-muted/5 w-56 rounded-lg border-none px-3 py-2 text-right text-xs font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.form.selectProject} />
            </SelectTrigger>
            <SelectContent className="border-border bg-card rounded-lg border">
              {projectOptions.map((option) => (
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
