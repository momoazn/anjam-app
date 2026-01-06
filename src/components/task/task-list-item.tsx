import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconClock, IconHash, IconTarget } from "@tabler/icons-react";
import { isToday } from "date-fns-jalali";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { TaskAssigneeAvatar } from "@/components/task/task-assignee-avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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
import { useProductClasses } from "@/hooks/use-product-theme";
import { useUsers } from "@/hooks/users";
import { formatDateShort } from "@/lib/date-utils";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import { isTaskCanceled, isTaskCompleted } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { Task } from "@/types/tasks";

// Convex-compatible TaskWithProject interface
// Uses both _id (Convex) and id (compatibility), and both naming conventions
interface TaskWithProject extends Omit<Task, "id"> {
  id?: string;
  project?: {
    name: string;
  };
  assignee?: {
    id: string;
    _id: string;
    username: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
  } | null;
  display_id?: string; // Compatibility field mapped from displayId
  // Additional expand fields
  expand?: {
    project?: {
      name: string;
    };
    assignee?: {
      id: string;
      _id: string;
      username: string;
      firstName?: string;
      first_name?: string;
      lastName?: string;
      last_name?: string;
    };
  };
}

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
  const productClasses = useProductClasses();
  const taskId = task.id ?? task._id;

  const StatusIcon = taskStatusIcons[task.status];
  const statusIconColor = getStatusColorVariant(task.status, "icon");

  const PriorityIcon = priorityIcons[task.priority];
  const priorityIconColor = priorityColors[task.priority];
  const assigneeRecord = task.assignee;

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isDeadlineToday = deadlineDate ? isToday(deadlineDate) : false;
  const now = new Date();
  const isOverdue =
    deadlineDate &&
    deadlineDate.getTime() < now.getTime() &&
    !isTaskCompleted(task) &&
    !isTaskCanceled(task);

  const updateTask = useUpdateTask();

  const { data: users } = useUsers({ enabled: true }); // Removed batch/sort options not supported yet

  const handleClick = () => {
    navigate(`/tasks/${taskId}`);
  };

  const handlePriorityChange = (value: string) => {
    updateTask.mutate({ id: taskId, updates: { priority: value } });
    toast.success(tasks.edit.success);
  };

  const handleAssigneeChange = (value: string) => {
    updateTask.mutate({
      id: taskId,
      updates: { assigneeUserId: value === "__unassigned" ? undefined : value },
    });
    toast.success(tasks.edit.success);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    updateTask.mutate({
      id: taskId,
      updates: { deadline: date ? date.getTime() : undefined },
    });
    toast.success(tasks.edit.success);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  };

  // Convex uses displayId, PB used display_id (sometimes computed)
  // In our hook mapping we might need to ensure one is standard.
  // The Task type has displayId.
  const displayId = task.displayId || task.display_id || "";

  return (
    <button
      type="button"
      className={cn(
        "group relative flex h-auto w-full cursor-pointer items-stretch justify-start border-b border-border/40 bg-transparent p-0 text-right transition-colors hover:z-10 focus-visible:ring-0",
        productClasses.transition,
        productClasses.kbdFocus,
        "hover:bg-muted/30",
        isSelected && (productClasses.selected || "bg-primary/5"),
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleCardKeyDown}
      aria-label={taskLabels.editTask.replace("{title}", task.title)}
    >
      {/* Selection & Priority Zone */}
      <div className="flex w-11 shrink-0 flex-col items-center justify-center gap-2 border-e px-2 py-3">
        {isSelectable ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelectionChange?.(checked as boolean)
            }
            className="size-4 rounded-md transition-transform hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex size-7.5 items-center justify-center rounded-lg border transition-all duration-300 cursor-pointer hover:scale-110",
                  priorityIconColor,
                  productClasses.beveled,
                )}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <PriorityIcon className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[140px] p-1.5" align="start">
              <Select
                value={task.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="border-transparent bg-transparent h-8 text-right text-xs focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border rounded-lg border">
                  <SelectItem
                    value="low"
                    className="text-xs font-bold"
                  >
                    {tasks.priority.low}
                  </SelectItem>
                  <SelectItem
                    value="medium"
                    className="text-xs font-bold"
                  >
                    {tasks.priority.medium}
                  </SelectItem>
                  <SelectItem
                    value="high"
                    className="text-xs font-bold"
                  >
                    {tasks.priority.high}
                  </SelectItem>
                  <SelectItem
                    value="urgent"
                    className="text-xs font-bold"
                  >
                    {tasks.priority.urgent}
                  </SelectItem>
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Main Content Zone */}
      <div className="flex min-w-0 grow flex-col justify-center px-4 py-3 text-right">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 opacity-40">
            <IconHash className="size-2.5" />
            <span className="font-mono text-[10px] font-bold">
              {digitsEnToFa(displayId)}
            </span>
          </div>

          {showProject && task.project?.name && (
            <div className="text-primary/60 flex items-center gap-1">
              <IconTarget className="size-2.5" />
              <span className="text-[10px] font-bold">
                {task.project.name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-5 items-center justify-center rounded border",
              statusIconColor,
              productClasses.beveled,
            )}
          >
            <StatusIcon className="size-3.5 shrink-0" />
          </div>
          <span className="truncate text-sm font-bold transition-colors group-hover:text-primary">
            {task.title}
          </span>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "rounded-md px-1.5 py-0 text-[10px] font-medium",
                  productClasses.beveled,
                )}
              >
                {/* Convex tags might be IDs if not expanded. Assuming expanded name or just ID for now. */}
                {/* If tags are just IDs, this will show ID. We need tag expansion if we want names. */}
                {/* For now, assuming task.tags is array of strings (names or IDs) */}
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Meta & Assignee Zone */}
      <div className="flex items-center gap-5 px-4 py-3">
        {/* Deadline Indicator */}
        {task.deadline && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hidden flex-col items-end text-right sm:flex cursor-pointer hover:bg-muted/50 rounded p-1"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="flex items-center gap-1 opacity-40">
                  <IconClock className="size-2.5" />
                  <span className="text-[10px] font-bold tracking-wider">
                    {tasks.list.deadline}
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-0.5 text-xs font-bold tabular-nums",
                    !isOverdue && !isDeadlineToday && "opacity-60",
                    isDeadlineToday && "text-amber-600 dark:text-amber-400",
                    isOverdue && "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {digitsEnToFa(formatDateShort(task.deadline))}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <Calendar
                mode="single"
                selected={task.deadline ? new Date(task.deadline) : undefined}
                onSelect={handleDueDateChange}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Assignee */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <TaskAssigneeAvatar
                assignee={assigneeRecord}
                hasAssigneeId={!!task.assigneeUserId}
                size="md"
                className="transition-all duration-300"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-1.5" align="start">
            <Select
              value={task.assigneeUserId || "__unassigned"}
              onValueChange={handleAssigneeChange}
            >
              <SelectTrigger className="border-transparent bg-transparent h-8 text-right text-xs focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border rounded-lg border">
                <SelectItem value="__unassigned" className="text-xs font-bold">
                  {tasks.addTask.unassigned}
                </SelectItem>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      className="text-xs font-bold"
                    >
                      {user.first_name || user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
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
          "absolute inset-y-0 end-0 w-1 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          statusIconColor.replace("text", "bg"),
        )}
      />
    </button>
  );
}

export const TaskListItem = memo(TaskListItemInner);
