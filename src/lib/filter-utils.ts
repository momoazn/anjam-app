import { isPast, isThisMonth, isThisWeek, isToday } from "date-fns-jalali";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskPriority,
  TaskStatus,
} from "@/types/tasks";

export const ALL_FILTER_VALUE = "all";

export type TaskFilterValues = {
  searchTerm: string;
  selectedStatus: string;
  selectedPriority: string;
  selectedAssignee: string;
  selectedDateRange: string;
  selectedTag: string;
};

export interface FilterableTask {
  title: string;
  status: string;
  priority: string;
  assigneeUserId?: string;
  assignee?: { displayName?: string } | null; // Expanded user
  deadline?: number;
  tags?: string[];
  deletedAt?: number;
}

export const DEFAULT_TASK_FILTERS: TaskFilterValues = {
  searchTerm: "",
  selectedStatus: ALL_FILTER_VALUE,
  selectedPriority: ALL_FILTER_VALUE,
  selectedAssignee: ALL_FILTER_VALUE,
  selectedDateRange: "all",
  selectedTag: "all",
};

function isValidStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

function isValidPriority(value: string): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

function matchesStatusFilter(
  task: FilterableTask,
  selectedStatus: string,
  selectedAssignee: string,
): boolean {
  if (selectedStatus === ALL_FILTER_VALUE) {
    if (selectedAssignee === "me") {
      return (
        task.status === "todo" ||
        task.status === "in_progress" ||
        task.status === "in_review"
      );
    }
    return true;
  }

  if (selectedStatus.includes(",")) {
    const statusArray = selectedStatus
      .split(",")
      .filter((status): status is TaskStatus => isValidStatus(status));
    return (
      statusArray.length > 0 && statusArray.includes(task.status as TaskStatus)
    );
  }

  if (isValidStatus(selectedStatus)) {
    return task.status === selectedStatus;
  }

  return true;
}

function matchesPriorityFilter(
  task: FilterableTask,
  selectedPriority: string,
): boolean {
  if (selectedPriority === ALL_FILTER_VALUE) return true;
  if (!isValidPriority(selectedPriority)) return true;
  return task.priority === selectedPriority;
}

function matchesAssigneeFilter(
  task: FilterableTask,
  selectedAssignee: string,
): boolean {
  if (selectedAssignee === ALL_FILTER_VALUE) return true;
  if (selectedAssignee === "me") return true; // Handled by calling component or special logic?
  return task.assigneeUserId === selectedAssignee;
}

function matchesDateRangeFilter(
  task: FilterableTask,
  selectedDateRange: string,
): boolean {
  if (selectedDateRange === "all") return true;
  if (!task.deadline) return selectedDateRange === "overdue";

  const deadline = new Date(task.deadline);

  switch (selectedDateRange) {
    case "today":
      return isToday(deadline);
    case "week":
      return isThisWeek(deadline);
    case "month":
      return isThisMonth(deadline);
    case "overdue":
      return isPast(deadline) && task.status !== "done";
    default:
      return true;
  }
}

function matchesTagFilter(task: FilterableTask, selectedTag: string): boolean {
  if (selectedTag === "all") return true;
  if (!task.tags || task.tags.length === 0) return false;
  return task.tags.includes(selectedTag);
}

function matchesSearchFilter(
  task: FilterableTask,
  searchTerm: string,
): boolean {
  if (!searchTerm) return true;
  const lowerSearch = searchTerm.toLowerCase();
  const assigneeName = task.assignee?.displayName?.toLowerCase();
  return (
    task.title.toLowerCase().includes(lowerSearch) ||
    (assigneeName != null && assigneeName.includes(lowerSearch))
  );
}

export function filterTasks(
  tasks: FilterableTask[],
  filters: TaskFilterValues,
  options?: { skipDeleted?: boolean },
): FilterableTask[] {
  return tasks.filter((task) => {
    if (options?.skipDeleted && task.deletedAt) {
      return false;
    }

    return (
      matchesSearchFilter(task, filters.searchTerm) &&
      matchesStatusFilter(
        task,
        filters.selectedStatus,
        filters.selectedAssignee,
      ) &&
      matchesPriorityFilter(task, filters.selectedPriority) &&
      matchesAssigneeFilter(task, filters.selectedAssignee) &&
      matchesDateRangeFilter(task, filters.selectedDateRange) &&
      matchesTagFilter(task, filters.selectedTag)
    );
  });
}
