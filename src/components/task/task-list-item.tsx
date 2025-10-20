import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TEXT } from "@/constants/text";
import { TaskWithProject } from "@/lib/pocketbase";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { cn } from "@/lib/utils";
import { UsersResponse } from "@/lib/pocketbase-types";
import { UserAvatar } from "../user-avatar";
import { EditTaskDialog } from "./task-details-dialog";

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

interface TaskListItemProps {
  task: TaskWithProject;
  className?: string;
  showProject?: boolean;
  onSuccess?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}

export function TaskListItem({
  task,
  className,
  showProject = false,
  onSuccess,
  isSelectable = false,
  isSelected = false,
  onSelectionChange,
}: TaskListItemProps) {
  const StatusIcon = taskStatusIcons[task.status];
  const statusIconColor = taskStatusColors[task.status];
  const PriorityIcon = priorityIcons[task.priority];
  const priorityIconColor = priorityColors[task.priority];
  const assigneeRecord = task.expand?.assignee as UsersResponse | undefined;

  return (
    <EditTaskDialog task={task} onSuccess={onSuccess}>
      <div
        className={cn(
          "group hover:bg-muted/50 focus-within:ring-ring flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2",
          isSelected && "bg-blue-50 dark:bg-blue-400/10",
          className,
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // Trigger the dialog
            const button = e.currentTarget.querySelector("button");
            button?.click();
          }
        }}
        aria-label={`ویرایش تسک ${task.title}`}
      >
        {/* Left side: Checkbox, Icon, ID, Title */}
        <div className="ms-1 flex min-w-0 flex-grow items-center gap-2">
          {isSelectable && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelectionChange?.(checked as boolean)
              }
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <PriorityIcon
            className={cn(`size-6 flex-shrink-0`, priorityIconColor)}
          />
          <span className="text-muted-foreground group-hover:text-foreground w-16 flex-shrink-0 font-mono text-xs transition-colors duration-200 ease-in-out">
            {task.display_id}
          </span>
          <StatusIcon className={cn(`size-4 flex-shrink-0`, statusIconColor)} />
          <span className="text-foreground truncate text-sm" title={task.title}>
            {task.title}
          </span>
          {showProject && task.expand?.project?.name && (
            <Badge
              variant="outline"
              className="border-border bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-medium"
            >
              {task.expand.project.name}
            </Badge>
          )}
        </div>

        {/* Right side: Tags, Date, Assignee */}
        <div className="flex flex-shrink-0 items-center space-x-3">
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="hidden items-center space-x-1 md:flex">
              {task.tags.slice(0, 2).map((tag) => {
                // Limit tags shown
                // Simple color logic for tags
                let tagColor = "bg-muted text-muted-foreground border-border";
                if (tag === TEXT.tasks.tags.bug)
                  tagColor =
                    "bg-destructive/10 text-destructive border-destructive/20";
                if (tag === TEXT.tasks.tags.feature)
                  tagColor = "bg-primary/10 text-primary border-primary/20";
                if (tag === TEXT.tasks.tags.improvement)
                  tagColor = "bg-accent/10 text-accent border-accent/20";
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${tagColor}`}
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Date */}
          <span className="text-muted-foreground w-[70px] flex-shrink-0 text-right text-xs">
            {formatDateShort(task.deadline)}
          </span>

          {/* Assignee Avatar */}
          <UserAvatar
            user={assigneeRecord}
            username={assigneeRecord ? undefined : (task.assignee ?? undefined)}
          />
        </div>
      </div>
    </EditTaskDialog>
  );
}
