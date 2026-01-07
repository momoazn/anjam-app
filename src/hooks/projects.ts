import { useMutation, useQuery } from "convex/react";

import { type Doc, Id, api } from "@/lib/convex";
import { useCurrentOrganization } from "@/store/auth-store";

/**
 * Hook to list all projects in the current organization.
 */
export function useProjects(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;

  const projects = useQuery(
    api.projects.listByOrg,
    enabled && organizationId ? { organizationId } : "skip",
  );

  return {
    data: projects?.map(
      (p: Doc<"projects"> & { supervisor?: Doc<"users"> | null }) => ({
        ...p,
        id: p._id,
        expand: {
          supervisor: p.supervisor
            ? {
                ...p.supervisor,
                id: p.supervisor._id,
                first_name: p.supervisor.firstName,
                last_name: p.supervisor.lastName,
              }
            : undefined,
        },
      }),
    ),
    isPending: projects === undefined,
    error: null,
  };
}

/**
 * Hook to get a single project by ID.
 */
export function useProject(options: {
  id: string | undefined;
  enabled?: boolean;
}) {
  const { id, enabled = true } = options;

  const project = useQuery(
    api.projects.get,
    enabled && id ? { projectId: id as Id<"projects"> } : "skip",
  );

  return {
    data: project
      ? {
          ...project,
          id: project._id,
          expand: {
            supervisor: (
              project as Doc<"projects"> & { supervisor?: Doc<"users"> | null }
            ).supervisor
              ? {
                  ...(
                    project as Doc<"projects"> & {
                      supervisor: Doc<"users">;
                    }
                  ).supervisor,
                  id: (
                    project as Doc<"projects"> & {
                      supervisor: Doc<"users">;
                    }
                  ).supervisor._id,
                  first_name: (
                    project as Doc<"projects"> & {
                      supervisor: Doc<"users">;
                    }
                  ).supervisor.firstName,
                  last_name: (
                    project as Doc<"projects"> & {
                      supervisor: Doc<"users">;
                    }
                  ).supervisor.lastName,
                }
              : undefined,
          },
        }
      : undefined,
    isLoading: project === undefined,
    isPending: project === undefined,
    error: null,
  };
}

/**
 * Hook to get a project with supervisor details.
 * In Convex v1, supervisor is just a field on the project.
 */
export function useProjectWithSupervisor(options: {
  id: string | undefined;
  enabled?: boolean;
}) {
  // For now, this is same as useProject as we don't have complex expands in Convex yet
  // User details can be fetched separately or joined in the query if needed.
  return useProject(options);
}

/**
 * Hook to create a project.
 */
export function useCreateProject(options?: {
  onSuccess?: (id: string) => void;
}) {
  const createProjectMutation = useMutation(api.projects.create);

  return {
    mutate: async (data: {
      name: string;
      description?: string;
      supervisorUserId?: string;
      organizationId: string;
    }) => {
      const id = await createProjectMutation({
        name: data.name,
        description: data.description,
        supervisorUserId: data.supervisorUserId as Id<"users"> | undefined,
        organizationId: data.organizationId as Id<"organizations">,
      });
      options?.onSuccess?.(id);
      return id;
    },
    isPending: false,
  };
}

/**
 * Hook to update a project.
 */
export function useUpdateProject(options?: { onSuccess?: () => void }) {
  const updateProjectMutation = useMutation(api.projects.update);

  return {
    mutate: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        name?: string;
        description?: string;
        supervisorUserId?: string;
      };
    }) => {
      await updateProjectMutation({
        projectId: id as Id<"projects">,
        updates: {
          name: updates.name,
          description: updates.description,
          supervisorUserId: updates.supervisorUserId as Id<"users"> | undefined,
        },
      });
      options?.onSuccess?.();
    },
    isPending: false,
  };
}

/**
 * Hook to delete a project.
 */
export function useDeleteProject(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const deleteProjectMutation = useMutation(api.projects.deleteProject);

  return {
    mutate: async (id: string) => {
      try {
        await deleteProjectMutation({
          projectId: id as Id<"projects">,
        });
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    mutateAsync: async (id: string) => {
      try {
        await deleteProjectMutation({
          projectId: id as Id<"projects">,
        });
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    isPending: false,
  };
}
