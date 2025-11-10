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

  return useMutation({
    mutationFn: (
      commentData: Omit<CommentsRecord, "id" | "created" | "updated">,
    ) => pb.collection("comments").create(commentData),
    onMutate: async (newComment) => {
      // Cancel outgoing refetches for all comment-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<CommentWithUser[]>({
        queryKey: queryKeys.comments.all,
      });

      // Optimistically update cache with new comment
      const optimisticComment = {
        ...newComment,
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        expand: {},
      } as CommentWithUser;

      // Update the specific task's comments
      if (newComment.task) {
        queryClient.setQueryData<CommentWithUser[]>(
          queryKeys.comments.byTask(newComment.task),
          (old: CommentWithUser[] | undefined) => {
            if (!old) return [optimisticComment];
            return [optimisticComment, ...old];
          },
        );
      }

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful creation
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      // Invalidate specific task comments
      if (variables?.task) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.byTask(variables.task),
        });
      }

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
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

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CommentsRecord>;
    }) => pb.collection("comments").update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches for all comment-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<CommentWithUser[]>({
        queryKey: queryKeys.comments.all,
      });

      // Optimistically update cache
      queryClient.setQueriesData<CommentWithUser[]>(
        { queryKey: queryKeys.comments.all },
        (old: CommentWithUser[] | undefined) => {
          if (!old) return old;
          return old.map((comment: CommentWithUser) => {
            if (comment.id === id) {
              return { ...comment, ...updates } as CommentWithUser;
            }
            return comment;
          });
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful update
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      // Invalidate specific task comments if we can determine the task
      if (variables?.updates?.task) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.byTask(variables.updates.task),
        });
      }

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
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

  return useMutation({
    mutationFn: async (id: string) => {
      return pb.collection("comments").update<CommentsResponse>(id, {
        deleted_at: new Date().toISOString(),
      });
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches for all comment-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.all });

      // Snapshot previous values
      const previousQueries = queryClient.getQueriesData<CommentWithUser[]>({
        queryKey: queryKeys.comments.all,
      });

      // Optimistically remove comment from cache
      queryClient.setQueriesData<CommentWithUser[]>(
        { queryKey: queryKeys.comments.all },
        (old: CommentWithUser[] | undefined) => {
          if (!old) return old;
          return old.filter((comment) => comment.id !== id);
        },
      );

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (
        context &&
        typeof context === "object" &&
        "previousQueries" in context &&
        Array.isArray(context.previousQueries)
      ) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Comprehensive refetch after successful deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      // Invalidate all task comments since we can't determine which task the comment belonged to
      // This is a safe approach to ensure consistency
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "comments" && query.queryKey.includes("task"),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
