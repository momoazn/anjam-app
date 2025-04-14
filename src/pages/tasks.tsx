import { TaskListGroup } from "@/components/task/task-list-group";
import { TEXT } from "@/constants/text";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";
import { useTasks } from "@/pb-hooks";
import { useMemo } from "react";

export default function Tasks() {
  const { data: userTasks, isPending: isLoadingTasks } = useTasks(
    undefined,
    true,
  );

  const groupedTasks = useMemo(() => {
    return isLoadingTasks
      ? ([] as unknown as Record<TasksStatusOptions, TaskWithProject[]>)
      : userTasks?.reduce(
          (acc, task) => {
            (acc[task.status] = acc[task.status] || []).push(task);
            return acc;
          },
          {} as Record<TasksStatusOptions, TaskWithProject[]>,
        );
  }, [userTasks, isLoadingTasks]);

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900">
      <h1 className="ps-3 text-2xl font-bold">{TEXT.tasks.allTasks}</h1>
      {statusOrder?.map((status) => {
        const tasks = groupedTasks?.[status] ?? [];

        return (
          <TaskListGroup
            key={status}
            taskCount={tasks.length}
            status={status as TasksStatusOptions}
            tasks={tasks}
            showProject={true}
          />
        );
      })}
    </div>
  );
}
