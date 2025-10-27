import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fa } from "@/constants/text";
import { queryKeys } from "@/hooks/query-keys";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import {
  taskStatusBgColors,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { cn } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { CreateTaskDialog } from "./create-task-dialog";

interface TaskListHeaderProps {
  taskCount: number;
  status: TasksStatusOptions;
}

export function TaskListHeader({ taskCount, status }: TaskListHeaderProps) {
  const queryClient = useQueryClient();

  const IconComponent = taskStatusIcons[status];

  const onSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.tasks.all,
    });
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between border-t border-b px-4 py-2",
        taskStatusBgColors[status],
      )}
    >
      <div className="flex items-center">
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

      <div className="flex items-center gap-1">
        <CreateTaskDialog initialStatus={status} onSuccess={onSuccess}>
          <Button
            id="add-task-button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 rounded"
            title={fa.task.addNewTask}
          >
            <Plus className="size-4" />
          </Button>
        </CreateTaskDialog>

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
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{fa.task.sortByPriority}</DropdownMenuItem>
            <DropdownMenuItem>{fa.task.sortByDate}</DropdownMenuItem>
            <DropdownMenuItem>{fa.task.showCompletedTasks}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
