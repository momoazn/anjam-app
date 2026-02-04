import {
  IconCalendar,
  IconFilter,
  IconHash,
  IconStack2,
  IconTag,
  IconUser,
} from "@tabler/icons-react";
import type { Control } from "react-hook-form";

import type { TaskFormData } from "@/components/forms/task-fields-schema";
import { FormField as GenericFormField } from "@/components/recipes/form-field";
import { tasks } from "@/constants";
import { cn } from "@/lib/utils";

import { AssigneeField } from "./fields/assignee-field";
import { DateField } from "./fields/date-field";
import { PriorityField } from "./fields/priority-field";
import { ProjectField } from "./fields/project-field";
import { StatusField } from "./fields/status-field";
import { TagsField } from "./fields/tags-field";

type TaskFieldsProps = {
  control: Control<TaskFormData>;
  isInProject?: boolean;
  projectId?: string;
};

export function TaskFields({
  control,
  isInProject = false,
  projectId,
}: TaskFieldsProps) {
  const actualIsInProject = isInProject || Boolean(projectId);
  const metaLabelClass =
    "flex items-center gap-1.5 font-bold tracking-tight text-muted-foreground/60 text-xs";

  return (
    <div className="text-right space-y-5">
      <section className="space-y-4">
        <div className="space-y-4">
          <GenericFormField
            control={control}
            name="title"
            label={tasks.addTask.issueTitle}
            type="input"
            placeholder={tasks.form.placeholders.taskTitle}
            autoFocus
            required
          />

          <GenericFormField
            control={control}
            name="description"
            label={tasks.addTask.description}
            type="textarea"
            placeholder={tasks.form.placeholders.detailedDescription}
            className="min-h-25"
          />
        </div>
      </section>

      <section className="space-y-3">
        <div
          className={cn(
            "border-border/40 space-y-2 overflow-hidden rounded-xl border",
            "bg-background/20 p-3",
          )}
        >
          {!actualIsInProject && (
            <div
              className={cn(
                "border-border/10 flex items-center justify-between border-s px-3 py-3",
                "rounded-lg",
              )}
            >
              <span className={metaLabelClass}>
                <IconStack2 className="size-3" /> {tasks.form.project}
              </span>
              <ProjectField control={control} />
            </div>
          )}

          <div
            className={cn(
              "border-border/10 flex items-center justify-between border-s px-3 py-3",
              "rounded-lg",
            )}
          >
            <span className={metaLabelClass}>
              <IconUser className="size-3" /> {tasks.form.assignee}
            </span>
            <AssigneeField control={control} projectId={projectId} />
          </div>

          <div
            className={cn(
              "border-border/10 flex items-center justify-between border-s px-3 py-3",
              "rounded-lg",
            )}
          >
            <span className={metaLabelClass}>
              <IconFilter className="size-3" /> Status
            </span>
            <StatusField control={control} />
          </div>

          <div
            className={cn(
              "border-border/10 flex items-center justify-between border-s px-3 py-3",
              "rounded-lg",
            )}
          >
            <span className={metaLabelClass}>
              <IconHash className="size-3" /> {tasks.form.priority}
            </span>
            <PriorityField control={control} />
          </div>

          <div
            className={cn(
              "border-border/10 flex items-center justify-between border-s px-3 py-3",
              "rounded-lg",
            )}
          >
            <span className={metaLabelClass}>
              <IconCalendar className="size-3" /> {tasks.form.deadline}
            </span>
            <DateField control={control} />
          </div>

          <div
            className={cn(
              "border-border/10 flex items-center justify-between border-s px-3 py-3",
              "rounded-lg",
            )}
          >
            <span className={metaLabelClass}>
              <IconTag className="size-3" /> {tasks.form.tags}
            </span>
            <TagsField control={control} />
          </div>
        </div>
      </section>
    </div>
  );
}
