/**
 * User-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting users.
 * Includes project-user relationship handling and simplified user data.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import {
  UsersResponse,
  UsersRecord,
  UsersProjectsResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";

/**
 * Hook to fetch all users
 * @param options - Configuration options for the query
 * @returns React Query result with users data
 */
export function useUsers(
  options: {
    enabled?: boolean;
    batch?: number;
    sort?: string;
    filter?: string;
  } = {},
) {
  const { enabled = true, batch = 100, sort = "-created", filter } = options;

  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () =>
      pb.collection("users").getFullList<UsersResponse>({
        batch,
        sort,
        filter,
      }),
    enabled,
  });
}

/**
 * Hook to fetch a single user by ID
 * @param options - Configuration options for the query
 * @returns React Query result with user data
 */
export function useUser({
  id,
  enabled = true,
}: {
  id: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => pb.collection("users").getOne<UsersResponse>(id),
    enabled: enabled && Boolean(id),
  });
}

/**
 * Hook to fetch users for a specific project
 * @param options - Configuration options for the query
 * @returns React Query result with project users data
 */
export function useProjectUsers({
  projectId,
  enabled = true,
}: {
  projectId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.users.projectUsers(projectId),
    queryFn: async () => {
      if (!projectId) {
        return Promise.resolve([]);
      }

      // Get all user-project relationships for this project
      const userProjects = await pb
        .collection("users_projects")
        .getFullList<
          UsersProjectsResponse & { expand?: { user?: UsersResponse } }
        >({
          filter: `project = "${projectId}"`,
          expand: "user",
        });

      // Extract user data from the expanded relationships
      return userProjects
        .map((up) => up.expand?.user)
        .filter((user): user is UsersResponse => Boolean(user))
        .map((user) => ({
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
        }));
    },
    enabled: enabled && Boolean(projectId),
  });
}

/**
 * Hook to create a new user
 * @param options - Mutation options
 * @returns Mutation function for creating users
 */
export function useCreateUser(
  options?: UseMutationOptions<
    UsersResponse,
    Error,
    Omit<UsersRecord, "id" | "created" | "updated">
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Omit<UsersRecord, "id" | "created" | "updated">) =>
      pb.collection("users").create(userData),
    onMutate: async (newUser) => {
      // Cancel outgoing refetches for all user-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<UsersResponse[]>({
        queryKey: queryKeys.users.all,
      });

      // Optimistically update cache with new user
      const optimisticUser = {
        ...newUser,
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      } as UsersResponse;

      queryClient.setQueriesData<UsersResponse[]>(
        { queryKey: queryKeys.users.all },
        (old: UsersResponse[] | undefined) => {
          if (!old) return [optimisticUser];
          return [optimisticUser, ...old];
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      // Invalidate tasks as new user might affect assignee options
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook to update an existing user
 * @param options - Mutation options
 * @returns Mutation function for updating users
 */
export function useUpdateUser(
  options?: UseMutationOptions<
    UsersResponse,
    Error,
    { id: string; updates: Partial<UsersRecord> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<UsersRecord>;
    }) => pb.collection("users").update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches for all user-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<UsersResponse[]>({
        queryKey: queryKeys.users.all,
      });

      // Optimistically update cache
      queryClient.setQueriesData<UsersResponse[]>(
        { queryKey: queryKeys.users.all },
        (old: UsersResponse[] | undefined) => {
          if (!old) return old;
          return old.map((user: UsersResponse) => {
            if (user.id === id) {
              return { ...user, ...updates } as UsersResponse;
            }
            return user;
          });
        },
      );

      // Also update specific user detail query
      queryClient.setQueryData<UsersResponse>(
        queryKeys.users.detail(id),
        (old) => {
          if (!old) return old;
          return { ...old, ...updates } as UsersResponse;
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // Invalidate specific user detail
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(variables.id),
        });
      }

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      // Invalidate tasks if user role or name changed (affects assignee display)
      if (
        variables?.updates &&
        (variables.updates.role ||
          variables.updates.first_name ||
          variables.updates.last_name)
      ) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      }

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook to delete a user
 * @param options - Mutation options
 * @returns Mutation function for deleting users
 */
export function useDeleteUser(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("users").delete(id);
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches for all user-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<UsersResponse[]>({
        queryKey: queryKeys.users.all,
      });

      // Optimistically remove user from cache
      queryClient.setQueriesData<UsersResponse[]>(
        { queryKey: queryKeys.users.all },
        (old: UsersResponse[] | undefined) => {
          if (!old) return old;
          return old.filter((user) => user.id !== id);
        },
      );

      // Remove from user detail cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });

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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      // Invalidate tasks as user deletion affects assignee filtering
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
