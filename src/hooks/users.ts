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
  QueryKey,
} from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import {
  UsersResponse,
  UsersRecord,
  UsersProjectsResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";

type UsersQuerySnapshot = [QueryKey, UsersResponse[] | undefined][];

type UsersListOptions = {
  enabled?: boolean;
  batch?: number;
  sort?: string;
  filter?: string;
};

/**
 * Hook to fetch all users
 * @param options - Configuration options for the query
 * @returns React Query result with users data
 */
export function useUsers(options: UsersListOptions = {}) {
  const { enabled = true, batch = 100, sort = "-created", filter } = options;
  const queryParams = {
    batch,
    sort,
    ...(filter ? { filter } : {}),
  };

  return useQuery({
    queryKey: queryKeys.users.list({
      batch,
      sort,
      filter: filter ?? null,
    }),
    queryFn: () =>
      pb.collection("users").getFullList<UsersResponse>(queryParams),
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
    Omit<UsersRecord, "id" | "created" | "updated">,
    { previousQueries: UsersQuerySnapshot }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UsersResponse,
    Error,
    Omit<UsersRecord, "id" | "created" | "updated">,
    { previousQueries: UsersQuerySnapshot }
  >({
    mutationFn: (userData: Omit<UsersRecord, "id" | "created" | "updated">) =>
      pb.collection("users").create(userData),
    onMutate: async (newUser) => {
      // Cancel outgoing refetches for all user-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot previous values
      const previousQueries: UsersQuerySnapshot = queryClient.getQueriesData<
        UsersResponse[]
      >({
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
    { id: string; updates: Partial<UsersRecord> },
    { previousQueries: UsersQuerySnapshot }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UsersResponse,
    Error,
    { id: string; updates: Partial<UsersRecord> },
    { previousQueries: UsersQuerySnapshot }
  >({
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
      const previousQueries: UsersQuerySnapshot = queryClient.getQueriesData<
        UsersResponse[]
      >({
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

/**
 * Hook to toggle user active status
 * @param options - Mutation options
 * @returns Mutation function for toggling user active status
 */
export function useToggleUserActive(
  options?: UseMutationOptions<{ message: string }, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `${pb.baseUrl}api/tm/users/${userId}/toggle-active`,
        {
          method: "PATCH",
          headers: {
            Authorization: pb.authStore.token
              ? `Bearer ${pb.authStore.token}`
              : "",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle user status");
      }

      return response.json();
    },
    onMutate: async (userId: string) => {
      // Cancel outgoing refetches for all user-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<UsersResponse[]>({
        queryKey: queryKeys.users.all,
      });

      // Optimistically update user active status in cache
      queryClient.setQueriesData<UsersResponse[]>(
        { queryKey: queryKeys.users.all },
        (old: UsersResponse[] | undefined) => {
          if (!old) return old;
          return old.map((user: UsersResponse) => {
            if (user.id === userId) {
              return { ...user, active: !user.active } as UsersResponse;
            }
            return user;
          });
        },
      );

      // Also update specific user detail query
      queryClient.setQueryData<UsersResponse>(
        queryKeys.users.detail(userId),
        (old) => {
          if (!old) return old;
          return { ...old, active: !old.active } as UsersResponse;
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // Invalidate specific user detail
      if (variables) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(variables),
        });
      }

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook to unblock a user
 * @param options - Mutation options
 * @returns Mutation function for unblocking users
 */
export function useUnblockUser(
  options?: UseMutationOptions<{ message: string }, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `${pb.baseUrl}api/tm/users/${userId}/unblock`,
        {
          method: "PATCH",
          headers: {
            Authorization: pb.authStore.token
              ? `Bearer ${pb.authStore.token}`
              : "",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unblock user");
      }

      return response.json();
    },
    onMutate: async (userId: string) => {
      // Cancel outgoing refetches for all user-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<UsersResponse[]>({
        queryKey: queryKeys.users.all,
      });

      // Optimistically update user blocked status in cache
      queryClient.setQueriesData<UsersResponse[]>(
        { queryKey: queryKeys.users.all },
        (old: UsersResponse[] | undefined) => {
          if (!old) return old;
          return old.map((user: UsersResponse) => {
            if (user.id === userId) {
              return {
                ...user,
                blocked: false,
                failed_login_attempts: 0,
              } as UsersResponse;
            }
            return user;
          });
        },
      );

      // Also update specific user detail query
      queryClient.setQueryData<UsersResponse>(
        queryKeys.users.detail(userId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            blocked: false,
            failed_login_attempts: 0,
          } as UsersResponse;
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
      // Comprehensive refetch after successful unblock
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // Invalidate specific user detail
      if (variables) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(variables),
        });
      }

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
