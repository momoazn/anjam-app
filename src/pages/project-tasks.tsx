import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { TaskFilters } from "@/components/task/task-filters";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TEXT } from "@/constants/text";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { useProjectTasksPageData } from "@/hooks/use-project-tasks-page-data";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";

export default function ProjectTasks() {
  const { id: projectId } = useParams<{ id: string }>();

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

  return (
    <div className="text-foreground mt-4 flex flex-col space-y-4 pb-8">
      <h1 className="ps-3 text-2xl font-bold">
        {`${TEXT.projects.project} ${project?.name}`}
      </h1>

      {/* Search and Filter Controls */}
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

      {statusOrder?.map((status) => {
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
      })}
    </div>
  );
}
