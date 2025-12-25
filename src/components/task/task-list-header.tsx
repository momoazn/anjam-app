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
        "group bg-muted/20 hover:bg-muted/30 border-y-border/50 relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-none border-y border-s-2 px-4 py-3 text-right transition-all",
        getStatusColorVariant(status, "border")
          .replace("border-", "border-s-")
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
        <div
          className={cn(
            "bg-card ring-border/50 flex h-8 w-8 items-center justify-center rounded-none border shadow-sm ring-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
            statusColor.replace("text", "ring"),
          )}
        >
          <IconComponent
            className={cn(
              "size-4 transition-transform duration-500 group-hover:rotate-180",
              statusColor,
            )}
          />
        </div>

        <div>
          <h2 className="text-sm font-black tracking-tight uppercase">
            {tasks.status[status]}
          </h2>
          <div className="mt-0.5 flex items-center gap-2">
            <Hash className="text-muted-foreground/30 size-2.5" />
            <span className="text-muted-foreground/70 text-[9px] font-black tracking-tight uppercase">
              {digitsEnToFa(taskCount)} ITEMS TOTAL
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="border-border/30 flex items-center gap-1 border-e pe-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-background size-8 rounded-none transition-transform active:scale-95"
            onClick={handleCreateTask}
          >
            <Plus className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background size-8 rounded-none transition-transform active:scale-95"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-border/50 rounded-none"
            >
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

        <div className="hover:bg-background border-border/30 flex size-8 items-center justify-center rounded-none border transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
          {isCollapsed ? (
            <ChevronDown className="text-muted-foreground size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          ) : (
            <ChevronUp className="text-muted-foreground size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute start-0 bottom-0 h-px w-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 transition-all duration-300 group-hover:w-full",
          statusColor.replace("text", "text"),
        )}
      />
    </div>
  );
}
