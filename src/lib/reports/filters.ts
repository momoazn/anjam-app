import { isWithinInterval } from "date-fns-jalali";

import type { TaskWithProject } from "../pocketbase";
import type { TasksPriorityOptions } from "../pocketbase-types";
import { TasksStatusOptions } from "../pocketbase-types";
import type { FilterControls } from "./types";

/**
 * Filter tasks by non-time criteria
 */
export function filterTasksNonTime(
  tasks: TaskWithProject[],
  controls: FilterControls,
): TaskWithProject[] {
  return tasks.filter((task) => {
    if (
      controls.projectIds?.length &&
      !controls.projectIds.includes(task.project ?? "")
    )
      return false;
    if (
      controls.assigneeIds?.length &&
      !controls.assigneeIds.includes(task.assignee ?? "")
    )
      return false;
    if (controls.statuses?.length && !controls.statuses.includes(task.status))
      return false;
    if (
      controls.priorities?.length &&
      !controls.priorities.includes(task.priority)
    )
      return false;
    return true;
  });
}

/**
 * Filter tasks by full controls including time range
 */
export function filterTasksByControls(
  tasks: TaskWithProject[],
  controls: {
    start: Date;
    end: Date;
    projectIds?: string[];
    assigneeIds?: string[];
    statuses?: TasksStatusOptions[];
    priorities?: TasksPriorityOptions[];
  },
): TaskWithProject[] {
  return tasks.filter((task) => {
    // Project filter
    if (controls.projectIds && controls.projectIds.length > 0) {
      if (!task.project || !controls.projectIds.includes(task.project)) {
        return false;
      }
    }

    // Assignee filter
    if (controls.assigneeIds && controls.assigneeIds.length > 0) {
      if (!task.assignee || !controls.assigneeIds.includes(task.assignee)) {
        return false;
      }
    }

    // Status filter
    if (controls.statuses && controls.statuses.length > 0) {
      if (!controls.statuses.includes(task.status)) {
        return false;
      }
    }

    // Priority filter
    if (controls.priorities && controls.priorities.length > 0) {
      if (!controls.priorities.includes(task.priority)) {
        return false;
      }
    }

    // Time window rule: include if created OR updated falls in range
    const createdInRange =
      task.created &&
      isWithinInterval(new Date(task.created), {
        start: controls.start,
        end: controls.end,
      });
    const updatedInRange =
      task.updated &&
      isWithinInterval(new Date(task.updated), {
        start: controls.start,
        end: controls.end,
      });

    return createdInRange || updatedInRange;
  });
}

/**
 * Filter tasks by project IDs
 */
export function filterTasksByProjects(
  tasks: TaskWithProject[],
  projectIds: string[],
): TaskWithProject[] {
  if (!projectIds.length) return tasks;
  return tasks.filter(
    (task) => task.project && projectIds.includes(task.project),
  );
}

/**
 * Filter tasks by assignee IDs
 */
export function filterTasksByAssignees(
  tasks: TaskWithProject[],
  assigneeIds: string[],
): TaskWithProject[] {
  if (!assigneeIds.length) return tasks;
  return tasks.filter(
    (task) => task.assignee && assigneeIds.includes(task.assignee),
  );
}

/**
 * Filter tasks by status
 */
export function filterTasksByStatus(
  tasks: TaskWithProject[],
  statuses: TasksStatusOptions[],
): TaskWithProject[] {
  if (!statuses.length) return tasks;
  return tasks.filter((task) => statuses.includes(task.status));
}

/**
 * Filter tasks by priority
 */
export function filterTasksByPriority(
  tasks: TaskWithProject[],
  priorities: TasksPriorityOptions[],
): TaskWithProject[] {
  if (!priorities.length) return tasks;
  return tasks.filter((task) => priorities.includes(task.priority));
}

/**
 * Filter tasks by time range
 */
export function filterTasksByTimeRange(
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
): TaskWithProject[] {
  return tasks.filter((task) => {
    const createdInRange =
      task.created && isWithinInterval(new Date(task.created), range);
    const updatedInRange =
      task.updated && isWithinInterval(new Date(task.updated), range);
    return createdInRange || updatedInRange;
  });
}

/**
 * Filter completed tasks in range
 */
export function filterCompletedTasksInRange(
  tasks: TaskWithProject[],
  range: { start: Date; end: Date },
): TaskWithProject[] {
  return tasks.filter(
    (task) =>
      task.status === TasksStatusOptions.done &&
      task.updated &&
      isWithinInterval(new Date(task.updated), range),
  );
}

/**
 * Filter overdue tasks
 */
export function filterOverdueTasks(
  tasks: TaskWithProject[],
  now: Date = new Date(),
): TaskWithProject[] {
  return tasks.filter(
    (task) =>
      task.status !== TasksStatusOptions.done &&
      task.deadline &&
      new Date(task.deadline) < now,
  );
}

/**
 * Filter tasks assigned to user
 */
export function filterTasksByUser(
  tasks: TaskWithProject[],
  userId: string,
): TaskWithProject[] {
  return tasks.filter((task) => task.assignee === userId);
}
