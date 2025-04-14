import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { TEXT } from "@/constants/text";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import {
  taskStatusBgColors,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { cn } from "@/lib/utils";
import { getTasksQueryKey } from "@/pb-hooks";
import { AddTaskDialog } from "./add-task-dialog";

interface TaskListHeaderProps {
  taskCount: number;
  status: TasksStatusOptions;
}

export function TaskListHeader({ taskCount, status }: TaskListHeaderProps) {
  const queryClient = useQueryClient();
  const { id: projectId } = useParams<{ id: string }>();

  const IconComponent = taskStatusIcons[status];

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
        <h2 className="me-2 text-sm font-medium text-gray-800">
          {TEXT.tasks.status[status]}
        </h2>
        <span className="text-sm text-gray-400">{taskCount}</span>
      </div>
      <AddTaskDialog
        initialStatus={status}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: getTasksQueryKey(projectId),
          });
        }}
      >
        <Button
          id="add-task-button"
          variant="ghost"
          size="icon"
          className="size-6 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Plus className="size-4" />
        </Button>
      </AddTaskDialog>
    </header>
  );
}
