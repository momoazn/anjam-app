import { FilterX, ListTodo, Plus } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TaskFilters } from "@/components/task/task-filters";
import { TaskListGroup } from "@/components/task/task-list-group";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";

// Loading skeleton component
const TaskListSkeleton = () => (
  <div className="space-y-4" data-animate-stagger>
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
        <div className="space-y-2 p-2" data-animate-stagger>
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
  const navigate = useNavigate();

  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent
          className="flex flex-col items-center justify-center py-12 text-center"
          data-animate-stagger
        >
          <FilterX className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {fa.tasks.emptyState.noTasksFound}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {fa.tasks.emptyState.noTasksFoundDescription}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent
        className="flex flex-col items-center justify-center py-12 text-center"
        data-animate-stagger
      >
        <div
          className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          data-interactive-pulse
        >
          <Plus className="text-primary h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          {fa.tasks.emptyState.noTasksYet}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {fa.tasks.emptyState.noTasksYetDescription}
        </p>
        <Button className="gap-2" onClick={() => navigate("/tasks/new")}>
          <Plus className="h-4 w-4" />
          {fa.tasks.emptyState.createFirstTask}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function Tasks() {
  const navigate = useNavigate();
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

  // URL params are now handled automatically by useQueryState in the hook

  const groupedTasks = useMemo(() => {
    // Prevent grouping during load state to avoid brief flash of unfiltered/empty groups
    if (isLoadingTasks || !filteredTasks) {
      return {} as Record<TasksStatusOptions, TaskWithProject[]>;
    }
    return filteredTasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
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
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <ListTodo className="h-5 w-5 md:h-6 md:w-6" />
            {fa.tasks.allTasks}
          </h1>
          <p className="text-muted-foreground mt-2">
            {totalTasks > 0
              ? fa.tasks.header.tasksFound.replace(
                  "{count}",
                  totalTasks.toString(),
                )
              : fa.tasks.header.manageTasks}
          </p>
        </div>
        <Button
          className="w-full gap-2 sm:w-auto"
          size="lg"
          onClick={() => navigate("/tasks/new")}
        >
          <Plus className="h-4 w-4" />
          {fa.tasks.addTask.buttons.newTask}
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8" data-animate-stagger>
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
      <div className="space-y-6" data-animate-stagger>
        {isLoadingTasks ? (
          <TaskListSkeleton />
        ) : !filteredTasks || filteredTasks.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          statusOrder?.map((status) => {
            const tasksInGroup = groupedTasks?.[status] ?? [];
            return (
              <TaskListGroup
                key={status}
                taskCount={tasksInGroup.length}
                status={status}
                tasks={tasksInGroup}
                showProject={true}
              />
            );
          })
        )}
      </div>
    </PageTransition>
  );
}
