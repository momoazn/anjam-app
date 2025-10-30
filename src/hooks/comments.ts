/**
 * Comment-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting comments.
 * Includes task-based filtering and user expansion.
 */

import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import { CommentsResponse, UsersResponse } from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";
import {
  useEntityMutation,
  useEntityUpdateMutation,
} from "./use-entity-mutation";

export type CommentWithUser = CommentsResponse<{
  user: UsersResponse;
}>;

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
 * @returns Mutation hook for creating comments
 */
export function useCreateComment() {
  return useEntityMutation({
    collection: "comments",
    successMessage: "Comment added successfully",
    errorMessage: "Failed to add comment: {error}",
    invalidateQueries: ["comments"],
  });
}

/**
 * Hook to update a comment's content
 * @returns Mutation hook for updating comments
 */
export function useUpdateComment() {
  return useEntityUpdateMutation({
    collection: "comments",
    successMessage: "Comment updated successfully",
    errorMessage: "Failed to update comment: {error}",
    invalidateQueries: ["comments"],
  });
}

/**
 * Hook to soft delete a comment
 * @returns Mutation hook for soft deleting comments
 */
export function useSoftDeleteComment() {
  return useEntityUpdateMutation({
    collection: "comments",
    successMessage: "Comment deleted successfully",
    errorMessage: "Failed to delete comment: {error}",
    invalidateQueries: ["comments"],
  });
}
