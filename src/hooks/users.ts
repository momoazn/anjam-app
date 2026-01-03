/**
 * User-related React Query hooks
 */
import { UseMutationOptions, useQuery } from "@tanstack/react-query";

import { pb } from "../lib/pocketbase";
import {
  ProjectMembersResponse,
  ProjectMembersRoleOptions,
  UsersRecord,
  UsersResponse,
} from "../lib/pocketbase-types";
import { STALE_TIMES } from "../lib/query-config";
import { mutationInvalidators } from "../lib/query-invalidators";
import { createCrudHooks } from "./factories/use-crud-factory";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

type UsersListOptions = {
  enabled?: boolean;
  batch?: number;
  sort?: string;
  filter?: string;
};

const {
  useCreate: useCreateUserMutation,
  useUpdate: useUpdateUserMutation,
  useDelete: useDeleteUserMutation,
} = createCrudHooks<UsersRecord, UsersResponse>({
  collection: "users",
  queryKeys: queryKeys.users,
  invalidators: mutationInvalidators.crud.users,
});

type ToggleUserActiveResponse = {
  data: { active: boolean };
  meta: { message: string };
};

const useToggleUserActiveMutation = createMutation<
  ToggleUserActiveResponse,
  Error,
  string
>(
  (userId) =>
    pb.send<ToggleUserActiveResponse>(`/api/v1/users/${userId}/toggle-active`, {
      method: "PATCH",
    }),
  (client, _data, userId) => {
    mutationInvalidators.crud.users.adminAction(client, userId);
  },
);

type UnblockUserResponse = {
  data: Record<string, never>;
  meta: { message: string };
};

const useUnblockUserMutation = createMutation<
  UnblockUserResponse,
  Error,
  string
>(
  (userId) =>
    pb.send<UnblockUserResponse>(`/api/v1/users/${userId}/unblock`, {
      method: "PATCH",
    }),
  (client, _data, userId) => {
    mutationInvalidators.crud.users.adminAction(client, userId);
  },
);

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
    staleTime: STALE_TIMES.reference,
  });
}

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
    staleTime: STALE_TIMES.reference,
  });
}

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

      const projectMembers = await pb
        .collection("project_members")
        .getFullList<
          ProjectMembersResponse & { expand?: { user?: UsersResponse } }
        >({
          filter: `project = "${projectId}"`,
          expand: "user",
        });

      return projectMembers
        .map((pm) => ({
          member: pm.expand?.user,
          role: pm.role,
        }))
        .filter(
          (
            item,
          ): item is {
            member: UsersResponse;
            role: ProjectMembersRoleOptions;
          } => Boolean(item.member),
        )
        .map(({ member, role }) => ({
          id: member.id,
          username: member.username,
          first_name: member.first_name,
          last_name: member.last_name,
          project_role: role,
        }));
    },
    enabled: enabled && Boolean(projectId),
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateUser(
  options?: UseMutationOptions<
    UsersResponse,
    Error,
    Omit<UsersRecord, "id" | "created" | "updated">
  >,
) {
  return useCreateUserMutation(options);
}

export function useUpdateUser(
  options?: UseMutationOptions<
    UsersResponse,
    Error,
    { id: string; updates: Partial<UsersRecord> }
  >,
) {
  return useUpdateUserMutation(options);
}

export function useDeleteUser(
  options?: UseMutationOptions<UsersResponse, Error, string>,
) {
  return useDeleteUserMutation(options);
}

export function useToggleUserActive(
  options?: UseMutationOptions<ToggleUserActiveResponse, Error, string>,
) {
  return useToggleUserActiveMutation(options);
}

export function useUnblockUser(
  options?: UseMutationOptions<UnblockUserResponse, Error, string>,
) {
  return useUnblockUserMutation(options);
}
