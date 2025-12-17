/**
 * Project-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting projects.
 * Includes supervisor relationship handling and flexible sorting options.
 */

import {
  useQuery,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb, ProjectWithSupervisor } from "../lib/pocketbase";
import { ProjectsResponse, ProjectsRecord } from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

type CreateProjectVariables = Omit<ProjectsRecord, "id" | "created" | "updated">;
type UpdateProjectVariables = { id: string; updates: Partial<ProjectsRecord> };

const useCreateProjectMutation = createMutation<
  ProjectsResponse,
  Error,
  CreateProjectVariables
>((projectData) => pb.collection("projects").create(projectData), (client) => {
  client.invalidateQueries({ queryKey: queryKeys.projects.all });
  client.invalidateQueries({ queryKey: queryKeys.projects.lists() });
  client.invalidateQueries({ queryKey: queryKeys.tasks.all });
  client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
  client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
});

const useUpdateProjectMutation = createMutation<
  ProjectsResponse,
  Error,
  UpdateProjectVariables
>(({ id, updates }) => pb.collection("projects").update(id, updates), (client, _data, variables) => {
  client.invalidateQueries({ queryKey: queryKeys.projects.all });
  client.invalidateQueries({ queryKey: queryKeys.projects.lists() });

  if (variables?.id) {
    client.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.id) });
    client.invalidateQueries({
      queryKey: [...queryKeys.projects.detail(variables.id), "supervisor"],
    });
  }

  client.invalidateQueries({ queryKey: queryKeys.tasks.all });
  client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

  client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
});

const useDeleteProjectMutation = createMutation<void, Error, string>(
  async (id) => {
    await pb.collection("projects").delete(id);
  },
  (client, _data, projectId) => {
    client.invalidateQueries({ queryKey: queryKeys.projects.all });
    client.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    client.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    client.invalidateQueries({
      queryKey: [...queryKeys.projects.detail(projectId), "supervisor"],
    });

    client.invalidateQueries({ queryKey: queryKeys.tasks.all });
    client.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    client.invalidateQueries({ queryKey: queryKeys.users.allProjectUsers() });
  },
);

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
    CreateProjectVariables
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
    UpdateProjectVariables
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
  options?: UseMutationOptions<void, Error, string>,
) {
  return useDeleteProjectMutation(options);
}
