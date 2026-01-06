import type { QueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { handleError } from "@/lib/error-handler";

type FactoryMutationOptions<
  TData,
  TError,
  TVariables,
  TOnMutateResult = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  "onSuccess" | "onSettled"
> & {
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: unknown,
  ) => void;
};

export interface MutationFactoryConfig {
  showErrorToast?: boolean;
}

export function createMutation<
  TData,
  TError extends Error,
  TVariables,
  TOnMutateResult = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidate: (client: QueryClient, data: TData, variables: TVariables) => void,
  config: MutationFactoryConfig = {},
) {
  const { showErrorToast = true } = config;

  return function useFactoryMutation(
    options?:
      | UseMutationOptions<TData, TError, TVariables, TOnMutateResult>
      | FactoryMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  ) {
    const queryClient = useQueryClient();
    const { onSuccess, onSettled, onError, ...restOptions } = (options ??
      {}) as {
      onSuccess?: (
        data: TData,
        variables: TVariables,
        context: unknown,
      ) => void;
      onSettled?: (
        data: TData | undefined,
        error: TError | null,
        variables: TVariables,
        context: unknown,
      ) => void;
      onError?: (
        error: TError,
        variables: TVariables,
        context: unknown,
      ) => void;
    } & Omit<
      UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
      "onSuccess" | "onSettled" | "onError"
    >;

    return useMutation<TData, TError, TVariables, TOnMutateResult>({
      mutationFn,
      onSuccess: (data, variables, onMutateResult, context) => {
        void context;
        onSuccess?.(data, variables, onMutateResult);
      },
      onError: (error, variables, onMutateResult, context) => {
        void context;
        // Show error toast by default unless disabled
        if (showErrorToast) {
          handleError(error);
        }
        // Call custom onError handler if provided
        onError?.(error, variables, onMutateResult);
      },
      onSettled: (data, error, variables, onMutateResult, context) => {
        void context;
        if (variables) {
          invalidate(queryClient, data as TData, variables);
        }
        onSettled?.(data, error, variables, onMutateResult);
      },
      ...restOptions,
    });
  };
}
