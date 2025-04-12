import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { TaskListGroup } from "@/components/task/task-list-group";
import { pb } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksResponse,
  TasksStatusOptions,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";
import { statusOrder } from "@/store/task-store";

export default function Dashboard() {
  const user = useAuthStore().user;

  const { data: userTasks, isPending: isLoadingTasks } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => {
      return pb.collection("tasks").getFullList<TasksResponse>({
        batch: 100,
        filter:
          user?.role === UsersRoleOptions.employee
            ? `assignee = "${user?.id}"`
            : "",
        // expand: "creator,assignee",
      });
    },
  });

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

  const sortByPriority = (a: TasksResponse, b: TasksResponse) => {
    if (a.priority === TasksPriorityOptions.urgent) return -1;
    if (b.priority === TasksPriorityOptions.urgent) return 1;
    if (a.priority === TasksPriorityOptions.high) return -1;
    if (b.priority === TasksPriorityOptions.high) return 1;
    if (a.priority === TasksPriorityOptions.medium) return -1;
    if (b.priority === TasksPriorityOptions.medium) return 1;
    if (a.priority === TasksPriorityOptions.low) return -1;
    if (b.priority === TasksPriorityOptions.low) return 1;
    return 0;
  };

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900">
      {statusOrder?.map((status) => {
        const sortedTasks = groupedTasks?.[status]?.sort(sortByPriority);

        return (
          <TaskListGroup
            key={status}
            taskCount={sortedTasks?.length ?? 0}
            status={status as TasksStatusOptions}
            tasks={sortedTasks ?? []}
          />
        );
      })}
    </div>
  );
}
