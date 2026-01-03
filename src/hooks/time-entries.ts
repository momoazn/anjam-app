import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { pb } from "@/lib/pocketbase";
import type {
  TimeEntriesRecord,
  TimeEntriesResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

import { createCrudHooks } from "./factories/use-crud-factory";

const crudHooks = createCrudHooks<TimeEntriesRecord, TimeEntriesResponse>({
  collection: "time_entries",
  queryKeys: queryKeys.timeEntries,
  invalidators: {
    create: (client) =>
      client.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "time_entries",
      }),
    update: (client) =>
      client.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "time_entries",
      }),
    delete: (client) =>
      client.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "time_entries",
      }),
  },
});

export const {
  useCreate: useCreateTimeEntry,
  useUpdate: useUpdateTimeEntry,
  useDelete: useDeleteTimeEntry,
} = crudHooks;

export function useTimeEntries(
  taskId: string,
  options?: { enabled?: boolean },
) {
  const enabled = taskId !== "" && (options?.enabled ?? true);

  return useQuery<
    TimeEntriesResponse<{
      user?: UsersResponse;
    }>[]
  >({
    queryKey: queryKeys.timeEntries.listByTask(taskId),
    queryFn: () =>
      pb.collection("time_entries").getFullList<
        TimeEntriesResponse<{
          user?: UsersResponse;
        }>
      >({
        filter: `task = "${taskId}"`,
        sort: "-created",
        expand: "user",
      }),
    enabled,
  });
}
