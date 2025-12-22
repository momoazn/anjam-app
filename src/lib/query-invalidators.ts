/**
 * Query invalidation helpers for standardized cache management
 * Provides reusable invalidation patterns for collections and related data
 */

import { QueryClient, QueryKey } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";

/**
 * Factory to create collection invalidator for a resource
 */
function createCollectionInvalidator(
  _resource: string,
  allKey: readonly string[],
  listsKey: () => readonly string[],
  additionalKeys?: Array<() => readonly string[]>,
) {
  return (client: QueryClient) => {
    client.invalidateQueries({ queryKey: allKey });
    client.invalidateQueries({ queryKey: listsKey() });
    additionalKeys?.forEach((keyFn) => {
      client.invalidateQueries({ queryKey: keyFn() });
    });
  };
}

/**
 * Collection-based invalidation helpers
 */
export const collectionInvalidators = {
  tasks: createCollectionInvalidator(
    "tasks",
    queryKeys.tasks.all,
    queryKeys.tasks.lists,
  ),
  projects: createCollectionInvalidator(
    "projects",
    queryKeys.projects.all,
    queryKeys.projects.lists,
  ),
  users: createCollectionInvalidator(
    "users",
    queryKeys.users.all,
    queryKeys.users.lists,
    [queryKeys.users.allProjectUsers],
  ),
  groups: createCollectionInvalidator(
    "groups",
    queryKeys.groups.all,
    queryKeys.groups.lists,
  ),
  comments: createCollectionInvalidator(
    "comments",
    queryKeys.comments.all,
    queryKeys.comments.lists,
  ),
  tags: createCollectionInvalidator(
    "tags",
    queryKeys.tags.all,
    queryKeys.tags.lists,
  ),
};

/**
 * Factory to create detail invalidator for a resource
 */
function createDetailInvalidator(
  collectionInvalidator: (client: QueryClient) => void,
  detailKeyFn: (id: string) => readonly string[],
) {
  return (client: QueryClient, id: string) => {
    collectionInvalidator(client);
    client.invalidateQueries({ queryKey: detailKeyFn(id) });
  };
}

/**
 * Detail invalidation helpers
 */
export const detailInvalidators = {
  task: createDetailInvalidator(
    collectionInvalidators.tasks,
    queryKeys.tasks.detail,
  ),
  project: createDetailInvalidator(
    collectionInvalidators.projects,
    queryKeys.projects.detail,
  ),
  user: createDetailInvalidator(
    collectionInvalidators.users,
    queryKeys.users.detail,
  ),
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
 * Factory to create standard CRUD invalidators
 */
function createStandardCrudInvalidators(
  _collectionInvalidator: (client: QueryClient) => void,
  detailInvalidator: (client: QueryClient, id: string) => void,
  compositeChange: (client: QueryClient, id?: string) => void,
) {
  return {
    create: (client: QueryClient) => compositeChange(client),
    update: (client: QueryClient, id?: string) =>
      id ? detailInvalidator(client, id) : compositeChange(client),
    delete: (client: QueryClient, id?: string) =>
      id ? detailInvalidator(client, id) : compositeChange(client),
  };
}

/**
 * Factory to create CRUD invalidators with additional invalidations
 */
function createCrudInvalidatorsWithExtras(
  _collectionInvalidator: (client: QueryClient) => void,
  detailInvalidator: (client: QueryClient, id: string) => void,
  compositeChange: (client: QueryClient, id?: string) => void,
  extraInvalidations?: (client: QueryClient, id?: string) => void,
) {
  return {
    create: (client: QueryClient) => {
      compositeChange(client);
      extraInvalidations?.(client);
    },
    update: (client: QueryClient, id?: string) => {
      if (id) {
        detailInvalidator(client, id);
      } else {
        compositeChange(client);
      }
      extraInvalidations?.(client, id);
    },
    delete: (client: QueryClient, id?: string) => {
      if (id) {
        detailInvalidator(client, id);
      } else {
        compositeChange(client);
      }
      extraInvalidations?.(client, id);
    },
  };
}

/**
 * Preset invalidators for common CRUD mutation patterns.
 */
export const mutationInvalidators = {
  crud: {
    tasks: {
      ...createStandardCrudInvalidators(
        collectionInvalidators.tasks,
        detailInvalidators.task,
        compositeInvalidators.taskChange,
      ),
      bulk: (client: QueryClient) => {
        collectionInvalidators.tasks(client);
        collectionInvalidators.projects(client);
      },
      reorder: (client: QueryClient) => collectionInvalidators.tasks(client),
    },
    projects: {
      ...createCrudInvalidatorsWithExtras(
        collectionInvalidators.projects,
        detailInvalidators.project,
        compositeInvalidators.projectChange,
        (client) => {
          client.invalidateQueries({
            queryKey: queryKeys.users.allProjectUsers(),
          });
        },
      ),
    },
    users: {
      ...createStandardCrudInvalidators(
        collectionInvalidators.users,
        detailInvalidators.user,
        compositeInvalidators.userChange,
      ),
      adminAction: (client: QueryClient, userId?: string) =>
        userId
          ? detailInvalidators.user(client, userId)
          : compositeInvalidators.userChange(client),
    },
    comments: {
      create: (client: QueryClient, taskId?: string) =>
        compositeInvalidators.commentChange(client, taskId),
      update: (client: QueryClient, taskId?: string) =>
        compositeInvalidators.commentChange(client, taskId),
      delete: (client: QueryClient, taskId?: string) =>
        compositeInvalidators.commentChange(client, taskId),
    },
    tags: {
      create: (client: QueryClient) => collectionInvalidators.tags(client),
      update: (client: QueryClient) => collectionInvalidators.tags(client),
      delete: (client: QueryClient) => collectionInvalidators.tags(client),
    },
    groups: {
      ...createCrudInvalidatorsWithExtras(
        collectionInvalidators.groups,
        (client, id) => {
          collectionInvalidators.groups(client);
          client.invalidateQueries({
            queryKey: queryKeys.groups.detail(id),
          });
        },
        (client) => {
          collectionInvalidators.groups(client);
          collectionInvalidators.projects(client);
        },
        (client, id) => {
          collectionInvalidators.projects(client);
          if (id) {
            client.invalidateQueries({
              queryKey: queryKeys.groups.detail(id),
            });
          }
        },
      ),
    },
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
