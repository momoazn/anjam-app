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
export interface CrudConfig<
  TResponse,
  TQueryKeys = unknown,
  TCreateData = unknown,
> {
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

  /** Optional custom create data type (for excluding auto-generated fields) */
  createDataType?: TCreateData;
}

/**
 * Creates standardized CRUD mutation hooks
 * @param config - Configuration object with collection, queryKeys, and invalidators
 * @returns Object with create, update, and delete mutation hooks
 */
export function createCrudHooks<
  TRecord,
  TResponse,
  TQueryKeys = unknown,
  TCreateData = Omit<TRecord, "id" | "created" | "updated">,
>(config: CrudConfig<TResponse, TQueryKeys, TCreateData>) {
  const { collection, invalidators, relatedInvalidators } = config;

  const useCreateMutation = createMutation<TResponse, Error, TCreateData>(
    async (data) => {
      const result = await pb
        .collection(collection)
        .create(data as Record<string, unknown>);
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
      const supportsSoftDelete = ["tasks", "comments"].includes(collection);

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

export function createBulkOperations<TRecord, TResponse, TQueryKeys = unknown>(
  config: CrudConfig<TResponse, TQueryKeys>,
) {
  const { collection, invalidators } = config;

  return {
    useBulkUpdate: createMutation<
      TResponse[],
      Error,
      { ids: string[]; updates: Partial<TRecord> }
    >(
      async ({ ids, updates }) => {
        const promises = ids.map((id) =>
          pb.collection(collection).update(id, updates),
        );
        const results = await Promise.allSettled(promises);

        // Check for failures and collect successful results
        const successfulResults: TResponse[] = [];
        const errors: string[] = [];

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            successfulResults.push(
              config.mapToResponse
                ? config.mapToResponse(result.value)
                : (result.value as unknown as TResponse),
            );
          } else {
            errors.push(
              `Failed to update item at index ${index}: ${result.reason}`,
            );
          }
        });

        // If all operations failed, throw an error
        if (successfulResults.length === 0 && errors.length > 0) {
          throw new Error(`Bulk update failed: ${errors.join("; ")}`);
        }

        // Log partial failures but still return successful results
        if (errors.length > 0) {
          console.warn(
            `Bulk update completed with ${errors.length} failures:`,
            errors,
          );
        }

        return successfulResults;
      },
      (client) => {
        invalidators.bulk?.(client);
      },
    ),

    useBulkDelete: createMutation<void, Error, string[]>(
      async (ids: string[]) => {
        const timestamp = new Date().toISOString();
        const supportsSoftDelete = ["tasks", "comments"].includes(collection);

        const operations = ids.map((id) =>
          supportsSoftDelete
            ? pb.collection(collection).update(id, { deleted_at: timestamp })
            : pb.collection(collection).delete(id),
        );

        const results = await Promise.allSettled(operations);

        // Check for failures
        const errors: string[] = [];
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            errors.push(
              `Failed to delete item at index ${index}: ${result.reason}`,
            );
          }
        });

        // If all operations failed, throw an error
        if (errors.length === ids.length && errors.length > 0) {
          throw new Error(`Bulk delete failed: ${errors.join("; ")}`);
        }

        // Log partial failures
        if (errors.length > 0) {
          console.warn(
            `Bulk delete completed with ${errors.length} failures:`,
            errors,
          );
        }
      },
      (client) => {
        invalidators.bulk?.(client);
      },
    ),
  };
}
