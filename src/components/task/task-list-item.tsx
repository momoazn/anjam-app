import { isToday } from "date-fns-jalali";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/user-avatar";
import { fa } from "@/constants/text";
import { formatDateShort } from "@/lib/date-utils";
import { TaskWithProject } from "@/lib/pocketbase";
import { UsersResponse } from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { isTaskCompleted, isTaskCanceled } from "@/lib/status-utils";

type TaskListItemProps = {
  task: TaskWithProject;
  className?: string;
  showProject?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
};

export function TaskListItem({
  task,
  className,
  showProject = false,
  isSelectable = false,
  isSelected = false,
  onSelectionChange,
}: TaskListItemProps) {
  const navigate = useNavigate();

  const StatusIcon = taskStatusIcons[task.status];
  const statusIconColor = taskStatusColors[task.status];

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
    <div
      className={cn(
        "group hover:bg-muted/30 focus-within:ring-ring border-border/50 flex cursor-pointer items-center justify-between border-b px-3 py-2 text-sm transition-colors duration-150 ease-in-out focus-within:ring-1 focus-within:ring-offset-0",
        isSelected && "bg-blue-50/50 dark:bg-blue-400/5",
        className,
      )}
      data-interactive-item
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={fa.task.editTask.replace("{title}", task.title)}
    >
      {/* Left side: Checkbox, Icon, ID, Title (fixed layout) */}
      <div className="flex min-w-0 grow items-center gap-1">
        {isSelectable && (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelectionChange?.(checked as boolean)
              }
              className="shrink-0 transition-transform hover:scale-110"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <PriorityIcon className={cn(`h-4 w-4 shrink-0`, priorityIconColor)} />
        <span className="text-muted-foreground group-hover:text-foreground w-16 shrink-0 text-center font-mono text-xs transition-all duration-200 ease-in-out">
          {task.display_id}
        </span>
        <StatusIcon className={cn(`h-3.5 w-3.5 shrink-0`, statusIconColor)} />
        <span
          className="text-foreground truncate text-[13px] leading-snug font-medium transition-colors duration-200"
          title={task.title}
        >
          {task.title}
        </span>
        {showProject && task.expand?.project?.name && (
          <Badge
            variant="outline"
            className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-200"
          >
            {task.expand.project.name}
          </Badge>
        )}
      </div>

      {/* Right side: Tags, Date, Assignee */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="hidden items-center gap-1 md:flex">
            {task.tags.slice(0, 2).map((tag) => {
              // Limit tags shown
              // Simple color logic for tags
              let tagColor = "bg-muted text-muted-foreground border-border";
              if (tag === fa.tasks.tags.bug)
                tagColor =
                  "bg-destructive/10 text-destructive border-destructive/20";
              if (tag === fa.tasks.tags.feature)
                tagColor = "bg-primary/10 text-primary border-primary/20";
              if (tag === fa.tasks.tags.improvement)
                tagColor = "bg-accent/10 text-accent border-accent/20";
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-200 hover:scale-105 ${tagColor}`}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Date */}
        <div className="flex w-[70px] shrink-0 items-end">
          <span
            className={cn(
              "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium",
              !task.deadline &&
                "border-muted-foreground/15 text-muted-foreground/80",
              task.deadline &&
                !isOverdue &&
                !isDeadlineToday &&
                "border-muted-foreground/20 text-muted-foreground/80",
              isDeadlineToday &&
                "border-amber-500/20 bg-amber-500/3 text-amber-600/70 dark:border-amber-400/20 dark:bg-amber-400/3 dark:text-amber-300/70",
              isOverdue &&
                "border-destructive/20 bg-destructive/3 text-destructive/70 dark:border-destructive/20 dark:bg-destructive/5 dark:text-destructive/70",
            )}
          >
            {formatDateShort(task.deadline)}
          </span>
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1.5">
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
            username={
              !assigneeRecord && task.assignee ? task.assignee : undefined
            }
            showUnassigned={!assigneeRecord && !task.assignee}
            className="h-7 w-7"
          />
        </div>
      </div>
    </div>
  );
}
