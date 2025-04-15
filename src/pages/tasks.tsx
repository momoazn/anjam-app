import { TaskFilters } from "@/components/task/task-filters"; // Import the new component
import { TaskListGroup } from "@/components/task/task-list-group";
import { TEXT } from "@/constants/text";
import { useTaskFilters } from "@/hooks/use-task-filters"; // Import the custom hook
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types"; // Added Priority & UsersResponse
import { statusOrder } from "@/lib/tasks-utils";
import { useTasks } from "@/pb-hooks";
import { useMemo } from "react";

export default function Tasks() {
  const { data: userTasks, isPending: isLoadingTasks } = useTasks(
    undefined,
    "project,assignee", // Expand project and assignee
  );

  const {
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedAssignee,
    filteredTasks,
    users,
    isLoadingUsers,
  } = useTaskFilters(userTasks);

  const groupedTasks = useMemo(() => {
    // Prevent grouping during load state to avoid brief flash of unfiltered/empty groups
    if (isLoadingTasks || !filteredTasks) {
      return {} as Record<TasksStatusOptions, TaskWithProject[]>;
    }
    return filteredTasks.reduce(
      (acc, task) => {
        (acc[task.status] = acc[task.status] || []).push(task);
        return acc;
      },
      {} as Record<TasksStatusOptions, TaskWithProject[]>,
    );
  }, [filteredTasks, isLoadingTasks]);

  return (
    <div className="bg-card text-foreground mt-4 flex flex-col space-y-4 pb-8">
      <h1 className="ps-3 text-2xl font-bold">{TEXT.tasks.allTasks}</h1>

      {/* Search and Filter Controls */}
      <TaskFilters
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedPriority={selectedPriority}
        selectedAssignee={selectedAssignee}
        setSearchTerm={setSearchTerm}
        setSelectedStatus={setSelectedStatus}
        setSelectedPriority={setSelectedPriority}
        setSelectedAssignee={setSelectedAssignee}
        users={users}
        isLoadingUsers={isLoadingUsers}
      />

      {/* Task List */}
      {isLoadingTasks && (
        <p className="text-muted-foreground px-3">
          {"در حال بارگذاری تسک‌ها..."}
        </p>
      )}
      {!isLoadingTasks && filteredTasks.length === 0 && (
        <p className="text-muted-foreground px-3">
          {"هیچ تسکی با فیلترهای فعلی مطابقت ندارد."}
        </p>
      )}
      {!isLoadingTasks &&
        filteredTasks.length > 0 &&
        statusOrder?.map((status) => {
          const tasksInGroup = groupedTasks?.[status] ?? [];

          // Only render the group if it contains tasks after filtering
          if (tasksInGroup.length === 0) {
            return null;
          }

          return (
            <TaskListGroup
              key={status}
              taskCount={tasksInGroup.length}
              status={status as TasksStatusOptions}
              tasks={tasksInGroup}
              showProject={true} // Keep showing project for the main tasks page
            />
          );
        })}
    </div>
  );
}
