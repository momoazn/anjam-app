/**
 * Test credentials and data constants
 * These match the seeded data from scripts/seed-data.ts
 */

export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "admin12345",
    role: "admin",
    name: "Admin User",
  },
  manager: {
    email: "manager@example.com",
    password: "manager123",
    role: "manager",
    name: "Manager User",
  },
  supervisor: {
    email: "supervisor@example.com",
    password: "supervisor123",
    role: "supervisor",
    name: "Supervisor User",
  },
  employee1: {
    email: "employee1@example.com",
    password: "employee123",
    role: "employee",
    name: "Employee 1",
  },
  employee2: {
    email: "employee2@example.com",
    password: "employee123",
    role: "employee",
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
