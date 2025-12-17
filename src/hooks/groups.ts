/**
 * Group-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting groups.
 * Includes group members and projects relationship handling.
 */

import {
  useQuery,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import {
  GroupsResponse,
  GroupsRecord,
  UsersResponse,
  ProjectsResponse,
} from "@/lib/pocketbase-types";
import { mutationInvalidators } from "@/lib/query-invalidators";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

type CreateGroupVariables = Omit<GroupsRecord, "id" | "created" | "updated">;
type UpdateGroupVariables = { id: string; updates: Partial<GroupsRecord> };

const useCreateGroupMutation = createMutation<GroupsResponse, Error, CreateGroupVariables>(
  (groupData) => pb.collection("groups").create(groupData),
  (client) => {
    mutationInvalidators.crud.groups.create(client);
  },
);

const useUpdateGroupMutation = createMutation<GroupsResponse, Error, UpdateGroupVariables>(
  ({ id, updates }) => pb.collection("groups").update(id, updates),
  (client, _data, variables) => {
    mutationInvalidators.crud.groups.update(client, variables?.id);
  },
);

const useDeleteGroupMutation = createMutation<void, Error, string>(
  (id) => pb.collection("groups").delete(id),
  (client, _data, groupId) => {
    mutationInvalidators.crud.groups.delete(client, groupId);
  },
);

const useToggleGroupActiveMutation = createMutation<GroupsResponse, Error, string>(
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
    CreateGroupVariables
  >,
) {
  return useCreateGroupMutation(options);
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
    UpdateGroupVariables
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
  options?: UseMutationOptions<void, Error, string>,
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
