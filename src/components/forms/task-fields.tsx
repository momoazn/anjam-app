import {
  IconCalendar,
  IconFilter,
  IconHash,
  IconStack2,
  IconTag,
  IconUser,
} from "@tabler/icons-react";
import { useMemo } from "react";
import type { Control } from "react-hook-form";

import type { TaskFormData } from "@/components/forms/task-fields-schema";
import DatePicker from "@/components/ui/date-picker";
import {
  FormControl,
  FormItem,
  FormMessage,
  FormField as ShadcnFormField,
} from "@/components/ui/form";
import { tasks } from "@/constants";
import { useProjectUsers, useProjects, useUsers } from "@/hooks";
import {
  TASK_STATUS_CONFIG,
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { TagPicker } from "../task/tag-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FormField as GenericFormField } from "./form-field";

const TASK_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
] as const;

type TaskStatus = (typeof TASK_STATUSES)[number];

const TASK_PRIORITY_VALUES = ["low", "medium", "high", "urgent"] as const;

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

  const { data: projectsData } = useProjects({ enabled: !actualIsInProject });
  const { data: projectUsers } = useProjectUsers({
    projectId: projectId || "",
  });
  const { data: users } = useUsers({ enabled: !projectId });

  const assignees = projectId ? projectUsers : users;

  const projectOptions = useMemo(() => {
    if (!projectsData) return [];
    return projectsData.map((p) => ({ value: p.id, label: p.name }));
  }, [projectsData]);

  const assigneeOptions = useMemo(() => {
    const unassignedLabel = String(tasks.addTask.unassigned);
    const opts = [{ value: unassignedLabel, label: unassignedLabel }];
    if (assignees) {
      assignees.forEach((u) => {
        const firstName =
          (u as { firstName?: string; first_name?: string }).firstName ??
          (u as { first_name?: string }).first_name;
        const lastName =
          (u as { lastName?: string; last_name?: string }).lastName ??
          (u as { last_name?: string }).last_name;
        opts.push({
          value:
            (u as { id?: string; _id?: string }).id ||
            (u as { _id?: string })._id ||
            "",
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

  const statusOptions = useMemo(() => {
    return TASK_STATUSES.map((status) => ({
      value: status,
      label: TASK_STATUS_CONFIG[status as TaskStatus]?.name || status,
    }));
  }, []);

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
              <ShadcnFormField
                control={control}
                name="project"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-muted/5 w-56 rounded-lg border-none px-3 py-2 text-right text-xs font-bold tracking-tight focus:ring-0">
                        <SelectValue
                          placeholder={tasks.addTask.selectProject}
                        />
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
                    <FormMessage className="text-xs font-bold" />
                  </FormItem>
                )}
              />
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
            <ShadcnFormField
              control={control}
              name="status"
              render={({ field }) => {
                const value = (field.value as TaskStatus) || "todo";
                const StatusIcon =
                  taskStatusIcons[value] || taskStatusIcons.todo;
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
                          const itemColor = getStatusColorVariant(
                            itemStatus,
                            "icon",
                          );
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
            <ShadcnFormField
              control={control}
              name="priority"
              render={({ field }) => {
                const value =
                  (field.value as (typeof TASK_PRIORITY_VALUES)[number]) ||
                  "medium";
                const PriorityIcon = priorityIcons[value];
                const priorityColor = priorityColors[value];
                return (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-muted/5 w-56 rounded-lg border-none px-3 py-2 text-right text-xs font-bold tracking-tight focus:ring-0">
                        <div className="flex items-center justify-end gap-2">
                          <span>{tasks.priority[value]}</span>
                          <PriorityIcon
                            className={cn("size-4", priorityColor)}
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card rounded-lg border">
                        {TASK_PRIORITY_VALUES.map((p) => {
                          const ItemIcon = priorityIcons[p];
                          const itemColor = priorityColors[p];
                          return (
                            <SelectItem
                              key={p}
                              value={p}
                              className="text-xs font-bold"
                            >
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
          </div>
        </div>
      </section>
    </div>
  );
}
