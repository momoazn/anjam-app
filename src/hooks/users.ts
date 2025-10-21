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
  } = {},
) {
  const { enabled = true, batch = 100, sort = "-created" } = options;

  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () =>
      pb.collection("users").getFullList<UsersResponse>({
        batch,
        sort,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
}

/**
 * Hook to fetch all project-user relationships in a single request
 * This mitigates the N+1 query problem by fetching all relationships at once
 * @param options - Configuration options for the query
 * @returns React Query result with all project-user relationships
 */
export function useAllProjectUsers(
  options: {
    enabled?: boolean;
    batch?: number;
  } = {},
) {
  const { enabled = true, batch = 500 } = options;

  return useQuery({
    queryKey: queryKeys.users.allProjectUsers(),
    queryFn: async () => {
      // Fetch all project-user relationships with expanded user data
      const userProjects = await pb
        .collection("users_projects")
        .getFullList<
          UsersProjectsResponse & { expand?: { user?: UsersResponse } }
        >({
          batch,
          expand: "user",
        });

      // Group by project ID for easy lookup
      const projectUsersMap = new Map<string, UsersResponse[]>();

      userProjects.forEach((up) => {
        if (up.expand?.user && up.project) {
          if (!projectUsersMap.has(up.project)) {
            projectUsersMap.set(up.project, []);
          }
          projectUsersMap.get(up.project)!.push(up.expand.user);
        }
      });

      return projectUsersMap;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Optimized hook to get users for a specific project
 * Uses the bulk-fetched data from useAllProjectUsers when available
 * Falls back to individual project query if needed
 * @param options - Configuration options for the query
 * @returns React Query result with project users data
 */
export function useProjectUsersOptimized({
  projectId,
  enabled = true,
}: {
  projectId: string;
  enabled?: boolean;
}) {
  // First, try to get data from the bulk fetch
  const { data: allProjectUsers } = useAllProjectUsers({
    enabled: enabled && Boolean(projectId),
  });

  // Fallback to individual project query if bulk data not available
  const individualQuery = useQuery({
    queryKey: queryKeys.users.projectUsers(projectId),
    queryFn: async () => {
      if (!projectId) {
        return Promise.resolve([]);
      }

      const userProjects = await pb
        .collection("users_projects")
        .getFullList<
          UsersProjectsResponse & { expand?: { user?: UsersResponse } }
        >({
          filter: `project = "${projectId}"`,
          expand: "user",
        });

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
    enabled: enabled && Boolean(projectId) && !allProjectUsers,
  });

  // Return data from bulk fetch if available, otherwise from individual query
  const projectUsers = allProjectUsers?.get(projectId) || [];

  return {
    data: projectUsers.map((user) => ({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    })),
    isPending: !allProjectUsers && individualQuery.isPending,
    error: individualQuery.error,
  };
}

/**
 * @deprecated Use useProjectUsers instead
 */
export const useSpecificProjectUsers = (
  ...args: Parameters<typeof useProjectUsers>
) => {
  console.warn(
    "useSpecificProjectUsers is deprecated. Please use useProjectUsers instead. " +
      "This alias will be removed in a future version.",
  );
  return useProjectUsers(...args);
};
