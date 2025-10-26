import { Control } from "react-hook-form";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TEXT } from "@/constants/text";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { useProjects, useProjectUsersFromAppData, useUsers } from "@/hooks";
import DatePicker from "../ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserAvatar } from "../user-avatar";

interface TaskFieldsProps {
  control: Control<{
    title: string;
    description: string;
    assignee: string;
    priority: TasksPriorityOptions;
    status: TasksStatusOptions;
    project?: string;
    deadline?: Date;
  }>;
  isInProject?: boolean;
}

export function TaskFields({ control, isInProject = false }: TaskFieldsProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const actualIsInProject = isInProject || Boolean(projectId);

  // Fetch available projects
  const { data: projects } = useProjects({ enabled: !actualIsInProject });

  // Fetch project users when in project context
  const { data: projectUsers } = useProjectUsersFromAppData(projectId || "");

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
                placeholder={TEXT.tasks.addTask.issueTitle}
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
                placeholder={TEXT.tasks.addTask.description}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center gap-2">
        <FormField
          control={control}
          name="assignee"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    size="default"
                    className="!bg-transparent dark:!bg-transparent"
                  >
                    <SelectValue placeholder={TEXT.tasks.addTask.unassigned} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TEXT.tasks.addTask.unassigned}>
                      <UserAvatar username={TEXT.tasks.addTask.unassigned} />
                      {TEXT.tasks.addTask.unassigned}
                    </SelectItem>
                    {assignees?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <UserAvatar username={u.username} />
                        <span>
                          {u.first_name} {u.last_name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
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
            const StatusIcon = taskStatusIcons[field.value];
            const statusIconColor = taskStatusColors[field.value];

            return (
              <FormItem>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      // Toggle through statuses
                      const currentIndex = Object.values(
                        TasksStatusOptions,
                      ).indexOf(field.value);
                      const nextIndex =
                        (currentIndex + 1) %
                        Object.values(TasksStatusOptions).length;
                      field.onChange(
                        Object.values(TasksStatusOptions)[nextIndex],
                      );
                    }}
                  >
                    <StatusIcon className={`size-3 ${statusIconColor}`} />
                    {TEXT.tasks.status[field.value]}
                  </Button>
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
                    {TEXT.tasks.priority[field.value]}
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
                        placeholder={TEXT.tasks.addTask.selectProject}
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
