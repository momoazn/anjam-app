/**
 * Task-related React Query hooks
 */
import {
  QueryClient,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import { TaskWithProject, pb } from "../lib/pocketbase";
import {
  Collections,
  Create,
  TasksRecord,
  TasksResponse,
  UsersResponse,
  UsersRoleOptions,
} from "../lib/pocketbase-types";
import { STALE_TIMES } from "../lib/query-config";
import { mutationInvalidators } from "../lib/query-invalidators";
import { createCrudHooks } from "./factories/use-crud-factory";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

const crudHooks = createCrudHooks<
  TasksRecord,
  TasksResponse,
  typeof queryKeys.tasks,
  Omit<Create<Collections.Tasks>, "task_number">
>({
  collection: "tasks",
  queryKeys: queryKeys.tasks,
  invalidators: mutationInvalidators.crud.tasks,
  relatedInvalidators: [
    {
      invalidator: mutationInvalidators.crud.projects.update,
      args: [],
    },
  ],
});

const {
  useCreate: useCreateTaskMutation,
  useUpdate: useUpdateTaskMutation,
  useDelete: useDeleteTaskMutation,
} = crudHooks;

type BatchUpdateResponse = {
  updated: number;
};

const useBulkUpdateTasksMutation = createMutation<
  BatchUpdateResponse,
  Error,
  { ids: string[]; updates: Partial<TasksRecord> }
>(
  ({ ids, updates }) =>
    pb.send("/api/v1/tasks/batch-update", {
      method: "POST",
      body: {
        task_ids: ids,
        updates,
      },
    }),
  (client) => {
    mutationInvalidators.crud.tasks.bulk(client);
  },
);

const useBulkDeleteTasksMutation = createMutation<
  BatchUpdateResponse,
  Error,
  string[]
>(
  (ids) =>
    pb.send("/api/v1/tasks/batch-update", {
      method: "POST",
      body: {
        task_ids: ids,
        updates: {
          deleted_at: new Date().toISOString(),
        },
      },
    }),
  (client) => {
    mutationInvalidators.crud.tasks.bulk(client);
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
  ({ taskId, newOrder, statusKey }: ReorderTaskVariables) =>
    pb.collection("tasks").update<TasksResponse>(taskId, {
      order: newOrder,
      status: statusKey as TasksRecord["status"],
    }),
  (client: QueryClient) => {
    mutationInvalidators.crud.tasks.reorder(client);
  },
);

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

  if (currentUser?.role === UsersRoleOptions.employee) {
    filters.push(`assignee = "${currentUser.id}"`);
  }

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
    expandFields = "project,assignee,tags",
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
    staleTime: STALE_TIMES.dynamic,
  });
}

export function useTask(options: { id: string; enabled?: boolean }) {
  const { id, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: async () => {
      const task = await pb.collection("tasks").getOne<TaskWithProject>(id, {
        expand: "project,assignee,creator,tags",
      });
      if (task.deleted_at) {
        throw new Error("Task not found");
      }
      return task;
    },
    enabled: enabled && Boolean(id),
    staleTime: STALE_TIMES.dynamic,
  });
}

export function useCreateTask(
  options?: UseMutationOptions<
    TasksResponse,
    Error,
    Omit<Create<Collections.Tasks>, "task_number">
  >,
) {
  return useCreateTaskMutation(options);
}

export function useUpdateTask(
  options?: UseMutationOptions<
    TasksResponse,
    Error,
    { id: string; updates: Partial<TasksRecord> }
  >,
) {
  return useUpdateTaskMutation(options);
}

export function useDeleteTask(
  options?: UseMutationOptions<TasksResponse, Error, string>,
) {
  return useDeleteTaskMutation(options);
}

export function useBulkUpdateTasks(
  options?: UseMutationOptions<
    BatchUpdateResponse,
    Error,
    { ids: string[]; updates: Partial<TasksRecord> }
  >,
) {
  return useBulkUpdateTasksMutation(options);
}

export function useBulkDeleteTasks(
  options?: UseMutationOptions<BatchUpdateResponse, Error, string[]>,
) {
  return useBulkDeleteTasksMutation(options);
}

export function useReorderTask() {
  return useReorderTaskMutation();
}

export function usePrefetchTask() {
  const queryClient = useQueryClient();

  const prefetch = useCallback(
    (taskId: string) => {
      const existingData = queryClient.getQueryData(
        queryKeys.tasks.detail(taskId),
      );
      if (existingData) return;

      queryClient.prefetchQuery({
        queryKey: queryKeys.tasks.detail(taskId),
        queryFn: async () => {
          const task = await pb
            .collection("tasks")
            .getOne<TaskWithProject>(taskId, {
              expand: "project,assignee,creator,tags",
            });
          if (task.deleted_at) {
            throw new Error("Task not found");
          }
          return task;
        },
        staleTime: STALE_TIMES.dynamic,
      });
    },
    [queryClient],
  );

  return prefetch;
}
