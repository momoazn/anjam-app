import { useCallback } from "react";

import { ALL_FILTER_VALUE, useTaskFilters } from "@/hooks/use-task-filters";
import type { FilterableTask } from "@/lib/filter-utils";

export type TaskFilterValues = {
  searchTerm: string;
  selectedStatus: string;
  selectedPriority: string;
  selectedAssignee: string;
  selectedDateRange: string;
  selectedTag: string;
};

export function useTaskFiltering(
  tasks?: FilterableTask[] | undefined,
  options?: { skipFiltering?: boolean },
) {
  const {
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedDateRange,
    selectedTag,
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedAssignee,
    setSelectedDateRange,
    setSelectedTag,
  } = useTaskFilters(tasks, options);

  const currentFilters: TaskFilterValues = {
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedDateRange,
    selectedTag,
  };

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStatus(ALL_FILTER_VALUE);
    setSelectedPriority(ALL_FILTER_VALUE);
    setSelectedAssignee(ALL_FILTER_VALUE);
    setSelectedDateRange("all");
    setSelectedTag("all");
  }, [
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedAssignee,
    setSelectedDateRange,
    setSelectedTag,
  ]);

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all" ||
    selectedDateRange !== "all" ||
    selectedTag !== "all"
  );

  return {
    filters: {
      searchTerm,
      selectedStatus,
      selectedPriority,
      selectedAssignee,
      selectedDateRange,
      selectedTag,
      setSearchTerm,
      setSelectedStatus,
      setSelectedPriority,
      setSelectedAssignee,
      setSelectedDateRange,
      setSelectedTag,
    },
    currentFilters,
    hasActiveFilters,
    resetFilters,
  };
}
