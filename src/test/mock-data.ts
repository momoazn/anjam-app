import type {
  UsersResponse,
  ProjectsResponse,
  TasksResponse,
} from "@/lib/pocketbase-types";

export const createMockUser = (
  overrides: Partial<UsersResponse> = {},
): UsersResponse => ({
  id: "user123",
  collectionId: "users",
  collectionName: "users",
  created: "2024-01-01T00:00:00.000Z",
  updated: "2024-01-01T00:00:00.000Z",
  username: "testuser",
  verified: true,
  emailVisibility: false,
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  avatar: "",
  role: "employee",
  active: true,
  blocked: false,
  failed_login_attempts: 0,
  ...overrides,
});

export const createMockProject = (
  overrides: Partial<ProjectsResponse> = {},
): ProjectsResponse => ({
  id: "proj123",
  collectionId: "projects",
  collectionName: "projects",
  created: "2024-01-01T00:00:00.000Z",
  updated: "2024-01-01T00:00:00.000Z",
  name: "Test Project",
  code: "TST",
  description: "Test project description",
  supervisor: "user123",
  assets: [],
  ...overrides,
});

export const createMockTask = (
  overrides: Partial<TasksResponse> = {},
): TasksResponse => ({
  id: "task123",
  collectionId: "tasks",
  collectionName: "tasks",
  created: "2024-01-01T00:00:00.000Z",
  updated: "2024-01-01T00:00:00.000Z",
  display_id: "TST-001",
  title: "Test Task",
  description: "Test task description",
  assignee: "user123",
  creator: "user123",
  project: "proj123",
  status: "pending",
  priority: "medium",
  deadline: null,
  tags: [],
  order: 0,
  time_spent_minutes: 0,
  deleted_at: null,
  ...overrides,
});

export const mockUsers = {
  admin: createMockUser({
    id: "admin123",
    username: "admin",
    role: "admin",
    first_name: "Admin",
    last_name: "User",
  }),
  supervisor: createMockUser({
    id: "super123",
    username: "supervisor",
    role: "supervisor",
    first_name: "Supervisor",
    last_name: "User",
  }),
  employee: createMockUser({
    id: "emp123",
    username: "employee",
    role: "employee",
    first_name: "Employee",
    last_name: "User",
  }),
};
