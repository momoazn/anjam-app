import {
  IconCalendar,
  IconClock,
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
import { Input } from "@/components/ui/input";
import { tasks } from "@/constants";
import {
  useProjectStatuses,
  useProjectUsers,
  useProjects,
  useUsers,
} from "@/hooks";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
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

type TaskFieldsProps = {
  control: Control<TaskFormData>;
  isInProject?: boolean;
  projectId?: string;
  variant?: "default" | "product";
};

export function TaskFields({
  control,
  isInProject = false,
  projectId,
  variant = "default",
}: TaskFieldsProps) {
  const actualIsInProject = isInProject || Boolean(projectId);
  const isProductVariant = variant === "product";
  const metaLabelClass = cn(
    "flex items-center gap-1.5 font-bold tracking-tight",
    isProductVariant
      ? "text-muted-foreground/60 text-[8px]"
      : "text-muted-foreground/40 text-[7px]",
  );

  const { data: projectsData } = useProjects({ enabled: !actualIsInProject });
  const { data: projectUsers } = useProjectUsers({
    projectId: projectId || "",
  });
  const { data: users } = useUsers({ enabled: !projectId });
  const { data: projectStatuses } = useProjectStatuses({
    projectId: projectId || "",
    enabled: Boolean(projectId),
  });

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
        opts.push({
          value: u.id,
          label: formatUserName(u.first_name, u.last_name, u.username),
        });
      });
    }
    return opts;
  }, [assignees]);

  const statusOptions = useMemo(() => {
    if (projectStatuses && projectStatuses.length > 0) {
      const validStatuses = new Set(Object.values(TasksStatusOptions));
      return projectStatuses
        .filter((status) => validStatuses.has(status.key as TasksStatusOptions))
        .map((status) => ({
          value: status.key as TasksStatusOptions,
          label: status.name || status.key,
        }));
    }

    return Object.values(TasksStatusOptions).map((status) => ({
      value: status,
      label: TASK_STATUS_CONFIG[status].name,
    }));
  }, [projectStatuses]);

  return (
    <div
      className={cn("text-right", isProductVariant ? "space-y-4" : "space-y-6")}
    >
      {/* Primary Input Zone */}
      <section className={isProductVariant ? "space-y-4" : "space-y-3"}>
        {isProductVariant ? null : (
          <div className="flex items-center gap-3">
            <span className="text-primary/60 text-[9px] font-bold tracking-tight">
              {tasks.form.sections.generalInfo}
            </span>
            <div className="bg-border/20 h-px flex-1" />
          </div>
        )}

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

      {/* Logic Gates Zone */}
      <section className={isProductVariant ? "space-y-2" : "space-y-3"}>
        {isProductVariant ? null : (
          <div className="flex items-center gap-3">
            <span className="text-primary/60 text-[9px] font-bold tracking-tight">
              {tasks.form.sections.taskParameters}
            </span>
            <div className="bg-border/20 h-px flex-1" />
          </div>
        )}

        <div
          className={cn(
            "bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border sm:grid-cols-2 lg:grid-cols-3",
            isProductVariant
              ? "rounded-xl shadow-none"
              : "rounded-2xl shadow-sm",
          )}
        >
          {!actualIsInProject && (
            <div
              className={cn(
                "border-border/10 flex flex-col justify-between border-s p-3",
                isProductVariant ? "bg-background/20 h-14" : "bg-card h-16",
              )}
            >
              <span className={metaLabelClass}>
                <IconStack2 className="size-2" /> {tasks.form.project}
              </span>
              <ShadcnFormField
                control={control}
                name="project"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-muted/5 h-7 rounded-lg border-none px-2 text-right text-[10px] font-bold tracking-tight focus:ring-0">
                        <SelectValue
                          placeholder={tasks.addTask.selectProject}
                        />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card rounded-lg border">
                        {projectOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-[9px] font-bold"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[9px] font-bold" />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div
            className={cn(
              "border-border/10 flex flex-col justify-between border-s p-3",
              isProductVariant ? "bg-background/20 h-14" : "bg-card h-16",
            )}
          >
            <span className={metaLabelClass}>
              <IconUser className="size-2" /> {tasks.form.assignee}
            </span>
            <ShadcnFormField
              control={control}
              name="assignee"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-muted/5 h-7 rounded-lg border-none px-2 text-right text-[10px] font-bold tracking-tight focus:ring-0">
                      <SelectValue placeholder={tasks.addTask.unassigned} />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card rounded-lg border">
                      {assigneeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-[9px] font-bold"
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
              "border-border/10 flex flex-col justify-between border-s p-3",
              isProductVariant ? "bg-background/20 h-14" : "bg-card h-16",
            )}
          >
            <span className={metaLabelClass}>
              <IconFilter className="size-2" /> Status
            </span>
            <ShadcnFormField
              control={control}
              name="status"
              render={({ field }) => {
                const value = field.value as TasksStatusOptions;
                const StatusIcon =
                  taskStatusIcons[value] || taskStatusIcons.todo;
                const statusColor = getStatusColorVariant(value, "icon");
                return (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-muted/5 h-7 rounded-lg border-none px-2 text-right text-[10px] font-bold tracking-tight focus:ring-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>
                            {TASK_STATUS_CONFIG[value]?.name ??
                              value ??
                              tasks.form.status}
                          </span>
                          <StatusIcon className={cn("size-3", statusColor)} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card rounded-lg border">
                        {statusOptions.map((option) => {
                          const ItemIcon =
                            taskStatusIcons[option.value] ||
                            taskStatusIcons.todo;
                          const itemColor = getStatusColorVariant(
                            option.value,
                            "icon",
                          );
                          return (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-[9px] font-bold"
                            >
                              <div className="flex items-center gap-1.5">
                                <ItemIcon className={cn("size-3", itemColor)} />
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
              "border-border/10 flex flex-col justify-between border-s p-3",
              isProductVariant ? "bg-background/20 h-14" : "bg-card h-16",
            )}
          >
            <span className={metaLabelClass}>
              <IconHash className="size-2" /> {tasks.form.priority}
            </span>
            <ShadcnFormField
              control={control}
              name="priority"
              render={({ field }) => {
                const value = field.value as TasksPriorityOptions;
                const PriorityIcon = priorityIcons[value];
                const priorityColor = priorityColors[value];
                return (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-muted/5 h-7 rounded-lg border-none px-2 text-right text-[10px] font-bold tracking-tight focus:ring-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{tasks.priority[value]}</span>
                          <PriorityIcon
                            className={cn("size-3", priorityColor)}
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card rounded-lg border">
                        {Object.values(TasksPriorityOptions).map((p) => {
                          const ItemIcon = priorityIcons[p];
                          const itemColor = priorityColors[p];
                          return (
                            <SelectItem
                              key={p}
                              value={p}
                              className="text-[9px] font-bold"
                            >
                              <div className="flex items-center gap-1.5">
                                <ItemIcon className={cn("size-3", itemColor)} />
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
              "border-border/10 flex flex-col justify-between border-s p-3",
              isProductVariant ? "bg-background/20 h-14" : "bg-card h-16",
            )}
          >
            <span className={metaLabelClass}>
              <IconCalendar className="size-2" /> {tasks.form.deadline}
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
                          "h-7 rounded-lg border-none bg-muted/5 shadow-none px-2 font-bold text-[10px] tracking-tight focus:ring-0 text-right",
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold" />
                </FormItem>
              )}
            />
          </div>

          <div
            className={cn(
              "bg-card flex flex-col justify-between p-3",
              isProductVariant ? "bg-background/20 h-14" : "h-16",
            )}
          >
            <span className={metaLabelClass}>
              <IconClock className="size-2" /> {tasks.form.estimate}
            </span>
            <div className="flex items-center justify-end gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold opacity-30">
                  {tasks.form.hoursShort}
                </span>
                <ShadcnFormField
                  control={control}
                  name="estimated_hours"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      max={999}
                      className="bg-muted/10 h-7 w-12 rounded-lg border-none p-1 text-center text-[10px] font-bold tabular-nums focus:ring-0"
                      placeholder="0"
                      onChange={(e) => {
                        const value = Math.max(
                          0,
                          Math.min(999, Number(e.target.value) || 0),
                        );
                        field.onChange(value);
                      }}
                    />
                  )}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold opacity-30">
                  {tasks.form.minutesShort}
                </span>
                <ShadcnFormField
                  control={control}
                  name="estimated_minutes"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      max={59}
                      className="bg-muted/10 h-7 w-12 rounded-lg border-none p-1 text-center text-[10px] font-bold tabular-nums focus:ring-0"
                      placeholder="0"
                      onChange={(e) => {
                        const value = Math.max(
                          0,
                          Math.min(59, Number(e.target.value) || 0),
                        );
                        field.onChange(value);
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "border-border/10 flex flex-col justify-between border-s p-3",
              isProductVariant ? "bg-background/20 h-14" : "bg-card h-16",
            )}
          >
            <span className={metaLabelClass}>
              <IconTag className="size-2" /> {tasks.form.tags}
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
                  <FormMessage className="text-[9px] font-bold" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
