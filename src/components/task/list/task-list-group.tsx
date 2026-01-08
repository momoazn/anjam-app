import { memo, useMemo, useState } from "react";

import { tasks as tasksText } from "@/constants";
import { TaskPriority, TaskStatus, TaskWithProject } from "@/types/tasks";

import { TaskListHeader, type TaskSortMode } from "./task-list-header";
import { TaskListItem } from "./task-list-item";

type TaskListGroupProps = {
  taskCount: number;
  status: TaskStatus;
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
      const priorityRank: Record<TaskPriority, number> = {
        low: 0,
        medium: 1,
        high: 2,
        urgent: 3,
      };
      cloned.sort((a, b) => {
        const aRank = priorityRank[a.priority as TaskPriority] ?? 0;
        const bRank = priorityRank[b.priority as TaskPriority] ?? 0;
        return bRank - aRank;
      });
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
    const taskIds = tasks.map((t) => t._id as string);
    const otherSelected = selectedTasks.filter((id) => !taskIds.includes(id));
    const newSelected = selected
      ? [...otherSelected, ...taskIds]
      : otherSelected;
    onSelectionChange?.(newSelected);
  };

  const allSelected = useMemo(() => {
    if (tasks.length === 0) return false;
    return tasks.every((t) => selectedTasks.includes(t._id as string));
  }, [tasks, selectedTasks]);

  return (
    <section
      className="overflow-hidden rounded-xl border border-border/40 bg-background/30 transition-colors duration-200"
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
        <div>
          <ul className="divide-y divide-border/40" data-animate-stagger>
            {sortedTasks?.length > 0 ? (
              sortedTasks.map((task) => {
                const taskId = task._id as string;
                return (
                  <li key={taskId}>
                    <TaskListItem
                      task={task}
                      showProject={showProject}
                      isSelectable={enableSelection}
                      isSelected={selectedTasks.includes(taskId)}
                      onSelectionChange={(selected) =>
                        handleTaskSelection(taskId, selected)
                      }
                    />
                  </li>
                );
              })
            ) : (
              <div className="py-10 text-center">
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
