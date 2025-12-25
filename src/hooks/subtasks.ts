import { useQuery } from "@tanstack/react-query";

import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/hooks/query-keys";
import type {
  SubtasksRecord,
  SubtasksResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";
import { createCrudHooks } from "./factories/use-crud-factory";

const crudHooks = createCrudHooks<SubtasksRecord, SubtasksResponse>({
  collection: "subtasks",
  queryKeys: queryKeys.subtasks,
  invalidators: {
    create: (client) =>
      client.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "subtasks",
      }),
    update: (client) =>
      client.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "subtasks",
      }),
    delete: (client) =>
      client.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "subtasks",
      }),
  },
});

const {
  useCreate: useCreateSubtaskMutation,
  useUpdate: useUpdateSubtaskMutation,
  useDelete: useDeleteSubtaskMutation,
} = crudHooks;

export function useSubtasks(taskId: string, options?: { enabled?: boolean }) {
  const enabled = taskId !== "" && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.subtasks.listByTask(taskId),
    queryFn: () =>
      pb.collection("subtasks").getFullList<
        SubtasksResponse<{
          assignee?: UsersResponse;
        }>
      >({
        filter: `task = "${taskId}"`,
        sort: "order",
        expand: "assignee",
      }),
    enabled,
  });
}

export function useCreateSubtask() {
  return useCreateSubtaskMutation();
}

export function useUpdateSubtask() {
  return useUpdateSubtaskMutation();
}

export function useDeleteSubtask() {
  return useDeleteSubtaskMutation();
}
