/**
 * Project-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting projects.
 * Includes supervisor relationship handling and flexible sorting options.
 */
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

/**
 * Hook to fetch all projects
 * @param options - Configuration options for the query
 * @returns React Query result with projects data
 */
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

/**
 * Hook to fetch a single project by ID
 * @param options - Configuration options for the query
 * @returns React Query result with project data
 */
export function useProject(options: { id: string; enabled?: boolean }) {
  const { id, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => pb.collection("projects").getOne<ProjectsResponse>(id),
    enabled: enabled && Boolean(id),
    staleTime: STALE_TIMES.reference,
  });
}

/**
 * Hook to fetch a single project by ID with supervisor expanded
 * @param options - Configuration options for the query
 * @returns React Query result with project data including supervisor
 */
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

/**
 * Hook to create a new project
 * @param options - Mutation options
 * @returns Mutation function for creating projects
 */
export function useCreateProject(
  options?: UseMutationOptions<
    ProjectsResponse,
    Error,
    Omit<ProjectsRecord, "id" | "created" | "updated">
  >,
) {
  return useCreateProjectMutation(options);
}

/**
 * Hook to update an existing project
 * @param options - Mutation options
 * @returns Mutation function for updating projects
 */
export function useUpdateProject(
  options?: UseMutationOptions<
    ProjectsResponse,
    Error,
    { id: string; updates: Partial<ProjectsRecord> }
  >,
) {
  return useUpdateProjectMutation(options);
}

/**
 * Hook to delete a project
 * @param options - Mutation options
 * @returns Mutation function for deleting projects
 */
export function useDeleteProject(
  options?: UseMutationOptions<ProjectsResponse, Error, string>,
) {
  return useDeleteProjectMutation(options);
}
