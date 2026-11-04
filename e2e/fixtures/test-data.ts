/**
 * Test credentials and data constants
 * These match the data created by convex/seed.ts.
 * Seed with: bunx convex run seed:seedDevData '{"reset": true}'
 * Roles are organization roles: "owner" or "member".
 */

export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "admin12345",
    role: "owner",
    organization: "org1",
    name: "Admin User",
  },
  manager: {
    email: "manager@example.com",
    password: "manager123",
    role: "member",
    organization: "org1",
    name: "Manager User",
  },
  supervisor: {
    email: "supervisor@example.com",
    password: "supervisor123",
    role: "owner",
    organization: "org2",
    name: "Supervisor User",
  },
  employee1: {
    email: "employee1@example.com",
    password: "employee123",
    role: "member",
    organization: "org1",
    name: "Employee 1",
  },
  employee2: {
    email: "employee2@example.com",
    password: "employee123",
    role: "member",
    organization: "org1",
    name: "Employee 2",
  },
} as const;

export const TEST_PROJECT = {
  name: "E2E Test Project",
  code: "ETP",
  description: "Project for E2E testing",
} as const;

export const TEST_TASK = {
  title: "E2E Test Task",
  description: "Task for E2E testing",
  priority: "high",
} as const;
