import { lazy } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TaskStatus,
  taskStatusBgColors,
  taskStatusColors,
  taskStatusIcons,
} from "@/store/task-store";
import { Button } from "../ui/button";
import { TEXT } from "@/constants/text";

const AddTaskDialog = lazy(() =>
  import("./add-task-dialog").then((module) => ({
    default: module.AddTaskDialog,
  })),
);

interface TaskListHeaderProps {
  taskCount: number;
  status: TaskStatus;
}

export function TaskListHeader({ taskCount, status }: TaskListHeaderProps) {
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
          className={cn("mr-2 h-3.5 w-3.5", taskStatusColors[status])}
          strokeWidth={status === "todo" ? 1.5 : 2}
        />
        <h2 className="mr-2 text-sm font-medium text-gray-800">
          {TEXT.tasks.status[status]}
        </h2>
        <span className="text-sm text-gray-400">{taskCount}</span>
      </div>
      <AddTaskDialog>
        <Button
          id="add-task-button"
          variant="ghost"
          size="icon"
          className="size-6 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </AddTaskDialog>
    </header>
  );
}
