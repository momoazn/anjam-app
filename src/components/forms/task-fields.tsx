import { Control, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Icon } from "@tabler/icons-react";
import * as TablerIcons from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fa } from "@/constants/text";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { priorityColors, priorityIcons } from "@/lib/tasks-utils";
import {
  useProjects,
  useProjectUsers,
  useUsers,
  useProjectStatusConfigs,
} from "@/hooks";
import DatePicker from "../ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserAvatar } from "../user-avatar";

type TaskFieldsProps = {
  control: Control<{
    title: string;
    description: string;
    assignee: string;
    priority: TasksPriorityOptions;
    status?: TasksStatusOptions;
    status_config?: string;
    project?: string;
    deadline?: Date;
  }>;
  isInProject?: boolean;
};

export function TaskFields({ control, isInProject = false }: TaskFieldsProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const actualIsInProject = isInProject || Boolean(projectId);

  // Watch the project field to fetch status configs when project changes
  const selectedProjectId = useWatch({ control, name: "project" }) || projectId;

  // Fetch available projects
  const { data: projects } = useProjects({ enabled: !actualIsInProject });

  // Fetch project users when in project context
  const { data: projectUsers } = useProjectUsers({
    projectId: projectId || "",
  });

  // Fetch all users when not in project context
  const { data: users } = useUsers({ enabled: !projectId });

  // Fetch status configs for the selected project
  const { data: statusConfigs } = useProjectStatusConfigs(
    selectedProjectId || "",
    { enabled: Boolean(selectedProjectId) },
  );

  // Filter to only show enabled statuses
  const enabledStatuses =
    statusConfigs?.filter((status) => status.enabled) || [];

  // Use projectUsers when in project context, otherwise use all users
  const assignees = projectId ? projectUsers : users;

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string | undefined): Icon => {
    if (!iconName) return TablerIcons.IconCircle;
    // Type guard to check if the property exists and is an Icon component
    const iconKey = iconName as keyof typeof TablerIcons;
    if (iconKey in TablerIcons && typeof TablerIcons[iconKey] === "function") {
      return TablerIcons[iconKey] as Icon;
    }
    return TablerIcons.IconCircle;
  };

  // Helper function to get color class by color name
  const getColorClass = (color: string | undefined): string => {
    if (!color) return "text-gray-500";
    const colorMap: Record<string, string> = {
      gray: "text-gray-500 dark:text-gray-400",
      yellow: "text-yellow-500 dark:text-yellow-400",
      purple: "text-purple-600 dark:text-purple-400",
      blue: "text-blue-500 dark:text-blue-400",
      green: "text-green-500 dark:text-green-400",
      red: "text-red-500 dark:text-red-400",
      orange: "text-orange-500 dark:text-orange-400",
    };
    return colorMap[color] || "text-gray-500";
  };

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

      <div className="flex items-center gap-2">
        <FormField
          control={control}
          name="assignee"
          render={({ field }) => {
            const selectedUser = assignees?.find((u) => u.id === field.value);
            const selectedDisplayName = selectedUser
              ? [selectedUser.first_name, selectedUser.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                selectedUser.username ||
                ""
              : fa.tasks.addTask.unassigned;

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
                        <div className="flex items-center gap-2">
                          <UserAvatar username={selectedUser.username} />
                          <span>{selectedDisplayName}</span>
                        </div>
                      ) : (
                        <span>{fa.tasks.addTask.unassigned}</span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={fa.tasks.addTask.unassigned}>
                        <div className="flex items-center gap-2">
                          <UserAvatar username={fa.tasks.addTask.unassigned} />
                          <span>{fa.tasks.addTask.unassigned}</span>
                        </div>
                      </SelectItem>
                      {assignees?.map((u) => {
                        const displayName =
                          [u.first_name, u.last_name]
                            .filter(Boolean)
                            .join(" ") ||
                          u.username ||
                          "";

                        return (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center gap-2">
                              <UserAvatar username={u.username} />
                              <span>{displayName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
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
          name="status_config"
          render={({ field }) => {
            const selectedStatus = enabledStatuses.find(
              (s) => s.id === field.value,
            );
            const StatusIcon = selectedStatus
              ? getIconComponent(selectedStatus.icon)
              : TablerIcons.IconCircle;
            const statusIconColor = selectedStatus
              ? getColorClass(selectedStatus.color)
              : "text-gray-500";

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
                        {selectedStatus?.name || fa.tasks.addTask.status}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {enabledStatuses.map((status) => {
                        const Icon = getIconComponent(status.icon);
                        const colorClass = getColorClass(status.color);
                        return (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              <Icon className={`size-3 ${colorClass}`} />
                              <span>{status.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
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
