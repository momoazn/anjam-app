import { useParams } from "react-router-dom";

import { TaskListGroup } from "@/components/task/task-list-group";
import { TEXT } from "@/constants/text";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";
import { useProject, useTasks } from "@/pb-hooks";
import { useMemo } from "react";

export default function ProjectTasks() {
  const { id: projectId } = useParams<{ id: string }>();

  const { data: project } = useProject(projectId as string);
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(projectId, true);

  const groupedTasks = useMemo(() => {
    return isLoadingTasks
      ? ([] as unknown as Record<TasksStatusOptions, TaskWithProject[]>)
      : tasks?.reduce(
          (acc, task) => {
            (acc[task.status] = acc[task.status] || []).push(task);
            return acc;
          },
          {} as Record<TasksStatusOptions, TaskWithProject[]>,
        );
  }, [tasks, isLoadingTasks]);

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900">
      <h1 className="ps-3 text-2xl font-bold">
        {`${TEXT.projects.project} ${project?.name}`}
      </h1>
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
