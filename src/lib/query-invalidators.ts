import { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";

export const collectionInvalidators = {
  tasks: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
  },
  projects: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.projects.all });
    client.invalidateQueries({ queryKey: queryKeys.projects.lists() });
  },
  users: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.users.all });
    client.invalidateQueries({ queryKey: queryKeys.users.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
  },
  comments: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.comments.all });
    client.invalidateQueries({ queryKey: queryKeys.comments.lists() });
  },
  tags: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.tags.all });
    client.invalidateQueries({ queryKey: queryKeys.tags.lists() });
  },
};

export const detailInvalidators = {
  task: (client: QueryClient, id: string) => {
    collectionInvalidators.tasks(client);
    client.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
  },
  project: (client: QueryClient, id: string) => {
    collectionInvalidators.projects(client);
    client.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
  },
  user: (client: QueryClient, id: string) => {
    collectionInvalidators.users(client);
    client.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
  },
  taskComments: (client: QueryClient, taskId: string) => {
    client.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) });
    collectionInvalidators.comments(client);
  },
};

export const compositeInvalidators = {
  taskChange: (client: QueryClient, taskId?: string) => {
    collectionInvalidators.tasks(client);
    collectionInvalidators.projects(client);
    if (taskId) {
      client.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    }
  },
  userChange: (client: QueryClient, userId?: string) => {
    collectionInvalidators.users(client);
    collectionInvalidators.tasks(client);
    if (userId) {
      client.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    }
  },
  projectChange: (client: QueryClient, projectId?: string) => {
    collectionInvalidators.projects(client);
    collectionInvalidators.tasks(client);
    if (projectId) {
      client.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    }
  },
  userProjectAssignment: (client: QueryClient) => {
    collectionInvalidators.users(client);
    collectionInvalidators.projects(client);
    collectionInvalidators.tasks(client);
  },
  commentChange: (client: QueryClient, taskId?: string) => {
    collectionInvalidators.comments(client);
    if (taskId) {
      detailInvalidators.taskComments(client, taskId);
    }
  },
};

export const mutationInvalidators = {
  crud: {
    tasks: {
      create: compositeInvalidators.taskChange,
      update: (client: QueryClient, id?: string) =>
        id
          ? detailInvalidators.task(client, id)
          : compositeInvalidators.taskChange(client),
      delete: (client: QueryClient, id?: string) =>
        id
          ? detailInvalidators.task(client, id)
          : compositeInvalidators.taskChange(client),
      bulk: (client: QueryClient) => {
        collectionInvalidators.tasks(client);
        collectionInvalidators.projects(client);
      },
      reorder: (client: QueryClient) => collectionInvalidators.tasks(client),
    },
    projects: {
      create: compositeInvalidators.projectChange,
      update: (client: QueryClient, id?: string) => {
        if (id) {
          detailInvalidators.project(client, id);
        } else {
          compositeInvalidators.projectChange(client);
        }
        client.invalidateQueries({
          queryKey: queryKeys.users.allProjectUsers(),
        });
      },
      delete: (client: QueryClient, id?: string) =>
        id
          ? detailInvalidators.project(client, id)
          : compositeInvalidators.projectChange(client),
    },
    users: {
      create: compositeInvalidators.userChange,
      update: (client: QueryClient, id?: string) =>
        id
          ? detailInvalidators.user(client, id)
          : compositeInvalidators.userChange(client),
      delete: (client: QueryClient, id?: string) =>
        id
          ? detailInvalidators.user(client, id)
          : compositeInvalidators.userChange(client),
      adminAction: (client: QueryClient, userId?: string) =>
        userId
          ? detailInvalidators.user(client, userId)
          : compositeInvalidators.userChange(client),
    },
    comments: {
      create: (client: QueryClient, data?: { task?: string }) =>
        compositeInvalidators.commentChange(client, data?.task),
      update: (client: QueryClient, data?: { task?: string }) =>
        compositeInvalidators.commentChange(client, data?.task),
      delete: (client: QueryClient, data?: { task?: string }) =>
        compositeInvalidators.commentChange(client, data?.task),
    },
    tags: {
      create: (client: QueryClient) => collectionInvalidators.tags(client),
      update: (client: QueryClient) => collectionInvalidators.tags(client),
      delete: (client: QueryClient) => collectionInvalidators.tags(client),
    },
  },
};

export function createInvalidator(
  patterns: Array<{
    predicate?: (query: unknown) => boolean;
    queryKey?: unknown;
  }>,
) {
  return (client: QueryClient) => {
    patterns.forEach(({ predicate, queryKey }) => {
      if (predicate) {
        client.invalidateQueries({ predicate });
      } else if (queryKey) {
        client.invalidateQueries({ queryKey: queryKey as readonly unknown[] });
      }
    });
  };
}
