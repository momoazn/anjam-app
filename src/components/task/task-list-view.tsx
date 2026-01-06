import { TaskEmptyState } from "@/components/task/task-empty-state";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TaskListSkeleton } from "@/components/task/task-list-skeleton";
import { TaskStatus, TaskWithProject } from "@/types/tasks";
import { useCurrentOrgMode } from "@/store/auth-store";

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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";

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
          if (!isProductMode) return true;
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
