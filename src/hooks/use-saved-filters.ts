import { useState, useEffect, useCallback } from "react";
import { ALL_FILTER_VALUE } from "./use-task-filters";

export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    searchTerm: string;
    selectedStatus: string;
    selectedPriority: string;
    selectedAssignee: string;
    selectedDateRange: string;
    selectedTag: string;
  };
  createdAt: string;
  isDefault?: boolean;
}

const STORAGE_KEY = "task_manager_saved_filters";
const DEFAULT_FILTER_KEY = "task_manager_default_filter";

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
      if (stored) {
        const filters = JSON.parse(stored) as SavedFilter[];
        setSavedFilters(filters);
      }

      const defaultId = localStorage.getItem(DEFAULT_FILTER_KEY);
      setDefaultFilterId(defaultId);
    } catch (error) {
      console.error("Failed to load saved filters:", error);
    }
  }, []);

  // Save filters to localStorage
  const persistFilters = useCallback((filters: SavedFilter[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      setSavedFilters(filters);
    } catch (error) {
      console.error("Failed to save filters:", error);
      throw new Error("فشل في حفظ الفلتر");
    }
  }, []);

  // Create a new saved filter
  const saveFilter = useCallback(
    (
      name: string,
      filters: {
        searchTerm: string;
        selectedStatus: string;
        selectedPriority: string;
        selectedAssignee: string;
        selectedDateRange: string;
        selectedTag: string;
      },
    ): SavedFilter => {
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

  // Update an existing filter
  const updateFilter = useCallback(
    (id: string, updates: Partial<Omit<SavedFilter, "id" | "createdAt">>) => {
      const updatedFilters = savedFilters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter,
      );
      persistFilters(updatedFilters);
    },
    [savedFilters, persistFilters],
  );

  // Delete a saved filter
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

  // Set a filter as default
  const setAsDefault = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem(DEFAULT_FILTER_KEY, id);
    } else {
      localStorage.removeItem(DEFAULT_FILTER_KEY);
    }
    setDefaultFilterId(id);
  }, []);

  // Get the default filter
  const getDefaultFilter = useCallback((): SavedFilter | null => {
    if (!defaultFilterId) return null;
    return savedFilters.find((f) => f.id === defaultFilterId) || null;
  }, [defaultFilterId, savedFilters]);

  // Check if current filters match any saved filter
  const getCurrentFilterMatch = useCallback(
    (currentFilters: {
      searchTerm: string;
      selectedStatus: string;
      selectedPriority: string;
      selectedAssignee: string;
      selectedDateRange: string;
      selectedTag: string;
    }): SavedFilter | null => {
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
        }) || null
      );
    },
    [savedFilters],
  );

  // Check if filters are default (all filters cleared)
  const isDefaultFilters = useCallback(
    (filters: {
      searchTerm: string;
      selectedStatus: string;
      selectedPriority: string;
      selectedAssignee: string;
      selectedDateRange: string;
      selectedTag: string;
    }): boolean => {
      return (
        filters.searchTerm === "" &&
        filters.selectedStatus === ALL_FILTER_VALUE &&
        filters.selectedPriority === ALL_FILTER_VALUE &&
        filters.selectedAssignee === ALL_FILTER_VALUE &&
        filters.selectedDateRange === "all" &&
        filters.selectedTag === "all"
      );
    },
    [],
  );

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
