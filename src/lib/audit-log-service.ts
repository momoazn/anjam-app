/**
 * Audit Log Service
 *
 * Provides type-safe functions for fetching audit logs with filtering and pagination.
 * Includes sensitive field masking for security.
 */

import { pb } from "./pocketbase";
import type {
  AuditLogsResponse,
  AuditLogsActionOptions,
  AuditLogsClientOptions,
} from "./pocketbase-types";

// Sensitive fields that should be masked in the UI
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "tokenKey",
  "accessKey",
  "oauth_secret",
  "private_notes",
];

export type AuditLogsListParams = {
  page?: number;
  perPage?: number;
  resource?: string;
  resourceId?: string;
  actor?: string;
  action?: AuditLogsActionOptions;
  client?: AuditLogsClientOptions;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  search?: string; // Search in message or request_id
};

export type AuditLogsListResult = {
  items: AuditLogsResponse[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type FieldDiff = {
  old: unknown;
  new: unknown;
};

/**
 * Masks sensitive field values in changes JSON
 */
function maskSensitiveFields(
  changes: Record<string, FieldDiff>,
): Record<string, FieldDiff> {
  const masked: Record<string, FieldDiff> = {};
  for (const [key, diff] of Object.entries(changes)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      masked[key] = {
        old: diff.old !== null && diff.old !== undefined ? "••••" : diff.old,
        new: diff.new !== null && diff.new !== undefined ? "••••" : diff.new,
      };
    } else {
      masked[key] = diff;
    }
  }
  return masked;
}

/**
 * Parses changes JSON string and masks sensitive fields
 */
function parseAndMaskChanges(
  changesStr: string | null | undefined,
): Record<string, FieldDiff> | null {
  if (!changesStr) return null;
  try {
    const changes = JSON.parse(changesStr) as Record<string, FieldDiff>;
    return maskSensitiveFields(changes);
  } catch {
    return null;
  }
}

/**
 * Lists audit logs with filtering and pagination
 */
export async function listAuditLogs(
  params: AuditLogsListParams = {},
): Promise<AuditLogsListResult> {
  const {
    page = 1,
    perPage = 50,
    resource,
    resourceId,
    actor,
    action,
    client,
    dateFrom,
    dateTo,
    search,
  } = params;

  // Build filter string
  const filters: string[] = [];

  if (resource) {
    filters.push(`resource="${resource}"`);
  }

  if (resourceId) {
    filters.push(`resource_id="${resourceId}"`);
  }

  if (actor) {
    filters.push(`actor="${actor}"`);
  }

  if (action) {
    filters.push(`action="${action}"`);
  }

  if (client) {
    filters.push(`client="${client}"`);
  }

  if (dateFrom) {
    filters.push(`created>="${dateFrom}"`);
  }

  if (dateTo) {
    filters.push(`created<="${dateTo}"`);
  }

  if (search) {
    // Search in message or request_id
    filters.push(`(message~"${search}" || request_id~"${search}")`);
  }

  const filter = filters.length > 0 ? filters.join(" && ") : "";

  // Fetch with pagination
  const result = await pb
    .collection("audit_logs")
    .getList<AuditLogsResponse>(page, perPage, {
      filter,
      sort: "-created", // Most recent first
      expand: "actor", // Expand actor relation to get user details
    });

  // Mask sensitive fields in changes
  const maskedItems = result.items.map((item) => {
    if (item.changes && typeof item.changes === "string") {
      const maskedChanges = parseAndMaskChanges(item.changes);
      return {
        ...item,
        changes: maskedChanges,
      };
    }
    return item;
  });

  return {
    items: maskedItems,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

/**
 * Gets audit logs for a specific resource (task, project, etc.)
 */
export async function getAuditLogsForResource(
  resource: string,
  resourceId: string,
  page = 1,
  perPage = 50,
): Promise<AuditLogsListResult> {
  return listAuditLogs({
    resource,
    resourceId,
    page,
    perPage,
  });
}
