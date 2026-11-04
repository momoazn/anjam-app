import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";

import { Id, api } from "@/lib/convex";

export function useSubtasks(
  taskId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled =
    taskId !== undefined && taskId !== "" && (options?.enabled ?? true);

  const subtasks = useQuery(
    api.subtasks.listByTask,
    enabled ? { taskId: taskId as Id<"tasks"> } : "skip",
  );

  const expandedSubtasks = useMemo(() => {
    return subtasks?.map((s) => ({
      ...s,
      expand: {
        assignee: s.assignee
          ? {
              _id: s.assignee._id,
              displayName: s.assignee.displayName || "",
              email: s.assignee.email || "",
              image: s.assignee.image,
            }
          : undefined,
      },
    }));
  }, [subtasks]);

  return {
    data: expandedSubtasks,
    isLoading: subtasks === undefined,
    isPending: subtasks === undefined,
    error: null,
  };
}

export function useCreateSubtask() {
  const createMutation = useMutation(api.subtasks.create);

  return {
    mutate: async (data: {
      taskId: string;
      title: string;
      assigneeUserId?: string;
      order: number;
    }) => {
      return await createMutation({
        taskId: data.taskId as Id<"tasks">,
        title: data.title,
        assigneeUserId: data.assigneeUserId as Id<"users"> | undefined,
        order: data.order,
      });
    },
    isPending: false,
  };
}

export function useUpdateSubtask() {
  const updateMutation = useMutation(api.subtasks.update);

  return {
    mutate: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        title?: string;
        assigneeUserId?: string | null;
        assignee?: string;
        isDone?: boolean;
        is_done?: boolean;
        order?: number;
      };
    }) => {
      return await updateMutation({
        subtaskId: id as Id<"subtasks">,
        updates: {
          title: updates.title,
          assigneeUserId: (updates.assigneeUserId === undefined
            ? updates.assignee
            : updates.assigneeUserId) as Id<"users"> | null | undefined,
          isDone: updates.isDone ?? updates.is_done,
          order: updates.order,
        },
      });
    },
    isPending: false,
  };
}

export function useDeleteSubtask() {
  const deleteMutation = useMutation(api.subtasks.remove);

  return {
    mutate: async (id: string) => {
      return await deleteMutation({
        subtaskId: id as Id<"subtasks">,
      });
    },
    isPending: false,
  };
}
