/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";

import { savedFilters as savedFiltersText } from "@/constants";

import {
  DEFAULT_TASK_FILTERS,
  type TaskFilterValues,
} from "./use-task-filters";

export interface SavedFilter {
  id: string;
  name: string;
  filters: TaskFilterValues;
  createdAt: string;
  isDefault?: boolean;
}

const STORAGE_KEY = "anjam_saved_filters";
const DEFAULT_FILTER_KEY = "anjam_default_filter";

/**
 * Hook for managing saved filters in localStorage
 */
export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [defaultFilterId, setDefaultFilterId] = useState<string | null>(null);

  // Load saved filters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const defaultId = localStorage.getItem(DEFAULT_FILTER_KEY);

      if (stored) {
        const filters = JSON.parse(stored) as SavedFilter[];
        setSavedFilters(filters);
      }

      setDefaultFilterId(defaultId);
    } catch {
      // Silently fail - filters will just be empty
    }
  }, []);

  // Save filters to localStorage
  const persistFilters = useCallback((filters: SavedFilter[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      setSavedFilters(filters);
    } catch {
      throw new Error(savedFiltersText.toast.saveError);
    }
  }, []);

  const saveFilter = useCallback(
    (name: string, filters: TaskFilterValues): SavedFilter => {
      const newFilter: SavedFilter = {
        id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        filters,
        createdAt: new Date().toISOString(),
      };

      const updatedFilters = [...savedFilters, newFilter];
      persistFilters(updatedFilters);

      return newFilter;
    },
    [savedFilters, persistFilters],
  );

  const updateFilter = useCallback(
    (id: string, updates: Partial<Omit<SavedFilter, "id" | "createdAt">>) => {
      const updatedFilters = savedFilters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter,
      );
      persistFilters(updatedFilters);
    },
    [savedFilters, persistFilters],
  );

  const deleteFilter = useCallback(
    (id: string) => {
      const updatedFilters = savedFilters.filter((filter) => filter.id !== id);
      persistFilters(updatedFilters);

      // Clear default if it was deleted
      if (defaultFilterId === id) {
        localStorage.removeItem(DEFAULT_FILTER_KEY);
        setDefaultFilterId(null);
      }
    },
    [savedFilters, defaultFilterId, persistFilters],
  );

  const setAsDefault = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem(DEFAULT_FILTER_KEY, id);
    } else {
      localStorage.removeItem(DEFAULT_FILTER_KEY);
    }
    setDefaultFilterId(id);
  }, []);

  const getDefaultFilter = useCallback((): SavedFilter | null => {
    if (!defaultFilterId) return null;
    return savedFilters.find((f) => f.id === defaultFilterId) ?? null;
  }, [defaultFilterId, savedFilters]);

  const getCurrentFilterMatch = useCallback(
    (currentFilters: TaskFilterValues): SavedFilter | null => {
      return (
        savedFilters.find((saved) => {
          return (
            saved.filters.searchTerm === currentFilters.searchTerm &&
            saved.filters.selectedStatus === currentFilters.selectedStatus &&
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
    [savedFilters],
  );

  const isDefaultFilters = useCallback((filters: TaskFilterValues): boolean => {
    return (
      filters.searchTerm === DEFAULT_TASK_FILTERS.searchTerm &&
      filters.selectedStatus === DEFAULT_TASK_FILTERS.selectedStatus &&
      filters.selectedPriority === DEFAULT_TASK_FILTERS.selectedPriority &&
      filters.selectedAssignee === DEFAULT_TASK_FILTERS.selectedAssignee &&
      filters.selectedDateRange === DEFAULT_TASK_FILTERS.selectedDateRange &&
      filters.selectedTag === DEFAULT_TASK_FILTERS.selectedTag
    );
  }, []);

  return {
    savedFilters,
    saveFilter,
    updateFilter,
    deleteFilter,
    setAsDefault,
    getDefaultFilter,
    defaultFilterId,
    getCurrentFilterMatch,
    isDefaultFilters,
  };
}
