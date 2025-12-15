/**
 * Query invalidation helpers for standardized cache management
 * Provides reusable invalidation patterns for collections and related data
 */

import { QueryClient, QueryKey } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";

/**
 * Collection-based invalidation helpers
 */
export const collectionInvalidators = {
  /** Invalidate all task-related queries */
  tasks: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
  },

  /** Invalidate all project-related queries */
  projects: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.projects.all });
    client.invalidateQueries({ queryKey: queryKeys.projects.lists() });
  },

  /** Invalidate all user-related queries */
  users: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
  },

  /** Invalidate all group-related queries */
  groups: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.groups.all });
    client.invalidateQueries({ queryKey: queryKeys.groups.lists() });
  },

  /** Invalidate all comment-related queries */
  comments: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.comments.all });
    client.invalidateQueries({ queryKey: queryKeys.comments.lists() });
  },

  /** Invalidate all tag-related queries */
  tags: (client: QueryClient) => {
    // Assuming tagQueryKeys exists in query-keys
    client.invalidateQueries({ queryKey: ["tags"] });
  },
};

/**
 * Detail invalidation helpers
 */
export const detailInvalidators = {
  /** Invalidate specific task and its related queries */
  task: (client: QueryClient, taskId: string) => {
    collectionInvalidators.tasks(client);
    client.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
  },

  /** Invalidate specific project and its related queries */
  project: (client: QueryClient, projectId: string) => {
    collectionInvalidators.projects(client);
    client.invalidateQueries({
      queryKey: queryKeys.projects.detail(projectId),
    });
  },

  /** Invalidate specific user and their related queries */
  user: (client: QueryClient, userId: string) => {
    collectionInvalidators.users(client);
    client.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
  },

  /** Invalidate comments for a specific task */
  taskComments: (client: QueryClient, taskId: string) => {
    client.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) });
    // Also invalidate all comments lists
    collectionInvalidators.comments(client);
  },
};

/**
 * Composite invalidation helpers for common scenarios
 */
export const compositeInvalidators = {
  /** Invalidate queries that change when tasks are modified */
  taskChange: (client: QueryClient, taskId?: string) => {
    collectionInvalidators.tasks(client);
    collectionInvalidators.projects(client); // Tasks affect project stats

    if (taskId) {
      client.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    }
  },

  /** Invalidate queries that change when users are modified */
  userChange: (client: QueryClient, userId?: string) => {
    collectionInvalidators.users(client);
    collectionInvalidators.tasks(client); // Users affect task assignments

    if (userId) {
      client.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    }
  },

  /** Invalidate queries that change when projects are modified */
  projectChange: (client: QueryClient, projectId?: string) => {
    collectionInvalidators.projects(client);
    collectionInvalidators.tasks(client); // Projects affect tasks

    if (projectId) {
      client.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    }
  },

  /** Invalidate all user project assignments */
  userProjectAssignment: (client: QueryClient) => {
    collectionInvalidators.users(client);
    collectionInvalidators.projects(client);
    collectionInvalidators.tasks(client);
  },

  /** Invalidate all comment-related queries */
  commentChange: (client: QueryClient, taskId?: string) => {
    collectionInvalidators.comments(client);

    if (taskId) {
      detailInvalidators.taskComments(client, taskId);
    }
  },
};

/**
 * Helper to create invalidation functions with specific patterns
 */
export function createInvalidator(
  patterns: Array<{
    // Use a broad type for predicate to align with React Query's predicate signature
    // without over-constraining the caller.
    predicate?: (query: unknown) => boolean;
    queryKey?: QueryKey;
  }>,
) {
  return (client: QueryClient) => {
    patterns.forEach(({ predicate, queryKey }) => {
      if (predicate) {
        client.invalidateQueries({ predicate });
      } else if (queryKey) {
        client.invalidateQueries({ queryKey });
      }
    });
  };
}
