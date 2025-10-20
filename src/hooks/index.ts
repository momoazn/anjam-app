/**
 * Centralized exports for all React Query hooks
 *
 * This file re-exports all hooks from their respective feature files,
 * providing a single import point for the entire hooks API.
 */

// Query keys
export { queryKeys } from "./query-keys";

// Task hooks
export {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "./tasks";

// Project hooks
export {
  useProjects,
  useProject,
  useProjectWithSupervisor,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "./projects";

// User hooks
export {
  useUsers,
  useUser,
  useProjectUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSpecificProjectUsers, // Deprecated
} from "./users";

// Auth hooks
export { useIsInitialAdmin } from "./auth";
