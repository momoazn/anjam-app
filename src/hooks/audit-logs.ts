/**
 * Audit Logs React Query hooks
 *
 * Provides hooks for fetching audit logs for admin console and resource-specific history.
 */
import { useQuery } from "@tanstack/react-query";

import {
  type AuditLogsListParams,
  getAuditLogsForResource,
  listAuditLogs,
} from "@/lib/audit-log-service";

import { queryKeys } from "./query-keys";

/**
 * Hook to fetch audit logs for admin console with filters
 */
export function useAuditLogs(params: AuditLogsListParams = {}) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => listAuditLogs(params),
    enabled: true,
  });
}

/**
 * Hook to fetch audit logs for a specific resource (task, project, etc.)
 */
export function useResourceAuditLogs(
  resource: string,
  resourceId: string,
  options: { page?: number; perPage?: number; enabled?: boolean } = {},
) {
  const { page = 1, perPage = 50, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.auditLogs.resource(resource, resourceId, page, perPage),
    queryFn: () => getAuditLogsForResource(resource, resourceId, page, perPage),
    enabled: enabled && !!resource && !!resourceId,
  });
}
