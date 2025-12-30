import PocketBase from "pocketbase";

import type {
  ProjectsResponse,
  TasksResponse,
  TypedPocketBase,
  UsersResponse,
  TagsResponse,
} from "./pocketbase-types";

// During development, the PocketBase server is running on localhost:8090
// and the frontend is running on another port, so we need to specify the host
// But in production, the frontend is served by PocketBase itself, so we can use '/'
//
// 👉 Be sure to keep a trailing / in the baseUrl as its value is used to build
//    other URLs for images and links and those would break if the trailing / is missing
const baseUrl = import.meta.env.PROD ? "/" : "http://127.0.0.1:8090/";

export const pb = new PocketBase(baseUrl) as TypedPocketBase;

/**
 * Automatically attach organization context to all API requests
 *
 * This allows the backend to:
 * 1. Verify org context in API endpoints
 * 2. Enforce mode-based restrictions on operations
 * 3. Audit which org each operation belongs to
 *
 * Reads from localStorage to avoid circular dependency with auth-store.ts
 */
pb.beforeSend = function (_url, options) {
  try {
    const storage = localStorage.getItem("anjam-auth-storage");
    if (storage) {
      const parsed = JSON.parse(storage);
      const orgId = parsed?.state?.currentOrganization?.id;

      if (orgId && options.headers) {
        options.headers["X-Organization-ID"] = orgId;
      }
    }
  } catch (err) {
    // Silently fail - not critical if header missing
    console.warn("Failed to attach org context:", err);
  }

  return options;
};

export async function customApiCall<TResponse>(
  path: string,
  options?: Parameters<typeof pb.send>[1],
) {
  return pb.send<TResponse>(path, options ?? {});
}

export type TaskWithProject = TasksResponse<{
  project: ProjectsResponse;
  assignee?: UsersResponse; // Make assignee optional in expand
  creator: UsersResponse;
  tags?: TagsResponse[];
  status_ref: Record<string, unknown>; // For status expansion
}>;
export type ProjectWithSupervisor = ProjectsResponse<{
  supervisor: UsersResponse;
}>;
