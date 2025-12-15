/**
 * Comment-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting comments.
 * Includes task-based filtering and user expansion.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import {
  CommentsResponse,
  CommentsRecord,
  UsersResponse,
} from "../lib/pocketbase-types";
import { queryKeys } from "./query-keys";

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
 * @param options - Mutation options
 * @returns Mutation hook for creating comments
 */
export function useCreateComment(
  options?: UseMutationOptions<
    CommentsResponse,
    Error,
    Omit<CommentsRecord, "id" | "created" | "updated">
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: (
      commentData: Omit<CommentsRecord, "id" | "created" | "updated">,
    ) => pb.collection("comments").create(commentData),
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      if (variables?.task) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.byTask(variables.task),
        });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
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
    { id: string; updates: Partial<CommentsRecord> }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CommentsRecord>;
    }) => pb.collection("comments").update(id, updates),
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      if (variables?.updates?.task) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.byTask(variables.updates.task),
        });
      }

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}

/**
 * Hook to soft delete a comment
 * @param options - Mutation options
 * @returns Mutation hook for soft deleting comments
 */
export function useSoftDeleteComment(
  options?: UseMutationOptions<CommentsResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: async (id: string) => {
      return pb.collection("comments").update<CommentsResponse>(id, {
        deleted_at: new Date().toISOString(),
      });
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "comments" && query.queryKey.includes("task"),
      });

      onSettled?.(data, error, variables, context);
    },
    ...restOptions,
  });
}
