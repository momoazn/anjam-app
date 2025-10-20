/**
 * Task-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting tasks.
 * Includes role-based filtering and optimistic updates for better UX.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb, TaskWithProject } from "../lib/pocketbase";
import {
  UsersResponse,
  UsersRoleOptions,
  TasksRecord,
  TasksResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";

/**
 * Fetches tasks with optional project filtering and field expansion
 */
function getTasks(
  projectId?: string,
  expandFields?: string,
): Promise<TaskWithProject[]> {
  const currentUser = pb.authStore.record as UsersResponse | null;
  const filters: string[] = [];

  // Apply role-based filtering
  if (currentUser?.role === UsersRoleOptions.employee) {
    filters.push(`assignee = "${currentUser.id}"`);
  }

  // Apply project filtering
  if (projectId) {
    filters.push(`project = "${projectId}"`);
  }

  return pb.collection("tasks").getFullList<TaskWithProject>({
    batch: 100,
    filter: filters.length > 0 ? filters.join(" && ") : undefined,
    sort: "order",
    expand: expandFields,
  });
}

/**
 * Hook to fetch tasks with optional project filtering and field expansion
 * @param options - Configuration options for the query
 * @returns React Query result with tasks data
 */
export function useTasks(
  options: {
    projectId?: string;
    expandFields?: string;
    enabled?: boolean;
  } = {},
) {
  const { projectId, expandFields, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.tasks.list(projectId, expandFields),
    queryFn: () => getTasks(projectId, expandFields),
    enabled,
  });
}

/**
 * Hook to fetch a single task by ID
 * @param options - Configuration options for the query
 * @returns React Query result with task data
 */
export function useTask(options: { id: string; enabled?: boolean }) {
  const { id, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => pb.collection("tasks").getOne<TaskWithProject>(id),
    enabled: enabled && Boolean(id),
  });
}

/**
 * Hook to create a new task
 * @param options - Mutation options
 * @returns Mutation function for creating tasks
 */
export function useCreateTask(
  options?: UseMutationOptions<
    TasksResponse,
    Error,
    Omit<TasksRecord, "id" | "created" | "updated">,
    { previousQueries: [readonly unknown[], TaskWithProject[] | undefined][] }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(taskData),
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<TaskWithProject[]>({
        queryKey: queryKeys.tasks.all,
      });

      // Optimistically update cache with new task
      const optimisticTask = {
        ...newTask,
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        expand: {},
      } as TaskWithProject;

      queryClient.setQueriesData<TaskWithProject[]>(
        { queryKey: queryKeys.tasks.all },
        (old: TaskWithProject[] | undefined) => {
          if (!old) return [optimisticTask];
          return [optimisticTask, ...old];
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    ...options,
  });
}

/**
 * Hook to update an existing task
 * @param options - Mutation options
 * @returns Mutation function for updating tasks
 */
export function useUpdateTask(
  options?: UseMutationOptions<
    TasksResponse,
    Error,
    { id: string; updates: Partial<TasksRecord> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<TasksRecord>;
    }) => {
      return pb.collection("tasks").update(id, updates);
    },
    onMutate: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<TasksRecord>;
    }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<TaskWithProject[]>({
        queryKey: queryKeys.tasks.all,
      });

      // Optimistically update cache
      queryClient.setQueriesData<TaskWithProject[]>(
        { queryKey: queryKeys.tasks.all },
        (old: TaskWithProject[] | undefined) => {
          if (!old) return old;
          return old.map((task: TaskWithProject) => {
            if (task.id === id) {
              // Create a new object with proper type validation
              const updatedTask = { ...task, ...updates };
              // Ensure the result maintains the TaskWithProject structure
              return updatedTask as TaskWithProject;
            }
            return task;
          });
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a task
 * @param options - Mutation options
 * @returns Mutation function for deleting tasks
 */
export function useDeleteTask(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("tasks").delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    ...options,
  });
}
