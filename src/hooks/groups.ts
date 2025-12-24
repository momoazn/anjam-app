/**
 * Group-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting groups.
 * Includes group members and projects relationship handling.
 */

import { useQuery, UseMutationOptions } from "@tanstack/react-query";
import { customApiCall, pb } from "@/lib/pocketbase";
import {
  GroupsResponse,
  GroupsRecord,
  UsersResponse,
  ProjectsResponse,
} from "@/lib/pocketbase-types";
import { mutationInvalidators } from "@/lib/query-invalidators";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";
import { createCrudHooks } from "./factories/use-crud-factory";

type CreateGroupWithManagerVariables = {
  group: { name: string; description?: string };
  manager: {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
};

type CreateGroupWithManagerResponse = {
  data: { groupId: string; managerId: string };
};

const {
  useCreate: useCreateGroupMutation,
  useUpdate: useUpdateGroupMutation,
  useDelete: useDeleteGroupMutation,
} = createCrudHooks<GroupsRecord, GroupsResponse>({
  collection: "groups",
  queryKeys: queryKeys.groups,
  invalidators: mutationInvalidators.crud.groups,
});

// Special mutation for creating group with manager (custom API)
const useCreateGroupWithManagerMutation = createMutation<
  CreateGroupWithManagerResponse,
  Error,
  CreateGroupWithManagerVariables
>(
  (payload) =>
    customApiCall<CreateGroupWithManagerResponse>(
      "/api/v1/groups/create-with-manager",
      { method: "POST", body: payload },
    ),
  (client) => {
    client.invalidateQueries({ queryKey: queryKeys.groups.all });
    client.invalidateQueries({ queryKey: queryKeys.groups.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
  },
);

const useToggleGroupActiveMutation = createMutation<
  GroupsResponse,
  Error,
  string
>(
  async (id) => {
    const group = await pb.collection("groups").getOne<GroupsResponse>(id);
    return pb.collection("groups").update(id, { active: !group.active });
  },
  (client, _data, groupId) => {
    client.invalidateQueries({ queryKey: queryKeys.groups.all });
    client.invalidateQueries({ queryKey: queryKeys.groups.lists() });
    client.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
  },
);

/**
 * Hook to fetch all groups
 * @param options - Configuration options for the query
 * @returns React Query result with groups data
 */
export function useGroups(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.groups.lists(),
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
  return useCreateGroupMutation(options);
}

export function useCreateGroupWithManager(
  options?: UseMutationOptions<
    CreateGroupWithManagerResponse,
    Error,
    CreateGroupWithManagerVariables
  >,
) {
  return useCreateGroupWithManagerMutation(options);
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
  return useUpdateGroupMutation(options);
}

/**
 * Hook to delete a group
 * @param options - Mutation options
 * @returns Mutation function for deleting groups
 */
export function useDeleteGroup(
  options?: UseMutationOptions<GroupsResponse, Error, string>,
) {
  return useDeleteGroupMutation(options);
}

/**
 * Hook to toggle a group's active status
 * @param options - Mutation options
 * @returns Mutation function for toggling group active status
 */
export function useToggleGroupActive(
  options?: UseMutationOptions<GroupsResponse, Error, string>,
) {
  return useToggleGroupActiveMutation(options);
}
