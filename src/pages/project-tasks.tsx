import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { TaskFilters } from "@/components/task/task-filters";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TaskListSkeleton } from "@/components/task/task-list-skeleton";
import { Button } from "@/components/ui/button";
import { projects, reports, tasks as tasksText } from "@/constants";
import { useProjectTasksPageData } from "@/hooks/use-project-tasks-page-data";
import { useTaskFilters } from "@/hooks/use-task-filters";
import type { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/status-utils";
import { isTaskCanceled, isTaskCompleted } from "@/lib/status-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconLayoutGrid } from "@tabler/icons-react";
import {
  FolderOpen,
  Plus,
  Activity,
  Clock,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ProjectTasks() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
  } = useTaskFilters(tasksData);

  const groupedTasks = useMemo(() => {
    const items = filteredTasks;
    if (isLoadingTasks || !items) {
      return {} as Record<TasksStatusOptions, TaskWithProject[]>;
    }
    return items.reduce(
      (acc, task) => {
        const status = task.status as TasksStatusOptions;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(task);
        return acc;
      },
      {} as Record<TasksStatusOptions, TaskWithProject[]>,
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
        className="hover:bg-primary/5 hover:text-primary border-border/40 bg-muted/20 h-12 gap-3 rounded-none border px-6 font-bold transition-all"
      >
        <IconLayoutGrid className="size-4" />
        <span className="text-[11px] font-black tracking-tight uppercase">
          {tasksText.board.title}
        </span>
      </Button>

      <Button
        className="h-14 gap-3 rounded-none px-8 font-black shadow-md transition-all   hover:shadow-lg active:scale-95 "
        size="lg"
        onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
      >
        <Plus className="size-5" />
        <span className="tracking-tight uppercase">
          {tasksText.addTask.buttons.newTaskForProject}
        </span>
      </Button>
    </div>
  );

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
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

      {/* Stats Bar */}
      <div
        className="bg-border/40 border-border/40 mb-8 grid grid-cols-2 gap-px border sm:grid-cols-4"
        data-animate-stagger
      >
        {[
          {
            label: projects.details.totalTasks,
            value: totalTasks,
            icon: Activity,
            color: "text-primary",
          },
          {
            label: projects.activeTasks,
            value: taskStats.active,
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: projects.details.completedTasks,
            value: taskStats.completed,
            icon: CircleCheck,
            color: "text-emerald-500",
          },
          {
            label: reports.overdue,
            value: taskStats.overdue,
            icon: AlertTriangle,
            color: "text-rose-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card hover:bg-muted/10 p-6 text-right transition-colors"
          >
            <div className="mb-2 flex items-center justify-end gap-3">
              <span className="text-muted-foreground/40 text-[10px] font-black tracking-tight uppercase">
                {stat.label}
              </span>
              <stat.icon className={cn("size-4", stat.color)} />
            </div>
            <div className="text-3xl font-black tracking-tighter">
              {digitsEnToFa(stat.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/5 border-border/40 mb-10 border p-6">
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

      <div className="space-y-10" data-animate-stagger>
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
