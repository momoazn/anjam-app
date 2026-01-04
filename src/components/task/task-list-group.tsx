import { memo, useMemo, useState } from "react";

import { tasks as tasksText } from "@/constants";
import { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const [sortMode, setSortMode] = useState<TaskSortMode>("default");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    const newSelected = selected
      ? [...selectedTasks, taskId]
      : selectedTasks.filter((id) => id !== taskId);

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

  const handleSelectAll = (selected: boolean) => {
    const taskIds = tasks.map((t) => t.id);
    const otherSelected = selectedTasks.filter((id) => !taskIds.includes(id));
    const newSelected = selected
      ? [...otherSelected, ...taskIds]
      : otherSelected;
    onSelectionChange?.(newSelected);
  };

  const allSelected = useMemo(() => {
    if (tasks.length === 0) return false;
    return tasks.every((t) => selectedTasks.includes(t.id));
  }, [tasks, selectedTasks]);

  return (
    <section
      className={cn(
        "transition-colors duration-200",
        isProductMode &&
          "overflow-hidden rounded-xl border border-border/40 bg-background/30",
      )}
      data-animate-stagger
    >
      <TaskListHeader
        taskCount={taskCount}
        status={status}
        sortMode={sortMode}
        onSortChange={setSortMode}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        enableSelection={enableSelection}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
      />
      {!isCollapsed && (
        <div
          className={cn(
            !isProductMode &&
              "bg-card/50 overflow-hidden rounded-b-xl border border-t-0",
          )}
        >
          <ul
            className={cn(
              "divide-y",
              isProductMode ? "divide-border/40" : "divide-border",
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
                    isSelected={selectedTasks.includes(task.id)}
                    onSelectionChange={(selected) =>
                      handleTaskSelection(task.id, selected)
                    }
                  />
                </li>
              ))
            ) : (
              <div
                className={cn("py-16 text-center", isProductMode && "py-10")}
              >
                <span className="text-muted-foreground text-xs font-medium">
                  {tasksText.list.noTasks}
                </span>
              </div>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}

export const TaskListGroup = memo(TaskListGroupInner);
