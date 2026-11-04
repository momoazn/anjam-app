import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

import type { Doc } from "@/lib/convex";
import { Id, api } from "@/lib/convex";
import { getDueRange } from "@/lib/filter-utils";
import {
  useAuthIsAuthenticatedStrict,
  useCurrentOrganization,
} from "@/store/app-context-store";
import {
  TASK_STATUSES,
  TaskStatus,
  TaskWithDetails,
  TaskWithProject,
} from "@/types/tasks";

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

function toBaseTask(task: ListedTask | TaskDetails) {
  return {
    ...task,
    displayId: task.displayId,
    project: task.project
      ? {
          _id: task.project._id,
          name: task.project.name,
          code: task.project.code,
        }
      : {
          _id: task.projectId,
          name: "Loading...",
          code: "",
        },
    assignee:
      task.assignee ??
      (task.assigneeUserId ? { _id: task.assigneeUserId } : null),
    creator: task.creator ?? null,
    updatedAt: task.updatedAt,
  };
}

function toTaskWithProject(task: ListedTask): TaskWithProject {
  return toBaseTask(task) as TaskWithProject;
}

function toTaskWithDetails(task: TaskDetails): TaskWithDetails {
  return toBaseTask(task) as TaskWithDetails;
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
    tagId?: string;
    /** Due filter value: "today" | "week" | "month" | "overdue". */
    dueRange?: string;
    searchTerm?: string;
    page?: number;
    perPage?: number;
    enabled?: boolean;
  } = {},
) {
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;
  const {
    enabled = true,
    projectId,
    assigneeUserId,
    status,
    priority,
    tagId,
    dueRange,
    searchTerm,
    page = 1,
    perPage = 50,
  } = options;

  // "status" may hold several comma-separated statuses.
  const statuses = status
    ?.split(",")
    .filter((s): s is TaskStatus => TASK_STATUSES.includes(s as TaskStatus));

  // Convex pages are cursor based: page N starts at the cursor that page N-1 returned.
  // The cursors are only valid for the filters that produced them.
  const filterKey = JSON.stringify([
    organizationId,
    projectId,
    assigneeUserId,
    statuses,
    priority,
    tagId,
    dueRange,
    searchTerm,
    perPage,
  ]);
  const [cursorState, setCursorState] = useState<{
    key: string;
    cursors: Array<string | null>;
  }>({ key: filterKey, cursors: [null] });
  const cursors = cursorState.key === filterKey ? cursorState.cursors : [null];
  const cursor = cursors[page - 1];

  const result = useQuery(
    api.tasks.list,
    enabled && isAuthenticated && organizationId && cursor !== undefined
      ? {
          organizationId,
          projectId: projectId as Id<"projects"> | undefined,
          assigneeUserId: assigneeUserId as Id<"users"> | undefined,
          statuses,
          priority: priority as Doc<"tasks">["priority"] | undefined,
          tagId: tagId as Id<"tags"> | undefined,
          ...(dueRange ? getDueRange(dueRange) : {}),
          searchTerm,
          paginationOpts: { numItems: perPage, cursor },
        }
      : "skip",
  );

  useEffect(() => {
    if (!result || result.isDone) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCursorState((prev) => {
      const known = prev.key === filterKey ? prev.cursors : [null];
      if (known[page] === result.continueCursor) return prev;
      const next = known.slice(0, page);
      next[page] = result.continueCursor;
      return { key: filterKey, cursors: next };
    });
  }, [result, page, filterKey]);

  return {
    data: result
      ? {
          items: result.page.map((t) => toTaskWithProject(t as ListedTask)),
          // Rows up to and including this page (exact once the last page loads).
          totalItems: (page - 1) * perPage + result.page.length,
          totalPages: result.isDone ? page : page + 1,
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
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;
  const { enabled = true, projectId } = options;

  const tasks = useQuery(
    api.tasks.listAll,
    enabled && isAuthenticated && organizationId
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
          assigneeUserId: (data.assigneeUserId ?? data.assignee) as
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
          taskType: data.taskType ?? data.task_type,
          storyPoints: data.storyPoints ?? data.story_points,
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
      // null clears the field; undefined leaves it unchanged.
      updates: {
        title?: string;
        description?: string | null;
        status?: string;
        priority?: string;
        assigneeUserId?: string | null;
        assignee?: string;
        deadline?: number | null;
        tags?: string[];
        taskType?: string;
        task_type?: string;
        storyPoints?: number | null;
        story_points?: number;
      };
    }) => {
      try {
        const result = await updateTaskMutation({
          taskId: id as Id<"tasks">,
          updates: {
            title: updates.title,
            description: updates.description,
            status: updates.status as Doc<"tasks">["status"] | undefined,
            priority: updates.priority as Doc<"tasks">["priority"] | undefined,
            assigneeUserId: (updates.assigneeUserId === undefined
              ? updates.assignee
              : updates.assigneeUserId) as Id<"users"> | null | undefined,
            deadline: updates.deadline,
            tags: updates.tags as Id<"tags">[] | undefined,
            taskType: updates.taskType ?? updates.task_type,
            storyPoints:
              updates.storyPoints === undefined
                ? updates.story_points
                : updates.storyPoints,
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
    mutate: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: {
        status?: "todo" | "in_progress" | "in_review" | "done" | "cancelled";
        priority?: "low" | "medium" | "high" | "urgent";
        assigneeUserId?: string | null;
        assignee?: string;
      };
    }) => {
      return await bulkUpdateMutation({
        ids: ids as Id<"tasks">[],
        updates: {
          status: updates.status,
          priority: updates.priority,
          assigneeUserId: (updates.assigneeUserId === undefined
            ? updates.assignee
            : updates.assigneeUserId) as Id<"users"> | null | undefined,
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
    mutate: async (ids: string[]) => {
      return await bulkDeleteMutation({
        ids: ids as Id<"tasks">[],
      });
    },
    isPending: false,
  };
}
