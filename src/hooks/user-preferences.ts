import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pb } from "@/lib/pocketbase";
import type {
  UserPreferencesRecord,
  UserPreferencesResponse,
} from "@/lib/pocketbase-types";

import { queryKeys } from "./query-keys";

export type UserPreferences = {
  ui: {
    showActivityFeed: boolean;
  };
  display: {
    theme: "light" | "dark" | "system";
    timezone:
      | "auto"
      | "UTC"
      | "Asia/Tehran"
      | "Europe/London"
      | "America/New_York";
    dateFormat: "locale" | "yyyy/MM/dd" | "dd/MM/yyyy" | "MM/dd/yyyy";
  };
  favorites: {
    projectIds: string[];
  };
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  ui: {
    showActivityFeed: true,
  },
  display: {
    theme: "system",
    timezone: "auto",
    dateFormat: "locale",
  },
  favorites: {
    projectIds: [],
  },
};

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  taskAssigned: true,
  projectUpdated: true,
} as const;

export function useUserPreferences() {
  const user = pb.authStore.record;

  return useQuery({
    queryKey: queryKeys.userPreferences.byUser(user?.id),
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
        queryKey: queryKeys.userPreferences.byUser(user.id),
      });
    },
  });
}

export function useToggleProjectFavorite() {
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!preferences) throw new Error("Preferences not loaded");

      const currentFavorites =
        (preferences.preferences as UserPreferences)?.favorites?.projectIds ||
        [];
      const isFavorite = currentFavorites.includes(projectId);

      const nextFavorites = isFavorite
        ? currentFavorites.filter((id) => id !== projectId)
        : [...currentFavorites, projectId];

      return updatePreferences.mutateAsync({
        id: preferences.id,
        updates: {
          preferences: {
            ...(preferences.preferences as UserPreferences),
            favorites: {
              ...(preferences.preferences as UserPreferences)?.favorites,
              projectIds: nextFavorites,
            },
          },
        },
      });
    },
  });
}
