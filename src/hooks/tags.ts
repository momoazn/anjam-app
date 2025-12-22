import { useQuery, type UseMutationOptions } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { TagsResponse, TagsRecord } from "@/lib/pocketbase-types";
import { mutationInvalidators } from "@/lib/query-invalidators";
import { createCrudHooks } from "./factories/use-crud-factory";
import { queryKeys } from "./query-keys";

const {
  useCreate: useCreateTagMutation,
  useUpdate: useUpdateTagMutation,
  useDelete: useDeleteTagMutation,
} = createCrudHooks<TagsRecord, TagsResponse>({
  collection: "tags",
  queryKeys: queryKeys.tags,
  invalidators: mutationInvalidators.crud.tags,
});

/**
 * Fetch all tags
 */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: async () => {
      return await pb.collection("tags").getFullList<TagsResponse>({
        sort: "name",
      });
    },
  });
}

/**
 * Create a new tag
 */
export function useCreateTag(
  options?: UseMutationOptions<TagsResponse, Error, Partial<TagsRecord>>,
) {
  return useCreateTagMutation({
    ...options,
    mutationFn: (data) => {
      // Get the current user and set as creator
      const currentUser = pb.authStore.record;
      if (!currentUser) {
        throw new Error("User must be logged in to create a tag");
      }

      // Merge the creator field with the provided data
      const tagData = {
        ...data,
        creator: currentUser.id,
      };

      return pb.collection("tags").create<TagsResponse>(tagData);
    },
  });
}

/**
 * Update an existing tag
 */
export function useUpdateTag(
  options?: UseMutationOptions<
    TagsResponse,
    Error,
    { id: string; updates: Partial<TagsRecord> }
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
