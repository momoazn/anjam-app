import { useState } from "react";

import { fa } from "@/constants/text";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { TaskListHeader } from "./task-list-header";
import { TaskListItem } from "./task-list-item";

type TaskListGroupProps = {
  taskCount: number;
  status: TasksStatusOptions;
  tasks: TaskWithProject[];
  showProject?: boolean;
  enableSelection?: boolean;
  selectedTasks?: string[];
  onSelectionChange?: (taskIds: string[]) => void;
};

export function TaskListGroup({
  taskCount,
  status,
  tasks,
  showProject = false,
  enableSelection = false,
  selectedTasks = [],
  onSelectionChange,
}: TaskListGroupProps) {
  const [localSelectedTasks, setLocalSelectedTasks] =
    useState<string[]>(selectedTasks);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    const newSelected = selected
      ? [...localSelectedTasks, taskId]
      : localSelectedTasks.filter((id) => id !== taskId);

    setLocalSelectedTasks(newSelected);
    onSelectionChange?.(newSelected);
  };

  return (
    <section className="transition-colors duration-200">
      <TaskListHeader taskCount={taskCount} status={status} />
      <div
        className={cn("mt-2 min-h-[30px] space-y-1 rounded-md pe-1")}
        role="list"
      >
        {tasks?.length > 0 ? (
          tasks?.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              showProject={showProject}
              isSelectable={enableSelection}
              isSelected={localSelectedTasks.includes(task.id)}
              onSelectionChange={(selected) =>
                handleTaskSelection(task.id, selected)
              }
            />
          ))
        ) : (
          <div className="text-muted-foreground text-center text-sm">
            {fa.tasks.list.noTasks}
          </div>
        )}
      </div>
    </section>
  );
}
