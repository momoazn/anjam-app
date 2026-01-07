import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";

import type { Doc } from "@/lib/convex";
import { Id, api } from "@/lib/convex";
import { useCurrentOrganization } from "@/store/auth-store";
import { TaskWithDetails, TaskWithProject } from "@/types/tasks";

type ListedTask = Doc<"tasks"> & {
  creator: Doc<"users"> | null;
  assignee: Doc<"users"> | null;
  project: Doc<"projects"> | null;
};

type TaskDetails = Doc<"tasks"> & {
  creator: Doc<"users"> | null;
  assignee: Doc<"users"> | null;
  project: Doc<"projects"> | null;
  tagsData?: Array<Doc<"tags">>;
};

function toTaskWithProject(task: ListedTask): TaskWithProject {
  return {
    ...task,
    id: task._id,
    display_id: task.displayId,
    project: task.project
      ? {
          _id: task.project._id,
          id: task.project._id,
          name: task.project.name,
          code: task.project.code,
        }
      : {
          _id: task.projectId,
          id: task.projectId,
          name: "Loading...",
          code: "",
        },
    assignee:
      task.assignee ??
      (task.assigneeUserId
        ? { _id: task.assigneeUserId, id: task.assigneeUserId }
        : null),
    creator: task.creator ?? null,
    updated: task.updatedAt
      ? new Date(task.updatedAt).toISOString()
      : new Date(task._creationTime).toISOString(),
    created: new Date(task._creationTime).toISOString(),
    expand: {
      project: task.project,
      assignee: task.assignee,
      creator: task.creator,
    },
  };
}

function toTaskWithDetails(task: TaskDetails): TaskWithDetails {
  return {
    ...task,
    id: task._id,
    display_id: task.displayId,
    project: task.project
      ? {
          _id: task.project._id,
          id: task.project._id,
          name: task.project.name,
          code: task.project.code,
        }
      : {
          _id: task.projectId,
          id: task.projectId,
          name: "Loading...",
          code: "",
        },
    assignee:
      task.assignee ??
      (task.assigneeUserId
        ? { _id: task.assigneeUserId, id: task.assigneeUserId }
        : null),
    creator: task.creator ?? null,
    created: new Date(task._creationTime).toISOString(),
    updated: task.updatedAt
      ? new Date(task.updatedAt).toISOString()
      : new Date(task._creationTime).toISOString(),
    expand: {
      project: task.project,
      assignee: task.assignee,
      creator: task.creator,
      tags: task.tagsData,
    },
  };
}

/**
 * Hook to list tasks with optional filtering.
 */
export function useTasks(
  options: {
    projectId?: string;
    assigneeUserId?: string;
    status?: string;
    priority?: string;
    searchTerm?: string;
    page?: number;
    perPage?: number;
    enabled?: boolean;
  } = {},
) {
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
          items: result.page.map((t) => toTaskWithProject(t as ListedTask)),
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
export function useAllTasks(
  options: {
    projectId?: string;
    enabled?: boolean;
  } = {},
) {
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
    data: tasks?.map((t) => toTaskWithProject(t as ListedTask)),
    isPending: tasks === undefined,
    isLoading: tasks === undefined,
    error: null,
  };
}

/**
 * Hook to get a single task by ID.
 */
export function useTask(options: {
  id: string | undefined;
  enabled?: boolean;
}) {
  const { id, enabled = true } = options;

  const task = useQuery(
    api.tasks.get,
    enabled && id ? { taskId: id as Id<"tasks"> } : "skip",
  );

  return {
    data: task ? toTaskWithDetails(task as TaskDetails) : undefined,
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
  onError?: (error: unknown) => void;
}) {
  const createTaskMutation = useMutation(api.tasks.create);

  return {
    mutate: async (data: {
      projectId?: string;
      project?: string;
      title: string;
      description?: string;
      assigneeUserId?: string;
      assignee?: string;
      priority: string;
      status: string;
      deadline?: number;
      tags?: string[];
      estimatedMinutes?: number;
      estimated_minutes?: number;
      taskType?: string;
      task_type?: string;
      storyPoints?: number;
      story_points?: number;
    }) => {
      try {
        const projectId = data.projectId || data.project;
        if (!projectId) throw new Error("Project is required");
        const id = await createTaskMutation({
          projectId: projectId as Id<"projects">,
          title: data.title,
          description: data.description,
          assigneeUserId: (data.assigneeUserId || data.assignee) as
            | Id<"users">
            | undefined,
          priority: data.priority as "low" | "medium" | "high" | "urgent",
          status: data.status as
            | "todo"
            | "in_progress"
            | "in_review"
            | "done"
            | "cancelled",
          deadline: data.deadline,
          tags: data.tags as Id<"tags">[] | undefined,
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
  onError?: (error: unknown) => void;
}) {
  const updateTaskMutation = useMutation(api.tasks.update);

  return {
    mutate: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        assigneeUserId?: string;
        assignee?: string;
        deadline?: number;
        tags?: string[];
        estimatedMinutes?: number;
        estimated_minutes?: number;
        timeSpentMinutes?: number;
        time_spent_minutes?: number;
        taskType?: string;
        task_type?: string;
        storyPoints?: number;
        story_points?: number;
      };
    }) => {
      try {
        const result = await updateTaskMutation({
          taskId: id as Id<"tasks">,
          updates: {
            title: updates.title,
            description: updates.description,
            status: updates.status,
            priority: updates.priority,
            assigneeUserId: (updates.assigneeUserId || updates.assignee) as
              | Id<"users">
              | undefined,
            deadline: updates.deadline,
            tags: updates.tags as Id<"tags">[] | undefined,
            estimatedMinutes:
              updates.estimatedMinutes || updates.estimated_minutes,
            timeSpentMinutes:
              updates.timeSpentMinutes || updates.time_spent_minutes,
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
  onError?: (error: unknown) => void;
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
  const updateBoardPositionMutation = useMutation(
    api.tasks.updateBoardPosition,
  );

  return {
    mutate: async ({
      taskId,
      status,
      order,
    }: {
      taskId: string;
      status: "todo" | "in_progress" | "in_review" | "done" | "cancelled";
      order: number;
    }) => {
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
    mutateAsync: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: {
        status?: "todo" | "in_progress" | "in_review" | "done" | "cancelled";
        priority?: "low" | "medium" | "high" | "urgent";
        assigneeUserId?: string;
        assignee?: string;
      };
    }) => {
      return await bulkUpdateMutation({
        ids: ids as Id<"tasks">[],
        updates: {
          status: updates.status,
          priority: updates.priority,
          assigneeUserId: (updates.assigneeUserId || updates.assignee) as
            | Id<"users">
            | undefined,
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
