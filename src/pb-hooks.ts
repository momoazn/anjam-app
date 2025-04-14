import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { pb } from "./lib/pocketbase";
import {
  ProjectsResponse,
  TasksResponse,
  UsersRoleOptions,
} from "./lib/pocketbase-types";

const getTasks = (projectId?: string) => {
  const userId = pb.authStore.record?.id;
  const filters = [];
  if (userId === UsersRoleOptions.employee) {
    filters.push(`assignee = "${userId}"`);
  }
  if (projectId) {
    filters.push(`project = "${projectId}"`);
  }

  return pb.collection("tasks").getFullList<TasksResponse>({
    batch: 100,
    filter: filters.join(" && "),
    sort: "order",
  });
};

export const getTasksQueryKey = (projectId?: string) => [
  "tasks-full-list",
  projectId ?? "",
];

export const getUseTasksQueryOptions = (
  projectId?: string,
): UseQueryOptions<TasksResponse[], Error, TasksResponse[], string[]> => ({
  queryKey: getTasksQueryKey(projectId),
  queryFn: () => getTasks(projectId),
});

export const useTasks = (projectId?: string) => {
  return useQuery(getUseTasksQueryOptions(projectId));
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
      const tasksQueryKey = getTasksQueryKey();
      await queryClient.cancelQueries({
        queryKey: tasksQueryKey,
      });

      const previousTasks =
        queryClient.getQueryData<TasksResponse[]>(tasksQueryKey);

      if (previousTasks) {
        const newTasks = previousTasks.map((t) =>
          t.id === taskId ? { ...t, ...updates } : t,
        );

        queryClient.setQueryData<TasksResponse[]>(tasksQueryKey, newTasks);
      }

      return { previousTasks };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
    },
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => pb.collection("projects").getOne(projectId),
  });
};

export const getProjectsQueryKey = () => ["projects"];

export const getUseProjectsQueryOptions = (): UseQueryOptions<
  ProjectsResponse[],
  Error,
  ProjectsResponse[],
  string[]
> => ({
  queryKey: getProjectsQueryKey(),
  queryFn: () => pb.collection("projects").getFullList(),
});

export const useProjects = () => {
  return useQuery(getUseProjectsQueryOptions());
};
