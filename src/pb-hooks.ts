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
  UsersResponse,
  UsersRoleOptions,
} from "./lib/pocketbase-types";

const getTasks = (projectId?: string, expandFields?: string) => {
  const currentUser = pb.authStore.record as UsersResponse | null;
  const filters = [];
  if (currentUser?.role === UsersRoleOptions.employee) {
    filters.push(`assignee = "${currentUser.id}"`);
  }
  if (projectId) {
    filters.push(`project = "${projectId}"`);
  }

  return pb.collection("tasks").getFullList<TaskWithProject>({
    batch: 100,
    filter: filters.join(" && "),
    sort: "order",
    expand: expandFields,
  });
};

export const getTasksQueryKey = (projectId?: string, expandFields?: string) => [
  "tasks-full-list",
  projectId ?? "all", // Use 'all' for clarity when no project ID
  expandFields ?? "none", // Include expand fields in the key
];

export const TASKS_QUERY_KEY_ROOT = ["tasks-full-list"] as const;

export const getUseTasksQueryOptions = (
  projectId?: string,
  expandFields?: string,
): UseQueryOptions<TaskWithProject[], Error, TaskWithProject[], string[]> => ({
  queryKey: getTasksQueryKey(projectId, expandFields),
  queryFn: () => getTasks(projectId, expandFields),
});

export const useTasks = (projectId?: string, expandFields?: string) => {
  return useQuery(getUseTasksQueryOptions(projectId, expandFields));
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
        queryKey: TASKS_QUERY_KEY_ROOT,
      });

      const previousQueries = queryClient.getQueriesData<TaskWithProject[]>({
        queryKey: TASKS_QUERY_KEY_ROOT,
      });

      queryClient.setQueriesData<TaskWithProject[]>(
        {
          queryKey: TASKS_QUERY_KEY_ROOT,
        },
        (old: TaskWithProject[] | undefined) => {
          if (!old) return old;
          return old.map((task: TaskWithProject) =>
            task.id === taskId
              ? ({ ...task, ...updates } as TaskWithProject)
              : task,
          );
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY_ROOT,
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
          first_name: string;
          last_name: string;
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
        if (response.status === 204) {
          return true;
        }
        if (!response.ok) {
          return false;
        }
        const payload = (await response.json()) as { exists?: boolean };
        return !(payload?.exists ?? false);
      } catch (error) {
        console.error(error);
        return false;
      }

      return false;
    },
  });
};
