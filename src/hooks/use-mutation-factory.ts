import type { QueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export function createMutation<
  TData,
  TError,
  TVariables,
  TOnMutateResult = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidate: (client: QueryClient, data: TData, variables: TVariables) => void,
) {
  return function useFactoryMutation(
    options?:
      | UseMutationOptions<TData, TError, TVariables, TOnMutateResult>
      | FactoryMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  ) {
    const queryClient = useQueryClient();
    const { onSuccess, onSettled, ...restOptions } = (options ?? {}) as {
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
    } & Omit<
      UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
      "onSuccess" | "onSettled"
    >;

    return useMutation<TData, TError, TVariables, TOnMutateResult>({
      mutationFn,
      onSuccess: (data, variables, onMutateResult, context) => {
        void context;
        onSuccess?.(data, variables, onMutateResult);
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
