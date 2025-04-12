import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { TaskListGroup } from "@/components/task/task-list-group";
import { pb } from "@/lib/pocketbase";
import {
  TasksResponse,
  TasksStatusOptions,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";
import { statusOrder } from "@/store/task-store";

const getTasks = () => {
  const userId = pb.authStore.record?.id;
  return pb.collection("tasks").getFullList<TasksResponse>({
    batch: 100,
    filter:
      userId === UsersRoleOptions.employee ? `assignee = "${userId}"` : "",
    sort: "order",
  });
};

const useTasksQueryOptions: UseQueryOptions<
  TasksResponse[],
  Error,
  TasksResponse[],
  string[]
> = {
  queryKey: ["tasks-full-list"],
  queryFn: () => getTasks(),
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: userTasks, isPending: isLoadingTasks } =
    useQuery(useTasksQueryOptions);

  const { mutate: _updateTask } = useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<TasksResponse>;
    }) => {
      return pb.collection("tasks").update(taskId, updates);
    },
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: useTasksQueryOptions.queryKey,
      });

      const previousTasks = queryClient.getQueryData<TasksResponse[]>(
        useTasksQueryOptions.queryKey,
      );

      if (previousTasks) {
        const newTasks = previousTasks.map((t) =>
          t.id === taskId ? { ...t, ...updates } : t,
        );

        queryClient.setQueryData<TasksResponse[]>(
          useTasksQueryOptions.queryKey,
          newTasks,
        );
      }

      return { previousTasks };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: useTasksQueryOptions.queryKey,
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
