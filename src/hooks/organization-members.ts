import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { Doc, Id, api } from "@/lib/convex";
import { useCurrentOrganization } from "@/store/auth-store";

export type OrgRole = "owner" | "member";
export type MemberStatus = "invited" | "active" | "suspended";

export interface OrgMemberWithUser extends Omit<
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
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?._id;

  const members = useQuery(
    api.orgMembers.listByOrg,
    (options?.enabled ?? true) && orgId ? { organizationId: orgId } : "skip",
  );

  // Apply frontend filtering for status/role if needed
  const filteredMembers = members
    ?.map((m) => {
      const user = m.user
        ? {
            ...m.user,
            id: m.user._id,
            first_name: m.user.firstName,
            last_name: m.user.lastName,
          }
        : null;

      return {
        ...m,
        id: m._id,
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
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?._id;

  const invites = useQuery(
    api.invites.list,
    orgId ? { organizationId: orgId } : "skip",
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
    mutate: async ({ maxUses }: { role: OrgRole; maxUses?: number }) => {
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
      toast.success("Invite revoked");
    },
    isPending: false,
  };
}

export function useInviteOrgMember() {
  const createInviteLink = useMutation(api.invites.createLink);
  const currentOrg = useCurrentOrganization();

  return {
    mutate: async ({ email }: { email: string; role: OrgRole }) => {
      if (!currentOrg) throw new Error("No organization selected");

      // For now, we still use invite links but maybe we'll send an email in the future
      // The current implementation in members.tsx expects an email based invite
      const token = await createInviteLink({
        organizationId: currentOrg._id,
      });

      const inviteUrl = `${window.location.origin}/invite/${token}`;

      // In a real app, you'd send an email here.
      // For now, we'll just copy the link as a fallback.
      await navigator.clipboard.writeText(inviteUrl);
      toast.success(`Invite link for ${email} created and copied to clipboard`);

      return token;
    },
    isPending: false,
  };
}

export function useUpdateOrgMemberRole() {
  // Not implemented in Convex yet, adding placeholder
  return {
    mutate: async (_args: { memberId: string; role: OrgRole }) => {
      void _args;
      toast.error("Role updates not yet implemented in Convex");
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
      toast.success("Member removed");
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

export function useInviteByToken(token: string) {
  const invite = useQuery(
    api.invites.getByToken,

    token ? { token } : "skip",
  );

  return {
    data: invite,

    isLoading: invite === undefined,

    error: (invite === null ? new Error("Invite not found") : undefined) as
      | Error
      | undefined,
  };
}

export function useOrgMemberCount() {
  const { data: members } = useOrganizationMembers({ status: "active" });
  return members?.length ?? 0;
}

export function usePendingInvitationsCount() {
  const { data: members } = useOrganizationMembers({ status: "invited" });
  return members?.length ?? 0;
}

export function getInviteStatus(
  invite: Doc<"invites">,
): "active" | "expired" | "exhausted" | "revoked" {
  // Convex doesn't have a 'revoked' field in schema yet, but it can be deleted.
  // If we want 'revoked', we'd need a field. For now, since 'revoke' mutation deletes it,
  // we won't see 'revoked' status in the list.

  const expiresAt = invite.expiresAt ? new Date(invite.expiresAt) : null;
  if (expiresAt && expiresAt < new Date()) return "expired";

  if (invite.maxUses && invite.uses >= invite.maxUses) {
    return "exhausted";
  }

  return "active";
}

export function getInviteUrl(token: string): string {
  return `${window.location.origin}/invite/${token}`;
}
