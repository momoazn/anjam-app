import { UseMutationOptions, useQuery } from "@tanstack/react-query";

import { ProjectWithSupervisor, pb } from "../lib/pocketbase";
import { ProjectsRecord, ProjectsResponse } from "../lib/pocketbase-types";
import { STALE_TIMES } from "../lib/query-config";
import { mutationInvalidators } from "../lib/query-invalidators";
import { createCrudHooks } from "./factories/use-crud-factory";
import { queryKeys } from "./query-keys";

const {
  useCreate: useCreateProjectMutation,
  useUpdate: useUpdateProjectMutation,
  useDelete: useDeleteProjectMutation,
} = createCrudHooks<ProjectsRecord, ProjectsResponse>({
  collection: "projects",
  queryKeys: queryKeys.projects,
  invalidators: mutationInvalidators.crud.projects,
});

export function useProjects(
  options: {
    enabled?: boolean;
    batch?: number;
    sort?: string;
  } = {},
) {
  const { enabled = true, batch = 100, sort = "-created" } = options;

  return useQuery({
    queryKey: queryKeys.projects.list({ batch, sort }),
    queryFn: () =>
      pb.collection("projects").getFullList<ProjectsResponse>({
        batch,
        sort,
      }),
    enabled,
    staleTime: STALE_TIMES.reference,
  });
}

export function useProject(options: { id: string; enabled?: boolean }) {
  const { id, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => pb.collection("projects").getOne<ProjectsResponse>(id),
    enabled: enabled && Boolean(id),
    staleTime: STALE_TIMES.reference,
  });
}

export function useProjectWithSupervisor(options: {
  id: string;
  enabled?: boolean;
}) {
  const { id, enabled = true } = options;

  return useQuery({
    queryKey: [...queryKeys.projects.detail(id), "supervisor"],
    queryFn: () =>
      pb.collection("projects").getOne<ProjectWithSupervisor>(id, {
        expand: "supervisor",
      }),
    enabled: enabled && Boolean(id),
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateProject(
  options?: UseMutationOptions<
    ProjectsResponse,
    Error,
    Omit<ProjectsRecord, "id" | "created" | "updated">
  >,
) {
  return useCreateProjectMutation(options);
}

export function useUpdateProject(
  options?: UseMutationOptions<
    ProjectsResponse,
    Error,
    { id: string; updates: Partial<ProjectsRecord> }
  >,
) {
  return useUpdateProjectMutation(options);
}

export function useDeleteProject(
  options?: UseMutationOptions<ProjectsResponse, Error, string>,
) {
  return useDeleteProjectMutation(options);
}
