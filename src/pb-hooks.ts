import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { pb } from "./lib/pocketbase";
import { TasksResponse, UsersRoleOptions } from "./lib/pocketbase-types";

export const getTasks = () => {
  const userId = pb.authStore.record?.id;
  return pb.collection("tasks").getFullList<TasksResponse>({
    batch: 100,
    filter:
      userId === UsersRoleOptions.employee ? `assignee = "${userId}"` : "",
    sort: "order",
  });
};

export const useTasksQueryOptions: UseQueryOptions<
  TasksResponse[],
  Error,
  TasksResponse[],
  string[]
> = {
  queryKey: ["tasks-full-list"],
  queryFn: () => getTasks(),
};

export const useTasks = () => {
  return useQuery(useTasksQueryOptions);
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
};
