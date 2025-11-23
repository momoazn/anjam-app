import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fa } from "@/constants/text";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import {
  taskStatusBgColors,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export type TaskSortMode = "default" | "priority" | "date";

type TaskListHeaderProps = {
  taskCount: number;
  status: TasksStatusOptions;
  sortMode?: TaskSortMode;
  onSortChange?: (mode: TaskSortMode) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function TaskListHeader({
  taskCount,
  status,
  sortMode = "default",
  onSortChange,
  isCollapsed = false,
  onToggleCollapse,
}: TaskListHeaderProps) {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();

  const IconComponent = taskStatusIcons[status];

  const handleCreateTask = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/tasks/new`);
    } else {
      navigate("/tasks/new");
    }
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2 shadow-sm cursor-pointer hover:bg-background/50 transition-colors",
        taskStatusBgColors[status],
      )}
      onClick={onToggleCollapse}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleCollapse?.();
        }
      }}
    >
      <div className="flex items-center gap-1">
        <div className="bg-background/60 flex items-center justify-center rounded-full p-0.5">
          {isCollapsed ? (
            <ChevronDown className="text-muted-foreground size-3" />
          ) : (
            <ChevronUp className="text-muted-foreground size-3" />
          )}
        </div>
        <IconComponent
          className={cn("me-2 h-3.5 w-3.5", taskStatusColors[status])}
          strokeWidth={status === "todo" ? 1.5 : 2}
        />
        <h2 className="text-foreground me-2 text-sm font-medium">
          {fa.tasks.status[status]}
        </h2>
        <span className="text-muted-foreground text-sm">
          {digitsEnToFa(taskCount)}
        </span>
      </div>

      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          id="add-task-button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 rounded"
          title={fa.task.addNewTask}
          onClick={handleCreateTask}
        >
          <Plus className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 rounded"
              title={fa.task.moreOptions}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onClick={() =>
                onSortChange?.(sortMode === "priority" ? "default" : "priority")
              }
            >
              {sortMode === "priority" && (
                <Check className="text-primary me-1.5 size-3" />
              )}
              {fa.task.sortByPriority}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onSortChange?.(sortMode === "date" ? "default" : "date")
              }
            >
              {sortMode === "date" && (
                <Check className="text-primary me-1.5 size-3" />
              )}
              {fa.task.sortByDate}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              {fa.task.showCompletedTasks}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
