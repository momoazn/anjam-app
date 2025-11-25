import type { UsersRoleOptions } from "@/lib/pocketbase-types";

const PERMISSIONS = {
  // Global permissions
  "groups.view": ["admin"],
  "groups.manage": ["admin"],

  // Group-level permissions
  "group.view": ["admin", "manager", "supervisor", "employee"],
  "group.users.view": ["admin", "manager", "supervisor", "employee"],
  "group.users.manage": ["admin", "manager"],

  // Project-level permissions
  "projects.view": ["admin", "manager", "supervisor", "employee"],
  "projects.manage": ["admin", "manager", "supervisor"],
  "projects.create": ["admin", "manager"],

  // Task-level permissions
  "tasks.view": ["admin", "manager", "supervisor", "employee"],
  "tasks.manage": ["admin", "manager", "supervisor"],
  "tasks.create": ["admin", "manager", "supervisor"],
  "tasks.own.update": ["admin", "manager", "supervisor", "employee"],

  // User management
  "users.view": ["admin", "manager", "supervisor"],
  "users.manage": ["admin", "manager"],
  "users.create": ["admin", "manager"],

  // Reports and analytics
  "reports.view": ["admin", "manager", "supervisor"],

  // System permissions
  "notifications.view": ["admin", "manager", "supervisor", "employee"],
  "helps.view": ["admin", "manager", "supervisor", "employee"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(
  userRole: UsersRoleOptions | null,
  permission: Permission,
): boolean {
  if (!userRole) return false;
  return PERMISSIONS[permission].includes(userRole);
}

export function hasAnyRole(
  userRole: UsersRoleOptions | null,
  roles: UsersRoleOptions[],
): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

export function isAdmin(userRole: UsersRoleOptions | null): boolean {
  return userRole === "admin";
}

export function isManager(userRole: UsersRoleOptions | null): boolean {
  return userRole === "manager";
}

export function isSupervisor(userRole: UsersRoleOptions | null): boolean {
  return userRole === "supervisor";
}

export function isEmployee(userRole: UsersRoleOptions | null): boolean {
  return userRole === "employee";
}

export function canManageUsers(userRole: UsersRoleOptions | null): boolean {
  return isAdmin(userRole) || isManager(userRole);
}

export function canCreateProjects(userRole: UsersRoleOptions | null): boolean {
  return isAdmin(userRole) || isManager(userRole);
}
