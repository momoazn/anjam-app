/**
 * Comment-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting comments.
 * Includes task-based filtering and user expansion.
 */

import {
  useQuery,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import {
  CommentsResponse,
  CommentsRecord,
  UsersResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

export type CommentWithUser = CommentsResponse<{
  user: UsersResponse;
}>;

type CreateCommentVariables = Omit<CommentsRecord, "id" | "created" | "updated">;
type UpdateCommentVariables = { id: string; updates: Partial<CommentsRecord> };

const useCreateCommentMutation = createMutation<
  CommentsResponse,
  Error,
  CreateCommentVariables
>((commentData) => pb.collection("comments").create(commentData), (client, _data, variables) => {
  client.invalidateQueries({ queryKey: queryKeys.comments.all });
  client.invalidateQueries({ queryKey: queryKeys.comments.lists() });

  if (variables?.task) {
    client.invalidateQueries({ queryKey: queryKeys.comments.byTask(variables.task) });
  }
});

const useUpdateCommentMutation = createMutation<
  CommentsResponse,
  Error,
  UpdateCommentVariables
>(({ id, updates }) => pb.collection("comments").update(id, updates), (client, _data, variables) => {
  client.invalidateQueries({ queryKey: queryKeys.comments.all });
  client.invalidateQueries({ queryKey: queryKeys.comments.lists() });

  if (variables?.updates?.task) {
    client.invalidateQueries({
      queryKey: queryKeys.comments.byTask(variables.updates.task),
    });
  }
});

const useDeleteCommentMutation = createMutation<CommentsResponse, Error, string>(
  (id) =>
    pb.collection("comments").update<CommentsResponse>(id, {
      deleted_at: new Date().toISOString(),
    }),
  (client) => {
    client.invalidateQueries({ queryKey: queryKeys.comments.all });
    client.invalidateQueries({ queryKey: queryKeys.comments.lists() });
    client.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "comments" && query.queryKey.includes("task"),
    });
  },
);

/**
 * Hook to fetch comments for a specific task with user expansion
 * @param taskId - The task ID to fetch comments for
 * @param options - Configuration options for the query
 * @returns React Query result with comments data
 */
export function useComments(
  taskId: string,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.comments.byTask(taskId),
    queryFn: async (): Promise<CommentWithUser[]> => {
      // Exclude soft-deleted comments (only include non-deleted)
      return await pb.collection("comments").getFullList<CommentWithUser>({
        filter: `task = "${taskId}" && deleted_at = ""`,
        sort: "-created",
        expand: "user",
        batch: 100,
      });
    },
    enabled: enabled && !!taskId,
  });
}

/**
 * Hook to create a new comment
 * @param options - Mutation options
 * @returns Mutation hook for creating comments
 */
export function useCreateComment(
  options?: UseMutationOptions<
    CommentsResponse,
    Error,
    CreateCommentVariables
  >,
) {
  return useCreateCommentMutation(options);
}

/**
 * Hook to update a comment's content
 * @param options - Mutation options
 * @returns Mutation hook for updating comments
 */
export function useUpdateComment(
  options?: UseMutationOptions<
    CommentsResponse,
    Error,
    UpdateCommentVariables
  >,
) {
  return useUpdateCommentMutation(options);
}

/**
 * Hook to soft delete a comment
 * @param options - Mutation options
 * @returns Mutation hook for soft deleting comments
 */
export function useDeleteComment(
  options?: UseMutationOptions<CommentsResponse, Error, string>,
) {
  return useDeleteCommentMutation(options);
}

export const useSoftDeleteComment = useDeleteComment;
