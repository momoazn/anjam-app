import {
  useQuery,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { TagsResponse, TagsRecord } from "@/lib/pocketbase-types";
import { createMutation } from "./use-mutation-factory";

// Query keys for tags
export const tagQueryKeys = {
  all: ["tags"] as const,
  lists: () => [...tagQueryKeys.all, "list"] as const,
  list: (filters?: string) => [...tagQueryKeys.lists(), { filters }] as const,
};

const useCreateTagMutation = createMutation<TagsResponse, Error, Partial<TagsRecord>>(
  (data) => pb.collection("tags").create<TagsResponse>(data),
  (client) => {
    client.invalidateQueries({ queryKey: tagQueryKeys.all });
  },
);

const useUpdateTagMutation = createMutation<
  TagsResponse,
  Error,
  { id: string; data: Partial<TagsRecord> }
>(({ id, data }) => pb.collection("tags").update<TagsResponse>(id, data), (client) => {
  client.invalidateQueries({ queryKey: tagQueryKeys.all });
});

const useDeleteTagMutation = createMutation<void, Error, string>(
  (id) => pb.collection("tags").delete(id),
  (client) => {
    client.invalidateQueries({ queryKey: tagQueryKeys.all });
  },
);

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
  return useCreateTagMutation(options);
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
  return useUpdateTagMutation(options);
}

/**
 * Delete a tag
 */
export function useDeleteTag(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useDeleteTagMutation(options);
}
