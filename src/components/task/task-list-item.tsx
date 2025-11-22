import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { fa } from "@/constants/text";
import { TaskWithProject } from "@/lib/pocketbase";
import { UsersResponse } from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { cn } from "@/lib/utils";
import { minutesToHoursAndMinutes } from "@/lib/time-utils";

const formatDateShort = (dateString?: string | null) => {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "dd MMMM"));
};

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

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 focus-within:ring-ring flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-all duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 hover:scale-[1.01] hover:shadow-sm active:scale-[0.99]",
        isSelected &&
          "border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-400/10",
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
      {/* Left side: Checkbox, Icon, ID, Title */}
      <div className="flex min-w-0 grow items-center gap-2">
        {isSelectable && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelectionChange?.(checked as boolean)
            }
            className="shrink-0 transition-transform hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <PriorityIcon
          className={cn(
            `size-5 shrink-0 transition-transform group-hover:scale-110`,
            priorityIconColor,
          )}
        />
        <span className="text-muted-foreground group-hover:text-foreground w-16 shrink-0 font-mono text-xs transition-all duration-200 ease-in-out">
          {task.display_id}
        </span>
        <StatusIcon
          className={cn(
            `size-4 shrink-0 transition-transform group-hover:scale-110`,
            statusIconColor,
          )}
        />
        <span
          className="text-foreground truncate text-sm font-medium transition-colors duration-200"
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
                  className={`rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-200 hover:scale-105 ${tagColor}`}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Date and Time */}
        <div className="flex flex-col items-end gap-1 w-[70px] shrink-0">
          <span className="text-muted-foreground group-hover:text-foreground text-right text-xs transition-colors duration-200">
            {formatDateShort(task.deadline)}
          </span>
          {(task.estimated_hours || task.estimated_minutes || task.time_spent_minutes) && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {task.time_spent_minutes ? minutesToHoursAndMinutes(task.time_spent_minutes).hours + 'h' + minutesToHoursAndMinutes(task.time_spent_minutes).minutes + 'm' : ''}
                {(task.time_spent_minutes && (task.estimated_hours || task.estimated_minutes)) ? '/' : ''}
                {(task.estimated_hours || task.estimated_minutes) ? (task.estimated_hours || 0) + 'h' + (task.estimated_minutes || 0) + 'm' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Assignee Name */}
        <div className="text-xs">
          {assigneeRecord ? (
            assigneeRecord.first_name || assigneeRecord.last_name ? (
              <span>
                {assigneeRecord.first_name} {assigneeRecord.last_name} -{" "}
                {assigneeRecord.username}
              </span>
            ) : (
              <span>{assigneeRecord.username}</span>
            )
          ) : task.assignee ? (
            <span className="text-muted-foreground">{task.assignee}</span>
          ) : (
            <span className="text-muted-foreground">
              {fa.tasks.addTask.unassigned}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
