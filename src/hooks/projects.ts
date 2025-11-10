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
    onMutate: async (newProject) => {
      // Cancel outgoing refetches for all project-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<ProjectsResponse[]>({
        queryKey: queryKeys.projects.all,
      });

      // Optimistically update cache with new project
      const optimisticProject = {
        ...newProject,
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      } as ProjectsResponse;

      queryClient.setQueriesData<ProjectsResponse[]>(
        { queryKey: queryKeys.projects.all },
        (old: ProjectsResponse[] | undefined) => {
          if (!old) return [optimisticProject];
          return [optimisticProject, ...old];
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful creation
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      // Invalidate tasks as new project might affect task filtering
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      options?.onSuccess?.(data, variables, context);
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
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches for all project-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<ProjectsResponse[]>({
        queryKey: queryKeys.projects.all,
      });

      // Optimistically update cache
      queryClient.setQueriesData<ProjectsResponse[]>(
        { queryKey: queryKeys.projects.all },
        (old: ProjectsResponse[] | undefined) => {
          if (!old) return old;
          return old.map((project: ProjectsResponse) => {
            if (project.id === id) {
              return { ...project, ...updates } as ProjectsResponse;
            }
            return project;
          });
        },
      );

      // Also update specific project detail queries
      queryClient.setQueryData<ProjectsResponse>(
        queryKeys.projects.detail(id),
        (old) => {
          if (!old) return old;
          return { ...old, ...updates } as ProjectsResponse;
        },
      );

      // Update project with supervisor query
      queryClient.setQueryData<ProjectWithSupervisor>(
        [...queryKeys.projects.detail(id), "supervisor"],
        (old) => {
          if (!old) return old;
          return { ...old, ...updates } as ProjectWithSupervisor;
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful update
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      // Invalidate specific project detail
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.projects.detail(variables.id), "supervisor"],
        });
      }

      // Invalidate tasks if project status or other relevant fields changed
      if (variables?.updates) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      }

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      options?.onSuccess?.(data, variables, context);
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
    onMutate: async (id: string) => {
      // Cancel outgoing refetches for all project-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<ProjectsResponse[]>({
        queryKey: queryKeys.projects.all,
      });

      // Optimistically remove project from cache
      queryClient.setQueriesData<ProjectsResponse[]>(
        { queryKey: queryKeys.projects.all },
        (old: ProjectsResponse[] | undefined) => {
          if (!old) return old;
          return old.filter((project) => project.id !== id);
        },
      );

      // Remove from project detail caches
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.removeQueries({
        queryKey: [...queryKeys.projects.detail(id), "supervisor"],
      });

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });

      // Invalidate tasks as project deletion affects task filtering
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      // Invalidate project-user relationships
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
