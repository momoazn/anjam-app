import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pb } from "@/lib/pocketbase";
import type {
  UserPreferencesRecord,
  UserPreferencesResponse,
} from "@/lib/pocketbase-types";

export const DEFAULT_USER_PREFERENCES = {
  ui: {
    showActivityFeed: true,
  },
  display: {
    theme: "system",
    timezone: "auto",
    dateFormat: "locale",
  },
} as const;

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  taskAssigned: true,
  projectUpdated: true,
} as const;

export function useUserPreferences() {
  const user = pb.authStore.record;

  return useQuery({
    queryKey: ["user_preferences", user?.id ?? ""],
    queryFn: async (): Promise<UserPreferencesResponse> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        return await pb
          .collection("user_preferences")
          .getFirstListItem<UserPreferencesResponse>(`user = "${user.id}"`);
      } catch (error: unknown) {
        const isNotFound =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error as { status?: number }).status === 404;
        if (!isNotFound) {
          throw error;
        }

        return await pb
          .collection("user_preferences")
          .create<UserPreferencesResponse>({
            user: user.id,
            preferences: DEFAULT_USER_PREFERENCES,
            notifications: DEFAULT_NOTIFICATION_PREFERENCES,
          });
      }
    },
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  const user = pb.authStore.record;

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      updates: Partial<
        Pick<UserPreferencesRecord, "preferences" | "notifications">
      >;
    }) => {
      return pb
        .collection("user_preferences")
        .update<UserPreferencesResponse>(payload.id, payload.updates);
    },
    onSuccess: () => {
      if (!user?.id) return;
      queryClient.invalidateQueries({
        queryKey: ["user_preferences", user.id],
      });
    },
  });
}
