import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash } from "@tabler/icons-react";
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
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { getStatusColorVariant, taskStatusIcons } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

export type TaskSortMode = "default" | "priority" | "date";

type TaskListHeaderProps = {
  taskCount: number;
  status: TasksStatusOptions;
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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";

  const IconComponent = taskStatusIcons[status];
  const statusColor = getStatusColorVariant(status, "icon");

  const handleCreateTask = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/tasks/new`);
    } else {
      navigate("/tasks/new");
    }
  };

  if (isProductMode) {
    return (
      <div className="group flex flex-col">
        <Button
          variant="ghost"
          className={cn(
            "flex h-auto w-full items-center justify-between rounded-none px-3 py-2 text-right transition-colors focus-visible:ring-0",
            "hover:bg-muted/30",
          )}
          onClick={onToggleCollapse}
        >
          <div className="flex min-w-0 items-center gap-3">
            {enableSelection && (
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                className="size-4 rounded-md border-2"
                onClick={(e) => e.stopPropagation()}
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
                {tasks.status[status]}
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
              onClick={(e) => {
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-2">
                <DropdownMenuItem
                  onClick={(e) => {
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
                  onClick={(e) => {
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
        </Button>
      </div>
    );
  }

  return (
    <div className="group relative mb-2 flex flex-col">
      <Button
        variant="ghost"
        className={cn(
          "bg-muted/30 hover:bg-muted/50 relative flex h-auto w-full cursor-pointer items-center justify-between rounded-t-xl border px-6 py-4 text-right transition-all focus-visible:ring-0",
          isCollapsed && "rounded-xl",
        )}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-6">
          {enableSelection && (
            <div className="flex items-center">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                className="size-5 rounded-md border-2"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div
            className={cn(
              "bg-background flex size-12 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 group-hover:scale-105",
              statusColor,
            )}
          >
            <IconComponent className="size-6" />
          </div>

          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-2 opacity-40">
              <IconHash className="size-3" />
              <span className="text-[10px] font-bold tracking-tight">
                {tasks.filters.status}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {tasks.status[status]}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold tracking-tight opacity-40">
              {tasks.list.count}
            </span>
            <span className="text-lg font-bold tabular-nums">
              {digitsEnToFa(taskCount)}
            </span>
          </div>

          <div className="bg-border mx-2 h-10 w-px" />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-background size-10 rounded-lg transition-all active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateTask();
              }}
            >
              <Plus className="size-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background size-10 rounded-lg transition-all active:scale-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-2">
                <DropdownMenuItem
                  onClick={(e) => {
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
                  onClick={(e) => {
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

            <div className="bg-background flex size-10 items-center justify-center rounded-lg border transition-all">
              {isCollapsed ? (
                <ChevronDown className="size-5 opacity-40" />
              ) : (
                <ChevronUp className="size-5 opacity-40" />
              )}
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
}
