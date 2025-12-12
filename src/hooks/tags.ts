import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { TagsResponse, TagsRecord } from "@/lib/pocketbase-types";

// Query keys for tags
export const tagQueryKeys = {
  all: ["tags"] as const,
  lists: () => [...tagQueryKeys.all, "list"] as const,
  list: (filters?: string) => [...tagQueryKeys.lists(), { filters }] as const,
};

/**
 * Fetch all tags
 */
export function useTags(
  options?: Omit<
    UseQueryOptions<TagsResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: tagQueryKeys.lists(),
    queryFn: async () => {
      const records = await pb.collection("tags").getFullList<TagsResponse>({
        sort: "name",
      });
      return records;
    },
    ...options,
  });
}

/**
 * Create a new tag
 */
export function useCreateTag(
  options?: UseMutationOptions<TagsResponse, Error, Partial<TagsRecord>>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TagsRecord>) => {
      return await pb.collection("tags").create<TagsResponse>(data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Update an existing tag
 */
export function useUpdateTag(
  options?: UseMutationOptions<
    TagsResponse,
    Error,
    { id: string; data: Partial<TagsRecord> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TagsRecord>;
    }) => {
      return await pb.collection("tags").update<TagsResponse>(id, data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Delete a tag
 */
export function useDeleteTag(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("tags").delete(id);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
