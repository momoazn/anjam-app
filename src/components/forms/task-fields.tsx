import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { useParams } from "react-router-dom";

import DatePicker from "@/components/ui/date-picker";
import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tasks } from "@/constants";
import {
  useProjectStatuses,
  useProjects,
  useProjectUsers,
  useUsers,
} from "@/hooks";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusIcons,
  TASK_STATUS_CONFIG,
  getStatusColorVariant,
} from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { FormField as GenericFormField } from "./form-field";
import {
  IconFilter,
  IconHash,
  IconUser,
  IconCalendar,
  IconStack2,
  IconClock,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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

type TaskFieldsProps = {
  control: Control<TaskFormData>;
  isInProject?: boolean;
};

export function TaskFields({ control, isInProject = false }: TaskFieldsProps) {
  const { id: projectId } = useParams<{ id: string }>();
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
      return projectStatuses.map((status) => ({
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
    <div className="space-y-10 text-right">
      {/* Primary Input Zone */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            General Information
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="space-y-6">
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
          />
        </div>
      </section>

      {/* Logic Gates Zone */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            Task Details
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          {!actualIsInProject && (
            <div className="bg-card border-border/10 flex h-20 flex-col justify-between border-s p-4">
              <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[8px] font-black tracking-tight uppercase">
                <IconStack2 className="size-2.5" /> Project
              </span>
              <GenericFormField
                control={control}
                name="project"
                label=""
                type="select"
                options={projectOptions}
                placeholder={tasks.addTask.selectProject}
                className="h-8 border-none bg-transparent p-0"
              />
            </div>
          )}

          <div className="bg-card border-border/10 flex h-20 flex-col justify-between border-s p-4">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[8px] font-black tracking-tight uppercase">
              <IconUser className="size-2.5" /> Assignee
            </span>
            <GenericFormField
              control={control}
              name="assignee"
              label=""
              type="select"
              options={assigneeOptions}
              placeholder={tasks.addTask.unassigned}
              className="h-8 border-none bg-transparent p-0"
            />
          </div>

          <div className="bg-card border-border/10 flex h-20 flex-col justify-between border-s p-4">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[8px] font-black tracking-tight uppercase">
              <IconFilter className="size-2.5" /> Status
            </span>
            <ShadcnFormField
              control={control}
              name="status"
              render={({ field }) => {
                const StatusIcon =
                  taskStatusIcons[field.value] || taskStatusIcons.todo;
                const statusColor = getStatusColorVariant(field.value, "icon");
                return (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-muted/5 h-8 rounded-none border-none px-1 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
                        <div className="flex items-center justify-end gap-2">
                          <span>
                            {TASK_STATUS_CONFIG[field.value]?.name ??
                              field.value?.toUpperCase() ??
                              "Status"}
                          </span>
                          <StatusIcon className={cn("size-3.5", statusColor)} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card rounded-none border">
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
                              className="text-[10px] font-black uppercase"
                            >
                              <div className="flex items-center gap-2">
                                <ItemIcon
                                  className={cn("size-3.5", itemColor)}
                                />
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

          <div className="bg-card border-border/10 flex h-20 flex-col justify-between border-s p-4">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[8px] font-black tracking-tight uppercase">
              <IconHash className="size-2.5" /> Priority
            </span>
            <ShadcnFormField
              control={control}
              name="priority"
              render={({ field }) => {
                const PriorityIcon = priorityIcons[field.value];
                const priorityColor = priorityColors[field.value];
                return (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-muted/5 h-8 rounded-none border-none px-1 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
                        <div className="flex items-center justify-end gap-2">
                          <span>{tasks.priority[field.value]}</span>
                          <PriorityIcon
                            className={cn("size-3.5", priorityColor)}
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card rounded-none border">
                        {Object.values(TasksPriorityOptions).map((p) => {
                          const ItemIcon = priorityIcons[p];
                          const itemColor = priorityColors[p];
                          return (
                            <SelectItem
                              key={p}
                              value={p}
                              className="text-[10px] font-black uppercase"
                            >
                              <div className="flex items-center gap-2">
                                <ItemIcon
                                  className={cn("size-3.5", itemColor)}
                                />
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

          <div className="bg-card border-border/10 flex h-20 flex-col justify-between border-s p-4">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[8px] font-black tracking-tight uppercase">
              <IconCalendar className="size-2.5" /> Deadline
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
                          "h-8 rounded-none border-none bg-muted/5 shadow-none px-1 font-black text-[11px] uppercase tracking-tight focus:ring-0 text-right",
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-card flex h-20 flex-col justify-between p-4">
            <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[8px] font-black tracking-tight uppercase">
              <IconClock className="size-2.5" /> Time Estimate
            </span>
            <div className="flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <ShadcnFormField
                  control={control}
                  name="estimated_hours"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      className="bg-muted/10 h-7 w-12 rounded-none border-none p-1 text-center text-xs font-black tabular-nums focus:ring-0"
                      placeholder="00"
                    />
                  )}
                />
                <span className="text-[10px] font-bold opacity-30">H</span>
              </div>
              <div className="flex items-center gap-2">
                <ShadcnFormField
                  control={control}
                  name="estimated_minutes"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      className="bg-muted/10 h-7 w-12 rounded-none border-none p-1 text-center text-xs font-black tabular-nums focus:ring-0"
                      placeholder="00"
                    />
                  )}
                />
                <span className="text-[10px] font-bold opacity-30">M</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
