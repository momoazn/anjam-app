import { digitsEnToFa } from "@persian-tools/persian-tools";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { TaskAssigneeAvatar } from "@/components/task/task-assignee-avatar";
import {
  TaskDueDate,
  TaskPriorityLabel,
  TaskTags,
} from "@/components/task/task-meta";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shared, task as taskLabels, tasks } from "@/constants";
import { useUpdateTask } from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import { getStatusColorVariant, taskStatusIcons } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { TaskStatus, TaskWithProject } from "@/types/tasks";

type TaskListItemProps = {
  task: TaskWithProject;
  className?: string;
  showProject?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
};

function TaskListItemInner({
  task,
  className,
  showProject = false,
  isSelectable = false,
  isSelected = false,
  onSelectionChange,
}: TaskListItemProps) {
  const navigate = useNavigate();
  const taskId = task._id as string;

  const StatusIcon = taskStatusIcons[task.status as TaskStatus];
  const statusIconColor = getStatusColorVariant(
    task.status as TaskStatus,
    "icon",
  );

  const updateTask = useUpdateTask();
  const { data: users } = useUsers({ enabled: true });

  const handleClick = () => {
    navigate(`/tasks/${taskId}`);
  };

  const handlePriorityChange = (value: string) => {
    updateTask.mutate({
      id: taskId,
      updates: { priority: value as TaskWithProject["priority"] },
    });
    toast.success(tasks.edit.success);
  };

  const handleAssigneeChange = (value: string) => {
    updateTask.mutate({
      id: taskId,
      updates: { assigneeUserId: value === "__unassigned" ? undefined : value },
    });
    toast.success(tasks.edit.success);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="task-row"
      data-task-id={taskId}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-1.5 px-3 py-2.5 text-right transition-colors md:flex-row md:items-center md:gap-4",
        "hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none",
        isSelected && "bg-primary/5",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleCardKeyDown}
      aria-label={taskLabels.editTask.replace("{title}", task.title)}
    >
      {/* Status, id, title, tags */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {isSelectable && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked: boolean) => onSelectionChange?.(checked)}
            className="size-4 shrink-0 rounded-md"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        )}
        <StatusIcon className={cn("size-4.5 shrink-0", statusIconColor)} />
        <span className="text-muted-foreground w-[4.5rem] shrink-0 font-mono text-xs tabular-nums">
          {digitsEnToFa(task.displayId || "")}
        </span>
        <span className="group-hover:text-primary min-w-0 truncate text-sm font-medium transition-colors">
          {task.title}
        </span>
        <TaskTags tagIds={task.tags} className="hidden shrink-0 lg:flex" />
      </div>

      {/* Meta columns: stacked under the title on mobile, aligned on desktop */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ps-7 md:ps-0">
        {showProject && (
          <span className="text-muted-foreground truncate text-xs max-md:hidden md:w-28">
            {task.project?.name}
          </span>
        )}

        <div className="md:w-28">
          <TaskDueDate task={task} className="-mx-1.5" />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="hover:bg-muted/60 -mx-1.5 cursor-pointer rounded-md px-1.5 py-0.5 md:w-20"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <TaskPriorityLabel priority={task.priority} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[140px] p-1.5" align="start">
            <Select value={task.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="h-8 border-transparent bg-transparent text-right text-xs focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border rounded-lg border">
                {(["low", "medium", "high", "urgent"] as const).map((level) => (
                  <SelectItem
                    key={level}
                    value={level}
                    className="text-xs font-bold"
                  >
                    {tasks.priority[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>

        <TaskTags tagIds={task.tags} className="lg:hidden" />

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="ms-auto cursor-pointer transition-transform hover:scale-110 md:ms-0"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <TaskAssigneeAvatar
                assignee={task.assignee}
                hasAssigneeId={!!task.assigneeUserId}
                size="sm"
                showIndicator={false}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-1.5" align="start">
            <Select
              value={task.assigneeUserId || "__unassigned"}
              onValueChange={handleAssigneeChange}
            >
              <SelectTrigger className="h-8 border-transparent bg-transparent text-right text-xs focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border rounded-lg border">
                <SelectItem value="__unassigned" className="text-xs font-bold">
                  {tasks.addTask.unassigned}
                </SelectItem>
                {users && users.length > 0 ? (
                  users.map((user: NonNullable<typeof users>[number]) => (
                    <SelectItem
                      key={user._id}
                      value={user._id}
                      className="text-xs font-bold"
                    >
                      {user.displayName || user.email}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty" disabled>
                    {shared.noData}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Indicator Bar */}
      <div
        className={cn(
          "absolute inset-y-0 end-0 w-0.5 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          getStatusColorVariant(task.status as TaskStatus, "bar"),
        )}
      />
    </div>
  );
}

export const TaskListItem = memo(TaskListItemInner);
