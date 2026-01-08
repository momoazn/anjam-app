import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

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

interface PreferencesState {
  preferences: UserPreferences;
  isLoading: boolean;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  toggleProjectFavorite: (projectId: string) => void;
}

const STORAGE_KEY = "anjam_user_preferences";

const initialState = {
  preferences: DEFAULT_USER_PREFERENCES,
  isLoading: false,
} satisfies Omit<
  PreferencesState,
  "updatePreferences" | "toggleProjectFavorite"
>;

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        updatePreferences: (updates) => {
          const newPreferences = { ...get().preferences, ...updates };
          set({ preferences: newPreferences });
        },

        toggleProjectFavorite: (projectId) => {
          const { preferences } = get();
          const currentFavorites = preferences.favorites?.projectIds || [];
          const isFavorite = currentFavorites.includes(projectId);

          const nextFavorites = isFavorite
            ? currentFavorites.filter((id) => id !== projectId)
            : [...currentFavorites, projectId];

          set({
            preferences: {
              ...preferences,
              favorites: {
                ...preferences.favorites,
                projectIds: nextFavorites,
              },
            },
          });
        },
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          preferences: state.preferences,
        }),
      },
    ),
    { name: "preferences-store", enabled: import.meta.env.DEV },
  ),
);

export const useUserPreferences = () =>
  usePreferencesStore((state) => ({
    data: state.preferences,
    isLoading: state.isLoading,
    updatePreferences: state.updatePreferences,
  }));

export const useUpdateUserPreferences = () =>
  usePreferencesStore((state) => ({
    mutate: async (payload: { updates: Partial<UserPreferences> }) => {
      state.updatePreferences(payload.updates);
    },
    isPending: false,
  }));

export const useToggleProjectFavorite = () =>
  usePreferencesStore((state) => ({
    mutate: async (projectId: string) => {
      state.toggleProjectFavorite(projectId);
    },
    isPending: false,
  }));

export const usePreferences = () =>
  usePreferencesStore((state) => state.preferences);
export const useUpdatePreferences = () =>
  usePreferencesStore((state) => state.updatePreferences);
export const useToggleFavorite = () =>
  usePreferencesStore((state) => state.toggleProjectFavorite);
