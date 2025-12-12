/**
 * Group-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting groups.
 * Includes group members and projects relationship handling.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import {
  GroupsResponse,
  GroupsRecord,
  UsersResponse,
  ProjectsResponse,
} from "@/lib/pocketbase-types";
import { queryKeys } from "./query-keys";

/**
 * Hook to fetch all groups
 * @param options - Configuration options for the query
 * @returns React Query result with groups data
 */
export function useGroups(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.groups.list(),
    queryFn: () =>
      pb
        .collection("groups")
        .getFullList<GroupsResponse<{ manager: UsersResponse }>>({
          sort: "-created",
          expand: "manager",
        }),
    enabled,
  });
}

/**
 * Hook to fetch a single group by ID
 * @param options - Configuration options for the query
 * @returns React Query result with group data
 */
export function useGroup(options: { id: string; enabled?: boolean }) {
  const { id, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.groups.detail(id),
    queryFn: () =>
      pb.collection("groups").getOne<GroupsResponse>(id, {
        expand: "manager",
      }),
    enabled: enabled && Boolean(id),
  });
}

/**
 * Hook to fetch users in a specific group
 * @param options - Configuration options for the query
 * @returns React Query result with users data
 */
export function useGroupUsers(options: { groupId: string; enabled?: boolean }) {
  const { groupId, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.groups.users(groupId),
    queryFn: () =>
      pb.collection("users").getFullList<UsersResponse>({
        filter: `group.id = "${groupId}"`,
      }),
    enabled: enabled && Boolean(groupId),
  });
}

/**
 * Hook to fetch projects in a specific group
 * @param options - Configuration options for the query
 * @returns React Query result with projects data
 */
export function useGroupProjects(options: {
  groupId: string;
  enabled?: boolean;
}) {
  const { groupId, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.groups.projects(groupId),
    queryFn: () =>
      pb.collection("projects").getFullList<ProjectsResponse>({
        filter: `group.id = "${groupId}"`,
      }),
    enabled: enabled && Boolean(groupId),
  });
}

/**
 * Hook to create a new group
 * @param options - Mutation options
 * @returns Mutation function for creating groups
 */
export function useCreateGroup(
  options?: UseMutationOptions<
    GroupsResponse,
    Error,
    Omit<GroupsRecord, "id" | "created" | "updated">
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ??
    ({} as UseMutationOptions<
      GroupsResponse,
      Error,
      Omit<GroupsRecord, "id" | "created" | "updated">
    >);

  return useMutation<
    GroupsResponse,
    Error,
    Omit<GroupsRecord, "id" | "created" | "updated">
  >({
    mutationFn: (groupData: Omit<GroupsRecord, "id" | "created" | "updated">) =>
      pb.collection("groups").create(groupData),
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}

/**
 * Hook to update an existing group
 * @param options - Mutation options
 * @returns Mutation function for updating groups
 */
export function useUpdateGroup(
  options?: UseMutationOptions<
    GroupsResponse,
    Error,
    { id: string; updates: Partial<GroupsRecord> }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ??
    ({} as UseMutationOptions<
      GroupsResponse,
      Error,
      { id: string; updates: Partial<GroupsRecord> }
    >);

  return useMutation<
    GroupsResponse,
    Error,
    { id: string; updates: Partial<GroupsRecord> }
  >({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<GroupsRecord>;
    }) => pb.collection("groups").update(id, updates),
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.detail(variables.id),
        });
      }

      if (variables?.updates) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}

/**
 * Hook to delete a group
 * @param options - Mutation options
 * @returns Mutation function for deleting groups
 */
export function useDeleteGroup(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ?? ({} as UseMutationOptions<void, Error, string>);

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("groups").delete(id);
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });

      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      if (variables) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.detail(variables),
        });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}

/**
 * Hook to toggle a group's active status
 * @param options - Mutation options
 * @returns Mutation function for toggling group active status
 */
export function useToggleGroupActive(
  options?: UseMutationOptions<GroupsResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ?? ({} as UseMutationOptions<GroupsResponse, Error, string>);

  return useMutation({
    mutationFn: async (id: string) => {
      const group = await pb.collection("groups").getOne<GroupsResponse>(id);
      return pb.collection("groups").update(id, { active: !group.active });
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });

      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(variables),
      });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}
