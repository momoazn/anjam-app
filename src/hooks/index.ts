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
  useToggleUserActive,
  useUnblockUser,
} from "./users";

// Comment hooks
export {
  useComments,
  useCreateComment,
  useUpdateComment,
  useSoftDeleteComment,
} from "./comments";

// Notification hooks
export {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAll,
  useClearRead,
} from "./notifications";

// Group hooks
export {
  useGroups,
  useGroup,
  useGroupUsers,
  useGroupProjects,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useToggleGroupActive,
} from "./groups";

// Page-specific optimized hooks
export { useTasksPageData } from "./use-tasks-page-data";
export { useProjectTasksPageData } from "./use-project-tasks-page-data";
export { useTaskCounts } from "./use-task-counts";

// Tag hooks
export { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "./tags";

// Utility hooks
export { useFileUpload, type FileWithPreview } from "./use-file-upload";
export { useTheme } from "./use-theme";
export { useIsMobile } from "./use-mobile";
export { useToast } from "./use-toast";

// Filter hooks
export {
  useTaskFilters,
  ALL_FILTER_VALUE,
  type TaskFiltersState,
} from "./use-task-filters";
export { useSavedFilters, type SavedFilter } from "./use-saved-filters";
