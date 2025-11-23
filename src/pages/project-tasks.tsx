import { PageTransition } from "@/components/page-transition";
import { TaskFilters } from "@/components/task/task-filters";
import { TaskListGroup } from "@/components/task/task-list-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { useProjectTasksPageData } from "@/hooks/use-project-tasks-page-data";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";
import { isTaskCanceled, isTaskCompleted } from "@/lib/status-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { FilterX, FolderOpen, Plus } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Loading skeleton component for project tasks
const ProjectTaskListSkeleton = () => (
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

// Empty state component for project tasks
const ProjectEmptyState = ({
  hasFilters,
  projectName,
  projectId,
}: {
  hasFilters: boolean;
  projectName: string;
  projectId: string;
}) => {
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
            {fa.tasks.emptyState.noTasksInProject}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {fa.tasks.emptyState.noTasksInProjectDescription.replace(
              "{projectName}",
              projectName,
            )}
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
          {fa.tasks.emptyState.projectNoTasksYet}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {fa.tasks.emptyState.projectNoTasksYetDescription.replace(
            "{projectName}",
            projectName,
          )}
        </p>
        <Button
          className="gap-2"
          onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
        >
          <Plus className="h-4 w-4" />
          {fa.tasks.emptyState.createFirstTask}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function ProjectTasks() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { project, tasks, users, isLoadingTasks, isLoadingUsers } =
    useProjectTasksPageData(projectId as string);

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
  } = useTaskFilters(tasks);

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

  const taskStats = useMemo(() => {
    if (!filteredTasks || filteredTasks.length === 0) {
      return {
        active: 0,
        completed: 0,
        overdue: 0,
      };
    }

    const now = new Date();
    let active = 0;
    let completed = 0;
    let overdue = 0;

    filteredTasks.forEach((task) => {
      if (isTaskCompleted(task)) {
        completed += 1;
        return;
      }

      if (!isTaskCanceled(task)) {
        active += 1;
      }

      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        if (
          deadlineDate < now &&
          !isTaskCompleted(task) &&
          !isTaskCanceled(task)
        ) {
          overdue += 1;
        }
      }
    });

    return { active, completed, overdue };
  }, [filteredTasks]);

  return (
    <PageTransition className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-6" data-animate-stagger>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FolderOpen className="text-muted-foreground h-6 w-6" />
              <h1 className="text-3xl font-bold tracking-tight">
                {project?.name || fa.projects.fallbacks.name}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {totalTasks > 0
                ? fa.tasks.header.tasksInProject.replace(
                    "{count}",
                    totalTasks.toString(),
                  )
                : fa.tasks.header.manageProjectTasks}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="gap-2"
              size="lg"
              onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
            >
              <Plus className="h-4 w-4" />
              {fa.tasks.addTask.buttons.newTaskForProject}
            </Button>
          </div>
        </div>
      </div>

      {/* Project task stats */}
      <div className="mb-6 grid gap-3 text-sm sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {fa.projects.details.totalTasks}
              </span>
              <span className="text-foreground text-xl font-semibold">
                {digitsEnToFa(totalTasks)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {"تسک‌های فعال"}
              </span>
              <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {digitsEnToFa(taskStats.active)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {fa.projects.details.completedTasks}
              </span>
              <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {digitsEnToFa(taskStats.completed)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {fa.reports.overdue}
              </span>
              <span className="text-xl font-semibold text-red-600 dark:text-red-400">
                {digitsEnToFa(taskStats.overdue)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6" data-animate-stagger>
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
      <div className="space-y-4" data-animate-stagger>
        {isLoadingTasks ? (
          <ProjectTaskListSkeleton />
        ) : !filteredTasks || filteredTasks.length === 0 ? (
          <ProjectEmptyState
            hasFilters={hasActiveFilters}
            projectName={project?.name || fa.projects.fallbacks.thisProject}
            projectId={projectId || ""}
          />
        ) : (
          statusOrder?.map((status) => {
            const tasks = groupedTasks?.[status] ?? [];

            return (
              <TaskListGroup
                key={status}
                taskCount={tasks.length}
                status={status as TasksStatusOptions}
                tasks={tasks}
                showProject={false}
              />
            );
          })
        )}
      </div>
    </PageTransition>
  );
}
