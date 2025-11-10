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

import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import { UsersResponse } from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";
import { useTasks } from "./tasks";

/**
 * Hook to get all data needed for the tasks page
 * Makes only 2 requests: tasks + users
 */
export function useTasksPageData() {
  // Get tasks with expanded project and assignee data
  const tasksQuery = useTasks({
    expandFields: "project,assignee",
  });

  // Get all users for the filter dropdown
  const usersQuery = useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () =>
      pb.collection("users").getFullList<UsersResponse>({
        batch: 100,
        sort: "-created",
      }),
  });

  return {
    tasks: tasksQuery.data || [],
    users: usersQuery.data || [],
    isLoadingTasks: tasksQuery.isPending,
    isLoadingUsers: usersQuery.isPending,
    error: tasksQuery.error || usersQuery.error,
  };
}
