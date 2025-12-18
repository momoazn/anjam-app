import type { Control, FieldValues } from "react-hook-form";
import { useParams } from "react-router-dom";

import DatePicker from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fa } from "@/constants";
import { useProjects, useProjectUsers, useUsers } from "@/hooks";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
  TASK_STATUS_CONFIG,
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

type TaskFieldsProps = {
  control: Control<FieldValues>;
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
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.tasks.addTask.issueTitle}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={fa.tasks.addTask.issueTitle}
                  autoFocus
                  className="text-lg font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fa.tasks.addTask.description}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[120px] resize-y"
                  placeholder={fa.tasks.addTask.description}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!actualIsInProject && (
          <FormField
            control={control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fa.tasks.addTask.selectProject}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={fa.tasks.addTask.selectProject}
                      />
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
                          {fa.common.messages.noData}
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
                <FormLabel>{fa.tasks.addTask.assignee}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={fa.tasks.addTask.unassigned}>
                        {field.value &&
                        field.value !== fa.tasks.addTask.unassigned &&
                        selectedUser ? (
                          <span>
                            {formatUserName(
                              selectedUser.first_name,
                              selectedUser.last_name,
                              selectedUser.username,
                            )}
                          </span>
                        ) : (
                          <span>{fa.tasks.addTask.unassigned}</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={fa.tasks.addTask.unassigned}>
                        <span>{fa.tasks.addTask.unassigned}</span>
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
                          {fa.common.messages.noData}
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
            const statusColor =
              taskStatusColors[field.value] || "text-gray-500";

            return (
              <FormItem>
                <FormLabel>{fa.tasks.addTask.status}</FormLabel>
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
                        const itemColor =
                          taskStatusColors[status] || "text-gray-500";
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
                <FormLabel>{fa.tasks.addTask.priority}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <PriorityIcon className={`size-4 ${priorityColor}`} />
                        <span>{fa.tasks.priority[field.value]}</span>
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
                              <span>{fa.tasks.priority[priority]}</span>
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
              <FormLabel>{fa.tasks.addTask.deadline}</FormLabel>
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
