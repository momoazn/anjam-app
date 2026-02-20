import { useMutation, useQuery } from "convex/react";

import {
  useAuthIsAuthenticatedStrict,
  useAuthUser,
  useCurrentOrganization,
} from "@/store/app-context-store";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to list all users in the current organization.
 */
export function useUsers(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id;

  const users = useQuery(
    api.users.list,
    enabled && isAuthenticated && organizationId ? { organizationId } : "skip",
  );

  return {
    data: users,
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
    data: user ?? undefined,
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
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  // For now, return all organization users since projects don't have separate membership in the current Convex schema
  // We can refine this later if we add project_members table to Convex
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id;

  const users = useQuery(
    api.users.list,
    enabled && isAuthenticated && organizationId ? { organizationId } : "skip",
  );

  return {
    data: users?.map((u) => ({
      _id: u._id,
      displayName: u.displayName,
      email: u.email,
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
  return {
    mutate: async (_args: unknown) => {
      void _args;
      throw new Error(
        "Creating users directly is not supported. Use invite/register flows instead.",
      );
    },
    isPending: false,
  };
}

export function useUpdateUser() {
  const currentUser = useAuthUser();
  const updateProfileMutation = useMutation(api.users.updateProfile);

  return {
    mutate: async (args: { id: string; updates: { displayName?: string } }) => {
      if (!currentUser?._id) {
        throw new Error("You must be authenticated to update a user profile.");
      }
      if (args.id !== currentUser._id) {
        throw new Error("Only your own profile can be updated.");
      }

      await updateProfileMutation({
        displayName: args.updates.displayName,
      });
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

    isPending: false,
  };
}
