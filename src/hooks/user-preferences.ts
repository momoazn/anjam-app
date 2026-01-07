import { useCallback, useState } from "react";

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

const STORAGE_KEY = "anjam_user_preferences";

function getStoredPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_USER_PREFERENCES;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch {
    console.warn("Failed to parse user preferences from localStorage");
  }
  return DEFAULT_USER_PREFERENCES;
}

function storePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    getStoredPreferences(),
  );
  const [isLoading] = useState(false);

  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);
      storePreferences(newPreferences);
    },
    [preferences],
  );

  return {
    data: preferences,
    isLoading,
    updatePreferences,
  };
}

export function useUpdateUserPreferences() {
  const { updatePreferences } = useUserPreferences();

  return {
    mutate: async (payload: { updates: Partial<UserPreferences> }) => {
      updatePreferences(payload.updates);
    },
    isPending: false,
  };
}

export function useToggleProjectFavorite() {
  const { data: preferences, updatePreferences } = useUserPreferences();

  return {
    mutate: async (projectId: string) => {
      if (!preferences) throw new Error("Preferences not loaded");

      const currentFavorites = preferences.favorites?.projectIds || [];
      const isFavorite = currentFavorites.includes(projectId);

      const nextFavorites = isFavorite
        ? currentFavorites.filter((id) => id !== projectId)
        : [...currentFavorites, projectId];

      updatePreferences({
        favorites: {
          ...preferences.favorites,
          projectIds: nextFavorites,
        },
      });
    },
    isPending: false,
  };
}
