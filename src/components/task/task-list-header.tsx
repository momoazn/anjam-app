import { useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TEXT } from "@/constants/text";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import {
  taskStatusBgColors,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/hooks/query-keys";
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
          {TEXT.tasks.status[status]}
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
            title="افزودن تسک جدید"
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
              title="گزینه‌های بیشتر"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>مرتب‌سازی بر اساس اولویت</DropdownMenuItem>
            <DropdownMenuItem>مرتب‌سازی بر اساس تاریخ</DropdownMenuItem>
            <DropdownMenuItem>نمایش تسک‌های تکمیل‌شده</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
