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

  tags: createListQueryKeys("tags", {
    sort: "name",
    filter: "",
  }),

  notifications: {
    all: ["notifications"] as const,
    byUser: (userId: string) => ["notifications", "user", userId] as const,
    unreadCount: (userId: string) =>
      ["notifications", "unread-count", userId] as const,
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
  projectStatuses: {
    list: (projectId: string) =>
      ["project_statuses", "project", projectId] as const,
    byProject: (projectId: string) =>
      ["project_statuses", "project", projectId] as const,
  },
  subtasks: {
    listByTask: (taskId: string) => ["subtasks", "task", taskId] as const,
    all: ["subtasks"] as const,
  },

  timeEntries: {
    listByTask: (taskId: string) => ["time_entries", "task", taskId] as const,
    all: ["time_entries"] as const,
  },

  orgMembers: {
    all: ["organization_members"] as const,
    lists: () => ["organization_members", "list"] as const,
    list: (
      orgId: string | undefined,
      options?: { status?: string; role?: string },
    ) => ["organization_members", "list", orgId, options] as const,
    detail: (id: string) => ["organization_members", "detail", id] as const,
  },

  projectMembers: {
    all: ["project_members"] as const,
    lists: () => ["project_members", "list"] as const,
    list: (projectId: string | undefined) =>
      ["project_members", "list", projectId] as const,
    detail: (id: string) => ["project_members", "detail", id] as const,
  },

  orgInvites: {
    all: ["organization_invites"] as const,
    lists: () => ["organization_invites", "list"] as const,
    list: (orgId: string | undefined) =>
      ["organization_invites", "list", orgId] as const,
    listByToken: (token: string) =>
      ["organization_invites", "token", token] as const,
  },

  notificationsUnreadCount: (userId: string) =>
    ["notifications", "unread-count", userId] as const,
};
