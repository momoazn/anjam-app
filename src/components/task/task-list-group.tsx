import { memo, useMemo, useState } from "react";

import { tasks as tasksText } from "@/constants";
import { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { TaskListHeader, type TaskSortMode } from "./task-list-header";
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

function TaskListGroupInner({
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
  const [sortMode, setSortMode] = useState<TaskSortMode>("default");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    const newSelected = selected
      ? [...localSelectedTasks, taskId]
      : localSelectedTasks.filter((id) => id !== taskId);

    setLocalSelectedTasks(newSelected);
    onSelectionChange?.(newSelected);
  };

  const sortedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const cloned = [...tasks];

    if (sortMode === "priority") {
      const priorityRank: Record<TasksPriorityOptions, number> = {
        low: 0,
        medium: 1,
        high: 2,
        urgent: 3,
      };
      cloned.sort(
        (a, b) => priorityRank[b.priority] - priorityRank[a.priority],
      );
    } else if (sortMode === "date") {
      cloned.sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aTime - bTime;
      });
    }

    return cloned;
  }, [tasks, sortMode]);

  return (
    <section className="transition-colors duration-200" data-animate-stagger>
      <TaskListHeader
        taskCount={taskCount}
        status={status}
        sortMode={sortMode}
        onSortChange={setSortMode}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />
      {!isCollapsed && (
        <ul
          className={cn(
            "bg-muted/5 border-border/20 mt-1 min-h-[30px] space-y-0 border-x border-b shadow-sm",
          )}
          data-animate-stagger
        >
          {sortedTasks?.length > 0 ? (
            sortedTasks.map((task) => (
              <li key={task.id}>
                <TaskListItem
                  task={task}
                  showProject={showProject}
                  isSelectable={enableSelection}
                  isSelected={localSelectedTasks.includes(task.id)}
                  onSelectionChange={(selected) =>
                    handleTaskSelection(task.id, selected)
                  }
                />
              </li>
            ))
          ) : (
            <div className="text-muted-foreground/40 py-12 text-center text-[10px] font-black tracking-[0.3em] uppercase">
              {tasksText.list.noTasks}
            </div>
          )}
        </ul>
      )}
    </section>
  );
}

export const TaskListGroup = memo(TaskListGroupInner);
