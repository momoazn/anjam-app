import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { pb } from "@/lib/pocketbase";
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

export const {
  useCreate: useCreateSubtask,
  useUpdate: useUpdateSubtask,
  useDelete: useDeleteSubtask,
} = crudHooks;

export function useSubtasks(taskId: string, options?: { enabled?: boolean }) {
  const enabled = taskId !== "" && (options?.enabled ?? true);

  return useQuery<
    SubtasksResponse<{
      assignee?: UsersResponse;
    }>[]
  >({
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
