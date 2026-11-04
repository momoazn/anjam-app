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
    organization: "تیم محصول",
    name: "سارا احمدی",
  },
  manager: {
    email: "manager@example.com",
    password: "manager123",
    role: "member",
    organization: "تیم محصول",
    name: "علی رضایی",
  },
  supervisor: {
    email: "supervisor@example.com",
    password: "supervisor123",
    role: "owner",
    organization: "تیم پشتیبانی",
    name: "نیلوفر کریمی",
  },
  employee1: {
    email: "employee1@example.com",
    password: "employee123",
    role: "member",
    organization: "تیم محصول",
    name: "محمد حسینی",
  },
  employee2: {
    email: "employee2@example.com",
    password: "employee123",
    role: "member",
    organization: "تیم محصول",
    name: "مریم صادقی",
  },
} as const;

export const TEST_PROJECT = {
  name: "اپ موبایل",
  code: "APP",
  description: "اپلیکیشن اندروید و iOS برای مدیریت تسک‌ها",
} as const;

export const TEST_TASK = {
  title: "E2E Test Task",
  description: "Task for E2E testing",
  priority: "high",
} as const;
