import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconClock, IconHash, IconTarget } from "@tabler/icons-react";
import { isToday } from "date-fns-jalali";
import { memo } from "react";
import { useNavigate } from "react-router-dom";

import { TaskAssigneeAvatar } from "@/components/task/task-assignee-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { task as taskLabels, tasks } from "@/constants";
import { useProductClasses } from "@/hooks/use-product-theme";
import { formatDateShort } from "@/lib/date-utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { UsersResponse } from "@/lib/pocketbase-types";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import { isTaskCanceled, isTaskCompleted } from "@/lib/status-utils";
import { cn } from "@/lib/utils";

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

  const StatusIcon = taskStatusIcons[task.status];
  const statusIconColor = getStatusColorVariant(task.status, "icon");

  const PriorityIcon = priorityIcons[task.priority];
  const priorityIconColor = priorityColors[task.priority];
  const assigneeRecord = task.expand?.assignee as UsersResponse | undefined;

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isDeadlineToday = deadlineDate ? isToday(deadlineDate) : false;
  const isOverdue =
    deadlineDate &&
    // eslint-disable-next-line react-hooks/purity
    deadlineDate.getTime() < Date.now() &&
    !isTaskCompleted(task) &&
    !isTaskCanceled(task);

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "group relative flex h-auto w-full cursor-pointer items-stretch justify-start border-b border-border/40 bg-transparent p-0 text-right transition-all duration-200 hover:z-10 focus-visible:ring-0",
        productClasses.transition,
        productClasses.kbdFocus,
        "hover:bg-muted/30",
        isSelected && (productClasses.selected || "bg-primary/5"),
        className,
      )}
      onClick={handleClick}
      aria-label={taskLabels.editTask.replace("{title}", task.title)}
    >
      {/* Selection & Priority Zone */}
      <div className="flex w-11 shrink-0 flex-col items-center justify-center gap-2 border-e py-2.5">
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
          <div
            className={cn(
              "flex size-7.5 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110",
              priorityIconColor,
              // Linear beveled edge for product mode
              productClasses.beveled,
            )}
          >
            <PriorityIcon className="size-4" />
          </div>
        )}
      </div>

      {/* Main Content Zone */}
      <div className="flex min-w-0 grow flex-col justify-center px-4 py-2.5 text-right">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 opacity-40">
            <IconHash className="size-2.5" />
            <span className="font-mono text-[10px] font-bold">
              {digitsEnToFa(task.display_id)}
            </span>
          </div>

          {showProject && task.expand?.project?.name && (
            <div className="text-primary/60 flex items-center gap-1">
              <IconTarget className="size-2.5" />
              <span className="text-[10px] font-bold">
                {task.expand.project.name}
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
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Meta & Assignee Zone */}
      <div className="flex items-center gap-5 px-5">
        {/* Deadline Indicator */}
        <div className="hidden flex-col items-end text-right sm:flex">
          <div className="flex items-center gap-1 opacity-40">
            <IconClock className="size-2.5" />
            <span className="text-[10px] font-bold tracking-wider">
              {tasks.list.deadline}
            </span>
          </div>
          <span
            className={cn(
              "mt-0.5 text-xs font-bold tabular-nums",
              !task.deadline && "opacity-20",
              task.deadline && !isOverdue && !isDeadlineToday && "opacity-60",
              isDeadlineToday && "text-amber-600 dark:text-amber-400",
              isOverdue && "text-rose-600 dark:text-rose-400",
            )}
          >
            {task.deadline
              ? digitsEnToFa(formatDateShort(task.deadline))
              : digitsEnToFa("---")}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex flex-col items-center">
          <TaskAssigneeAvatar
            assignee={assigneeRecord}
            hasAssigneeId={!!task.assignee}
            size="md"
            className="transition-all duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Active Indicator Bar */}
      <div
        className={cn(
          "absolute inset-y-0 end-0 w-1 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          statusIconColor.replace("text", "bg"),
        )}
      />
    </Button>
  );
}

export const TaskListItem = memo(TaskListItemInner);
