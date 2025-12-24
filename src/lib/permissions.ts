/**
 * Permission System
 *
 * This module provides permission checking for the frontend.
 * Permissions are resolved based on:
 * 1. Organization role (owner, admin, member)
 * 2. Project role (owner, admin, member, viewer)
 *
 * Organization admins (owner/admin) have full access to all projects.
 * Project roles only apply to organization members.
 */

// =============================================================================
// Types
// =============================================================================

export type OrgRole = "owner" | "admin" | "member";
export type ProjectRole = "owner" | "admin" | "member" | "viewer";

export interface PermissionContext {
  userId: string;
  organizationId: string;
  organizationRole: OrgRole | null;
  projectId: string | null;
  projectRole: ProjectRole | null;
  isOrgOwner: boolean;
  isOrgAdmin: boolean;
  permissions: Record<string, boolean>;
}

// =============================================================================
// Permission Definitions
// =============================================================================

/**
 * All possible permissions in the system.
 * Used for type safety and documentation.
 */
export const PERMISSIONS = {
  // Organization permissions
  "org.view": "View organization details",
  "org.update": "Update organization settings",
  "org.delete": "Delete organization",
  "org.manage_billing": "Manage billing and subscription",
  "org.manage_members": "Add/remove organization members",
  "org.invite_members": "Invite new members to organization",
  "org.create_project": "Create new projects",

  // Project permissions
  "project.view": "View project and its contents",
  "project.update": "Update project settings",
  "project.delete": "Delete project",
  "project.manage_members": "Add/remove project members",
  "project.manage_statuses": "Manage custom statuses",

  // Task permissions
  "task.view": "View tasks",
  "task.create": "Create new tasks",
  "task.update": "Update any task",
  "task.update_own": "Update own tasks only",
  "task.delete": "Delete tasks",
  "task.assign": "Assign tasks to users",

  // Comment permissions
  "comment.view": "View comments",
  "comment.create": "Create comments",
  "comment.delete_own": "Delete own comments",
  "comment.delete_any": "Delete any comment",

  // Time entry permissions
  "time_entry.create": "Log time",
  "time_entry.delete_own": "Delete own time entries",
  "time_entry.delete_any": "Delete any time entry",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// =============================================================================
// Role Checks
// =============================================================================

/**
 * Check if the organization role is owner
 */
export function isOrgOwner(role: OrgRole | null | undefined): boolean {
  return role === "owner";
}

/**
 * Check if the organization role has admin-level access (owner or admin)
 */
export function isOrgAdmin(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user has any organization membership
 */
export function isOrgMember(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

/**
 * Check if user can manage projects in the organization
 */
export function canManageProjects(
  orgRole: OrgRole | null | undefined,
): boolean {
  return isOrgAdmin(orgRole);
}

/**
 * Check if user can manage organization members
 */
export function canManageOrgMembers(
  orgRole: OrgRole | null | undefined,
): boolean {
  return isOrgAdmin(orgRole);
}

// =============================================================================
// Project Role Checks
// =============================================================================

/**
 * Check if user can view project content
 */
export function canViewProject(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return !!projectRole;
}

/**
 * Check if user can manage project settings
 */
export function canManageProject(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can manage project members
 */
export function canManageProjectMembers(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can create tasks
 */
export function canCreateTasks(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return (
    projectRole === "owner" ||
    projectRole === "admin" ||
    projectRole === "member"
  );
}

/**
 * Check if user can edit any task
 */
export function canEditAnyTask(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can edit a specific task
 * Members can only edit tasks assigned to them
 */
export function canEditTask(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
  taskAssigneeId: string | null | undefined,
  currentUserId: string,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  if (projectRole === "owner" || projectRole === "admin") return true;
  if (projectRole === "member" && taskAssigneeId === currentUserId) return true;
  return false;
}

/**
 * Check if user can delete tasks
 */
export function canDeleteTasks(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

/**
 * Check if user can comment
 */
export function canComment(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return (
    projectRole === "owner" ||
    projectRole === "admin" ||
    projectRole === "member"
  );
}

/**
 * Check if user can log time
 */
export function canLogTime(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return (
    projectRole === "owner" ||
    projectRole === "admin" ||
    projectRole === "member"
  );
}

// =============================================================================
// Computed Permission Object
// =============================================================================

/**
 * Compute all permissions for a given context
 * This mirrors the backend permission computation
 */
export function computePermissions(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): Record<Permission, boolean> {
  const isAdmin = isOrgAdmin(orgRole);
  const isOwner = isOrgOwner(orgRole);

  return {
    // Organization permissions
    "org.view": isOrgMember(orgRole),
    "org.update": isOwner,
    "org.delete": isOwner,
    "org.manage_billing": isOwner,
    "org.manage_members": isAdmin,
    "org.invite_members": isAdmin,
    "org.create_project": isAdmin,

    // Project permissions
    "project.view": canViewProject(orgRole, projectRole),
    "project.update": canManageProject(orgRole, projectRole),
    "project.delete": isOwner || projectRole === "owner",
    "project.manage_members": canManageProjectMembers(orgRole, projectRole),
    "project.manage_statuses": canManageProject(orgRole, projectRole),

    // Task permissions
    "task.view": canViewProject(orgRole, projectRole),
    "task.create": canCreateTasks(orgRole, projectRole),
    "task.update": canEditAnyTask(orgRole, projectRole),
    "task.update_own": canCreateTasks(orgRole, projectRole),
    "task.delete": canDeleteTasks(orgRole, projectRole),
    "task.assign": canEditAnyTask(orgRole, projectRole),

    // Comment permissions
    "comment.view": canViewProject(orgRole, projectRole),
    "comment.create": canComment(orgRole, projectRole),
    "comment.delete_own": canComment(orgRole, projectRole),
    "comment.delete_any": canEditAnyTask(orgRole, projectRole),

    // Time entry permissions
    "time_entry.create": canLogTime(orgRole, projectRole),
    "time_entry.delete_own": canLogTime(orgRole, projectRole),
    "time_entry.delete_any": canEditAnyTask(orgRole, projectRole),
  };
}
