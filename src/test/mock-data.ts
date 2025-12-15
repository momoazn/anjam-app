import type {
  UsersResponse,
  ProjectsResponse,
  TasksResponse,
  Collections,
  UsersRoleOptions,
  TasksStatusOptions,
  TasksPriorityOptions,
} from "@/lib/pocketbase-types";

export const createMockUser = (
  overrides: Partial<UsersResponse> = {},
): UsersResponse => ({
  id: "user123",
  collectionId: Collections.Users,
  collectionName: Collections.Users,
  created: "2024-01-01T00:00:00.000Z",
  updated: "2024-01-01T00:00:00.000Z",
  username: "testuser",
  verified: true,
  emailVisibility: false,
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  avatar: "",
  role: UsersRoleOptions.employee,
  active: true,
  blocked: false,
  failed_login_attempts: 0,
  ...overrides,
});

export const createMockProject = (
  overrides: Partial<ProjectsResponse> = {},
): ProjectsResponse => ({
  id: "proj123",
  collectionId: Collections.Projects,
  collectionName: Collections.Projects,
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
  collectionId: Collections.Tasks,
  collectionName: Collections.Tasks,
  created: "2024-01-01T00:00:00.000Z",
  updated: "2024-01-01T00:00:00.000Z",
  display_id: "TST-001",
  title: "Test Task",
  description: "Test task description",
  assignee: "user123",
  creator: "user123",
  project: "proj123",
  status: TasksStatusOptions.todo,
  priority: TasksPriorityOptions.medium,
  deadline: null,
  tags: [],
  order: 0,
  time_spent_minutes: 0,
  deleted_at: "",
  ...overrides,
});

export const mockUsers = {
  admin: createMockUser({
    id: "admin123",
    username: "admin",
    role: UsersRoleOptions.admin,
    first_name: "Admin",
    last_name: "User",
  }),
  supervisor: createMockUser({
    id: "super123",
    username: "supervisor",
    role: UsersRoleOptions.supervisor,
    first_name: "Supervisor",
    last_name: "User",
  }),
  employee: createMockUser({
    id: "emp123",
    username: "employee",
    role: UsersRoleOptions.employee,
    first_name: "Employee",
    last_name: "User",
  }),
};
