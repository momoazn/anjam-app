import { useMutation, useQuery } from "convex/react";

import {
  useAuthIsAuthenticatedStrict,
  useCurrentOrganization,
} from "@/store/app-context-store";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface Tag {
  id: Id<"tags">;
  _id: Id<"tags">;
  _creationTime: number;
  name: string;
  color: string;
  organizationId: Id<"organizations">;
  creatorUserId: Id<"users">;
}

export function useTags() {
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;

  const tags = useQuery(
    api.tags.listByOrg,
    isAuthenticated && organizationId ? { organizationId } : "skip",
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
    isPending: false,
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
    isPending: false,
  };
}
