import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Hash,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { task, tasks } from "@/constants";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { getStatusColorVariant, taskStatusIcons } from "@/lib/status-utils";
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
  const statusColor = getStatusColorVariant(status, "icon");

  const handleCreateTask = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/tasks/new`);
    } else {
      navigate("/tasks/new");
    }
  };

  return (
    <div
      className={cn(
        "group bg-muted/20 hover:bg-muted/40 relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border-l-4 px-4 py-3 text-right transition-all",
        getStatusColorVariant(status, "border")
          .replace("border-", "border-l-")
          .replace("/20", ""),
      )}
      onClick={onToggleCollapse}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleCollapse?.();
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className="bg-card ring-border flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ring-1 transition-transform group-hover:scale-110">
          <IconComponent className={cn("size-4", statusColor)} />
        </div>

        <div>
          <h2 className="text-sm font-black tracking-tight uppercase">
            {tasks.status[status]}
          </h2>
          <div className="mt-0.5 flex items-center gap-2">
            <Hash className="text-muted-foreground/50 size-3" />
            <span className="text-muted-foreground/70 text-[10px] font-bold">
              {digitsEnToFa(taskCount)} ITEMS TOTAL
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-background size-8 rounded-lg"
            onClick={handleCreateTask}
          >
            <Plus className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background size-8 rounded-lg"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={() =>
                  onSortChange?.(
                    sortMode === "priority" ? "default" : "priority",
                  )
                }
                className="gap-2"
              >
                {sortMode === "priority" ? (
                  <Check className="text-primary size-4" />
                ) : (
                  <div className="size-4" />
                )}
                <span className="font-bold">{task.sortByPriority}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onSortChange?.(sortMode === "date" ? "default" : "date")
                }
                className="gap-2"
              >
                {sortMode === "date" ? (
                  <Check className="text-primary size-4" />
                ) : (
                  <div className="size-4" />
                )}
                <span className="font-bold">{task.sortByDate}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="group-hover:bg-background flex size-8 items-center justify-center rounded-lg transition-transform duration-300">
          {isCollapsed ? (
            <ChevronDown className="text-muted-foreground size-4" />
          ) : (
            <ChevronUp className="text-muted-foreground size-4" />
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 h-px w-full opacity-10",
          statusColor.replace("text", "bg"),
        )}
      />
    </div>
  );
}
