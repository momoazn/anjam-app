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
  UsersResponse,
} from "./pocketbase-types";

// Sensitive fields that should be masked in the UI
// Normalized to lowercase Set for O(1) case-insensitive matching
const SENSITIVE_FIELDS_SET = new Set(
  [
    "password",
    "token",
    "tokenKey", // Will be normalized to "tokenkey"
    "accessKey", // Will be normalized to "accesskey"
    "oauth_secret",
    "private_notes",
  ].map((f) => f.toLowerCase()),
);

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
  items: AuditLogsResponse<
    Record<string, FieldDiff> | null,
    { actor?: UsersResponse }
  >[];
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
    // Case-insensitive check: normalize key to lowercase and check against normalized set
    if (SENSITIVE_FIELDS_SET.has(key.toLowerCase())) {
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
    // Escape quotes and special characters in search term to prevent injection
    const escapedSearch = search
      .replace(/\\/g, "\\\\") // Escape backslashes first
      .replace(/"/g, '\\"') // Escape double quotes
      .replace(/'/g, "\\'"); // Escape single quotes
    // Search in message or request_id
    filters.push(
      `(message~"${escapedSearch}" || request_id~"${escapedSearch}")`,
    );
  }

  const filter = filters.length > 0 ? filters.join(" && ") : "";

  // Fetch with pagination
  const result = await pb
    .collection("audit_logs")
    .getList<
      AuditLogsResponse<
        Record<string, FieldDiff> | null,
        { actor?: UsersResponse }
      >
    >(page, perPage, {
      filter,
      sort: "-created", // Most recent first
      expand: "actor", // Expand actor relation to get user details
    });

  // Mask sensitive fields in changes
  // Handle both string (legacy) and object (current) formats
  const maskedItems = result.items.map((item) => {
    if (item.changes) {
      let changes: Record<string, FieldDiff> | null = null;

      if (typeof item.changes === "string") {
        // Legacy format: stringified JSON
        changes = parseAndMaskChanges(item.changes);
      } else if (typeof item.changes === "object" && item.changes !== null) {
        // Current format: JSON object
        try {
          changes = maskSensitiveFields(
            item.changes as Record<string, FieldDiff>,
          );
        } catch {
          // If parsing fails, try to parse as string
          changes = parseAndMaskChanges(JSON.stringify(item.changes));
        }
      }

      if (changes) {
        return {
          ...item,
          changes,
        } satisfies AuditLogsResponse<
          Record<string, FieldDiff> | null,
          { actor?: UsersResponse }
        >;
      }
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
