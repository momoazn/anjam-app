import PocketBase from "pocketbase";

import type {
  ProjectsResponse,
  TasksResponse,
  TypedPocketBase,
  UsersResponse,
} from "./pocketbase-types";

// During development, the PocketBase server is running on localhost:8090
// and the frontend is running on another port, so we need to specify the host
// But in production, the frontend is served by PocketBase itself, so we can use '/'
//
// 👉 Be sure to keep a trailing / in the baseUrl as its value is used to build
//    other URLs for images and links and those would break if the trailing / is missing
const baseUrl = import.meta.env.PROD ? "/" : "http://127.0.0.1:8090/";

export const pb = new PocketBase(baseUrl) as TypedPocketBase;

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
}>;
export type ProjectWithSupervisor = ProjectsResponse<{
  supervisor: UsersResponse;
}>;
