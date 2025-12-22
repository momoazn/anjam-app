import { TaskEmptyState } from "@/components/task/task-empty-state";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TaskListSkeleton } from "@/components/task/task-list-skeleton";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { TasksStatusOptions } from "@/lib/pocketbase-types";

export type TaskListViewProps = {
  isLoading: boolean;
  totalTasks: number;
  hasActiveFilters: boolean;
  statusOrder: TasksStatusOptions[];
  groupedTasks: Record<TasksStatusOptions, TaskWithProject[]>;
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
      {statusOrder.map((status) => {
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
