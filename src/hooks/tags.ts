import { useMutation, useQuery } from "convex/react";

import { useCurrentOrganization } from "@/store/auth-store";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface Tag {
  id: string;
  _id: string;
  _creationTime: number;
  name: string;
  color: string;
  organizationId: string;
  creatorUserId: string;
}

export function useTags() {
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;

  const tags = useQuery(
    api.tags.listByOrg,
    organizationId ? { organizationId } : "skip",
  );

  return {
    data: tags?.map((t) => ({
      ...t,
      id: t._id,
      color: t.color ?? "#000000", // Default color if missing
    })),
    isLoading: tags === undefined,
  };
}

export function useCreateTag() {
  const currentOrg = useCurrentOrganization();
  const createMutation = useMutation(api.tags.create);

  const mutate = async (data: { name: string; color?: string }) => {
    if (!currentOrg) {
      throw new Error("User must belong to an organization to create a tag");
    }

    return await createMutation({
      organizationId: currentOrg._id as Id<"organizations">,
      name: data.name,
      color: data.color,
    });
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false, // Convex mutations don't have a built-in isPending in this way, but we can wrap it if needed
  };
}

export function useUpdateTag() {
  const updateMutation = useMutation(api.tags.update);

  const mutate = async ({
    id,
    updates,
  }: {
    id: string;
    updates: { name?: string; color?: string };
  }) => {
    return await updateMutation({
      tagId: id as Id<"tags">,
      name: updates.name,
      color: updates.color,
    });
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false,
  };
}

export function useDeleteTag() {
  const deleteMutation = useMutation(api.tags.deleteTag);

  const mutate = async (id: string) => {
    return await deleteMutation({
      tagId: id as Id<"tags">,
    });
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false,
  };
}
