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
async function getTasks(
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
    return await pb.collection("tasks").getFullList<TaskWithProject>({
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "order",
      expand: expandFields,
      batch: 500,
    });
  }

  // Use paginated list to avoid multiple sequential HTTP requests from getFullList
  const res = await pb.collection("tasks").getList<TaskWithProject>(1, 200, {
    filter: filters.length > 0 ? filters.join(" && ") : undefined,
    sort: "order",
    expand: expandFields,
  });

  return res.items;
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
    Omit<TasksRecord, "id" | "created" | "updated">
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ??
    ({} as UseMutationOptions<
      TasksResponse,
      Error,
      Omit<TasksRecord, "id" | "created" | "updated">
    >);

  return useMutation({
    mutationFn: (taskData: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(taskData),
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
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
  const { onSuccess, onSettled, ...restOptions } =
    options ??
    ({} as UseMutationOptions<
      TasksResponse,
      Error,
      { id: string; updates: Partial<TasksRecord> }
    >);

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
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.detail(variables.id),
        });
      }

      if (variables?.updates?.project) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
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
  const { onSuccess, onSettled, ...restOptions } =
    options ?? ({} as UseMutationOptions<TasksResponse, Error, string>);

  return useMutation({
    mutationFn: async (id: string) => {
      return pb.collection("tasks").update<TasksResponse>(id, {
        deleted_at: new Date().toISOString(),
      });
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      if (variables) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.detail(variables),
        });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
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
  const { onSuccess, onSettled, ...restOptions } =
    options ??
    ({} as UseMutationOptions<
      TasksResponse[],
      Error,
      { taskIds: string[]; updates: Partial<TasksRecord> }
    >);

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
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}

/**
 * Bulk delete multiple tasks at once
 */
export function useBulkDeleteTasks(
  options?: UseMutationOptions<void, Error, string[]>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ?? ({} as UseMutationOptions<void, Error, string[]>);

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      const deletePromises = taskIds.map((taskId) =>
        pb.collection("tasks").delete(taskId),
      );

      await Promise.all(deletePromises);
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
}
