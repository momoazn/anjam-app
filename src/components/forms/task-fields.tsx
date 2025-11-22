import * as TablerIcons from "@tabler/icons-react";
import { Control } from "react-hook-form";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fa } from "@/constants/text";
import { useProjects, useProjectUsers, useUsers } from "@/hooks";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { priorityColors, priorityIcons } from "@/lib/tasks-utils";
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
  control: Control<{
    title: string;
    description: string;
    assignee: string;
    priority: TasksPriorityOptions;
    status: TasksStatusOptions;
    project?: string;
    deadline?: Date;
    estimated_hours?: number;
    estimated_minutes?: number;
  }>;
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
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                className="h-auto border-none !bg-transparent p-0 text-xl font-semibold shadow-none focus-visible:ring-0 dark:!bg-transparent"
                placeholder={fa.tasks.addTask.issueTitle}
                autoFocus
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
            <FormControl>
              <Textarea
                {...field}
                className="min-h-[60px] w-full resize-none border-none !bg-transparent p-0 text-sm shadow-none outline-none focus-visible:ring-0 dark:!bg-transparent"
                placeholder={fa.tasks.addTask.description}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <TimeEstimateFields control={control} />

      <div className="flex items-center gap-2">
        <FormField
          control={control}
          name="assignee"
          render={({ field }) => {
            const selectedUser = assignees?.find((u) => u.id === field.value);

            return (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      size="default"
                      className="!bg-transparent dark:!bg-transparent"
                    >
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
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={fa.tasks.addTask.unassigned}>
                        <span>{fa.tasks.addTask.unassigned}</span>
                      </SelectItem>
                      {assignees?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <span>
                            {formatUserName(
                              u.first_name,
                              u.last_name,
                              u.username,
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  buttonProps={{
                    className: "w-38",
                    size: "sm",
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => {
            const StatusIcon = TablerIcons.IconCircle; // Default icon for now
            const statusIconColor = "text-gray-500"; // Default color for now

            return (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      size="sm"
                      className="gap-2 !bg-transparent dark:!bg-transparent"
                      aria-label={fa.tasks.addTask.status}
                    >
                      <StatusIcon className={`size-3 ${statusIconColor}`} />
                      <SelectValue placeholder={fa.tasks.addTask.status}>
                        {field.value || fa.tasks.addTask.status}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TasksStatusOptions).map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <StatusIcon
                              className={`size-3 ${statusIconColor}`}
                            />
                            <span>{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="priority"
          render={({ field }) => {
            const PriorityIcon = priorityIcons[field.value];
            const priorityIconColor = priorityColors[field.value];

            return (
              <FormItem>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      // Toggle through priorities
                      const currentIndex = Object.values(
                        TasksPriorityOptions,
                      ).indexOf(field.value);
                      const nextIndex =
                        (currentIndex + 1) %
                        Object.values(TasksPriorityOptions).length;
                      field.onChange(
                        Object.values(TasksPriorityOptions)[nextIndex],
                      );
                    }}
                  >
                    <PriorityIcon className={`size-3 ${priorityIconColor}`} />
                    {fa.tasks.priority[field.value]}
                  </Button>
                </FormControl>
              </FormItem>
            );
          }}
        />

        {!actualIsInProject && (
          <FormField
            control={control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      size="default"
                      className="!bg-transparent dark:!bg-transparent"
                    >
                      <SelectValue
                        placeholder={fa.tasks.addTask.selectProject}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span>{p.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  );
}
