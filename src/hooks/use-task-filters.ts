import { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
  UsersResponse,
} from "@/lib/pocketbase-types";
import { isPast, isThisMonth, isThisWeek, isToday } from "date-fns-jalali";
import { useMemo, useState } from "react";

export const ALL_FILTER_VALUE = "all"; // Export for use in components

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
export type UseTaskFiltersReturn = TaskFiltersState & {
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedStatus: React.Dispatch<
    React.SetStateAction<TasksStatusOptions | typeof ALL_FILTER_VALUE>
  >;
  setSelectedPriority: React.Dispatch<
    React.SetStateAction<TasksPriorityOptions | typeof ALL_FILTER_VALUE>
  >;
  setSelectedAssignee: React.Dispatch<
    React.SetStateAction<string | typeof ALL_FILTER_VALUE>
  >;
  setSelectedDateRange: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTag: React.Dispatch<React.SetStateAction<string>>;
  filteredTasks: TaskWithProject[];
};

// The custom hook
export function useTaskFilters(
  tasks: TaskWithProject[] | undefined, // Accept the raw task list
): UseTaskFiltersReturn {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    TasksStatusOptions | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [selectedPriority, setSelectedPriority] = useState<
    TasksPriorityOptions | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [selectedAssignee, setSelectedAssignee] = useState<
    string | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      // Search logic
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.expand?.assignee as UsersResponse)?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filter logic
      const matchesStatus =
        selectedStatus === ALL_FILTER_VALUE
          ? true
          : task.status === selectedStatus;
      const matchesPriority =
        selectedPriority === ALL_FILTER_VALUE
          ? true
          : task.priority === selectedPriority;
      const matchesAssignee =
        selectedAssignee === ALL_FILTER_VALUE
          ? true
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
