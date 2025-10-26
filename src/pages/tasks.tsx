import { TaskFilters } from "@/components/task/task-filters";
import { TaskListGroup } from "@/components/task/task-list-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TEXT } from "@/constants/text";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";
import { Plus, FilterX } from "lucide-react";
import { useMemo } from "react";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";

// Loading skeleton component
const TaskListSkeleton = () => (
  <div className="space-y-4">
    {statusOrder?.map((status) => (
      <Card key={status} className="overflow-hidden">
        <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-6 rounded" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <div className="space-y-2 p-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md p-2"
            >
              <div className="flex flex-1 items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// Empty state component
const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.tasks.all,
    });
  };

  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FilterX className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {TEXT.tasks.emptyState.noTasksFound}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {TEXT.tasks.emptyState.noTasksFoundDescription}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Plus className="text-primary h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          {TEXT.tasks.emptyState.noTasksYet}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {TEXT.tasks.emptyState.noTasksYetDescription}
        </p>
        <CreateTaskDialog onSuccess={onSuccess}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {TEXT.tasks.emptyState.createFirstTask}
          </Button>
        </CreateTaskDialog>
      </CardContent>
    </Card>
  );
};

export default function Tasks() {
  const {
    tasks: userTasks,
    users,
    isLoadingTasks,
    isLoadingUsers,
  } = useTasksPageData();

  const {
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedDateRange,
    selectedTag,
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedAssignee,
    setSelectedDateRange,
    setSelectedTag,
    filteredTasks,
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

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all" ||
    selectedDateRange !== "all" ||
    selectedTag !== "all"
  );

  const totalTasks = filteredTasks?.length || 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {TEXT.tasks.allTasks}
            </h1>
            <p className="text-muted-foreground mt-1">
              {totalTasks > 0
                ? TEXT.tasks.header.tasksFound.replace(
                    "{count}",
                    totalTasks.toString(),
                  )
                : TEXT.tasks.header.manageTasks}
            </p>
          </div>
          <CreateTaskDialog onSuccess={() => {}}>
            <Button className="gap-2" size="lg">
              <Plus className="h-4 w-4" />
              {TEXT.tasks.addTask.buttons.newTask}
            </Button>
          </CreateTaskDialog>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <TaskFilters
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          selectedPriority={selectedPriority}
          selectedAssignee={selectedAssignee}
          selectedDateRange={selectedDateRange}
          selectedTag={selectedTag}
          setSearchTerm={setSearchTerm}
          setSelectedStatus={setSelectedStatus}
          setSelectedPriority={setSelectedPriority}
          setSelectedAssignee={setSelectedAssignee}
          setSelectedDateRange={setSelectedDateRange}
          setSelectedTag={setSelectedTag}
          users={users}
          isLoadingUsers={isLoadingUsers}
        />
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {isLoadingTasks ? (
          <TaskListSkeleton />
        ) : !filteredTasks || filteredTasks.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
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
                status={status}
                tasks={tasksInGroup}
                showProject={true} // Keep showing project for the main tasks page
              />
            );
          })
        )}
      </div>
    </div>
  );
}
