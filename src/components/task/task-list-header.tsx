import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { task, tasks } from "@/constants";
import { getStatusColorVariant, taskStatusIcons } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/tasks";

export type TaskSortMode = "default" | "priority" | "date";

type TaskListHeaderProps = {
  taskCount: number;
  status: TaskStatus;
  sortMode?: TaskSortMode;
  onSortChange?: (mode: TaskSortMode) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  enableSelection?: boolean;
  allSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
};

export function TaskListHeader({
  taskCount,
  status,
  sortMode = "default",
  onSortChange,
  isCollapsed = false,
  onToggleCollapse,
  enableSelection = false,
  allSelected = false,
  onSelectAll,
}: TaskListHeaderProps) {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const IconComponent = taskStatusIcons[status as TaskStatus];
  const statusColor = getStatusColorVariant(status, "icon");

  const handleCreateTask = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/tasks/new`);
    } else {
      navigate("/tasks/new");
    }
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggleCollapse?.();
    }
  };

  return (
    <div className="group flex flex-col">
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flex h-auto w-full items-center justify-between rounded-none px-3 py-2 text-right transition-colors focus-visible:ring-0",
          "hover:bg-muted/30",
        )}
        onClick={onToggleCollapse}
        onKeyDown={handleHeaderKeyDown}
        aria-label={tasks.status[status as keyof typeof tasks.status]}
      >
        <div className="flex min-w-0 items-center gap-3">
          {enableSelection && (
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked: boolean) => onSelectAll?.(!!checked)}
              className="size-4 rounded-md border-2"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          )}

          <div
            className={cn(
              "bg-background flex size-7 items-center justify-center rounded-md border",
              statusColor,
            )}
          >
            <IconComponent className="size-4" />
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {tasks.status[status as keyof typeof tasks.status]}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {digitsEnToFa(taskCount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleCreateTask();
            }}
          >
            <Plus className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2">
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSortChange?.(
                    sortMode === "priority" ? "default" : "priority",
                  );
                }}
                className="gap-3 rounded-lg p-3 font-bold transition-colors"
              >
                {sortMode === "priority" ? (
                  <Check className="text-primary size-4" />
                ) : (
                  <div className="size-4" />
                )}
                {task.sortByPriority}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSortChange?.(sortMode === "date" ? "default" : "date");
                }}
                className="gap-3 rounded-lg p-3 font-bold transition-colors"
              >
                {sortMode === "date" ? (
                  <Check className="text-primary size-4" />
                ) : (
                  <div className="size-4" />
                )}
                {task.sortByDate}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-muted-foreground flex size-8 items-center justify-center rounded-lg">
            {isCollapsed ? (
              <ChevronDown className="size-4 opacity-70" />
            ) : (
              <ChevronUp className="size-4 opacity-70" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
