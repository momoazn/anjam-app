/**
 * App-level data fetching hooks
 *
 * These hooks provide optimized data fetching strategies for the entire application,
 * reducing the number of requests by pre-fetching commonly needed data.
 */

import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import {
  ProjectsResponse,
  UsersProjectsResponse,
  UsersResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";

/**
 * Hook to fetch all essential app data in optimized requests
 * This reduces the total number of requests by batching related data
 */
export function useAppData() {
  // Fetch all projects
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.list({ batch: 100, sort: "-created" }),
    queryFn: () =>
      pb.collection("projects").getFullList<ProjectsResponse>({
        batch: 100,
        sort: "-created",
      }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch all users
  const usersQuery = useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () =>
      pb.collection("users").getFullList<UsersResponse>({
        batch: 100,
        sort: "-created",
      }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch all project-user relationships
  const projectUsersQuery = useQuery({
    queryKey: queryKeys.users.allProjectUsers(),
    queryFn: async () => {
      const userProjects = await pb
        .collection("users_projects")
        .getFullList<
          UsersProjectsResponse & { expand?: { user?: UsersResponse } }
        >({
          batch: 500,
          expand: "user",
        });

      // Group by project ID for easy lookup
      const projectUsersMap = new Map<string, UsersResponse[]>();

      userProjects.forEach((up) => {
        if (up.expand?.user && up.project) {
          if (!projectUsersMap.has(up.project)) {
            projectUsersMap.set(up.project, []);
          }
          projectUsersMap.get(up.project)!.push(up.expand.user);
        }
      });

      return projectUsersMap;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    projects: projectsQuery.data || [],
    users: usersQuery.data || [],
    projectUsersMap:
      projectUsersQuery.data || new Map<string, UsersResponse[]>(),
    isLoading:
      projectsQuery.isPending ||
      usersQuery.isPending ||
      projectUsersQuery.isPending,
    error: projectsQuery.error || usersQuery.error || projectUsersQuery.error,
  };
}

/**
 * Hook to get users for a specific project using pre-fetched data
 * This eliminates the need for individual project-user requests
 */
export function useProjectUsersFromAppData(projectId: string) {
  const { projectUsersMap, isLoading } = useAppData();

  const projectUsers = projectUsersMap.get(projectId) || [];

  return {
    data: projectUsers.map((user) => ({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    })),
    isPending: isLoading,
  };
}
