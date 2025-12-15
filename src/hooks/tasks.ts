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
  compositeInvalidators,
  detailInvalidators,
} from "../lib/query-invalidators";
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
export type TasksListResult = {
  items: TaskWithProject[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

async function getTasks(
  projectId?: string,
  expandFields?: string,
  mode: "paged" | "full" = "paged",
  page = 1,
  perPage = 50,
  filter?: string,
): Promise<TasksListResult> {
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

  if (filter) {
    filters.push(`(${filter})`);
  }

  if (mode === "full") {
    const batchSize = 500;
    const items = await pb.collection("tasks").getFullList<TaskWithProject>({
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "order",
      expand: expandFields,
      batch: batchSize,
    });
    return {
      items,
      page: 1,
      perPage: items.length || batchSize,
      totalItems: items.length,
      totalPages: 1,
    };
  }

  // Use paginated list to avoid multiple sequential HTTP requests from getFullList
  const res = await pb
    .collection("tasks")
    .getList<TaskWithProject>(page, perPage, {
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "order",
      expand: expandFields,
    });

  return {
    items: res.items,
    page: res.page,
    perPage: res.perPage,
    totalItems: res.totalItems,
    totalPages: res.totalPages,
  };
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
    page?: number;
    perPage?: number;
    enabled?: boolean;
    filter?: string;
  } = {},
) {
  const {
    projectId,
    expandFields = "project,assignee",
    mode = "paged",
    page = 1,
    perPage = 50,
    enabled = true,
    filter,
  } = options;

  return useQuery({
    queryKey: queryKeys.tasks.list(
      projectId,
      expandFields,
      mode,
      page,
      perPage,
      filter,
    ),
    queryFn: () =>
      getTasks(projectId, expandFields, mode, page, perPage, filter),
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
      // Use the composite validator for task changes
      compositeInvalidators.taskChange(queryClient);

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
      // Use detail validator for specific task invalidation
      if (variables?.id) {
        detailInvalidators.task(queryClient, variables.id);
      } else {
        compositeInvalidators.taskChange(queryClient);
      }

      // If project changed, also invalidate projects
      if (variables?.updates?.project) {
        compositeInvalidators.projectChange(
          queryClient,
          variables.updates.project,
        );
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
      // Use detail validator for specific task and projects
      if (variables) {
        detailInvalidators.task(queryClient, variables);
      } else {
        compositeInvalidators.taskChange(queryClient);
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
      const timestamp = new Date().toISOString();
      const deletePromises = taskIds.map((taskId) =>
        pb.collection("tasks").update<TasksResponse>(taskId, {
          deleted_at: timestamp,
        }),
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
