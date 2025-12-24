import { isToday } from "date-fns-jalali";
import { memo } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
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
    deadlineDate.getTime() < Date.now() &&
    !isTaskCompleted(task) &&
    !isTaskCanceled(task);

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <button
      type="button"
      className={cn(
        "group border-border/40 bg-card hover:bg-muted/30 relative flex w-full cursor-pointer items-stretch border-b text-right transition-all duration-300 hover:z-10",
        isSelected && "bg-primary/5",
        className,
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={taskLabels.editTask.replace("{title}", task.title)}
    >
      {/* Selection & Priority Zone */}
      <div className="border-border/30 bg-muted/10 flex w-14 shrink-0 flex-col items-center justify-center gap-2 border-l py-3 text-right">
        {isSelectable ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelectionChange?.(checked as boolean)
            }
            className="size-4 rounded-none transition-transform hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-none transition-transform duration-300 group-hover:scale-110",
              priorityColors[task.priority]
                .replace("text", "bg-")
                .replace("600", "500/10")
                .replace("400", "400/10"),
            )}
          >
            <PriorityIcon className={cn("size-4.5", priorityIconColor)} />
          </div>
        )}
        <div className="flex h-1 flex-col gap-px opacity-20">
          <div className="bg-foreground h-full w-4" />
        </div>
      </div>

      {/* Main Content Zone */}
      <div className="flex min-w-0 grow flex-col justify-center px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground/50 text-[10px] font-black tracking-widest uppercase">
            {task.display_id}
          </span>
          <div className="bg-border/50 h-px w-4" />
          {showProject && task.expand?.project?.name && (
            <span className="text-primary/70 text-[10px] font-black tracking-tight uppercase">
              {task.expand.project.name}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3">
          <StatusIcon className={cn("size-4 shrink-0", statusIconColor)} />
          <span className="text-foreground group-hover:text-primary truncate text-base font-bold tracking-tight transition-colors">
            {task.title}
          </span>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-right">
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-border/50 bg-muted/50 text-muted-foreground rounded-none px-1.5 py-0 text-[9px] font-black tracking-wider uppercase"
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
          <span className="text-muted-foreground/40 text-[9px] font-black tracking-widest uppercase">
            Deadline
          </span>
          <span
            className={cn(
              "mt-0.5 text-xs font-black tracking-tighter",
              !task.deadline && "text-muted-foreground/30",
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
              className="border-background size-10 rounded-sm border-2 shadow-sm transition-transform duration-300 group-hover:scale-110"
            />
            {assigneeRecord && (
              <div className="border-background absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border-2 bg-emerald-500">
                <div className="size-1 rounded-full bg-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Indicator Bar */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-1 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          statusIconColor.replace("text", "bg"),
        )}
      />
    </button>
  );
}

export const TaskListItem = memo(TaskListItemInner);
