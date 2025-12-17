/**
 * User-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting users.
 * Includes project-user relationship handling and simplified user data.
 */

import {
  useQuery,
  UseMutationOptions,
} from "@tanstack/react-query";
import { customApiCall, pb } from "../lib/pocketbase";
import {
  UsersResponse,
  UsersRecord,
  UsersProjectsResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

type UsersListOptions = {
  enabled?: boolean;
  batch?: number;
  sort?: string;
  filter?: string;
};

type CreateUserVariables = Omit<UsersRecord, "id" | "created" | "updated">;
type UpdateUserVariables = { id: string; updates: Partial<UsersRecord> };

const useCreateUserMutation = createMutation<UsersResponse, Error, CreateUserVariables>(
  (userData) => pb.collection("users").create(userData),
  (client) => {
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
  },
);

const useUpdateUserMutation = createMutation<UsersResponse, Error, UpdateUserVariables>(
  ({ id, updates }) => pb.collection("users").update(id, updates),
  (client, _data, variables) => {
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });

    if (variables?.id) {
      client.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
    }

    if (
      variables?.updates &&
      (variables.updates.role ||
        variables.updates.first_name ||
        variables.updates.last_name)
    ) {
      client.invalidateQueries({ queryKey: queryKeys.tasks.all });
      client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    }
  },
);

const useDeleteUserMutation = createMutation<void, Error, string>(
  async (id) => {
    await pb.collection("users").delete(id);
  },
  (client, _data, userId) => {
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
  },
);

type ToggleUserActiveResponse = { message: string; active: boolean };

const useToggleUserActiveMutation = createMutation<
  ToggleUserActiveResponse,
  Error,
  string
>(
  (userId) =>
    customApiCall<ToggleUserActiveResponse>(
      `/api/tm/users/${userId}/toggle-active`,
      { method: "PATCH" },
    ),
  (client, _data, userId) => {
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
  },
);

type UnblockUserResponse = { message: string };

const useUnblockUserMutation = createMutation<UnblockUserResponse, Error, string>(
  (userId) =>
    customApiCall<UnblockUserResponse>(`/api/tm/users/${userId}/unblock`, {
      method: "PATCH",
    }),
  (client, _data, userId) => {
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
  },
);

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
  return useCreateUserMutation(options);
}

/**
 * Hook to update an existing user
 * @param options - Mutation options
 * @returns Mutation function for updating users
 */
export function useUpdateUser(
  options?: UseMutationOptions<UsersResponse, Error, UpdateUserVariables>,
) {
  return useUpdateUserMutation(options);
}

/**
 * Hook to delete a user
 * @param options - Mutation options
 * @returns Mutation function for deleting users
 */
export function useDeleteUser(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useDeleteUserMutation(options);
}

/**
 * Hook to toggle user active status
 * @param options - Mutation options
 * @returns Mutation function for toggling user active status
 */
export function useToggleUserActive(
  options?: UseMutationOptions<ToggleUserActiveResponse, Error, string>,
) {
  return useToggleUserActiveMutation(options);
}

/**
 * Hook to unblock a user
 * @param options - Mutation options
 * @returns Mutation function for unblocking users
 */
export function useUnblockUser(
  options?: UseMutationOptions<UnblockUserResponse, Error, string>,
) {
  return useUnblockUserMutation(options);
}
