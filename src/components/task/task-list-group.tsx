import { CircleHelp, Plus } from "lucide-react";

import { TaskListItem } from "@/components/task/task-list-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Task,
  TaskStatus,
  taskStatusBgColors,
  taskStatusColors,
  taskStatusIcons,
} from "@/store/task-store";

interface TaskListGroupProps {
  statusTitle: string;
  taskCount: number;
  status: TaskStatus;
  tasks: Task[];
}

// Map status to icons

export function TaskListGroup({
  statusTitle,
  taskCount,
  status,
  tasks,
}: TaskListGroupProps) {
  const IconComponent = taskStatusIcons[status] || CircleHelp;

  return (
    <section className="">
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
            {statusTitle}
          </h2>
          <span className="text-sm text-gray-400">{taskCount}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </header>
      <div className="mt-2 space-y-1 pe-1">
        {tasks.map((task) => (
          <TaskListItem key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
