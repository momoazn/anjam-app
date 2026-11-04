import { useMutation, useQuery } from "convex/react";

import { type Doc, Id, api } from "@/lib/convex";

export type CommentWithUser = {
  _id: Id<"comments">;
  _creationTime: number;
  taskId: Id<"tasks">;
  userId: Id<"users">;
  content: string;
  parentCommentId?: Id<"comments">;
  reactions?: Record<string, string[]>;
  deletedAt?: number;
  updatedAt?: number;
  // Attachments support for Convex
  attachments?: string[];
  // Expand fields with compatibility
  expand: {
    user?: {
      _id: Id<"users">;
      displayName: string;
      email: string;
      image?: string;
    };
  };
};

/**
 * Hook to list comments for a task.
 */
export function useComments(
  taskId: string,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  const comments = useQuery(
    api.comments.listByTask,
    enabled && taskId ? { taskId: taskId as Id<"tasks"> } : "skip",
  );

  return {
    data: comments?.map(
      (c: Doc<"comments"> & { user?: Doc<"users"> | null }) => ({
        ...c,
        attachments: [],
        expand: {
          user: c.user
            ? {
                _id: c.user._id,
                displayName: c.user.displayName || "",
                email: c.user.email || "",
                image: c.user.image,
              }
            : undefined,
        },
      }),
    ) as CommentWithUser[] | undefined,
    isLoading: comments === undefined,
    isPending: comments === undefined,
    error: null,
  };
}

/**
 * Hook to create a comment.
 */
export function useCreateComment() {
  const createCommentMutation = useMutation(api.comments.create);

  return {
    mutate: async (data: {
      taskId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      return await createCommentMutation({
        taskId: data.taskId as Id<"tasks">,
        content: data.content,
        parentCommentId: data.parentCommentId as Id<"comments"> | undefined,
      });
    },
    isPending: false,
  };
}

/**
 * Hook to update a comment.
 * Supports updating content.
 */
export function useUpdateComment() {
  const updateCommentMutation = useMutation(api.comments.update);

  return {
    mutate: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        content?: string;
      };
    }) => {
      return await updateCommentMutation({
        commentId: id as Id<"comments">,
        updates,
      });
    },
    isPending: false,
  };
}

export function useSoftDeleteComment() {
  const softDeleteMutation = useMutation(api.comments.softDelete);

  return {
    mutate: async (id: string) => {
      return await softDeleteMutation({
        commentId: id as Id<"comments">,
      });
    },
    isPending: false,
  };
}

export function useToggleReaction() {
  const toggleReactionMutation = useMutation(api.comments.toggleReaction);

  return {
    mutate: async ({ id, emoji }: { id: string; emoji: string }) => {
      return await toggleReactionMutation({
        commentId: id as Id<"comments">,
        emoji,
      });
    },
    isPending: false,
  };
}
