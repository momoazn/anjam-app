import { useState } from "react";
import { useDebounce } from "use-debounce";
import type { FilterState, BucketType } from "./types";

export function useReportsFilters() {
  const [filtersState, setFiltersState] = useState<FilterState>({
    timeRange: { preset: "30D" },
    filters: {
      projectIds: [],
      assigneeIds: [],
      statuses: [],
      priorities: [],
    },
  });

  const [employeeBucket, setEmployeeBucket] = useState<BucketType>("weekly");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const [debouncedFilters] = useDebounce(filtersState, 200);

  return {
    filtersState,
    setFiltersState,
    debouncedFilters,
    employeeBucket,
    setEmployeeBucket,
    selectedEmployeeId,
    setSelectedEmployeeId,
  };
}
