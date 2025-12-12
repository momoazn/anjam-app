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

type UsersListOptions = {
  enabled?: boolean;
  batch?: number;
  sort?: string;
  filter?: string;
};

type CreateUserVariables = Omit<UsersRecord, "id" | "created" | "updated">;
type UpdateUserVariables = { id: string; updates: Partial<UsersRecord> };

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
    filter: filter ?? undefined,
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
  options?: UseMutationOptions<UsersResponse, Error, CreateUserVariables>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ??
    ({} as UseMutationOptions<UsersResponse, Error, CreateUserVariables>);

  return useMutation<UsersResponse, Error, CreateUserVariables>({
    mutationFn: (userData: CreateUserVariables) =>
      pb.collection("users").create(userData),
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}

/**
 * Hook to update an existing user
 * @param options - Mutation options
 * @returns Mutation function for updating users
 */
export function useUpdateUser(
  options?: UseMutationOptions<UsersResponse, Error, UpdateUserVariables>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } =
    options ??
    ({} as UseMutationOptions<UsersResponse, Error, UpdateUserVariables>);

  return useMutation<UsersResponse, Error, UpdateUserVariables>({
    mutationFn: ({ id, updates }: UpdateUserVariables) =>
      pb.collection("users").update(id, updates),
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(variables.id),
        });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      if (
        variables?.updates &&
        (variables.updates.role ||
          variables.updates.first_name ||
          variables.updates.last_name)
      ) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
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
  const { onSuccess, onSettled, ...restOptions } =
    options ?? ({} as UseMutationOptions<void, Error, string>);

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("users").delete(id);
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      if (variables) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(variables),
        });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
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
  const { onSuccess, onSettled, ...restOptions } =
    options ?? ({} as UseMutationOptions<{ message: string }, Error, string>);

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `${pb.baseURL}api/tm/users/${userId}/toggle-active`,
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
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      if (variables) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(variables),
        });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
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
  const { onSuccess, onSettled, ...restOptions } =
    options ?? ({} as UseMutationOptions<{ message: string }, Error, string>);

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `${pb.baseURL}api/tm/users/${userId}/unblock`,
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
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      if (variables) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(variables),
        });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}
