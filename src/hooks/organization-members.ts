import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import type {
  OrganizationMembersResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";
import { useAuthStore, useCurrentOrganization } from "@/store/auth-store";

import { queryKeys } from "./query-keys";

// =============================================================================
// Types
// =============================================================================

type OrgRole = "owner" | "admin" | "member";
type MemberStatus = "invited" | "active" | "suspended";

interface OrgMemberWithUser extends OrganizationMembersResponse {
  expand?: {
    user?: UsersResponse;
    invited_by?: UsersResponse;
  };
}

interface UseOrgMembersOptions {
  status?: MemberStatus;
  role?: OrgRole;
  enabled?: boolean;
}

interface InviteMemberInput {
  email: string;
  role: OrgRole;
}

interface UpdateMemberRoleInput {
  memberId: string;
  role: OrgRole;
}

// =============================================================================
// Helper Functions
// =============================================================================

function buildMemberFilter(
  orgId: string,
  options?: UseOrgMembersOptions,
): string {
  const filters: string[] = [`organization = "${orgId}"`];

  if (options?.status) {
    filters.push(`status = "${options.status}"`);
  }

  if (options?.role) {
    filters.push(`role = "${options.role}"`);
  }

  return filters.join(" && ");
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all members of the current organization
 *
 * @example
 * const { data: members, isLoading } = useOrganizationMembers();
 * const { data: admins } = useOrganizationMembers({ role: "admin" });
 * const { data: pending } = useOrganizationMembers({ status: "invited" });
 */
export function useOrganizationMembers(options?: UseOrgMembersOptions) {
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: queryKeys.orgMembers.list(orgId, options),
    queryFn: async (): Promise<OrgMemberWithUser[]> => {
      if (!orgId) throw new Error("No organization selected");

      const records = await pb
        .collection("organization_members")
        .getFullList<OrgMemberWithUser>({
          filter: buildMemberFilter(orgId, options),
          expand: "user,invited_by",
          sort: "role,-created", // owners first, then by newest
        });

      return records;
    },
    enabled: (options?.enabled ?? true) && !!orgId,
  });
}

/**
 * Fetch a single organization member by ID
 */
export function useOrganizationMember(
  memberId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.orgMembers.detail(memberId),
    queryFn: async (): Promise<OrgMemberWithUser> => {
      const record = await pb
        .collection("organization_members")
        .getOne<OrgMemberWithUser>(memberId, {
          expand: "user,invited_by",
        });
      return record;
    },
    enabled: (options?.enabled ?? true) && !!memberId,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Invite a new member to the organization
 *
 * @example
 * const { mutate: invite, isPending } = useInviteOrgMember();
 * invite({ email: "user@example.com", role: "member" });
 */
export function useInviteOrgMember() {
  const queryClient = useQueryClient();
  const currentOrg = useCurrentOrganization();
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ email, role }: InviteMemberInput) => {
      if (!currentOrg) throw new Error("No organization selected");

      // Step 1: Find user by email
      let user: UsersResponse;
      try {
        user = await pb
          .collection("users")
          .getFirstListItem<UsersResponse>(`email = "${email}"`);
      } catch {
        // User doesn't exist - you might want to create an invited user
        // or throw an error depending on your business logic
        throw new Error(`No user found with email: ${email}`);
      }

      // Step 2: Check if already a member
      try {
        await pb
          .collection("organization_members")
          .getFirstListItem(
            `organization = "${currentOrg.id}" && user = "${user.id}"`,
          );
        throw new Error("User is already a member of this organization");
      } catch (err) {
        // Expected - user is not a member yet
        const errorMessage = (err as Error).message ?? "";
        if (errorMessage.includes("already a member")) {
          throw err;
        }
      }

      // Step 3: Create membership
      const membership = await pb.collection("organization_members").create({
        organization: currentOrg.id,
        user: user.id,
        role: role,
        status: "invited",
        invited_by: currentUser?.id,
        invited_at: new Date().toISOString(),
      });

      return membership;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

/**
 * Update a member's role
 *
 * @example
 * const { mutate: updateRole } = useUpdateOrgMemberRole();
 * updateRole({ memberId: "abc123", role: "admin" });
 */
export function useUpdateOrgMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: UpdateMemberRoleInput) => {
      const updated = await pb
        .collection("organization_members")
        .update(memberId, { role });
      return updated;
    },
    onSuccess: () => {
      toast.success("Member role updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

/**
 * Remove a member from the organization
 *
 * @example
 * const { mutate: removeMember } = useRemoveOrgMember();
 * removeMember("member-id-123");
 */
export function useRemoveOrgMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      await pb.collection("organization_members").delete(memberId);
    },
    onSuccess: () => {
      toast.success("Member removed from organization");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

/**
 * Accept an invitation (for the invited user)
 */
export function useAcceptOrgInvitation() {
  const queryClient = useQueryClient();
  const fetchOrgs = useAuthStore((s) => s.fetchUserOrganizations);

  return useMutation({
    mutationFn: async (memberId: string) => {
      const updated = await pb
        .collection("organization_members")
        .update(memberId, {
          status: "active",
          joined_at: new Date().toISOString(),
        });
      return updated;
    },
    onSuccess: () => {
      toast.success("Invitation accepted!");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
      // Refresh user's organization list
      fetchOrgs();
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

// =============================================================================
// Selector Hooks (for specific data needs)
// =============================================================================

/**
 * Get count of active members in organization
 */
export function useOrgMemberCount() {
  const { data: members } = useOrganizationMembers({ status: "active" });
  return members?.length ?? 0;
}

/**
 * Get count of pending invitations
 */
export function usePendingInvitationsCount() {
  const { data: members } = useOrganizationMembers({ status: "invited" });
  return members?.length ?? 0;
}
