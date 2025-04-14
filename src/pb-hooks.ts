import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { pb, TaskWithProject } from "./lib/pocketbase";
import {
  ProjectsResponse,
  TasksResponse,
  UsersRoleOptions,
} from "./lib/pocketbase-types";

const getTasks = (projectId?: string, withProject = false) => {
  const userId = pb.authStore.record?.id;
  const filters = [];
  if (userId === UsersRoleOptions.employee) {
    filters.push(`assignee = "${userId}"`);
  }
  if (projectId) {
    filters.push(`project = "${projectId}"`);
  }

  return pb.collection("tasks").getFullList<TaskWithProject>({
    batch: 100,
    filter: filters.join(" && "),
    sort: "order",
    expand: withProject ? "project" : undefined,
  });
};

export const getTasksQueryKey = (projectId?: string) => [
  "tasks-full-list",
  projectId ?? "",
];

export const getUseTasksQueryOptions = (
  projectId?: string,
  withProject = false,
): UseQueryOptions<TaskWithProject[], Error, TaskWithProject[], string[]> => ({
  queryKey: getTasksQueryKey(projectId),
  queryFn: () => getTasks(projectId, withProject),
});

export const useTasks = (projectId?: string, withProject = false) => {
  return useQuery(getUseTasksQueryOptions(projectId, withProject));
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

export const useUsers = (enabled = true) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => pb.collection("users").getFullList(),
    enabled,
  });
};

export const useSpecificProjectUsers = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => {
      if (!projectId) {
        return Promise.resolve([]);
      }
      return fetch(`/api/tm/projects/${projectId}/users`).then((res) =>
        res.json(),
      ) as Promise<
        {
          id: string;
          username: string;
        }[]
      >;
    },
    enabled,
  });
};

export const useIsInitialAdmin = () => {
  return useQuery({
    queryKey: ["is-initial-admin"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/tm/is-initial");
        if (!response.ok) {
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }

      return true;
    },
  });
};
