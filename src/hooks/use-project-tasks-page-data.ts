/**
 * Optimized hooks for the project-tasks page
 *
 * This hook provides exactly the data needed for the project-tasks page:
 * 1. Project data (for the page title)
 * 2. Tasks for the specific project
 * 3. Users for the filter dropdown
 */
import { useProject } from "./projects";
import { useAllTasks } from "./tasks";
import { useUsers } from "./users";

/**
 * Hook to get all data needed for the project-tasks page
 * Uses Convex hooks
 */
export function useProjectTasksPageData(projectId: string) {
  const projectQuery = useProject({
    id: projectId,
    enabled: Boolean(projectId),
  });

  const tasksQuery = useAllTasks({
    projectId,
    enabled: Boolean(projectId),
  });

  const usersQuery = useUsers({
    enabled: true,
  });

  return {
    project: projectQuery.data,
    tasks: tasksQuery.data || [],
    users: usersQuery.data || [],
    isLoadingProject: projectQuery.isLoading,
    isLoadingTasks: tasksQuery.isLoading,
    isLoadingUsers: usersQuery.isLoading,
    error: projectQuery.error || tasksQuery.error || usersQuery.error,
  };
}
