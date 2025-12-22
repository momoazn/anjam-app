/**
 * Task-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting tasks.
 * Includes role-based filtering and optimistic updates for better UX.
 */

import {
  useQuery,
  UseMutationOptions,
  QueryClient,
} from "@tanstack/react-query";
import { pb, TaskWithProject } from "../lib/pocketbase";
import { mutationInvalidators } from "../lib/query-invalidators";
import {
  UsersResponse,
  UsersRoleOptions,
  TasksRecord,
  TasksResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";
import {
  createCrudHooks,
  createBulkOperations,
} from "./factories/use-crud-factory";

// Create CRUD hooks using the factory
const crudHooks = createCrudHooks<TasksRecord, TasksResponse>({
  collection: "tasks",
  queryKeys: queryKeys.tasks,
  invalidators: mutationInvalidators.crud.tasks,
  relatedInvalidators: [
    {
      invalidator: mutationInvalidators.crud.projects.update,
      args: [], // Will be populated dynamically
    },
  ],
});

const bulkOps = createBulkOperations<TasksRecord, TasksResponse>({
  collection: "tasks",
  queryKeys: queryKeys.tasks,
  invalidators: mutationInvalidators.crud.tasks,
});

// Export CRUD hooks
const {
  useCreate: useCreateTaskMutation,
  useUpdate: useUpdateTaskMutation,
  useDelete: useDeleteTaskMutation,
} = crudHooks;
const {
  useBulkUpdate: useBulkUpdateTasksMutation,
  useBulkDelete: useBulkDeleteTasksMutation,
} = bulkOps;

type ReorderTaskVariables = {
  taskId: string;
  newOrder: number;
  statusKey: string;
};

// Task-specific mutation for reordering (kept separate as it's unique to tasks)
const useReorderTaskMutation = createMutation<
  TasksResponse,
  Error,
  ReorderTaskVariables
>(
  ({ taskId, newOrder, statusKey }: ReorderTaskVariables) =>
    pb.collection("tasks").update<TasksResponse>(taskId, {
      order: newOrder,
      status: statusKey as TasksRecord["status"],
    }),
  (client: QueryClient) => {
    mutationInvalidators.crud.tasks.reorder(client);
  },
);

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
    queryKey: queryKeys.tasks.list({
      projectId,
      expandFields,
      mode,
      page,
      perPage,
      filter,
    }),
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
  return useCreateTaskMutation(options);
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
  return useUpdateTaskMutation(options);
}

/**
 * Hook to soft delete a task
 * @param options - Mutation options
 * @returns Mutation function for soft deleting tasks
 */
export function useDeleteTask(
  options?: UseMutationOptions<TasksResponse, Error, string>,
) {
  return useDeleteTaskMutation(options);
}

/**
 * Bulk update multiple tasks at once
 */
export function useBulkUpdateTasks(
  options?: UseMutationOptions<
    TasksResponse[],
    Error,
    { ids: string[]; updates: Partial<TasksRecord> }
  >,
) {
  return useBulkUpdateTasksMutation(options);
}

/**
 * Bulk delete multiple tasks at once
 */
export function useBulkDeleteTasks(
  options?: UseMutationOptions<void, Error, string[]>,
) {
  return useBulkDeleteTasksMutation(options);
}

/**
 * Hook to reorder a task within a status column
 */
export function useReorderTask() {
  return useReorderTaskMutation();
}
