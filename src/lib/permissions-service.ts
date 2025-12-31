/**
 * Permissions Service
 *
 * Provides type-safe functions for fetching user permissions.
 */
import type { OrgRole, ProjectRole } from "./permissions";
import { pb } from "./pocketbase";

export interface PermissionsResponse {
  user_id: string;
  organization_id: string;
  organization_role: OrgRole | null;
  project_id: string | null;
  project_role: ProjectRole | null;
  is_org_owner: boolean;
  is_org_admin: boolean;
  permissions: Record<string, boolean>;
}

/**
 * Fetches permissions for the current user in an organization and optionally a project.
 * @param orgId - The organization ID
 * @param projectId - Optional project ID for project-specific permissions
 * @returns Permissions response with roles and permission flags
 */
export async function getPermissions(
  orgId: string,
  projectId?: string,
): Promise<PermissionsResponse> {
  const params = new URLSearchParams();
  params.set("organization_id", orgId);
  if (projectId) {
    params.set("project_id", projectId);
  }

  const response = await pb.send<PermissionsResponse>(
    `/api/v1/permissions?${params}`,
    {
      method: "GET",
    },
  );

  return response;
}
