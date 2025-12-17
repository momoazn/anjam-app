/**
 * Task-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting tasks.
 * Includes role-based filtering and optimistic updates for better UX.
 */

import {
  useQuery,
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
import { createMutation } from "./use-mutation-factory";

type CreateTaskVariables = Omit<TasksRecord, "id" | "created" | "updated">;
type UpdateTaskVariables = { id: string; updates: Partial<TasksRecord> };

const useCreateTaskMutation = createMutation<TasksResponse, Error, CreateTaskVariables>(
  (taskData) => pb.collection("tasks").create(taskData),
  (client) => {
    compositeInvalidators.taskChange(client);
  },
);

const useUpdateTaskMutation = createMutation<
  TasksResponse,
  Error,
  UpdateTaskVariables
>(
  ({ id, updates }) => pb.collection("tasks").update(id, updates),
  (client, _data, variables) => {
    if (variables?.id) {
      detailInvalidators.task(client, variables.id);
    } else {
      compositeInvalidators.taskChange(client);
    }

    if (variables?.updates?.project) {
      compositeInvalidators.projectChange(client, variables.updates.project);
    }
  },
);

const useDeleteTaskMutation = createMutation<TasksResponse, Error, string>(
  (id) =>
    pb.collection("tasks").update<TasksResponse>(id, {
      deleted_at: new Date().toISOString(),
    }),
  (client, _data, taskId) => {
    detailInvalidators.task(client, taskId);
  },
);

type BulkUpdateVariables = { taskIds: string[]; updates: Partial<TasksRecord> };

const useBulkUpdateTasksMutation = createMutation<
  TasksResponse[],
  Error,
  BulkUpdateVariables
>(
  async ({ taskIds, updates }) => {
    const updatePromises = taskIds.map((taskId) =>
      pb.collection("tasks").update<TasksResponse>(taskId, updates),
    );
    return await Promise.all(updatePromises);
  },
  (client) => {
    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    client.invalidateQueries({ queryKey: queryKeys.projects.all });
  },
);

const useBulkDeleteTasksMutation = createMutation<void, Error, string[]>(
  async (taskIds) => {
    const timestamp = new Date().toISOString();
    const deletePromises = taskIds.map((taskId) =>
      pb.collection("tasks").update<TasksResponse>(taskId, {
        deleted_at: timestamp,
      }),
    );
    await Promise.all(deletePromises);
  },
  (client) => {
    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    client.invalidateQueries({ queryKey: queryKeys.projects.all });
  },
);

type ReorderTaskVariables = {
  taskId: string;
  newOrder: number;
  statusKey: string;
};

const useReorderTaskMutation = createMutation<
  TasksResponse,
  Error,
  ReorderTaskVariables
>(
  ({ taskId, newOrder, statusKey }) =>
    pb.collection("tasks").update<TasksResponse>(taskId, {
      order: newOrder,
      status: statusKey as TasksRecord["status"],
    }),
  (client) => {
    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
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
    CreateTaskVariables
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
    UpdateTaskVariables
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
    BulkUpdateVariables
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
