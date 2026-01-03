import { useQuery } from "@tanstack/react-query";

import {
  type AuditLogsListParams,
  getAuditLogsForResource,
  listAuditLogs,
} from "@/lib/audit-log-service";

import { queryKeys } from "./query-keys";

export function useAuditLogs(params: AuditLogsListParams = {}) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => listAuditLogs(params),
    enabled: true,
  });
}

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
