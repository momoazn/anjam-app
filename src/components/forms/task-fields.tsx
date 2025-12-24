import type { Control } from "react-hook-form";
import { useParams } from "react-router-dom";

import DatePicker from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { common, tasks } from "@/constants";
import { useProjects, useProjectUsers, useUsers } from "@/hooks";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TimeEstimateFields } from "./time-estimate-fields";
import { FormField as GenericFormField } from "./form-field";

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

  // Fetch available projects
  const { data: projects } = useProjects({ enabled: !actualIsInProject });

  // Fetch project users when in project context
  const { data: projectUsers } = useProjectUsers({
    projectId: projectId || "",
  });

  // Fetch all users when not in project context
  const { data: users } = useUsers({ enabled: !projectId });

  // Use projectUsers when in project context, otherwise use all users
  const assignees = projectId ? projectUsers : users;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <GenericFormField
          control={control}
          name="title"
          label={tasks.addTask.issueTitle}
          type="input"
          placeholder={tasks.addTask.issueTitle}
          autoFocus
          className="text-lg font-medium"
          required
        />

        <GenericFormField
          control={control}
          name="description"
          label={tasks.addTask.description}
          type="textarea"
          placeholder={tasks.addTask.description}
          className="min-h-[120px] resize-y"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!actualIsInProject && (
          <FormField
            control={control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tasks.addTask.selectProject}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={tasks.addTask.selectProject} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects && projects.length > 0 ? (
                        projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span>{p.name}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__empty" disabled>
                          {common.messages.noData}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="assignee"
          render={({ field }) => {
            const selectedUser = assignees?.find((u) => u.id === field.value);

            return (
              <FormItem>
                <FormLabel>{tasks.addTask.assignee}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={tasks.addTask.unassigned}>
                        {field.value &&
                        field.value !== tasks.addTask.unassigned &&
                        selectedUser ? (
                          <span>
                            {formatUserName(
                              selectedUser.first_name,
                              selectedUser.last_name,
                              selectedUser.username,
                            )}
                          </span>
                        ) : (
                          <span>{tasks.addTask.unassigned}</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={tasks.addTask.unassigned}>
                        <span>{tasks.addTask.unassigned}</span>
                      </SelectItem>
                      {assignees && assignees.length > 0 ? (
                        assignees.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <span>
                              {formatUserName(
                                u.first_name,
                                u.last_name,
                                u.username,
                              )}
                            </span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__empty" disabled>
                          {common.messages.noData}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => {
            const StatusIcon =
              taskStatusIcons[field.value] || taskStatusIcons.todo;
            const statusColor = getStatusColorVariant(field.value, "icon");

            return (
              <FormItem>
                <FormLabel>{tasks.addTask.status}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`size-4 ${statusColor}`} />
                        <span>{TASK_STATUS_CONFIG[field.value].name}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TasksStatusOptions).map((status) => {
                        const ItemIcon =
                          taskStatusIcons[status] || taskStatusIcons.todo;
                        const itemColor = getStatusColorVariant(status, "icon");
                        return (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              <ItemIcon className={`size-4 ${itemColor}`} />
                              <span>{TASK_STATUS_CONFIG[status].name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="priority"
          render={({ field }) => {
            const PriorityIcon = priorityIcons[field.value];
            const priorityColor = priorityColors[field.value];

            return (
              <FormItem>
                <FormLabel>{tasks.addTask.priority}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <PriorityIcon className={`size-4 ${priorityColor}`} />
                        <span>{tasks.priority[field.value]}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TasksPriorityOptions).map((priority) => {
                        const ItemIcon = priorityIcons[priority];
                        const itemColor = priorityColors[priority];
                        return (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <ItemIcon className={`size-4 ${itemColor}`} />
                              <span>{tasks.priority[priority]}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{tasks.addTask.deadline}</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  buttonProps={{
                    className: "w-full",
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TimeEstimateFields control={control} />
      </div>
    </div>
  );
}
