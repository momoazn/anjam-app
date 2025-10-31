import type { UsersRoleOptions } from "@/lib/pocketbase-types";

const PERMISSIONS = {
  "projects.view": ["admin", "supervisor", "employee"],
  "projects.manage": ["admin", "supervisor"],
  "users.view": ["admin"],
  "users.manage": ["admin"],
  "reports.view": ["admin", "supervisor"],
  "tasks.view": ["admin", "supervisor", "employee"],
  "tasks.manage": ["admin", "supervisor", "employee"],
  "notifications.view": ["admin", "supervisor", "employee"],
  "helps.view": ["admin", "supervisor", "employee"],
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

export function isSupervisor(userRole: UsersRoleOptions | null): boolean {
  return userRole === "supervisor";
}

export function isEmployee(userRole: UsersRoleOptions | null): boolean {
  return userRole === "employee";
}
