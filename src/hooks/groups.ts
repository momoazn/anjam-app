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
    Omit<GroupsRecord, "id" | "created" | "updated">,
    {
      previousQueries: Array<
        [readonly unknown[], GroupsResponse[] | undefined]
      >;
    }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    GroupsResponse,
    Error,
    Omit<GroupsRecord, "id" | "created" | "updated">,
    {
      previousQueries: Array<
        [readonly unknown[], GroupsResponse[] | undefined]
      >;
    }
  >({
    mutationFn: (
      groupData: Omit<GroupsRecord, "id" | "created" | "updated">,
    ) => {
      const { code, ...rest } = groupData;
      return pb.collection("groups").create({
        // Provide a placeholder code when none is supplied; backend overwrites it.
        code: code ?? "AUTO",
        ...rest,
      });
    },
    onMutate: async (newGroup) => {
      // Cancel outgoing refetches for group list queries
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.list() });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<GroupsResponse[]>({
        queryKey: queryKeys.groups.list(),
      });

      // Optimistically update cache with new group
      const optimisticGroup = {
        ...newGroup,
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      } as GroupsResponse;

      queryClient.setQueriesData<GroupsResponse[]>(
        { queryKey: queryKeys.groups.list() },
        (old: GroupsResponse[] | undefined) => {
          if (!old) return [optimisticGroup];
          return [optimisticGroup, ...old];
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful creation
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });

      // Invalidate projects as new group might affect project filtering
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
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
    { id: string; updates: Partial<GroupsRecord> },
    {
      previousQueries: Array<
        [readonly unknown[], GroupsResponse[] | undefined]
      >;
    }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    GroupsResponse,
    Error,
    { id: string; updates: Partial<GroupsRecord> },
    {
      previousQueries: Array<
        [readonly unknown[], GroupsResponse[] | undefined]
      >;
    }
  >({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<GroupsRecord>;
    }) => pb.collection("groups").update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches for group list queries
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.list() });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<GroupsResponse[]>({
        queryKey: queryKeys.groups.list(),
      });

      // Optimistically update cache
      queryClient.setQueriesData<GroupsResponse[]>(
        { queryKey: queryKeys.groups.list() },
        (old: GroupsResponse[] | undefined) => {
          if (!old) return old;
          return old.map((group: GroupsResponse) => {
            if (group.id === id) {
              return { ...group, ...updates } as GroupsResponse;
            }
            return group;
          });
        },
      );

      // Also update specific group detail queries
      queryClient.setQueryData<GroupsResponse>(
        queryKeys.groups.detail(id),
        (old) => {
          if (!old) return old;
          return { ...old, ...updates } as GroupsResponse;
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful update
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });

      // Invalidate specific group detail
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.detail(variables.id),
        });
      }

      // Invalidate projects if group status or other relevant fields changed
      if (variables?.updates) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      }

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
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

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("groups").delete(id);
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches for group list queries
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.list() });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<GroupsResponse[]>({
        queryKey: queryKeys.groups.list(),
      });

      // Optimistically remove group from cache
      queryClient.setQueriesData<GroupsResponse[]>(
        { queryKey: queryKeys.groups.list() },
        (old: GroupsResponse[] | undefined) => {
          if (!old) return old;
          return old.filter((group) => group.id !== id);
        },
      );

      // Remove from group detail caches
      queryClient.removeQueries({ queryKey: queryKeys.groups.detail(id) });

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });

      // Invalidate projects as group deletion affects project filtering
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
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

  return useMutation({
    mutationFn: async (id: string) => {
      const group = await pb.collection("groups").getOne<GroupsResponse>(id);
      return pb.collection("groups").update(id, { active: !group.active });
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches for group list queries
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.list() });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<GroupsResponse[]>({
        queryKey: queryKeys.groups.list(),
      });

      // Optimistically update cache
      queryClient.setQueriesData<GroupsResponse[]>(
        { queryKey: queryKeys.groups.list() },
        (old: GroupsResponse[] | undefined) => {
          if (!old) return old;
          return old.map((group: GroupsResponse) => {
            if (group.id === id) {
              return { ...group, active: !group.active } as GroupsResponse;
            }
            return group;
          });
        },
      );

      // Also update specific group detail queries
      queryClient.setQueryData<GroupsResponse>(
        queryKeys.groups.detail(id),
        (old) => {
          if (!old) return old;
          return { ...old, active: !old.active } as GroupsResponse;
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful toggle
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });

      // Invalidate specific group detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(variables),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
