import { isPast, isThisMonth, isThisWeek, isToday } from "date-fns-jalali";

import type { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";

export const ALL_FILTER_VALUE = "all";

export type TaskFilterValues = {
  searchTerm: string;
  selectedStatus: string;
  selectedPriority: string;
  selectedAssignee: string;
  selectedDateRange: string;
  selectedTag: string;
};

export const DEFAULT_TASK_FILTERS: TaskFilterValues = {
  searchTerm: "",
  selectedStatus: ALL_FILTER_VALUE,
  selectedPriority: ALL_FILTER_VALUE,
  selectedAssignee: ALL_FILTER_VALUE,
  selectedDateRange: "all",
  selectedTag: "all",
};

export function isValidStatus(value: string): value is TasksStatusOptions {
  return Object.values(TasksStatusOptions).includes(
    value as TasksStatusOptions,
  );
}

export function isValidPriority(value: string): value is TasksPriorityOptions {
  return Object.values(TasksPriorityOptions).includes(
    value as TasksPriorityOptions,
  );
}

export function matchesStatusFilter(
  task: TaskWithProject,
  selectedStatus: string,
  selectedAssignee: string,
): boolean {
  if (selectedStatus === ALL_FILTER_VALUE) {
    if (selectedAssignee === "me") {
      return (
        task.status === TasksStatusOptions.todo ||
        task.status === TasksStatusOptions.in_progress ||
        task.status === TasksStatusOptions.pending
      );
    }
    return true;
  }

  if (selectedStatus.includes(",")) {
    const statusArray = selectedStatus
      .split(",")
      .filter((status): status is TasksStatusOptions => isValidStatus(status));
    return statusArray.length > 0 && statusArray.includes(task.status);
  }

  if (isValidStatus(selectedStatus)) {
    return task.status === selectedStatus;
  }

  return true;
}

export function matchesPriorityFilter(
  task: TaskWithProject,
  selectedPriority: string,
): boolean {
  if (selectedPriority === ALL_FILTER_VALUE) return true;
  if (!isValidPriority(selectedPriority)) return true;
  return task.priority === selectedPriority;
}

export function matchesAssigneeFilter(
  task: TaskWithProject,
  selectedAssignee: string,
): boolean {
  if (selectedAssignee === ALL_FILTER_VALUE) return true;
  if (selectedAssignee === "me") return true;
  return task.assignee === selectedAssignee;
}

export function matchesDateRangeFilter(
  task: TaskWithProject,
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
      return isPast(deadline) && task.status !== TasksStatusOptions.done;
    default:
      return true;
  }
}

export function matchesTagFilter(
  task: TaskWithProject,
  selectedTag: string,
): boolean {
  if (selectedTag === "all") return true;
  if (!task.tags || task.tags.length === 0) return false;
  return task.tags.includes(selectedTag);
}

export function matchesSearchFilter(
  task: TaskWithProject,
  searchTerm: string,
): boolean {
  if (!searchTerm) return true;
  const lowerSearch = searchTerm.toLowerCase();
  const assigneeName = task.expand?.assignee?.username?.toLowerCase();
  return (
    task.title.toLowerCase().includes(lowerSearch) ||
    (assigneeName != null && assigneeName.includes(lowerSearch))
  );
}

export function filterTasks(
  tasks: TaskWithProject[],
  filters: TaskFilterValues,
  options?: { skipDeleted?: boolean },
): TaskWithProject[] {
  return tasks.filter((task) => {
    if (options?.skipDeleted && task.deleted_at) {
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
