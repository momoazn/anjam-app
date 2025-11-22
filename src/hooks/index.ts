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
} from "./users";

// Comment hooks
export {
  useComments,
  useCreateComment,
  useUpdateComment,
  useSoftDeleteComment,
} from "./comments";

// Page-specific optimized hooks
export { useTasksPageData } from "./use-tasks-page-data";
export { useProjectTasksPageData } from "./use-project-tasks-page-data";
