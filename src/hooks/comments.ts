import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";

import { api, Id } from "@/lib/convex";

export type CommentWithUser = {
  id: string;
  _id: Id<"comments">;
  _creationTime: number;
  created: string;
  updated?: string;
  taskId: Id<"tasks">;
  userId: Id<"users">;
  content: string;
  parent?: string;
  parentCommentId?: Id<"comments">;
  reactions?: any;
  deleted_at?: string;
  deletedAt?: number;
  updatedAt?: number;
  user: string;
  // Attachments support for Convex
  attachments?: string[];
  // Expand fields with compatibility
  expand: {
    user?: {
      id: string;
      _id: Id<"users">;
      username: string;
      firstName?: string;
      first_name?: string;
      lastName?: string;
      last_name?: string;
      avatar?: string;
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
    data: comments?.map((c: any) => ({
      ...c,
      id: c._id,
      _id: c._id,
      created: new Date(c._creationTime).toISOString(),
      updated: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
      parent: c.parentCommentId,
      deleted_at: c.deletedAt ? new Date(c.deletedAt).toISOString() : undefined,
      user: c.userId,
      attachments: c.attachments || [],
      expand: {
        user: c.user
          ? {
              id: c.user._id,
              _id: c.user._id,
              username: c.user.username || "",
              firstName: c.user.firstName,
              first_name: c.user.firstName,
              lastName: c.user.lastName,
              last_name: c.user.lastName,
              avatar: c.user.image,
              image: c.user.image,
            }
          : undefined,
      },
    })) as CommentWithUser[] | undefined,
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
    mutate: async (data: { taskId: string; content: string; parentCommentId?: string }) => {
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
 * Note: Convex backend currently doesn't have an update mutation for comments,
 * but we'll define the hook for future use or add it if needed.
 */
export function useUpdateComment() {
  // const updateCommentMutation = useMutation(api.comments.update);

  return {
    mutate: async ({ id, updates }: { id: string; updates: any }) => {
      // return await updateCommentMutation({
      //   commentId: id as Id<"comments">,
      //   updates,
      // });
      console.warn("Update comment not implemented in Convex yet");
    },
    isPending: false,
  };
}

/**
 * Hook to soft-delete a comment.
 */
export function useDeleteComment() {
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

export const useSoftDeleteComment = useDeleteComment;
