/**
 * Centralized query key factory for React Query cache management.
 */

import type { AuditLogsListParams } from "@/lib/audit-log-service";

/**
 * Factory function to create query keys for a resource
 */
function createQueryKeys<T extends string>(resource: T) {
  return {
    all: [resource] as const,
    lists: () => [resource, "list"] as const,
    detail: (id: string) => [resource, "detail", id] as const,
  };
}

/**
 * Helper to create list query keys with default options normalization
 */
function createListQueryKeys<
  T extends string,
  TOptions extends Record<string, unknown>,
>(resource: T, defaults: TOptions) {
  const base = createQueryKeys(resource);

  return {
    ...base,
    list: (options?: Partial<TOptions>) => {
      const merged = { ...defaults, ...(options ?? {}) } as TOptions;
      (Object.keys(defaults) as Array<keyof TOptions>).forEach((key) => {
        if (options?.[key] === undefined) {
          (merged as Record<string, unknown>)[key as string] = defaults[key];
        }
      });
      return [...base.lists(), merged] as [string, string, TOptions];
    },
  };
}

export const queryKeys = {
  tasks: createListQueryKeys("tasks", {
    projectId: "all",
    expandFields: "project,assignee",
    mode: "paged" as "paged" | "full",
    page: 1,
    perPage: 50,
    filter: "",
  }),

  projects: createListQueryKeys("projects", {
    sort: "-created",
    batch: 100,
  }),

  users: {
    ...createListQueryKeys("users", {
      sort: "-created",
      batch: 100,
      filter: null as string | null,
    }),
    projectUsers: (projectId: string) =>
      ["users", "project", projectId] as const,
    allProjectUsers: () => ["users", "project-users"] as const,
  },

  comments: {
    all: ["comments"] as const,
    lists: () => ["comments", "list"] as const,
    byTask: (taskId: string) => ["comments", "list", "task", taskId] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    byUser: (userId: string) => ["notifications", "user", userId] as const,
  },

  groups: {
    all: ["groups"] as const,
    lists: () => ["groups", "list"] as const,
    details: () => ["groups", "detail"] as const,
    detail: (id: string) => ["groups", "detail", id] as const,
    users: (groupId: string) => ["groups", "detail", groupId, "users"] as const,
    projects: (groupId: string) =>
      ["groups", "detail", groupId, "projects"] as const,
    stats: (groupId: string) => ["groups", "detail", groupId, "stats"] as const,
  },

  auditLogs: {
    all: ["audit_logs"] as const,
    lists: () => ["audit_logs", "list"] as const,
    list: (params?: AuditLogsListParams) => {
      const defaults = {
        page: 1,
        perPage: 50,
        resource: "",
        resourceId: "",
        actor: "",
        action: "",
        client: "",
        dateFrom: "",
        dateTo: "",
        search: "",
      };
      const merged = { ...defaults, ...(params ?? {}) };
      (Object.keys(defaults) as Array<keyof typeof defaults>).forEach((key) => {
        if (params?.[key] === undefined) {
          (merged as Record<string, unknown>)[key as string] = defaults[key];
        }
      });
      return ["audit_logs", "list", merged] as const;
    },
    resource: (resource: string, resourceId: string, page = 1, perPage = 50) =>
      [
        "audit_logs",
        "list",
        "resource",
        resource,
        resourceId,
        page,
        perPage,
      ] as const,
  },
} as const;
