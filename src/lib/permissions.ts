import { type OrgRole } from "@/types/user";

export type { OrgRole };
export type ProjectRole = "owner" | "admin" | "member" | "viewer";

export const PERMISSIONS = {
  "org.view": "View organization details",
  "org.update": "Update organization settings",
  "org.delete": "Delete organization",
  "org.manage_billing": "Manage billing and subscription",
  "org.manage_members": "Add/remove organization members",
  "org.invite_members": "Invite new members to organization",
  "org.create_project": "Create new projects",

  "project.view": "View project and its contents",
  "project.update": "Update project settings",
  "project.delete": "Delete project",
  "project.manage_members": "Add/remove project members",
  "project.manage_statuses": "Manage custom statuses",

  "task.view": "View tasks",
  "task.create": "Create new tasks",
  "task.update": "Update any task",
  "task.update_own": "Update own tasks only",
  "task.delete": "Delete tasks",
  "task.assign": "Assign tasks to users",

  "comment.view": "View comments",
  "comment.create": "Create comments",
  "comment.delete_own": "Delete own comments",
  "comment.delete_any": "Delete any comment",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function isOrgOwner(role: OrgRole | null | undefined): boolean {
  return role === "owner";
}

export function isOrgAdmin(role: OrgRole | null | undefined): boolean {
  return role === "owner";
}

export function isOrgMember(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "member";
}

function canViewProject(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return !!projectRole;
}

function canManageProject(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

function canManageProjectMembers(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

function canCreateTasks(
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

function canEditAnyTask(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

function canDeleteTasks(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): boolean {
  if (isOrgAdmin(orgRole)) return true;
  return projectRole === "owner" || projectRole === "admin";
}

function canComment(
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

export function computePermissions(
  orgRole: OrgRole | null | undefined,
  projectRole: ProjectRole | null | undefined,
): Record<Permission, boolean> {
  const isAdmin = isOrgAdmin(orgRole);
  const isOwner = isOrgOwner(orgRole);

  return {
    "org.view": isOrgMember(orgRole),
    "org.update": isOwner,
    "org.delete": isOwner,
    "org.manage_billing": isOwner,
    "org.manage_members": isAdmin,
    "org.invite_members": isAdmin,
    "org.create_project": isAdmin,

    "project.view": canViewProject(orgRole, projectRole),
    "project.update": canManageProject(orgRole, projectRole),
    "project.delete": isOwner || projectRole === "owner",
    "project.manage_members": canManageProjectMembers(orgRole, projectRole),
    "project.manage_statuses": canManageProject(orgRole, projectRole),

    "task.view": canViewProject(orgRole, projectRole),
    "task.create": canCreateTasks(orgRole, projectRole),
    "task.update": canEditAnyTask(orgRole, projectRole),
    "task.update_own": canCreateTasks(orgRole, projectRole),
    "task.delete": canDeleteTasks(orgRole, projectRole),
    "task.assign": canEditAnyTask(orgRole, projectRole),

    "comment.view": canViewProject(orgRole, projectRole),
    "comment.create": canComment(orgRole, projectRole),
    "comment.delete_own": canComment(orgRole, projectRole),
    "comment.delete_any": canEditAnyTask(orgRole, projectRole),
  };
}

type TaskActors = { creatorUserId: string; assigneeUserId?: string };

/** Mirrors `canEditTask` in convex/lib/auth.ts. */
export function canEditTask(
  role: OrgRole | null | undefined,
  task: TaskActors,
  userId: string | null | undefined,
): boolean {
  if (isOrgOwner(role)) return true;
  if (!userId) return false;
  return task.creatorUserId === userId || task.assigneeUserId === userId;
}

/** Mirrors `canDeleteTask` in convex/lib/auth.ts. */
export function canDeleteTask(
  role: OrgRole | null | undefined,
  task: TaskActors,
  userId: string | null | undefined,
): boolean {
  if (isOrgOwner(role)) return true;
  return !!userId && task.creatorUserId === userId;
}
