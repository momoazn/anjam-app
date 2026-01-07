import { useMutation, useQuery } from "convex/react";

import { useCurrentOrganization } from "@/store/app-context-store";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to list all users in the current organization.
 */
export function useUsers(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id;

  const users = useQuery(
    api.users.list,
    enabled && organizationId ? { organizationId } : "skip",
  );

  return {
    data: users?.map((u) => ({
      ...u,
      id: u._id,
      // Compatibility fields for PB UI
      first_name: u.firstName,
      last_name: u.lastName,
    })),
    isPending: users === undefined,
    isLoading: users === undefined,
    error: null,
  };
}

/**
 * Hook to get a single user by ID.
 */
export function useUser({
  id,
  enabled = true,
}: {
  id: string | undefined;
  enabled?: boolean;
}) {
  const user = useQuery(
    api.users.get,
    enabled && id ? { id: id as Id<"users"> } : "skip",
  );

  return {
    data: user
      ? {
          ...user,
          id: user._id,
          first_name: user.firstName,
          last_name: user.lastName,
        }
      : undefined,
    isPending: user === undefined,
    isLoading: user === undefined,
    error: null,
  };
}

/**
 * Hook to get users associated with a project.
 * In Convex v1, we currently use organization-level membership.
 */
export function useProjectUsers({
  projectId,
  enabled = true,
}: {
  projectId: string | undefined;
  enabled?: boolean;
}) {
  void projectId;
  // For now, return all organization users since projects don't have separate membership in the current Convex schema
  // We can refine this later if we add project_members table to Convex
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id;

  const users = useQuery(
    api.users.list,
    enabled && organizationId ? { organizationId } : "skip",
  );

  return {
    data: users?.map((u) => ({
      id: u._id,
      username: u.username,
      first_name: u.firstName,
      last_name: u.lastName,
      project_role: "member", // Default role
    })),
    isPending: users === undefined,
    isLoading: users === undefined,
    error: null,
  };
}

// Mutations - these would need backend implementation if we want to support them
// For now, providing stubs or mapping to existing ones if available

export function useCreateUser() {
  // Stub for create user if needed, though usually handled via auth
  return {
    mutate: async (_data: unknown) => {
      void _data;
      console.warn("useCreateUser not implemented");
      return null;
    },
    isPending: false,
  };
}

export function useUpdateUser() {
  const setUsername = useMutation(api.users.setUsername);

  return {
    mutate: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { username?: string };
    }) => {
      void id;
      if (updates.username) {
        return await setUsername({ username: updates.username });
      }
      // Other updates not yet supported in Convex backend
      return null;
    },
    isPending: false,
  };
}

// Mutations - these would need backend implementation if we want to support them
// For now, providing stubs or mapping to existing ones if available

/**
 * Hook to remove a user from the organization.
 */
export function useDeleteUser(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const removeMutation = useMutation(api.orgMembers.remove);
  const currentOrg = useCurrentOrganization();

  return {
    mutate: async (userId: string) => {
      if (!currentOrg) return;
      try {
        await removeMutation({
          organizationId: currentOrg._id,
          userId: userId as Id<"users">,
        });
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    mutateAsync: async (userId: string) => {
      if (!currentOrg) return;
      try {
        const result = await removeMutation({
          organizationId: currentOrg._id,
          userId: userId as Id<"users">,
        });
        options?.onSuccess?.();
        return result;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    isPending: false,
  };
}
