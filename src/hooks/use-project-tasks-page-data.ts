/**
 * Optimized hooks for the project-tasks page
 *
 * This hook provides exactly the data needed for the project-tasks page:
 * 1. Project data (for the page title)
 * 2. Tasks for the specific project with expanded assignee data
 * 3. Users for the filter dropdown
 *
 * This eliminates unnecessary requests for all projects and all project-user relationships
 * that aren't needed on the project-tasks page.
 */

import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import { ProjectsResponse, UsersResponse } from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";
import { useTasks } from "./tasks";

/**
 * Hook to get all data needed for the project-tasks page
 * Makes only 3 requests: project + tasks + users
 */
export function useProjectTasksPageData(projectId: string) {
  // Get the specific project data
  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () =>
      pb.collection("projects").getOne<ProjectsResponse>(projectId),
    enabled: Boolean(projectId),
  });

  // Get tasks for the specific project with expanded assignee data
  const tasksQuery = useTasks({
    projectId,
    expandFields: "project,assignee",
    mode: "full", // ensure we fetch all tasks in the project so new items always appear
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
    project: projectQuery.data,
    tasks: tasksQuery.data || [],
    users: usersQuery.data || [],
    isLoadingProject: projectQuery.isPending,
    isLoadingTasks: tasksQuery.isPending,
    isLoadingUsers: usersQuery.isPending,
    error: projectQuery.error || tasksQuery.error || usersQuery.error,
  };
}
