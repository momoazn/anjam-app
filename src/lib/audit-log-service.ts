/**
 * Audit Log Service - Type-safe functions for fetching audit logs with filtering and pagination
 */
import { pb } from "./pocketbase";
import type {
  AuditLogsActionOptions,
  AuditLogsClientOptions,
  AuditLogsResponse,
  UsersResponse,
} from "./pocketbase-types";

const SENSITIVE_FIELDS_SET = new Set(
  [
    "password",
    "token",
    "tokenKey",
    "accessKey",
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
  dateFrom?: string;
  dateTo?: string;
  search?: string;
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

function maskSensitiveFields(
  changes: Record<string, FieldDiff>,
): Record<string, FieldDiff> {
  const masked: Record<string, FieldDiff> = {};
  for (const [key, diff] of Object.entries(changes)) {
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

  const filters: string[] = [];

  if (resource) filters.push(`resource="${resource}"`);
  if (resourceId) filters.push(`resource_id="${resourceId}"`);
  if (actor) filters.push(`actor="${actor}"`);
  if (action) filters.push(`action="${action}"`);
  if (client) filters.push(`client="${client}"`);
  if (dateFrom) filters.push(`created>="${dateFrom}"`);
  if (dateTo) filters.push(`created<="${dateTo}"`);

  if (search) {
    const escapedSearch = search
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'");
    filters.push(
      `(message~"${escapedSearch}" || request_id~"${escapedSearch}")`,
    );
  }

  const filter = filters.length > 0 ? filters.join(" && ") : "";

  const result = await pb
    .collection("audit_logs")
    .getList<
      AuditLogsResponse<
        Record<string, FieldDiff> | null,
        { actor?: UsersResponse }
      >
    >(page, perPage, {
      filter,
      sort: "-created",
      expand: "actor",
    });

  const maskedItems = result.items.map((item) => {
    if (item.changes) {
      let changes: Record<string, FieldDiff> | null = null;

      if (typeof item.changes === "string") {
        changes = parseAndMaskChanges(item.changes);
      } else if (typeof item.changes === "object" && item.changes !== null) {
        try {
          changes = maskSensitiveFields(
            item.changes as Record<string, FieldDiff>,
          );
        } catch {
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

export async function getAuditLogsForResource(
  resource: string,
  resourceId: string,
  page = 1,
  perPage = 50,
): Promise<AuditLogsListResult> {
  return listAuditLogs({ resource, resourceId, page, perPage });
}
