import { useMutation, useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useCurrentOrganization } from "@/store/auth-store";

/**
 * Hook to list all users in the current organization.
 */
export function useUsers(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?.id as Id<"organizations"> | undefined;

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
  // For now, return all organization users since projects don't have separate membership in the current Convex schema
  // We can refine this later if we add project_members table to Convex
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?.id as Id<"organizations"> | undefined;

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
     mutate: async (data: any) => {
       console.warn("useCreateUser not implemented");
       return null;
     },
     isPending: false
   }
}

export function useUpdateUser() {
  const setUsername = useMutation(api.users.setUsername);

  return {
    mutate: async ({ id, updates }: { id: string; updates: any }) => {
      if (updates.username) {
        return await setUsername({ username: updates.username });
      }
      // Other updates not yet supported in Convex backend
      return null;
    },
    isPending: false,
  };
}

// Admin mutations like toggle-active/unblock are not yet in Convex
export function useToggleUserActive() {
  return {
    mutate: async () => {
      console.warn("useToggleUserActive not implemented for Convex yet");
    },
    isPending: false,
  };
}

export function useUnblockUser() {
  return {
    mutate: async () => {
      console.warn("useUnblockUser not implemented for Convex yet");
    },
    isPending: false,
  };
}

/**
 * Hook to remove a user from the organization.
 */
export function useDeleteUser(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const removeMutation = useMutation(api.orgMembers.remove);
  const currentOrg = useCurrentOrganization();

  return {
    mutate: async (userId: string) => {
      if (!currentOrg) return;
      try {
        await removeMutation({
          organizationId: currentOrg.id as Id<"organizations">,
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
          organizationId: currentOrg.id as Id<"organizations">,
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
