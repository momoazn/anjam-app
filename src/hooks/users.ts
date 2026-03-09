import { useQuery } from "convex/react";

import { Id, api } from "@/lib/convex";
import {
  useAuthIsAuthenticatedStrict,
  useCurrentOrganization,
} from "@/store/app-context-store";

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
