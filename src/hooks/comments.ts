/**
 * Comment-related React Query hooks
 *
 * Provides hooks for fetching, creating, updating, and deleting comments.
 * Includes task-based filtering and user expansion.
 */
import { UseMutationOptions, useQuery } from "@tanstack/react-query";

import { pb } from "../lib/pocketbase";
import {
  CommentsRecord,
  CommentsResponse,
  UsersResponse,
} from "../lib/pocketbase-types";
import { STALE_TIMES } from "../lib/query-config";
import { mutationInvalidators } from "../lib/query-invalidators";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

export type CommentWithUser = CommentsResponse<
  unknown,
  {
    user: UsersResponse;
  }
>;

type CreateCommentPayload = Omit<CommentsRecord, "id" | "created" | "updated">;

type CreateCommentFormPayload = {
  formData: FormData;
  task: string;
};

type CreateCommentVariables = CreateCommentPayload | CreateCommentFormPayload;
type UpdateCommentVariables = { id: string; updates: Partial<CommentsRecord> };

const isFormPayload = (
  variables: CreateCommentVariables,
): variables is CreateCommentFormPayload => {
  return (
    typeof variables === "object" &&
    variables !== null &&
    "formData" in variables &&
    variables.formData instanceof FormData
  );
};

const useCreateCommentMutation = createMutation<
  CommentsResponse,
  Error,
  CreateCommentVariables
>(
  (commentData) => {
    if (isFormPayload(commentData)) {
      return pb.collection("comments").create(commentData.formData);
    }
    return pb.collection("comments").create(commentData);
  },
  (client, data) => {
    mutationInvalidators.crud.comments.create(client, data);
  },
);

const useUpdateCommentMutation = createMutation<
  CommentsResponse,
  Error,
  UpdateCommentVariables
>(
  ({ id, updates }) => pb.collection("comments").update(id, updates),
  (client, data) => {
    mutationInvalidators.crud.comments.update(client, data);
  },
);

const useDeleteCommentMutation = createMutation<
  CommentsResponse,
  Error,
  string
>(
  (id) =>
    pb.collection("comments").update<CommentsResponse>(id, {
      deleted_at: new Date().toISOString(),
    }),
  (client, data) => {
    mutationInvalidators.crud.comments.delete(client, data);
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
    staleTime: STALE_TIMES.dynamic,
  });
}

/**
 * Hook to create a new comment
 * @param options - Mutation options
 * @returns Mutation hook for creating comments
 */
export function useCreateComment(
  options?: UseMutationOptions<CommentsResponse, Error, CreateCommentVariables>,
) {
  return useCreateCommentMutation(options);
}

/**
 * Hook to update a comment's content
 * @param options - Mutation options
 * @returns Mutation hook for updating comments
 */
export function useUpdateComment(
  options?: UseMutationOptions<CommentsResponse, Error, UpdateCommentVariables>,
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
