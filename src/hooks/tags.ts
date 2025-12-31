import { type UseMutationOptions, useQuery } from "@tanstack/react-query";

import { pb } from "@/lib/pocketbase";
import type { TagsRecord, TagsResponse } from "@/lib/pocketbase-types";
import { mutationInvalidators } from "@/lib/query-invalidators";
import { useCurrentOrganization } from "@/store/auth-store";

import { createCrudHooks } from "./factories/use-crud-factory";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

const { useUpdate: useUpdateTagMutation, useDelete: useDeleteTagMutation } =
  createCrudHooks<TagsRecord, TagsResponse>({
    collection: "tags",
    queryKeys: queryKeys.tags,
    invalidators: mutationInvalidators.crud.tags,
  });

type CreateTagInput = Pick<TagsRecord, "name" | "color">;

const useCreateTagMutation = createMutation<
  TagsResponse,
  Error,
  CreateTagInput
>(
  (data) => pb.collection("tags").create<TagsResponse>(data),
  (client) => {
    mutationInvalidators.crud.tags.create(client);
  },
);

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
  options?: UseMutationOptions<TagsResponse, Error, CreateTagInput>,
) {
  const currentOrg = useCurrentOrganization();

  return useCreateTagMutation({
    ...options,
    mutationFn: (data) => {
      const currentUser = pb.authStore.record;
      if (!currentUser) {
        throw new Error("User must be logged in to create a tag");
      }
      if (!currentOrg) {
        throw new Error("User must belong to a group to create a tag");
      }

      // Merge the creator field with the provided data
      const tagData = {
        ...data,
        organization: currentOrg.id,
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
  options?: UseMutationOptions<TagsResponse, Error, string>,
) {
  return useDeleteTagMutation(options);
}
