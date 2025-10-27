import { useState } from "react";

import { TEXT } from "@/constants/text";
import { useUpdateTask } from "@/hooks/tasks";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { TaskListHeader } from "./task-list-header";
import { TaskListItem } from "./task-list-item";

interface TaskListGroupProps {
  taskCount: number;
  status: TasksStatusOptions;
  tasks: TaskWithProject[];
  showProject?: boolean;
  enableSelection?: boolean;
  selectedTasks?: string[];
  onSelectionChange?: (taskIds: string[]) => void;
}

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
  const [isDragOver, setIsDragOver] = useState(false);
  const { mutate: updateTask } = useUpdateTask();

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
        className={cn(
          "mt-2 min-h-[30px] space-y-1 rounded-md pe-1",
          isDragOver && "ring-primary/40 ring-2 ring-offset-2",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsDragOver(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          try {
            const data = e.dataTransfer.getData("application/json");
            const parsed = JSON.parse(data) as {
              taskId?: string;
              fromStatus?: TasksStatusOptions;
            };
            if (!parsed?.taskId) return;
            if (parsed.fromStatus === status) return;
            updateTask({ id: parsed.taskId, updates: { status } });
          } catch {
            // ignore malformed payloads
          }
        }}
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
            {TEXT.tasks.list.noTasks}
          </div>
        )}
      </div>
    </section>
  );
}
