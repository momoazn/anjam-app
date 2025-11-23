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
  QueryKey,
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
  mode: "paged" | "full" = "paged",
): Promise<TaskWithProject[]> {
  const currentUser = pb.authStore.record as UsersResponse | null;
  const filters: string[] = ['(deleted_at = "" || deleted_at = null)'];

  // Apply role-based filtering
  if (currentUser?.role === UsersRoleOptions.employee) {
    filters.push(`assignee = "${currentUser.id}"`);
  }

  // Apply project filtering
  if (projectId) {
    filters.push(`project = "${projectId}"`);
  }

  if (mode === "full") {
    return pb.collection("tasks").getFullList<TaskWithProject>({
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "order",
      expand: expandFields,
      batch: 500,
    });
  }

  // Use paginated list to avoid multiple sequential HTTP requests from getFullList
  return pb
    .collection("tasks")
    .getList<TaskWithProject>(1, 200, {
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "order",
      expand: expandFields,
    })
    .then((res) => res.items);
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
    mode?: "paged" | "full";
    enabled?: boolean;
  } = {},
) {
  const {
    projectId,
    expandFields = "project,assignee",
    mode = "paged",
    enabled = true,
  } = options;

  return useQuery({
    queryKey: queryKeys.tasks.list(projectId, expandFields, mode),
    queryFn: () => getTasks(projectId, expandFields, mode),
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
    queryFn: async () => {
      const task = await pb.collection("tasks").getOne<TaskWithProject>(id, {
        expand: "project,assignee,creator",
      });
      if (task.deleted_at) {
        throw new Error("Task not found");
      }
      return task;
    },
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
    { previousQueries: [QueryKey, TaskWithProject[] | undefined][] }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(taskData),
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches for all task-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot previous values for all task queries
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

      // Update all task list queries
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
      // Comprehensive refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      // Also invalidate projects as task count might change
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
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
      // Cancel outgoing refetches for all task-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot previous values for all task queries
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

      // Also update the specific task detail query
      queryClient.setQueryData<TaskWithProject>(
        queryKeys.tasks.detail(id),
        (old) => {
          if (!old) return old;
          return { ...old, ...updates } as TaskWithProject;
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
    onSettled: (_data, _error, variables) => {
      // Comprehensive refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      // Invalidate specific task detail
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.detail(variables.id),
        });
      }

      // Invalidate projects if task project changed
      if (variables?.updates?.project) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      }
    },
    ...options,
  });
}

/**
 * Hook to soft delete a task
 * @param options - Mutation options
 * @returns Mutation function for soft deleting tasks
 */
export function useDeleteTask(
  options?: UseMutationOptions<TasksResponse, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...(options ?? {}),
    mutationFn: async (id: string) => {
      return pb.collection("tasks").update<TasksResponse>(id, {
        deleted_at: new Date().toISOString(),
      });
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches for all task-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<TaskWithProject[]>({
        queryKey: queryKeys.tasks.all,
      });

      // Optimistically remove task from cache
      queryClient.setQueriesData<TaskWithProject[]>(
        { queryKey: queryKeys.tasks.all },
        (old: TaskWithProject[] | undefined) => {
          if (!old) return old;
          return old.filter((task) => task.id !== id);
        },
      );

      // Remove from task detail cache
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(id) });

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
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      // Invalidate projects as task count changes
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      options?.onSuccess?.(data, variables, context);
    },
  });
}

/**
 * Bulk update multiple tasks at once
 */
export function useBulkUpdateTasks(
  options?: UseMutationOptions<
    TasksResponse[],
    Error,
    { taskIds: string[]; updates: Partial<TasksRecord> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskIds,
      updates,
    }: {
      taskIds: string[];
      updates: Partial<TasksRecord>;
    }) => {
      const updatePromises = taskIds.map((taskId) =>
        pb.collection("tasks").update<TasksResponse>(taskId, updates),
      );

      return await Promise.all(updatePromises);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate all task-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Bulk delete multiple tasks at once
 */
export function useBulkDeleteTasks(
  options?: UseMutationOptions<void, Error, string[]>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      const deletePromises = taskIds.map((taskId) =>
        pb.collection("tasks").delete(taskId),
      );

      await Promise.all(deletePromises);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate all task-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook to reorder a task within a status column
 */
export function useReorderTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      newOrder,
      statusKey,
    }: {
      taskId: string;
      newOrder: number;
      statusKey: string;
    }) => {
      return pb.collection("tasks").update<TasksResponse>(taskId, {
        order: newOrder,
        status: statusKey as TasksRecord["status"],
      });
    },
    onSuccess: () => {
      // Invalidate all task-related queries to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
}
