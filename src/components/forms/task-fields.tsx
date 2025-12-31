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
};

export function TaskFields({
  control,
  isInProject = false,
  projectId,
}: TaskFieldsProps) {
  const actualIsInProject = isInProject || Boolean(projectId);

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
    <div className="space-y-6 text-right">
      {/* Primary Input Zone */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-primary/60 text-[9px] font-bold tracking-tight">
            General Info
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="space-y-4">
          <GenericFormField
            control={control}
            name="title"
            label={tasks.addTask.issueTitle}
            type="input"
            placeholder="Task Title"
            autoFocus
            required
          />

          <GenericFormField
            control={control}
            name="description"
            label={tasks.addTask.description}
            type="textarea"
            placeholder="Detailed Description"
            className="min-h-25"
          />
        </div>
      </section>

      {/* Logic Gates Zone */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-primary/60 text-[9px] font-bold tracking-tight">
            Task Parameters
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          {!actualIsInProject && (
            <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
              <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-bold tracking-tight">
                <IconStack2 className="size-2" /> Project
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
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-bold tracking-tight">
              <IconUser className="size-2" /> Assignee
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

          <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-bold tracking-tight">
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
                              "Status"}
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

          <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-bold tracking-tight">
              <IconHash className="size-2" /> Priority
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

          <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-bold tracking-tight">
              <IconCalendar className="size-2" /> Deadline
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

          <div className="bg-card flex h-16 flex-col justify-between p-3">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-bold tracking-tight">
              <IconClock className="size-2" /> Estimate
            </span>
            <div className="flex items-center justify-end gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold opacity-30">H</span>
                <ShadcnFormField
                  control={control}
                  name="estimated_hours"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      className="bg-muted/10 h-7 w-12 rounded-lg border-none p-1 text-center text-[10px] font-bold tabular-nums focus:ring-0"
                      placeholder="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold opacity-30">M</span>
                <ShadcnFormField
                  control={control}
                  name="estimated_minutes"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      className="bg-muted/10 h-7 w-12 rounded-lg border-none p-1 text-center text-[10px] font-bold tabular-nums focus:ring-0"
                      placeholder="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-bold tracking-tight">
              <IconTag className="size-2" /> Tags
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
