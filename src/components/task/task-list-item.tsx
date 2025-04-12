import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TEXT } from "@/constants/text";
import { TasksResponse } from "@/lib/pocketbase-types";
import { cn, getUserInitials } from "@/lib/utils";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/store/task-store";

// Helper to format date like "Apr 11"
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

interface TaskListItemProps {
  task: TasksResponse;
  className?: string;
}

export function TaskListItem({ task, className }: TaskListItemProps) {
  const StatusIcon = taskStatusIcons[task.status];
  const statusIconColor = taskStatusColors[task.status];
  const PriorityIcon = priorityIcons[task.priority];
  const priorityIconColor = priorityColors[task.priority];

  return (
    <div
      className={cn(
        "group flex cursor-grab items-center justify-between px-2 py-1.5 transition-colors duration-200 ease-in-out hover:bg-gray-50 active:cursor-grabbing",
        className,
      )}
    >
      {/* Left side: Icon, ID, Title */}
      <div className="ms-1 flex min-w-0 flex-grow items-center gap-2">
        <PriorityIcon
          className={cn(`size-6 flex-shrink-0`, priorityIconColor)}
        />
        <span className="w-16 flex-shrink-0 font-mono text-xs text-gray-400 transition-colors duration-200 ease-in-out group-hover:text-gray-600">
          {task.display_id}
        </span>
        <StatusIcon className={cn(`size-4 flex-shrink-0`, statusIconColor)} />
        <span className="truncate text-sm text-gray-800" title={task.title}>
          {task.title}
        </span>
      </div>

      {/* Right side: Tags, Date, Assignee */}
      <div className="flex flex-shrink-0 items-center space-x-3">
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="hidden items-center space-x-1 md:flex">
            {task.tags.slice(0, 2).map((tag) => {
              // Limit tags shown
              // Simple color logic for tags
              let tagColor = "bg-gray-100 text-gray-600 border-gray-200";
              if (tag === TEXT.tasks.tags.bug)
                tagColor = "bg-red-100 text-red-700 border-red-200";
              if (tag === TEXT.tasks.tags.feature)
                tagColor = "bg-purple-100 text-purple-700 border-purple-200";
              if (tag === TEXT.tasks.tags.improvement)
                tagColor = "bg-blue-100 text-blue-700 border-blue-200";
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
        <span className="w-[50px] flex-shrink-0 text-right text-xs text-gray-500">
          {formatDateShort(task.deadline ?? "")}
        </span>

        {/* Assignee Avatar */}
        <Avatar className="h-5 w-5">
          <AvatarFallback className="bg-gray-200 text-[10px]">
            {getUserInitials(task.assignee ?? "")}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
