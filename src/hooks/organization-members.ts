import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { organization } from "@/constants";
import { Doc, Id, api } from "@/lib/convex";
import {
  useAuthIsAuthenticatedStrict,
  useCurrentOrganization,
} from "@/store/app-context-store";

type OrgRole = "owner" | "member";
type MemberStatus = "invited" | "active" | "suspended";

interface OrgMemberWithUser extends Omit<
  Doc<"organizationMembers">,
  "role" | "status"
> {
  role: OrgRole;
  status: MemberStatus;
  user: Doc<"users"> | null;
}

interface UseOrgMembersOptions {
  status?: MemberStatus;
  role?: OrgRole;
  enabled?: boolean;
}

export function useOrganizationMembers(options?: UseOrgMembersOptions) {
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?._id;

  const members = useQuery(
    api.orgMembers.listByOrg,
    (options?.enabled ?? true) && isAuthenticated && orgId
      ? { organizationId: orgId }
      : "skip",
  );

  // Apply frontend filtering for status/role if needed
  const filteredMembers = members
    ?.map((m) => {
      const user = m.user
        ? {
            ...m.user,
            displayName: m.user.displayName,
            email: m.user.email,
          }
        : null;

      return {
        ...m,
        user,
        expand: {
          user,
        },
      };
    })
    .filter((m) => {
      if (options?.status && m.status !== options.status) return false;
      if (options?.role && m.role !== options.role) return false;
      return true;
    });

  return {
    data: filteredMembers as
      | (OrgMemberWithUser & {
          id: string;
          expand: { user: Doc<"users"> | null };
        })[]
      | undefined,
    isLoading: members === undefined,
    isPending: members === undefined,
  };
}

export function useOrganizationInvites() {
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?._id;

  const invites = useQuery(
    api.invites.list,
    isAuthenticated && orgId ? { organizationId: orgId } : "skip",
  );

  return {
    data: invites,
    isLoading: invites === undefined,
  };
}

export function useCreateOrgInvite() {
  const createInviteLink = useMutation(api.invites.createLink);
  const currentOrg = useCurrentOrganization();

  return {
    mutate: async ({ maxUses }: { maxUses?: number }) => {
      if (!currentOrg) throw new Error("No organization selected");

      const token = await createInviteLink({
        organizationId: currentOrg._id,
        maxUses,
        // Optional: add expiresAt
      });

      return token;
    },
    isPending: false, // Convex mutations don't have a built-in isPending like TanStack Query
  };
}

export function useRevokeOrgInvite() {
  const revokeMutation = useMutation(api.invites.revoke);

  return {
    mutate: async (inviteId: Id<"invites">) => {
      await revokeMutation({ inviteId });
      toast.success(organization.inviteLinks.revokeSuccess);
    },
    isPending: false,
  };
}

export function useRemoveOrgMember() {
  const removeMutation = useMutation(api.orgMembers.remove);
  const currentOrg = useCurrentOrganization();

  return {
    mutate: async (userId: string) => {
      if (!currentOrg) return;
      await removeMutation({
        organizationId: currentOrg._id as Id<"organizations">,
        userId: userId as Id<"users">,
      });
      toast.success(organization.members.remove.success);
    },
    isPending: false,
  };
}

export function useAcceptOrgInvitation() {
  const acceptMutation = useMutation(api.invites.acceptExistingUser);

  return {
    mutate: async (token: string) => {
      return await acceptMutation({ token });
    },
    isPending: false,
  };
}

export function getInviteStatus(
  invite: Doc<"invites">,
): "active" | "expired" | "exhausted" | "revoked" {
  const expiresAt = invite.expiresAt ? new Date(invite.expiresAt) : null;
  if (expiresAt && expiresAt < new Date()) return "expired";

  if (invite.maxUses && invite.uses >= invite.maxUses) {
    return "exhausted";
  }

  return "active";
}

export function getInviteUrl(token: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}invite/${token}`;
}
