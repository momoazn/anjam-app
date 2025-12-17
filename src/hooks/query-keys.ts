/**
 * Centralized query key factory for React Query cache management.
 */

import type { AuditLogsListParams } from "@/lib/audit-log-service";

const normalizeListOptions = <T extends Record<string, unknown>>(
  defaults: T,
  options?: Partial<T>,
) => ({ ...defaults, ...options });

export const queryKeys = {
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (
      projectId?: string,
      expandFields?: string,
      mode?: "paged" | "full",
      page?: number,
      perPage?: number,
      filter?: string,
    ) =>
      [
        ...queryKeys.tasks.lists(),
        normalizeListOptions(
          {
            projectId: "all",
            expandFields: "project,assignee",
            mode: "paged" as "paged" | "full",
            page: 1,
            perPage: 50,
            filter: "",
          },
          { projectId, expandFields, mode, page, perPage, filter },
        ),
      ] as const,
    detail: (id: string) => [...queryKeys.tasks.all, "detail", id] as const,
  },

  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (options?: { sort?: string; batch?: number }) =>
      [
        ...queryKeys.projects.lists(),
        normalizeListOptions(
          {
            sort: "-created",
            batch: 100,
          },
          options,
        ),
      ] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
  },

  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (options?: {
      sort?: string;
      batch?: number;
      filter?: string | null;
    }) => {
      return [
        ...queryKeys.users.lists(),
        normalizeListOptions(
          {
            batch: 100,
            sort: "-created",
            filter: null as string | null,
          },
          options,
        ),
      ] as const;
    },
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    projectUsers: (projectId: string) =>
      [...queryKeys.users.all, "project", projectId] as const,
    allProjectUsers: () => [...queryKeys.users.all, "project-users"] as const,
  },

  comments: {
    all: ["comments"] as const,
    lists: () => [...queryKeys.comments.all, "list"] as const,
    byTask: (taskId: string) =>
      [...queryKeys.comments.lists(), "task", taskId] as const,
  },

  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
    users: (groupId: string) =>
      [...queryKeys.groups.detail(groupId), "users"] as const,
    projects: (groupId: string) =>
      [...queryKeys.groups.detail(groupId), "projects"] as const,
    stats: (groupId: string) =>
      [...queryKeys.groups.detail(groupId), "stats"] as const,
  },

  auditLogs: {
    all: ["audit_logs"] as const,
    lists: () => [...queryKeys.auditLogs.all, "list"] as const,
    list: (params?: AuditLogsListParams) =>
      [
        ...queryKeys.auditLogs.lists(),
        normalizeListOptions(
          {
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
          },
          params,
        ),
      ] as const,
    resource: (resource: string, resourceId: string, page = 1, perPage = 50) =>
      [
        ...queryKeys.auditLogs.lists(),
        "resource",
        resource,
        resourceId,
        page,
        perPage,
      ] as const,
  },
} as const;
