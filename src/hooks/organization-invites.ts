import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useCurrentOrganization, useAuthStore } from "@/store/auth-store";
import { queryKeys } from "./query-keys";
import { handlePocketBaseError } from "@/lib/error-handler";
import { toast } from "sonner";
import { organization as orgStrings } from "@/constants";
import type {
  OrganizationInvitesResponse,
  OrganizationsResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

// =============================================================================
// Types
// =============================================================================

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
  password: string;
  passwordConfirm: string;
  organizationName: string;
}

interface AuthResponse {
  user: Record<string, unknown>;
  organization?: Record<string, unknown>;
  token: string;
  meta: {
    message: string;
  };
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all invites for the current organization
 */
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

/**
 * Fetch invite info by token (public endpoint)
 */
export function useInviteByToken(token: string) {
  return useQuery({
    queryKey: queryKeys.orgInvites.byToken(token),
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

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new invite link for the organization
 */
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

/**
 * Revoke an invite link
 */
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

/**
 * Accept an invite and register a new user
 */
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
      // Auto-login the user
      if (data.token && data.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pb.authStore.save(data.token, data.user as any);
        login(data.user as UsersResponse, data.token);
      }
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

/**
 * Register with organization (direct registration flow)
 */
export function useRegisterWithOrg() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async ({
      email,
      password,
      passwordConfirm,
      organizationName,
    }: RegisterWithOrgInput): Promise<AuthResponse> => {
      const response = await fetch("/api/v1/register-with-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm,
          organizationName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Auto-login the user (login also fetches orgs)
      if (data.token && data.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pb.authStore.save(data.token, data.user as any);
        login(data.user as UsersResponse, data.token);
      }
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the status of an invite
 */
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

/**
 * Generate the full invite URL
 */
export function getInviteUrl(token: string): string {
  return `${window.location.origin}/invite/${token}`;
}
