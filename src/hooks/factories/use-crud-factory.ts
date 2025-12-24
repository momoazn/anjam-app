/**
 * Generic CRUD hook factory for creating standardized create/update/delete hooks
 * Eliminates boilerplate code across tasks, projects, users, groups, and other collections
 */

import type { QueryClient } from "@tanstack/react-query";
import type { RecordModel } from "pocketbase";
import { pb } from "../../lib/pocketbase";
import { createMutation } from "../use-mutation-factory";

/**
 * Configuration for CRUD hooks
 */
export interface CrudConfig<TResponse, TQueryKeys = unknown> {
  /** PocketBase collection name */
  collection: string;

  /** Query keys for this resource */
  queryKeys: TQueryKeys;

  /** Mutation invalidators for this resource */
  invalidators: {
    create: (client: QueryClient) => void;
    update: (client: QueryClient, id?: string) => void;
    delete: (client: QueryClient, id?: string) => void;
    bulk?: (client: QueryClient) => void;
    reorder?: (client: QueryClient) => void;
  };

  /** Optional additional invalidators for related resources */
  relatedInvalidators?: Array<{
    invalidator: (client: QueryClient, id?: string) => void;
    args: unknown[];
  }>;

  /** Optional response mapping function */
  mapToResponse?: (record: RecordModel) => TResponse;
}

/**
 * Creates standardized CRUD mutation hooks
 * @param config - Configuration object with collection, queryKeys, and invalidators
 * @returns Object with create, update, and delete mutation hooks
 */
export function createCrudHooks<TRecord, TResponse, TQueryKeys = unknown>(
  config: CrudConfig<TResponse, TQueryKeys>,
) {
  const { collection, invalidators, relatedInvalidators } = config;

  const useCreateMutation = createMutation<
    TResponse,
    Error,
    Omit<TRecord, "id" | "created" | "updated">
  >(
    async (data) => {
      const result = await pb.collection(collection).create(data);
      return config.mapToResponse
        ? config.mapToResponse(result)
        : (result as unknown as TResponse);
    },
    (client) => {
      invalidators.create(client);
    },
  );

  const useUpdateMutation = createMutation<
    TResponse,
    Error,
    { id: string; updates: Partial<TRecord> }
  >(
    async ({ id, updates }) => {
      const result = await pb.collection(collection).update(id, updates);
      return config.mapToResponse
        ? config.mapToResponse(result)
        : (result as unknown as TResponse);
    },
    (client, _data, variables) => {
      invalidators.update(client, variables?.id);

      relatedInvalidators?.forEach(({ invalidator }) => {
        invalidator(client, variables?.id);
      });
    },
  );

  const useDeleteMutation = createMutation<TResponse, Error, string>(
    async (id: string) => {
      const supportsSoftDelete = ["tasks", "projects", "comments"].includes(
        collection,
      );

      if (supportsSoftDelete) {
        const result = await pb.collection(collection).update(id, {
          deleted_at: new Date().toISOString(),
        });
        return config.mapToResponse
          ? config.mapToResponse(result)
          : (result as unknown as TResponse);
      } else {
        await pb.collection(collection).delete(id);
        // For hard delete, return a minimal response
        return {} as TResponse;
      }
    },
    (client, _data, id) => {
      invalidators.delete(client, id);
    },
  );

  return {
    useCreate: useCreateMutation,
    useUpdate: useUpdateMutation,
    useDelete: useDeleteMutation,
  };
}

/**
 * Helper function to create bulk operations
 */
export function createBulkOperations<TRecord, TResponse, TQueryKeys = unknown>(
  config: CrudConfig<TResponse, TQueryKeys>,
) {
  const { collection, invalidators } = config;

  return {
    /**
     * Bulk update multiple records
     */
    useBulkUpdate: createMutation<
      TResponse[],
      Error,
      { ids: string[]; updates: Partial<TRecord> }
    >(
      async ({ ids, updates }) => {
        const promises = ids.map((id) =>
          pb.collection(collection).update(id, updates),
        );
        const results = await Promise.all(promises);
        return results as TResponse[];
      },
      (client) => {
        invalidators.bulk?.(client);
      },
    ),

    /**
     * Bulk delete multiple records (soft delete)
     */
    useBulkDelete: createMutation<void, Error, string[]>(
      async (ids: string[]) => {
        const timestamp = new Date().toISOString();
        const supportsSoftDelete = ["tasks", "projects", "comments"].includes(
          collection,
        );

        if (supportsSoftDelete) {
          const promises = ids.map((id) =>
            pb.collection(collection).update(id, { deleted_at: timestamp }),
          );
          await Promise.all(promises);
        } else {
          const promises = ids.map((id) =>
            pb.collection(collection).delete(id),
          );
          await Promise.all(promises);
        }
      },
      (client) => {
        invalidators.bulk?.(client);
      },
    ),
  };
}
