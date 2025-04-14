import { useParams } from "react-router-dom";

import { useProject, useTasks } from "@/pb-hooks";
import { TasksResponse } from "@/lib/pocketbase-types";
import { statusOrder } from "@/store/task-store";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { useMemo } from "react";
import { TEXT } from "@/constants/text";

export default function ProjectTasks() {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(projectId);
  const { data: project } = useProject(projectId as string);

  console.log("##### rendering project tasks #####");

  const groupedTasks = useMemo(() => {
    return isLoadingTasks
      ? ([] as unknown as Record<TasksStatusOptions, TasksResponse[]>)
      : tasks?.reduce(
          (acc, task) => {
            (acc[task.status] = acc[task.status] || []).push(task);
            return acc;
          },
          {} as Record<TasksStatusOptions, TasksResponse[]>,
        );
  }, [tasks, isLoadingTasks]);

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900">
      <h1 className="ps-3 text-2xl font-bold">
        {`${TEXT.projects.projectTasks} ${project?.name}`}
      </h1>
      {statusOrder?.map((status) => {
        const tasks = groupedTasks?.[status] ?? [];

        return (
          <TaskListGroup
            key={status}
            taskCount={tasks.length}
            status={status as TasksStatusOptions}
            tasks={tasks}
          />
        );
      })}
    </div>
  );
}
