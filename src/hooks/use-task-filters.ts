import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";

import {
  ALL_FILTER_VALUE,
  DEFAULT_TASK_FILTERS,
  FilterableTask,
  filterTasks,
} from "@/lib/filter-utils";
import type { TaskFilterValues } from "@/lib/filter-utils";

export { ALL_FILTER_VALUE };
export type { TaskFilterValues };

export type UseTaskFiltersReturn<T extends FilterableTask> = {
  searchTerm: string;
  selectedStatus: string;
  selectedPriority: string;
  selectedAssignee: string;
  selectedDateRange: string;
  selectedTag: string;
  setSearchTerm: (
    value: string | ((old: string) => string | null) | null,
  ) => Promise<URLSearchParams>;
  setSelectedStatus: (
    value: string | ((old: string) => string | null) | null,
  ) => Promise<URLSearchParams>;
  setSelectedPriority: (
    value: string | ((old: string) => string | null) | null,
  ) => Promise<URLSearchParams>;
  setSelectedAssignee: (
    value: string | ((old: string) => string | null) | null,
  ) => Promise<URLSearchParams>;
  setSelectedDateRange: (
    value: string | ((old: string) => string | null) | null,
  ) => Promise<URLSearchParams>;
  setSelectedTag: (
    value: string | ((old: string) => string | null) | null,
  ) => Promise<URLSearchParams>;
  filteredTasks: T[];
};

const useFilterState = (key: string, defaultValue: string) => {
  return useQueryState(key, parseAsString.withDefault(defaultValue));
};

export function useTaskFilters<T extends FilterableTask>(
  tasks: T[] | undefined,
  options?: { skipFiltering?: boolean },
): UseTaskFiltersReturn<T> {
  const [searchTerm, setSearchTerm] = useFilterState(
    "search",
    DEFAULT_TASK_FILTERS.searchTerm,
  );
  const [selectedStatus, setSelectedStatus] = useFilterState(
    "status",
    DEFAULT_TASK_FILTERS.selectedStatus,
  );
  const [selectedPriority, setSelectedPriority] = useFilterState(
    "priority",
    DEFAULT_TASK_FILTERS.selectedPriority,
  );
  const [selectedAssignee, setSelectedAssignee] = useFilterState(
    "assignee",
    DEFAULT_TASK_FILTERS.selectedAssignee,
  );
  const [selectedDateRange, setSelectedDateRange] = useFilterState(
    "due",
    DEFAULT_TASK_FILTERS.selectedDateRange,
  );
  const [selectedTag, setSelectedTag] = useFilterState(
    "tag",
    DEFAULT_TASK_FILTERS.selectedTag,
  );

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    if (options?.skipFiltering) return tasks;

    return filterTasks(tasks, {
      searchTerm,
      selectedStatus,
      selectedPriority,
      selectedAssignee,
      selectedDateRange,
      selectedTag,
    }) as T[];
  }, [
    tasks,
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedDateRange,
    selectedTag,
    options?.skipFiltering,
  ]);

  return {
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
    filteredTasks,
  };
}
