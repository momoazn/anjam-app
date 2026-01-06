import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";

import { api, Id } from "@/lib/convex";
import { useCurrentOrganization } from "@/store/auth-store";
import { TaskWithDetails, TaskWithProject } from "@/types/tasks";

/**
 * Hook to list tasks with optional filtering.
 */
export function useTasks(options: {
  projectId?: string;
  assigneeUserId?: string;
  status?: string;
  priority?: string;
  searchTerm?: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
} = {}) {
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;
  const {
    enabled = true,
    projectId,
    assigneeUserId,
    status,
    priority,
    searchTerm,
    page = 1,
    perPage = 50,
  } = options;

  const result = useQuery(
    api.tasks.list,
    enabled && organizationId
      ? {
          organizationId,
          projectId: projectId as Id<"projects"> | undefined,
          assigneeUserId: assigneeUserId as Id<"users"> | undefined,
          status,
          priority,
          searchTerm,
          paginationOpts: { numItems: perPage, cursor: null }, // Simplified pagination for now
        }
      : "skip",
  );

  return {
    data: result
      ? {
          items: result.page.map((t: any) => ({
            ...t,
            id: t._id, // Compatibility
            display_id: t.displayId, // Compatibility
            project: t.project || { _id: t.projectId, id: t.projectId, name: "Loading...", code: "" },
            assignee: t.assignee || (t.assigneeUserId ? { _id: t.assigneeUserId, id: t.assigneeUserId } : null),
            updated: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date(t._creationTime).toISOString(),
            created: new Date(t._creationTime).toISOString(),
            expand: {
              project: t.project,
              assignee: t.assignee,
              creator: t.creator,
            }
          } as TaskWithProject)),
          totalItems: result.page.length, // Rough estimate
          totalPages: result.isDone ? page : page + 1, // Simplified
        }
      : undefined,
    isPending: result === undefined,
    isLoading: result === undefined,
    error: null,
  };
}

/**
 * Hook to list all tasks (non-paginated).
 */
export function useAllTasks(options: {
  projectId?: string;
  enabled?: boolean;
} = {}) {
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;
  const { enabled = true, projectId } = options;

  const tasks = useQuery(
    api.tasks.listAll,
    enabled && organizationId
      ? {
          organizationId,
          projectId: projectId as Id<"projects"> | undefined,
        }
      : "skip",
  );

  return {
    data: tasks?.map((t: any) => ({
      ...t,
      id: t._id,
      display_id: t.displayId,
      project: t.project || { _id: t.projectId, id: t.projectId, name: "Loading...", code: "" },
      assignee: t.assignee || (t.assigneeUserId ? { _id: t.assigneeUserId, id: t.assigneeUserId } : null),
      expand: {
        project: t.project,
        assignee: t.assignee,
      },
    } as TaskWithProject)),
    isPending: tasks === undefined,
    isLoading: tasks === undefined,
    error: null,
  };
}

/**
 * Hook to get a single task by ID.
 */
export function useTask(options: { id: string | undefined; enabled?: boolean }) {
  const { id, enabled = true } = options;

  const task = useQuery(
    api.tasks.get,
    enabled && id ? { taskId: id as Id<"tasks"> } : "skip",
  );

  return {
    data: task ? ({
      ...task,
      id: task._id,
      display_id: task.displayId,
      project: (task as any).project || { _id: task.projectId, id: task.projectId, name: "Loading...", code: "" },
      assignee: (task as any).assignee || (task.assigneeUserId ? { _id: task.assigneeUserId, id: task.assigneeUserId } : null),
      expand: {
        project: (task as any).project,
        assignee: (task as any).assignee,
        creator: (task as any).creator,
      }
    } as TaskWithDetails) : undefined,
    isLoading: task === undefined,
    isPending: task === undefined,
    error: null,
  };
}

/**
 * Hook to create a task.
 */
export function useCreateTask(options?: {
  onSuccess?: (id: string) => void;
  onError?: (error: any) => void;
}) {
  const createTaskMutation = useMutation(api.tasks.create);

  return {
    mutate: async (data: any) => {
      try {
        const id = await createTaskMutation({
          projectId: data.projectId || data.project,
          title: data.title,
          description: data.description,
          assigneeUserId: data.assigneeUserId || data.assignee,
          priority: data.priority,
          status: data.status,
          deadline: data.deadline,
          tags: data.tags,
          estimatedMinutes: data.estimatedMinutes || data.estimated_minutes,
          taskType: data.taskType || data.task_type,
          storyPoints: data.storyPoints || data.story_points,
        });
        options?.onSuccess?.(id);
        return id;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    isPending: false,
  };
}

/**
 * Hook to update a task.
 */
export function useUpdateTask(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const updateTaskMutation = useMutation(api.tasks.update);

  return {
    mutate: async ({ id, updates }: { id: string; updates: any }) => {
      try {
        const result = await updateTaskMutation({
          taskId: id as Id<"tasks">,
          updates: {
            title: updates.title,
            description: updates.description,
            status: updates.status,
            priority: updates.priority,
            assigneeUserId: updates.assigneeUserId || updates.assignee,
            deadline: updates.deadline,
            tags: updates.tags,
            estimatedMinutes: updates.estimatedMinutes || updates.estimated_minutes,
            timeSpentMinutes: updates.timeSpentMinutes || updates.time_spent_minutes,
            taskType: updates.taskType || updates.task_type,
            storyPoints: updates.storyPoints || updates.story_points,
          },
        });
        options?.onSuccess?.();
        return result;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    isPending: false,
  };
}

/**
 * Hook to soft-delete a task.
 */
export function useDeleteTask(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const softDeleteMutation = useMutation(api.tasks.softDelete);

  return {
    mutate: async (id: string) => {
      try {
        const result = await softDeleteMutation({
          taskId: id as Id<"tasks">,
        });
        options?.onSuccess?.();
        return result;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    isPending: false,
  };
}

/**
 * Hook to update task board position.
 */
export function useReorderTask() {
  const updateBoardPositionMutation = useMutation(api.tasks.updateBoardPosition);

  return {
    mutate: async ({ taskId, status, order }: { taskId: string; status: any; order: number }) => {
      return await updateBoardPositionMutation({
        taskId: taskId as Id<"tasks">,
        status,
        order,
      });
    },
    isPending: false,
  };
}

/**
 * Hook to bulk update tasks.
 */
export function useBulkUpdateTasks() {
  const bulkUpdateMutation = useMutation(api.tasks.bulkUpdate);

  return {
    mutateAsync: async ({ ids, updates }: { ids: string[]; updates: any }) => {
      return await bulkUpdateMutation({
        ids: ids as Id<"tasks">[],
        updates: {
          status: updates.status,
          priority: updates.priority,
          assigneeUserId: updates.assigneeUserId || updates.assignee,
        },
      });
    },
    isPending: false,
  };
}

/**
 * Hook to bulk delete tasks.
 */
export function useBulkDeleteTasks() {
  const bulkDeleteMutation = useMutation(api.tasks.bulkDelete);

  return {
    mutateAsync: async (ids: string[]) => {
      return await bulkDeleteMutation({
        ids: ids as Id<"tasks">[],
      });
    },
    isPending: false,
  };
}

/**
 * Prefetch task (No-op in Convex as it doesn't use TanStack Query cache)
 */
export function usePrefetchTask() {
  return useCallback(() => {
    // No-op
  }, []);
}
