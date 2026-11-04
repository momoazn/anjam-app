import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { DEFAULT_TASK_FILTERS } from "@/lib/filter-utils";
import type { TaskFilterValues } from "@/lib/filter-utils";

import { useAuthUser, useCurrentOrganization } from "./app-context-store";

export interface SavedFilter {
  id: string;
  name: string;
  filters: TaskFilterValues;
  createdAt: string;
  isDefault?: boolean;
}

interface Scope {
  savedFilters: SavedFilter[];
  defaultFilterId: string | null;
}

const EMPTY_SCOPE: Scope = { savedFilters: [], defaultFilterId: null };

/** Saved filters belong to one user inside one organization. */
export function filterScopeKey(
  organizationId: string | null | undefined,
  userId: string | null | undefined,
): string {
  return `${organizationId ?? "no-org"}:${userId ?? "no-user"}`;
}

interface FiltersState {
  scopes: Record<string, Scope>;
  saveFilter: (
    scope: string,
    name: string,
    filters: TaskFilterValues,
  ) => SavedFilter;
  updateFilter: (
    scope: string,
    id: string,
    updates: Partial<Omit<SavedFilter, "id" | "createdAt">>,
  ) => void;
  deleteFilter: (scope: string, id: string) => void;
  setAsDefault: (scope: string, id: string | null) => void;
}

const STORAGE_KEY = "anjam_saved_filters";

function matches(a: TaskFilterValues, b: TaskFilterValues) {
  return (
    a.searchTerm === b.searchTerm &&
    a.selectedStatus === b.selectedStatus &&
    a.selectedPriority === b.selectedPriority &&
    a.selectedAssignee === b.selectedAssignee &&
    a.selectedDateRange === b.selectedDateRange &&
    a.selectedTag === b.selectedTag
  );
}

const useFiltersStore = create<FiltersState>()(
  devtools(
    persist(
      (set, get) => {
        const patch = (scope: string, next: Partial<Scope>) =>
          set((state) => ({
            scopes: {
              ...state.scopes,
              [scope]: { ...(state.scopes[scope] ?? EMPTY_SCOPE), ...next },
            },
          }));
        const read = (scope: string) => get().scopes[scope] ?? EMPTY_SCOPE;

        return {
          scopes: {},

          saveFilter: (scope, name, filters) => {
            const newFilter: SavedFilter = {
              id: `filter_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
              name,
              filters,
              createdAt: new Date().toISOString(),
            };
            patch(scope, {
              savedFilters: [...read(scope).savedFilters, newFilter],
            });
            return newFilter;
          },

          updateFilter: (scope, id, updates) => {
            patch(scope, {
              savedFilters: read(scope).savedFilters.map((filter) =>
                filter.id === id ? { ...filter, ...updates } : filter,
              ),
            });
          },

          deleteFilter: (scope, id) => {
            const { savedFilters, defaultFilterId } = read(scope);
            patch(scope, {
              savedFilters: savedFilters.filter((filter) => filter.id !== id),
              defaultFilterId: defaultFilterId === id ? null : defaultFilterId,
            });
          },

          setAsDefault: (scope, id) => patch(scope, { defaultFilterId: id }),
        };
      },
      {
        name: STORAGE_KEY,
        version: 1,
        // v0 kept one global list; its owner is unknown, so drop it.
        migrate: () => ({ scopes: {} }),
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ scopes: state.scopes }),
      },
    ),
    { name: "filters-store", enabled: import.meta.env.DEV },
  ),
);

export function isDefaultFilters(filters: TaskFilterValues): boolean {
  return matches(filters, DEFAULT_TASK_FILTERS);
}

export const useSavedFilters = () => {
  const organization = useCurrentOrganization();
  const user = useAuthUser();
  const scope = filterScopeKey(organization?._id, user?._id);
  const { savedFilters, defaultFilterId } = useFiltersStore(
    (state) => state.scopes[scope] ?? EMPTY_SCOPE,
  );
  const actions = useFiltersStore(
    useShallow((state) => ({
      saveFilter: state.saveFilter,
      updateFilter: state.updateFilter,
      deleteFilter: state.deleteFilter,
      setAsDefault: state.setAsDefault,
    })),
  );

  return {
    savedFilters,
    defaultFilterId,
    saveFilter: (name: string, filters: TaskFilterValues) =>
      actions.saveFilter(scope, name, filters),
    updateFilter: (
      id: string,
      updates: Partial<Omit<SavedFilter, "id" | "createdAt">>,
    ) => actions.updateFilter(scope, id, updates),
    deleteFilter: (id: string) => actions.deleteFilter(scope, id),
    setAsDefault: (id: string | null) => actions.setAsDefault(scope, id),
    getDefaultFilter: () =>
      savedFilters.find((f) => f.id === defaultFilterId) ?? null,
    getCurrentFilterMatch: (current: TaskFilterValues) =>
      savedFilters.find((saved) => matches(saved.filters, current)) ?? null,
    isDefaultFilters,
  };
};
