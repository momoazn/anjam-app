import { TaskListGroup } from "@/components/task/list/task-list-group";
import { TaskListSkeleton } from "@/components/task/list/task-list-skeleton";
import { TaskEmptyState } from "@/components/task/task-empty-state";
import { TaskStatus, TaskWithProject } from "@/types/tasks";

export type TaskListViewProps = {
  isLoading: boolean;
  totalTasks: number;
  hasActiveFilters: boolean;
  statusOrder: TaskStatus[];
  groupedTasks: Record<TaskStatus, TaskWithProject[]>;
  selectionMode: boolean;
  selectedTasks: string[];
  onSelectionChange: (taskIds: string[]) => void;
};

export function TaskListView({
  isLoading,
  totalTasks,
  hasActiveFilters,
  statusOrder,
  groupedTasks,
  selectionMode,
  selectedTasks,
  onSelectionChange,
}: TaskListViewProps) {
  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (totalTasks === 0) {
    return <TaskEmptyState hasFilters={hasActiveFilters} />;
  }

  return (
    <>
      {statusOrder
        .filter((status) => {
          return (groupedTasks?.[status] ?? []).length > 0;
        })
        .map((status) => {
          const tasksInGroup = groupedTasks?.[status] ?? [];
          return (
            <TaskListGroup
              key={status}
              taskCount={tasksInGroup.length}
              status={status}
              tasks={tasksInGroup}
              showProject={true}
              enableSelection={selectionMode}
              selectedTasks={selectedTasks}
              onSelectionChange={onSelectionChange}
            />
          );
        })}
    </>
  );
}
