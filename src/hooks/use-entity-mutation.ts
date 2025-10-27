import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { pb } from "@/lib/pocketbase";
import { queryKeys } from "./query-keys";

type UseEntityMutationOptions = {
  collection: string;
  successMessage: string;
  errorMessage: string;
  invalidateQueries?: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function useEntityMutation<TVariables = Record<string, unknown>>({
  collection,
  successMessage,
  errorMessage,
  invalidateQueries = [],
  onSuccess,
  onError,
}: UseEntityMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TVariables) => {
      return pb.collection(collection).create(data as Record<string, unknown>);
    },
    onSuccess: () => {
      // Invalidate specified queries
      invalidateQueries.forEach((queryKey) => {
        if (queryKey === "tasks") {
          // For tasks, invalidate all task-related queries to ensure all task lists refresh
          queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        } else {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      });

      // Show success message
      toast.success(successMessage);

      // Call custom onSuccess
      onSuccess?.();
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(errorMessage.replace("{error}", error.message));

      // Call custom onError
      onError?.(error);
    },
  });
}

type UseEntityUpdateMutationOptions = {
  collection: string;
  successMessage: string;
  errorMessage: string;
  invalidateQueries?: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function useEntityUpdateMutation<TVariables = Record<string, unknown>>({
  collection,
  successMessage,
  errorMessage,
  invalidateQueries = [],
  onSuccess,
  onError,
}: UseEntityUpdateMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TVariables }) => {
      return pb
        .collection(collection)
        .update(id, updates as Record<string, unknown>);
    },
    onSuccess: () => {
      // Invalidate specified queries
      invalidateQueries.forEach((queryKey) => {
        if (queryKey === "tasks") {
          // For tasks, invalidate all task-related queries to ensure all task lists refresh
          queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        } else {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      });

      // Show success message
      toast.success(successMessage);

      // Call custom onSuccess
      onSuccess?.();
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(errorMessage.replace("{error}", error.message));

      // Call custom onError
      onError?.(error);
    },
  });
}

type UseEntityDeleteMutationOptions = {
  collection: string;
  successMessage: string;
  errorMessage: string;
  invalidateQueries?: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function useEntityDeleteMutation({
  collection,
  successMessage,
  errorMessage,
  invalidateQueries = [],
  onSuccess,
  onError,
}: UseEntityDeleteMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return pb.collection(collection).delete(id);
    },
    onSuccess: () => {
      // Invalidate specified queries
      invalidateQueries.forEach((queryKey) => {
        if (queryKey === "tasks") {
          // For tasks, invalidate all task-related queries to ensure all task lists refresh
          queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        } else {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      });

      // Show success message
      toast.success(successMessage);

      // Call custom onSuccess
      onSuccess?.();
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(errorMessage.replace("{error}", error.message));

      // Call custom onError
      onError?.(error);
    },
  });
}
