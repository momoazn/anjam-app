import type { QueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function createMutation<TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidate: (client: QueryClient, data: TData, variables: TVariables) => void,
) {
  return function useFactoryMutation(
    options?: UseMutationOptions<TData, TError, TVariables>,
  ) {
    const queryClient = useQueryClient();
    const { onSuccess, onSettled, ...restOptions } =
      options ?? ({} as UseMutationOptions<TData, TError, TVariables>);

    return useMutation<TData, TError, TVariables>({
      mutationFn,
      onSuccess: (data, variables, context) => {
        onSuccess?.(data, variables, context);
      },
      onSettled: (data, error, variables, context) => {
        if (variables) {
          invalidate(queryClient, data as TData, variables);
        }
        onSettled?.(data, error, variables, context);
      },
      ...restOptions,
    });
  };
}
