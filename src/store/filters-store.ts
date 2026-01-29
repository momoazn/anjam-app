import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import { DEFAULT_TASK_FILTERS } from "@/lib/filter-utils";
import type { TaskFilterValues } from "@/lib/filter-utils";

export interface SavedFilter {
  id: string;
  name: string;
  filters: TaskFilterValues;
  createdAt: string;
  isDefault?: boolean;
}

interface FiltersState {
  savedFilters: SavedFilter[];
  defaultFilterId: string | null;
  saveFilter: (name: string, filters: TaskFilterValues) => SavedFilter;
  updateFilter: (
    id: string,
    updates: Partial<Omit<SavedFilter, "id" | "createdAt">>,
  ) => void;
  deleteFilter: (id: string) => void;
  setAsDefault: (id: string | null) => void;
  getDefaultFilter: () => SavedFilter | null;
  getCurrentFilterMatch: (
    currentFilters: TaskFilterValues,
  ) => SavedFilter | null;
  isDefaultFilters: (filters: TaskFilterValues) => boolean;
}

const STORAGE_KEY = "anjam_saved_filters";
const DEFAULT_FILTER_KEY = "anjam_default_filter";

const initialState = {
  savedFilters: [],
  defaultFilterId: null,
} satisfies Omit<
  FiltersState,
  | "saveFilter"
  | "updateFilter"
  | "deleteFilter"
  | "setAsDefault"
  | "getDefaultFilter"
  | "getCurrentFilterMatch"
  | "isDefaultFilters"
>;

export const useFiltersStore = create<FiltersState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        saveFilter: (name, filters) => {
          const newFilter: SavedFilter = {
            id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            filters,
            createdAt: new Date().toISOString(),
          };

          const updatedFilters = [...get().savedFilters, newFilter];
          set({ savedFilters: updatedFilters });

          return newFilter;
        },

        updateFilter: (id, updates) => {
          const updatedFilters = get().savedFilters.map((filter) =>
            filter.id === id ? { ...filter, ...updates } : filter,
          );
          set({ savedFilters: updatedFilters });
        },

        deleteFilter: (id) => {
          const { savedFilters, defaultFilterId } = get();
          const updatedFilters = savedFilters.filter(
            (filter) => filter.id !== id,
          );
          set({ savedFilters: updatedFilters });

          if (defaultFilterId === id) {
            localStorage.removeItem(DEFAULT_FILTER_KEY);
            set({ defaultFilterId: null });
          }
        },

        setAsDefault: (id) => {
          if (id) {
            localStorage.setItem(DEFAULT_FILTER_KEY, id);
          } else {
            localStorage.removeItem(DEFAULT_FILTER_KEY);
          }
          set({ defaultFilterId: id });
        },

        getDefaultFilter: () => {
          const { defaultFilterId, savedFilters } = get();
          if (!defaultFilterId) return null;
          return savedFilters.find((f) => f.id === defaultFilterId) ?? null;
        },

        getCurrentFilterMatch: (currentFilters) => {
          const { savedFilters } = get();
          return (
            savedFilters.find((saved) => {
              return (
                saved.filters.searchTerm === currentFilters.searchTerm &&
                saved.filters.selectedStatus ===
                  currentFilters.selectedStatus &&
                saved.filters.selectedPriority ===
                  currentFilters.selectedPriority &&
                saved.filters.selectedAssignee ===
                  currentFilters.selectedAssignee &&
                saved.filters.selectedDateRange ===
                  currentFilters.selectedDateRange &&
                saved.filters.selectedTag === currentFilters.selectedTag
              );
            }) ?? null
          );
        },

        isDefaultFilters: (filters) => {
          return (
            filters.searchTerm === DEFAULT_TASK_FILTERS.searchTerm &&
            filters.selectedStatus === DEFAULT_TASK_FILTERS.selectedStatus &&
            filters.selectedPriority ===
              DEFAULT_TASK_FILTERS.selectedPriority &&
            filters.selectedAssignee ===
              DEFAULT_TASK_FILTERS.selectedAssignee &&
            filters.selectedDateRange ===
              DEFAULT_TASK_FILTERS.selectedDateRange &&
            filters.selectedTag === DEFAULT_TASK_FILTERS.selectedTag
          );
        },
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          savedFilters: state.savedFilters,
          defaultFilterId: state.defaultFilterId,
        }),
        onRehydrateStorage: () => {
          return (state) => {
            if (state) {
              const defaultId = localStorage.getItem(DEFAULT_FILTER_KEY);
              state.defaultFilterId = defaultId;
            }
          };
        },
      },
    ),
    { name: "filters-store", enabled: import.meta.env.DEV },
  ),
);

export const useSavedFilters = () =>
  useFiltersStore((state) => ({
    savedFilters: state.savedFilters,
    saveFilter: state.saveFilter,
    updateFilter: state.updateFilter,
    deleteFilter: state.deleteFilter,
    setAsDefault: state.setAsDefault,
    getDefaultFilter: state.getDefaultFilter,
    defaultFilterId: state.defaultFilterId,
    getCurrentFilterMatch: state.getCurrentFilterMatch,
    isDefaultFilters: state.isDefaultFilters,
  }));
export const useDefaultFilterId = () =>
  useFiltersStore((state) => state.defaultFilterId);
export const useSaveFilter = () => useFiltersStore((state) => state.saveFilter);
export const useUpdateFilter = () =>
  useFiltersStore((state) => state.updateFilter);
export const useDeleteFilter = () =>
  useFiltersStore((state) => state.deleteFilter);
export const useSetAsDefault = () =>
  useFiltersStore((state) => state.setAsDefault);
export const useGetDefaultFilter = () =>
  useFiltersStore((state) => state.getDefaultFilter);
export const useGetCurrentFilterMatch = () =>
  useFiltersStore((state) => state.getCurrentFilterMatch);
export const useIsDefaultFilters = () =>
  useFiltersStore((state) => state.isDefaultFilters);

export const useFiltersActions = () =>
  useFiltersStore((state) => ({
    saveFilter: state.saveFilter,
    updateFilter: state.updateFilter,
    deleteFilter: state.deleteFilter,
    setAsDefault: state.setAsDefault,
  }));
