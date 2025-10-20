/**
 * PocketBase React Query Hooks
 *
 * This file contains all React Query hooks for interacting with PocketBase.
 * Hooks are organized by feature (tasks, projects, users, auth) for better maintainability.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb, TaskWithProject, ProjectWithSupervisor } from "./lib/pocketbase";
import {
  ProjectsResponse,
  TasksResponse,
  UsersResponse,
  UsersRoleOptions,
  TasksRecord,
  ProjectsRecord,
  UsersRecord,
  UsersProjectsResponse,
} from "./lib/pocketbase-types";

// ============================================================================
// HOOK STRUCTURE CONVENTIONS
// ============================================================================
//
// All hooks follow these unified patterns:
// 1. Query hooks: use[Entity](options) - fetch single or list
// 2. Mutation hooks: use[Action][Entity](options?) - create, update, delete
// 3. Parameter naming: object parameters for consistency
// 4. Return types: Consistent React Query result types
// 5. Error handling: Standardized across all mutations
//

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Centralized query key factory functions
 */
export const queryKeys = {
  // Tasks
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (projectId?: string, expandFields?: string) =>
      [
        ...queryKeys.tasks.lists(),
        { projectId: projectId ?? "all", expandFields: expandFields ?? "none" },
      ] as const,
    detail: (id: string) => [...queryKeys.tasks.all, "detail", id] as const,
  },

  // Projects
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    projectUsers: (projectId: string) =>
      [...queryKeys.users.all, "project", projectId] as const,
  },

  // Auth
  auth: {
    isInitialAdmin: ["auth", "is-initial-admin"] as const,
  },
} as const;

// ============================================================================
// TASKS HOOKS
// ============================================================================

/**
 * Fetches tasks with optional project filtering and field expansion
 */
function getTasks(
  projectId?: string,
  expandFields?: string,
): Promise<TaskWithProject[]> {
  const currentUser = pb.authStore.record as UsersResponse | null;
  const filters: string[] = [];

  // Apply role-based filtering
  if (currentUser?.role === UsersRoleOptions.employee) {
    filters.push(`assignee = "${currentUser.id}"`);
  }

  // Apply project filtering
  if (projectId) {
    filters.push(`project = "${projectId}"`);
  }

  return pb.collection("tasks").getFullList<TaskWithProject>({
    batch: 100,
    filter: filters.length > 0 ? filters.join(" && ") : undefined,
    sort: "order",
    expand: expandFields,
  });
}

/**
 * Hook to fetch tasks with optional project filtering and field expansion
 * @param options - Configuration options for the query
 * @returns React Query result with tasks data
 */
export function useTasks(
  options: {
    projectId?: string;
    expandFields?: string;
    enabled?: boolean;
  } = {},
) {
  const { projectId, expandFields, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.tasks.list(projectId, expandFields),
    queryFn: () => getTasks(projectId, expandFields),
    enabled,
  });
}

/**
 * Hook to fetch a single task by ID
 * @param options - Configuration options for the query
 * @returns React Query result with task data
 */
export function useTask(options: { id: string; enabled?: boolean }) {
  const { id, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => pb.collection("tasks").getOne<TaskWithProject>(id),
    enabled: enabled && Boolean(id),
  });
}

/**
 * Hook to create a new task
 * @param options - Mutation options
 * @returns Mutation function for creating tasks
 */
export function useCreateTask(
  options?: UseMutationOptions<
    TasksResponse,
    Error,
    Omit<TasksRecord, "id" | "created" | "updated">
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(taskData),
    onSuccess: () => {
      // Invalidate all task queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    ...options,
  });
}

/**
 * Hook to update an existing task
 * @param options - Mutation options
 * @returns Mutation function for updating tasks
 */
export function useUpdateTask(
  options?: UseMutationOptions<
    TasksResponse,
    Error,
    { id: string; updates: Partial<TasksRecord> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<TasksRecord>;
    }) => {
      return pb.collection("tasks").update(id, updates);
    },
    onMutate: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<TasksRecord>;
    }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<TaskWithProject[]>({
        queryKey: queryKeys.tasks.all,
      });

      // Optimistically update cache
      queryClient.setQueriesData<TaskWithProject[]>(
        { queryKey: queryKeys.tasks.all },
        (old: TaskWithProject[] | undefined) => {
          if (!old) return old;
          return old.map((task: TaskWithProject) =>
            task.id === id
              ? ({ ...task, ...updates } as TaskWithProject)
              : task,
          );
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context
      ) {
        const previousQueries = context.previousQueries as [
          readonly unknown[],
          TaskWithProject[] | undefined,
        ][];
        previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a task
 * @param options - Mutation options
 * @returns Mutation function for deleting tasks
 */
export function useDeleteTask(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("tasks").delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    ...options,
  });
}

// ============================================================================
// PROJECTS HOOKS
// ============================================================================

/**
 * Hook to fetch all projects
 * @param options - Configuration options for the query
 * @returns React Query result with projects data
 */
export function useProjects(
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: () => pb.collection("projects").getFullList<ProjectsResponse>(),
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

// ============================================================================
// USERS HOOKS
// ============================================================================

/**
 * Hook to fetch all users
 * @param options - Configuration options for the query
 * @returns React Query result with users data
 */
export function useUsers(
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () => pb.collection("users").getFullList<UsersResponse>(),
    enabled,
  });
}

/**
 * Hook to fetch a single user by ID
 * @param options - Configuration options for the query
 * @returns React Query result with user data
 */
export function useUser({
  id,
  enabled = true,
}: {
  id: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => pb.collection("users").getOne<UsersResponse>(id),
    enabled: enabled && Boolean(id),
  });
}

/**
 * Hook to fetch users for a specific project
 * @param options - Configuration options for the query
 * @returns React Query result with project users data
 */
export function useProjectUsers({
  projectId,
  enabled = true,
}: {
  projectId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.users.projectUsers(projectId),
    queryFn: async () => {
      if (!projectId) {
        return Promise.resolve([]);
      }

      // Get all user-project relationships for this project
      const userProjects = await pb
        .collection("users_projects")
        .getFullList<
          UsersProjectsResponse & { expand?: { user?: UsersResponse } }
        >({
          filter: `project = "${projectId}"`,
          expand: "user",
        });

      // Extract user data from the expanded relationships
      return userProjects
        .map((up) => up.expand?.user)
        .filter(Boolean)
        .map((user) => ({
          id: user!.id,
          username: user!.username,
          first_name: user!.first_name,
          last_name: user!.last_name,
        }));
    },
    enabled: enabled && Boolean(projectId),
  });
}

/**
 * Hook to create a new user
 * @param options - Mutation options
 * @returns Mutation function for creating users
 */
export function useCreateUser(
  options?: UseMutationOptions<
    UsersResponse,
    Error,
    Omit<UsersRecord, "id" | "created" | "updated">
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Omit<UsersRecord, "id" | "created" | "updated">) =>
      pb.collection("users").create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
}

/**
 * Hook to update an existing user
 * @param options - Mutation options
 * @returns Mutation function for updating users
 */
export function useUpdateUser(
  options?: UseMutationOptions<
    UsersResponse,
    Error,
    { id: string; updates: Partial<UsersRecord> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<UsersRecord>;
    }) => pb.collection("users").update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a user
 * @param options - Mutation options
 * @returns Mutation function for deleting users
 */
export function useDeleteUser(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("users").delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
}

// ============================================================================
// AUTH HOOKS
// ============================================================================

/**
 * Hook to check if the current user is the initial admin
 * @returns React Query result indicating if user is initial admin
 */
export function useIsInitialAdmin() {
  return useQuery({
    queryKey: queryKeys.auth.isInitialAdmin,
    queryFn: async (): Promise<boolean> => {
      try {
        const response = await fetch("/api/tm/is-initial");

        if (response.status === 204) {
          return true;
        }

        if (!response.ok) {
          return false;
        }

        const payload = (await response.json()) as { exists?: boolean };
        return !(payload?.exists ?? false);
      } catch (error) {
        console.error("Error checking initial admin status:", error);
        return false;
      }
    },
  });
}

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use useProjectUsers instead
 */
export const useSpecificProjectUsers = useProjectUsers;
