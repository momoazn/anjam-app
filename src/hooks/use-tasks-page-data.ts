/**
 * Optimized hooks for the tasks page
 *
 * This hook provides exactly the data needed for the tasks page:
 * 1. Tasks with expanded project and assignee data
 * 2. Users for the filter dropdown
 *
 * This eliminates unnecessary requests for projects and project-user relationships
 * that aren't needed on the tasks page.
 */
import { useAllTasks } from "./tasks";
import { useUsers } from "./users";

/**
 * Hook to get all data needed for the tasks page
 * Makes only 2 requests: tasks + users
 */
export function useTasksPageData() {
  const tasksQuery = useAllTasks();
  const usersQuery = useUsers();

  return {
    tasks: tasksQuery.data || [],
    users: usersQuery.data || [],
    isLoadingTasks: tasksQuery.isPending,
    isLoadingUsers: usersQuery.isPending,
    error: tasksQuery.error || usersQuery.error,
  };
}
