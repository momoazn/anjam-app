import { useMemo } from "react";

import { TaskListGroup } from "@/components/task/task-list-group";
import { TasksResponse, TasksStatusOptions } from "@/lib/pocketbase-types";
import { useTasks } from "@/pb-hooks";
import { statusOrder } from "@/store/task-store";

export default function Dashboard() {
  const { data: userTasks, isPending: isLoadingTasks } = useTasks();

  const groupedTasks = useMemo(() => {
    return isLoadingTasks
      ? ([] as unknown as Record<TasksStatusOptions, TasksResponse[]>)
      : userTasks?.reduce(
          (acc, task) => {
            (acc[task.status] = acc[task.status] || []).push(task);
            return acc;
          },
          {} as Record<TasksStatusOptions, TasksResponse[]>,
        );
  }, [userTasks, isLoadingTasks]);

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900">
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
