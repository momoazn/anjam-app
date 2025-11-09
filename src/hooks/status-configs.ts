/**
 * Status Config-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting status configurations.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import { StatusConfigsRecord } from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";

export type StatusConfigsResponse = StatusConfigsRecord & {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
};

/**
 * Hook to fetch all status configs for a project
 * @param projectId - The project ID to fetch status configs for
 * @param options - Configuration options for the query
 * @returns React Query result with status configs data
 */
export function useProjectStatusConfigs(
  projectId: string,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.statusConfigs.byProject(projectId),
    queryFn: () =>
      pb.collection("status_configs").getFullList<StatusConfigsResponse>({
        filter: `project = "${projectId}"`,
        sort: "order",
      }),
    enabled: enabled && Boolean(projectId),
  });
}

/**
 * Hook to fetch a single status config by ID
 * @param id - The status config ID
 * @param options - Configuration options for the query
 * @returns React Query result with status config data
 */
export function useStatusConfig(
  id: string,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.statusConfigs.detail(id),
    queryFn: () =>
      pb.collection("status_configs").getOne<StatusConfigsResponse>(id),
    enabled: enabled && Boolean(id),
  });
}

/**
 * Hook to create a new status config
 * @param options - Mutation options
 * @returns Mutation function for creating status configs
 */
export function useCreateStatusConfig(
  options?: UseMutationOptions<
    StatusConfigsResponse,
    Error,
    Omit<StatusConfigsRecord, "id" | "created" | "updated">
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      statusConfigData: Omit<StatusConfigsRecord, "id" | "created" | "updated">,
    ) => pb.collection("status_configs").create(statusConfigData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statusConfigs.all });
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.statusConfigs.byProject(data.project),
        });
      }
    },
    ...options,
  });
}

/**
 * Hook to update a status config
 * @param options - Mutation options
 * @returns Mutation function for updating status configs
 */
export function useUpdateStatusConfig(
  options?: UseMutationOptions<
    StatusConfigsResponse,
    Error,
    { id: string; data: Partial<StatusConfigsRecord> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<StatusConfigsRecord>;
    }) =>
      pb.collection("status_configs").update<StatusConfigsResponse>(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statusConfigs.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statusConfigs.detail(data.id),
      });
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.statusConfigs.byProject(data.project),
        });
      }
    },
    ...options,
  });
}

/**
 * Hook to delete a status config
 * @param options - Mutation options
 * @returns Mutation function for deleting status configs
 */
export function useDeleteStatusConfig(
  options?: UseMutationOptions<
    boolean,
    Error,
    { id: string; projectId: string }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) =>
      pb.collection("status_configs").delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statusConfigs.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statusConfigs.byProject(variables.projectId),
      });
    },
    ...options,
  });
}
