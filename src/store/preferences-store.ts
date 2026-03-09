import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

type UserPreferences = {
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
};

interface PreferencesState {
  preferences: UserPreferences;
  isLoading: boolean;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const STORAGE_KEY = "anjam_user_preferences";

const initialState = {
  preferences: DEFAULT_USER_PREFERENCES,
  isLoading: false,
} satisfies Omit<
  PreferencesState,
  "updatePreferences" | "toggleProjectFavorite"
>;

const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        updatePreferences: (updates) => {
          const newPreferences = { ...get().preferences, ...updates };
          set({ preferences: newPreferences });
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
  usePreferencesStore(
    useShallow((state) => ({
      data: state.preferences,
      isLoading: state.isLoading,
      updatePreferences: state.updatePreferences,
    })),
  );

export const useUpdateUserPreferences = () => {
  const updatePreferences = usePreferencesStore(
    (state) => state.updatePreferences,
  );

  return {
    mutate: async (payload: { updates: Partial<UserPreferences> }) => {
      updatePreferences(payload.updates);
    },
    isPending: false,
  } as const;
};
