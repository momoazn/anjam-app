/**
 * Project-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting projects.
 * Includes supervisor relationship handling and flexible sorting options.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb, ProjectWithSupervisor } from "../lib/pocketbase";
import { ProjectsResponse, ProjectsRecord } from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      projectData: Omit<ProjectsRecord, "id" | "created" | "updated">,
    ) => pb.collection("projects").create(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    ...options,
  });
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ProjectsRecord>;
    }) => pb.collection("projects").update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a project
 * @param options - Mutation options
 * @returns Mutation function for deleting projects
 */
export function useDeleteProject(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("projects").delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    ...options,
  });
}
