import { TaskEmptyState } from "@/components/task/task-empty-state";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TaskListSkeleton } from "@/components/task/task-list-skeleton";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/tasks";
import { useCurrentOrgMode } from "@/store/auth-store";

// Convex-compatible TaskWithProject interface
interface TaskWithProject extends Omit<Task, "id"> {
  id?: string;
  assignee?: {
    id: string;
    _id: string;
    username: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
  } | null;
  project?: { name: string };
  display_id?: string;
  expand?: {
    project?: { name: string };
    assignee?: {
      id: string;
      _id: string;
      username: string;
      firstName?: string;
      first_name?: string;
      lastName?: string;
      last_name?: string;
    };
  };
}

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
