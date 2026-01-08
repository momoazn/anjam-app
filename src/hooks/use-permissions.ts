import {
  type OrgRole,
  type Permission,
  type ProjectRole,
  computePermissions,
} from "@/lib/permissions";
import { useCurrentOrgRole } from "@/store/app-context-store";

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
