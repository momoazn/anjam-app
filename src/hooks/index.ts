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

export { useProjectStatuses } from "./project-statuses";

// Page-specific optimized hooks
export { useTasksPageData } from "./use-tasks-page-data";
export { useProjectTasksPageData } from "./use-project-tasks-page-data";
export { useTaskCounts } from "./use-task-counts";

// Tag hooks
export { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "./tags";

export {
  useSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
} from "./subtasks";

export {
  useTimeEntries,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
} from "./time-entries";

// Utility hooks
export { useFileUpload, type FileWithPreview } from "./use-file-upload";
export { useTheme } from "./use-theme";
export { useIsMobile } from "./use-mobile";
export { useToast } from "./use-toast";

// Filter hooks
export {
  useTaskFilters,
  ALL_FILTER_VALUE,
  type TaskFilterValues,
} from "./use-task-filters";
export { useSavedFilters, type SavedFilter } from "./use-saved-filters";

// Audit log hooks
export { useAuditLogs, useResourceAuditLogs } from "./audit-logs";

export {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_USER_PREFERENCES,
  useUserPreferences,
  useUpdateUserPreferences,
} from "./user-preferences";
export { useMentions } from "./mentions";

// Organization member hooks
export {
  useOrganizationMembers,
  useOrganizationMember,
  useInviteOrgMember,
  useUpdateOrgMemberRole,
  useRemoveOrgMember,
  useAcceptOrgInvitation,
  useOrgMemberCount,
  usePendingInvitationsCount,
} from "./organization-members";

// Project member hooks
export {
  useProjectMembers,
  useProjectMember,
  useIsProjectMember,
  useMyProjectRole,
  useAddProjectMember,
  useUpdateProjectMemberRole,
  useRemoveProjectMember,
  useProjectMemberCount,
  useProjectMembersByRole,
  useProjectOwners,
  useProjectAdmins,
} from "./project-members";
