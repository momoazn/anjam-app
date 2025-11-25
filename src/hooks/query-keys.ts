/**
 * Centralized query key factory for React Query cache management.
 * Provides type-safe query keys for all PocketBase collections and operations.
 *
 * Structure:
 * - Each collection has 'all', 'lists', and 'detail' keys
 * - 'all' is the base key for the collection
 * - 'lists' is for list queries (with optional filters)
 * - 'detail' is for single record queries
 * - Additional collection-specific keys as needed
 */

/**
 * Centralized query key factory functions
 */
export const queryKeys = {
  /**
   * Task-related query keys
   * - all: Base key for all task queries
   * - lists: For task list queries
   * - list: For filtered task lists (by project, with expand fields)
   * - detail: For individual task queries
   */
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (
      projectId?: string,
      expandFields?: string,
      mode?: "paged" | "full",
    ) =>
      [
        ...queryKeys.tasks.lists(),
        {
          projectId: projectId ?? "all",
          expandFields: expandFields ?? "none",
          mode: mode ?? "paged",
        },
      ] as const,
    detail: (id: string) => [...queryKeys.tasks.all, "detail", id] as const,
  },

  /**
   * Project-related query keys
   * - all: Base key for all project queries
   * - lists: For project list queries
   * - detail: For individual project queries
   */
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (options?: { sort?: string; batch?: number }) =>
      [...queryKeys.projects.lists(), options ?? {}] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
  },

  /**
   * User-related query keys
   * - all: Base key for all user queries
   * - lists: For user list queries
   * - detail: For individual user queries
   * - projectUsers: For users associated with a specific project
   * - allProjectUsers: For all project-user relationships (bulk fetch)
   */
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    projectUsers: (projectId: string) =>
      [...queryKeys.users.all, "project", projectId] as const,
    allProjectUsers: () => [...queryKeys.users.all, "project-users"] as const,
  },

  /**
   * Comment-related query keys
   * - all: Base key for all comment queries
   * - lists: For comment list queries
   * - byTask: For comments filtered by task ID
   */
  comments: {
    all: ["comments"] as const,
    lists: () => [...queryKeys.comments.all, "list"] as const,
    byTask: (taskId: string) =>
      [...queryKeys.comments.lists(), "task", taskId] as const,
  },

  /**
   * Group-related query keys
   * - all: Base key for all group queries
   * - lists: For group list queries
   * - list: For group list queries
   * - details: For individual group detail queries
   * - detail: For individual group queries
   * - users: For users associated with a specific group
   * - projects: For projects associated with a specific group
   * - stats: For group statistics
   */
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    list: () => [...queryKeys.groups.lists()] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
    users: (groupId: string) =>
      [...queryKeys.groups.detail(groupId), "users"] as const,
    projects: (groupId: string) =>
      [...queryKeys.groups.detail(groupId), "projects"] as const,
    stats: (groupId: string) =>
      [...queryKeys.groups.detail(groupId), "stats"] as const,
  },
} as const;
