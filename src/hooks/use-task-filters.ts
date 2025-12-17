import type { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { isPast, isThisMonth, isThisWeek, isToday } from "date-fns-jalali";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";

export const ALL_FILTER_VALUE = "all"; // Export for use in components

export function isValidStatus(value: string): value is TasksStatusOptions {
  return Object.values(TasksStatusOptions).includes(value as TasksStatusOptions);
}

export function isValidPriority(value: string): value is TasksPriorityOptions {
  return Object.values(TasksPriorityOptions).includes(
    value as TasksPriorityOptions,
  );
}

// Define the shape of the filters state
export type TaskFiltersState = {
  searchTerm: string;
  selectedStatus: TasksStatusOptions | typeof ALL_FILTER_VALUE;
  selectedPriority: TasksPriorityOptions | typeof ALL_FILTER_VALUE;
  selectedAssignee: string | typeof ALL_FILTER_VALUE;
  selectedDateRange: string;
  selectedTag: string;
};

// Define the return type of the hook
export type UseTaskFiltersReturn = {
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
  filteredTasks: TaskWithProject[];
};

// The custom hook
export function useTaskFilters(
  tasks: TaskWithProject[] | undefined, // Accept the raw task list
  options?: { skipFiltering?: boolean },
): UseTaskFiltersReturn {
  const [searchTerm, setSearchTerm] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [selectedStatus, setSelectedStatus] = useQueryState(
    "status",
    parseAsString.withDefault(ALL_FILTER_VALUE),
  );
  const [selectedPriority, setSelectedPriority] = useQueryState(
    "priority",
    parseAsString.withDefault(ALL_FILTER_VALUE),
  );
  const [selectedAssignee, setSelectedAssignee] = useQueryState(
    "assignee",
    parseAsString.withDefault(ALL_FILTER_VALUE),
  );
  const [selectedDateRange, setSelectedDateRange] = useQueryState(
    "due",
    parseAsString.withDefault("all"),
  );
  const [selectedTag, setSelectedTag] = useQueryState(
    "tag",
    parseAsString.withDefault("all"),
  );

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    // Allow caller to manage filtering server-side while still reusing state.
    if (options?.skipFiltering) return tasks;

    return tasks.filter((task) => {
      if (task.deleted_at) {
        return false;
      }
      // Search logic
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.expand?.assignee?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filter logic
      let matchesStatus = true;
      if (selectedStatus !== ALL_FILTER_VALUE && isValidStatus(selectedStatus)) {
        matchesStatus = task.status === selectedStatus;
      }

      // Handle comma-separated status values (e.g., "todo,in_progress")
      if (selectedStatus !== ALL_FILTER_VALUE && selectedStatus.includes(",")) {
        const statusArray = selectedStatus
          .split(",")
          .filter((s): s is TasksStatusOptions => isValidStatus(s));
        matchesStatus = statusArray.length > 0 && statusArray.includes(task.status);
      }

      // Special handling for "My Tasks" which should show both todo and in_progress
      if (selectedAssignee === "me" && selectedStatus === ALL_FILTER_VALUE) {
        matchesStatus =
          task.status === TasksStatusOptions.todo ||
          task.status === TasksStatusOptions.in_progress ||
          task.status === TasksStatusOptions.pending;
      }
      let matchesPriority = true;
      if (selectedPriority !== ALL_FILTER_VALUE && isValidPriority(selectedPriority)) {
        matchesPriority = task.priority === selectedPriority;
      }
      const matchesAssignee =
        selectedAssignee === ALL_FILTER_VALUE
          ? true
          : selectedAssignee === "me"
            ? true // "me" filter is already handled by backend role filtering
            : task.assignee === selectedAssignee;

      // Date range filter logic
      const matchesDateRange = (() => {
        if (selectedDateRange === "all") return true;
        if (!task.deadline) return selectedDateRange === "overdue"; // No deadline tasks are not overdue

        const deadline = new Date(task.deadline);

        switch (selectedDateRange) {
          case "today":
            return isToday(deadline);
          case "week":
            return isThisWeek(deadline);
          case "month":
            return isThisMonth(deadline);
          case "overdue":
            return isPast(deadline) && task.status !== TasksStatusOptions.done;
          default:
            return true;
        }
      })();

      // Tag filter logic
      const matchesTag = (() => {
        if (selectedTag === "all") return true;
        if (!task.tags || task.tags.length === 0) return false;
        return task.tags.includes(selectedTag);
      })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        matchesDateRange &&
        matchesTag
      );
    });
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
