import { isToday } from "date-fns-jalali";
import { memo } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/user-avatar";
import { task as taskLabels } from "@/constants";
import { formatDateShort } from "@/lib/date-utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { UsersResponse } from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusIcons,
  getStatusColorVariant,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { isTaskCompleted, isTaskCanceled } from "@/lib/status-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash, IconTarget, IconClock } from "@tabler/icons-react";

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
        "group bg-card hover:bg-muted/30 relative flex h-auto w-full cursor-pointer items-stretch justify-start border-b p-0 text-right transition-all duration-200 hover:z-10 focus-visible:ring-0",
        isSelected && "bg-primary/5",
        className,
      )}
      onClick={handleClick}
      aria-label={taskLabels.editTask.replace("{title}", task.title)}
    >
      {/* Selection & Priority Zone */}
      <div className="bg-muted/5 flex w-12 shrink-0 flex-col items-center justify-center gap-2 border-s py-3">
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
              "bg-background/50 flex size-8 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110",
              priorityIconColor,
            )}
          >
            <PriorityIcon className="size-4" />
          </div>
        )}
      </div>

      {/* Main Content Zone */}
      <div className="flex min-w-0 grow flex-col justify-center px-4 py-3 text-right">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 opacity-40">
            <IconHash className="size-2.5" />
            <span className="font-mono text-[10px] font-bold">
              {task.display_id}
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

        <div className="mt-1.5 flex items-center gap-3">
          <div
            className={cn(
              "bg-background/50 flex size-5 items-center justify-center rounded border",
              statusIconColor,
            )}
          >
            <StatusIcon className="size-3.5 shrink-0" />
          </div>
          <span className="text-foreground group-hover:text-primary truncate text-base font-bold transition-colors">
            {task.title}
          </span>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-background/50 text-muted-foreground rounded-md px-1.5 py-0 text-[10px] font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Meta & Assignee Zone */}
      <div className="flex items-center gap-6 px-6">
        {/* Deadline Indicator */}
        <div className="hidden flex-col items-end text-right sm:flex">
          <div className="flex items-center gap-1 opacity-40">
            <IconClock className="size-2.5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">
              Deadline
            </span>
          </div>
          <span
            className={cn(
              "mt-0.5 text-xs font-bold tabular-nums",
              !task.deadline && "text-muted-foreground/20",
              task.deadline &&
                !isOverdue &&
                !isDeadlineToday &&
                "text-muted-foreground",
              isDeadlineToday && "text-amber-600 dark:text-amber-400",
              isOverdue && "text-rose-600 dark:text-rose-400",
            )}
          >
            {task.deadline
              ? digitsEnToFa(formatDateShort(task.deadline))
              : "---"}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <UserAvatar
              user={
                assigneeRecord
                  ? {
                      first_name: assigneeRecord.first_name,
                      last_name: assigneeRecord.last_name,
                      username: assigneeRecord.username,
                      avatar: assigneeRecord.avatar,
                      id: assigneeRecord.id,
                      collectionId: assigneeRecord.collectionId,
                      collectionName: assigneeRecord.collectionName,
                    }
                  : undefined
              }
              showUnassigned={!assigneeRecord && !task.assignee}
              className="size-10 rounded-full border-2 shadow-sm transition-all duration-300 group-hover:scale-110"
            />
            {assigneeRecord && (
              <div className="bg-primary border-background absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2" />
            )}
          </div>
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
