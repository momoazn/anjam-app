import PocketBase from "pocketbase";

import type {
  ProjectsResponse,
  TagsResponse,
  TasksResponse,
  TypedPocketBase,
  UsersResponse,
} from "./pocketbase-types";

const baseUrl = import.meta.env.PROD ? "/" : "http://127.0.0.1:8090/";

export const pb = new PocketBase(baseUrl) as TypedPocketBase;

// Attach org context to all API requests
pb.beforeSend = function (_url, options) {
  const storage = localStorage.getItem("anjam-auth-storage");
  if (storage) {
    try {
      const parsed = JSON.parse(storage);
      const orgId = parsed?.state?.currentOrganization?.id;

      if (orgId) {
        options.headers = { ...options.headers, "X-Organization-ID": orgId };
      }
    } catch {
      // Ignore parse errors
    }
  }

  return options;
};

export type TaskWithProject = TasksResponse<{
  project: ProjectsResponse;
  assignee?: UsersResponse;
  creator: UsersResponse;
  tags?: TagsResponse[];
  status_ref: Record<string, unknown>;
}>;
export type ProjectWithSupervisor = ProjectsResponse<{
  supervisor: UsersResponse;
}>;
