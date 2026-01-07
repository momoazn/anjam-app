import {
  type OrgRole,
  type Permission,
  type ProjectRole,
  computePermissions,
} from "@/lib/permissions";
import { useCurrentOrgRole } from "@/store/auth-store";

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

export function usePermissions(_projectId?: string): UsePermissionsResult {
  void _projectId;
  const currentOrgRole = useCurrentOrgRole();

  // In v1, we simplified project roles to match org roles for now,
  // or default to "member" if they are in the org.
  // For proper project-level overrides, we'd need to fetch the project member record.
  // For now, we assume if you are an org owner/admin, you are project owner/admin.
  const projectRole: ProjectRole =
    currentOrgRole === "owner" ? "owner" : "member";

  const permissions = computePermissions(
    currentOrgRole ?? undefined,
    projectRole,
  );

  const can = (permission: Permission): boolean => {
    return permissions[permission] ?? false;
  };

  return {
    isLoading: false,
    isError: false,
    error: null,

    orgRole: currentOrgRole,
    projectRole: projectRole,
    isOrgOwner: currentOrgRole === "owner",
    isOrgAdmin: currentOrgRole === "owner",

    can,
    permissions,

    refetch: () => {},
  };
}

export function useCanDo(permission: Permission, projectId?: string): boolean {
  const { can } = usePermissions(projectId);
  return can(permission);
}

export function useIsOrgAdmin(): boolean {
  const { isOrgAdmin } = usePermissions();
  return isOrgAdmin;
}

export function useCanManageProject(projectId: string): boolean {
  const { can } = usePermissions(projectId);
  return can("project.update");
}
