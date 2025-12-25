import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useAuthStore } from "@/store/auth-store";
import {
  computePermissions,
  type Permission,
  type OrgRole,
  type ProjectRole,
} from "@/lib/permissions";

interface PermissionsResponse {
  user_id: string;
  organization_id: string;
  organization_role: OrgRole | null;
  project_id: string | null;
  project_role: ProjectRole | null;
  is_org_owner: boolean;
  is_org_admin: boolean;
  permissions: Record<string, boolean>;
}

interface UsePermissionsResult {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  orgRole: OrgRole | null;
  projectRole: ProjectRole | null;
  isOrgOwner: boolean;
  isOrgAdmin: boolean;

  can: (permission: Permission) => boolean;
  permissions: Record<Permission, boolean>;

  refetch: () => void;
}

export function usePermissions(projectId?: string): UsePermissionsResult {
  const { currentOrganization, currentOrgRole } = useAuthStore();
  const orgId = currentOrganization?.id;

  const query = useQuery({
    queryKey: ["permissions", orgId, projectId],
    queryFn: async (): Promise<PermissionsResponse> => {
      if (!orgId) {
        throw new Error("No organization selected");
      }

      const params = new URLSearchParams();
      params.set("organization_id", orgId);
      if (projectId) {
        params.set("project_id", projectId);
      }

      const response = await pb.send(`/api/v1/permissions?${params}`, {
        method: "GET",
      });

      return response as PermissionsResponse;
    },
    enabled: !!orgId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const localPermissions = computePermissions(
    currentOrgRole ?? undefined,
    query.data?.project_role ?? undefined,
  );

  const permissions = (query.data?.permissions ?? localPermissions) as Record<
    Permission,
    boolean
  >;

  const can = (permission: Permission): boolean => {
    return permissions[permission] ?? false;
  };

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    orgRole: query.data?.organization_role ?? currentOrgRole,
    projectRole: query.data?.project_role ?? null,
    isOrgOwner: query.data?.is_org_owner ?? currentOrgRole === "owner",
    isOrgAdmin:
      query.data?.is_org_admin ??
      (currentOrgRole === "owner" || currentOrgRole === "admin"),

    can,
    permissions,

    refetch: query.refetch,
  };
}

export function useCanDo(permission: Permission, projectId?: string): boolean {
  const { can, isLoading } = usePermissions(projectId);

  if (isLoading) return false;
  return can(permission);
}

export function useIsOrgAdmin(): boolean {
  const { isOrgAdmin, isLoading } = usePermissions();

  if (isLoading) return false;
  return isOrgAdmin;
}

export function useCanManageProject(projectId: string): boolean {
  const { can, isLoading } = usePermissions(projectId);

  if (isLoading) return false;
  return can("project.update");
}
