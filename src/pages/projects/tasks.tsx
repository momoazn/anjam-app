import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconLayoutGrid } from "@tabler/icons-react";
import { FolderOpen, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { TaskFilters } from "@/components/task/task-filters";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TaskListSkeleton } from "@/components/task/task-list-skeleton";
import { Button } from "@/components/ui/button";
import { projects, tasks as tasksText } from "@/constants";
import { useProjectTasksPageData } from "@/hooks/use-project-tasks-page-data";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { statusOrder } from "@/lib/status-utils";
import { isTaskCanceled, isTaskCompleted } from "@/lib/status-utils";
import { useOpenModal } from "@/store/modal-store";
import type { Task } from "@/types/tasks";
import { TaskStatus } from "@/types/tasks";

export default function ProjectTasks() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const openModal = useOpenModal();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    project,
    tasks: tasksData,
    users,
    isLoadingTasks,
    isLoadingUsers,
  } = useProjectTasksPageData(projectId as string);

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
  } = useTaskFilters(tasksData as Task[] | undefined);

  const groupedTasks = useMemo(() => {
    const items = filteredTasks;
    if (isLoadingTasks || !items) {
      return {} as Record<string, Task[]>;
    }
    return items.reduce(
      (acc, task) => {
        const status = task.status as string;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    );
  }, [filteredTasks, isLoadingTasks]);

  const totalTasks = filteredTasks?.length || 0;

  const taskStats = useMemo(() => {
    if (!filteredTasks || filteredTasks.length === 0) {
      return { active: 0, completed: 0, overdue: 0 };
    }

    const now = new Date();
    let active = 0;
    let completed = 0;
    let overdue = 0;

    filteredTasks.forEach((task) => {
      if (isTaskCompleted(task)) {
        completed += 1;
      } else {
        if (!isTaskCanceled(task)) {
          active += 1;
        }
        if (task.deadline) {
          const deadlineDate = new Date(task.deadline);
          if (deadlineDate < now && !isTaskCanceled(task)) {
            overdue += 1;
          }
        }
      }
    });

    return { active, completed, overdue };
  }, [filteredTasks]);

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="lg"
        onClick={() => navigate(`/projects/${projectId}/board`)}
        className="border-border/40 bg-muted/20 hover:bg-primary/5 hover:text-primary gap-2 border font-semibold transition-all h-8 rounded-lg px-3 text-xs"
      >
        <IconLayoutGrid className="size-4" />
        <span className="text-[11px] font-bold tracking-tight">
          {tasksText.board.title}
        </span>
      </Button>

      <Button
        className="gap-2 font-semibold shadow-sm transition-all active:scale-[0.98] h-8 rounded-lg px-3 text-xs"
        size="lg"
        onClick={() => openModal("create-task", { projectId })}
      >
        <Plus className="size-4" />
        <span>{tasksText.addTask.buttons.newTaskForProject}</span>
      </Button>
    </div>
  );

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={project?.name || projects.fallbacks.name}
        description={
          totalTasks > 0
            ? tasksText.header.tasksInProject.replace(
                "{count}",
                digitsEnToFa(totalTasks).toString(),
              )
            : tasksText.header.manageProjectTasks
        }
        icon={FolderOpen}
        actions={headerActions}
      />

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
        <span>
          {projects.details.totalTasks}: {digitsEnToFa(totalTasks)}
        </span>
        <span>
          {projects.activeTasks}: {digitsEnToFa(taskStats.active)}
        </span>
        <span>
          {projects.details.completedTasks}: {digitsEnToFa(taskStats.completed)}
        </span>
        <span>
          {tasksText.filters.overdue}: {digitsEnToFa(taskStats.overdue)}
        </span>
      </div>

      <div className="mb-4">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          {filtersOpen ? "بستن فیلترها" : "فیلترها"}
        </Button>

        {filtersOpen ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
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
        ) : null}
      </div>

      <div className="space-y-4" data-animate-stagger>
        {isLoadingTasks ? (
          <TaskListSkeleton />
        ) : (
          statusOrder?.map((status) => {
            const tasks = groupedTasks?.[status] ?? [];
            if (tasks.length === 0) return null;

            return (
              <TaskListGroup
                key={status}
                taskCount={tasks.length}
                status={status as TaskStatus}
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
