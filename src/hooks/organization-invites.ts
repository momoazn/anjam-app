import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthRecord } from "pocketbase";
import { toast } from "sonner";

import { organization as orgStrings } from "@/constants";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import type {
  OrganizationInvitesResponse,
  OrganizationsResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";
import { useAuthStore, useCurrentOrganization } from "@/store/auth-store";

import { queryKeys } from "./query-keys";

type InviteRole = "admin" | "member";

interface InviteWithExpand extends OrganizationInvitesResponse {
  expand?: {
    organization?: OrganizationsResponse;
  };
}

interface CreateInviteInput {
  role?: InviteRole;
  maxUses?: number;
}

interface InviteInfo {
  invite: {
    role: InviteRole;
    expires_at: string;
  };
  organization: {
    id: string;
    name: string;
    logo?: string;
  };
}

interface AcceptInviteInput {
  email: string;
  password: string;
  passwordConfirm: string;
}

interface RegisterWithOrgInput {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

interface AuthResponse {
  user: Record<string, unknown>;
  organization?: Record<string, unknown>;
  token: string;
  meta: {
    message: string;
  };
}

export function useOrganizationInvites() {
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: queryKeys.orgInvites.list(orgId),
    queryFn: async (): Promise<InviteWithExpand[]> => {
      if (!orgId) throw new Error("No organization selected");

      const response = await fetch(`/api/v1/organizations/${orgId}/invites`, {
        headers: {
          Authorization: pb.authStore.token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invites");
      }

      const data = await response.json();
      return data.invites ?? [];
    },
    enabled: !!orgId,
  });
}

export function useInviteByToken(token: string) {
  return useQuery({
    queryKey: queryKeys.orgInvites.listByToken(token),
    queryFn: async (): Promise<InviteInfo> => {
      const response = await fetch(`/api/v1/invites/${token}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid invite link");
      }

      return response.json();
    },
    enabled: !!token,
    retry: false,
  });
}

export function useCreateOrgInvite() {
  const queryClient = useQueryClient();
  const currentOrg = useCurrentOrganization();

  return useMutation({
    mutationFn: async ({ role, maxUses }: CreateInviteInput = {}) => {
      if (!currentOrg) throw new Error("No organization selected");

      const response = await fetch(
        `/api/v1/organizations/${currentOrg.id}/invites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: pb.authStore.token,
          },
          body: JSON.stringify({
            role: role ?? "member",
            max_uses: maxUses ?? 50,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create invite");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(orgStrings.inviteLinks.createDialog.success);
      queryClient.invalidateQueries({ queryKey: queryKeys.orgInvites.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

export function useRevokeOrgInvite() {
  const queryClient = useQueryClient();
  const currentOrg = useCurrentOrganization();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      if (!currentOrg) throw new Error("No organization selected");

      const response = await fetch(
        `/api/v1/organizations/${currentOrg.id}/invites/${inviteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to revoke invite");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(orgStrings.inviteLinks.revokeSuccess);
      queryClient.invalidateQueries({ queryKey: queryKeys.orgInvites.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

export function useAcceptInvite(token: string) {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async ({
      email,
      password,
      passwordConfirm,
    }: AcceptInviteInput): Promise<AuthResponse> => {
      const response = await fetch(`/api/v1/invites/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to accept invite");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.token && data.user) {
        pb.authStore.save(data.token, data.user as unknown as AuthRecord);
        login(data.user as UsersResponse, data.token);
      }
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async ({
      email,
      username,
      password,
      passwordConfirm,
    }: RegisterWithOrgInput): Promise<AuthResponse> => {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          passwordConfirm,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.token && data.user) {
        pb.authStore.save(data.token, data.user as unknown as AuthRecord);
        login(data.user as UsersResponse, data.token);
      }
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

// Hook to create organization for authenticated user
export function useCreateOrg() {
  const fetchOrgs = useAuthStore((s) => s.fetchUserOrganizations);
  const queryClient = useQueryClient();
  const { setCurrentOrganization } = useAuthStore();

  return useMutation({
    mutationFn: async (organizationName: string) => {
      const response = await fetch("/api/v1/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: pb.authStore.token,
        },
        body: JSON.stringify({
          organizationName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create organization");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      await fetchOrgs();
      // Set the newly created organization as current
      if (data.organization) {
        const orgRecord = data.organization;
        setCurrentOrganization(
          {
            id: orgRecord.id,
            name: orgRecord.name,
            logo: orgRecord.logo,
            settings: orgRecord.settings,
          } as OrganizationsResponse,
          "owner",
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

export function getInviteStatus(
  invite: OrganizationInvitesResponse,
): "active" | "expired" | "exhausted" | "revoked" {
  if (invite.revoked) return "revoked";

  const expiresAt = new Date(invite.expires_at);
  if (expiresAt < new Date()) return "expired";

  if (invite.max_uses && invite.uses_count >= invite.max_uses) {
    return "exhausted";
  }

  return "active";
}

export function getInviteUrl(token: string): string {
  return `${window.location.origin}/invite/${token}`;
}
