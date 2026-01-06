import { isWithinInterval } from "date-fns-jalali";

import type { ConvexTask } from "./types";
import type { ConvexTaskPriority, ConvexTaskStatus } from "./types";
import type { FilterControls } from "./types";

/**
 * Filter tasks by non-time criteria
 */
export function filterTasksNonTime(
  tasks: ConvexTask[],
  controls: FilterControls,
): ConvexTask[] {
  return tasks.filter((task) => {
    if (
      controls.projectIds?.length &&
      !controls.projectIds.includes(task.project ?? task.projectId)
    )
      return false;
    const assigneeId = task.assigneeUserId ?? task.assignee;
    if (
      controls.assigneeIds?.length &&
      !controls.assigneeIds.includes(assigneeId ?? "")
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
  tasks: ConvexTask[],
  controls: {
    start: Date;
    end: Date;
    projectIds?: string[];
    assigneeIds?: string[];
    statuses?: ConvexTaskStatus[];
    priorities?: ConvexTaskPriority[];
  },
): ConvexTask[] {
  return tasks.filter((task) => {
    // Project filter
    if (controls.projectIds && controls.projectIds.length > 0) {
      const projectId = task.project ?? task.projectId;
      if (!projectId || !controls.projectIds.includes(projectId)) {
        return false;
      }
    }

    // Assignee filter
    const assigneeId = task.assigneeUserId ?? task.assignee;
    if (controls.assigneeIds && controls.assigneeIds.length > 0) {
      if (!assigneeId || !controls.assigneeIds.includes(assigneeId)) {
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
    const createdInRange = isWithinInterval(
      new Date(task._creationTime),
      {
        start: controls.start,
        end: controls.end,
      },
    );
    const updatedAt = task.updatedAt ?? task.updated;
    const updatedInRange = updatedAt
      ? isWithinInterval(new Date(updatedAt), {
          start: controls.start,
          end: controls.end,
        })
      : false;

    return createdInRange || updatedInRange;
  });
}

/**
 * Filter tasks by project IDs
 */
export function filterTasksByProjects(
  tasks: ConvexTask[],
  projectIds: string[],
): ConvexTask[] {
  if (!projectIds.length) return tasks;
  return tasks.filter(
    (task) =>
      (task.project || task.projectId) && projectIds.includes(task.projectId),
  );
}

/**
 * Filter tasks by assignee IDs
 */
export function filterTasksByAssignees(
  tasks: ConvexTask[],
  assigneeIds: string[],
): ConvexTask[] {
  if (!assigneeIds.length) return tasks;
  return tasks.filter((task) => {
    const assigneeId = task.assigneeUserId ?? task.assignee;
    return assigneeId && assigneeIds.includes(assigneeId);
  });
}

/**
 * Filter tasks by status
 */
export function filterTasksByStatus(
  tasks: ConvexTask[],
  statuses: ConvexTaskStatus[],
): ConvexTask[] {
  if (!statuses.length) return tasks;
  return tasks.filter((task) => statuses.includes(task.status));
}

/**
 * Filter tasks by priority
 */
export function filterTasksByPriority(
  tasks: ConvexTask[],
  priorities: ConvexTaskPriority[],
): ConvexTask[] {
  if (!priorities.length) return tasks;
  return tasks.filter((task) => priorities.includes(task.priority));
}

/**
 * Filter tasks by time range
 */
export function filterTasksByTimeRange(
  tasks: ConvexTask[],
  range: { start: Date; end: Date },
): ConvexTask[] {
  return tasks.filter((task) => {
    const createdInRange = isWithinInterval(
      new Date(task._creationTime),
      range,
    );
    const updatedAt = task.updatedAt ?? task.updated;
    const updatedInRange = updatedAt
      ? isWithinInterval(new Date(updatedAt), range)
      : false;
    return createdInRange || updatedInRange;
  });
}

/**
 * Filter completed tasks in range
 */
export function filterCompletedTasksInRange(
  tasks: ConvexTask[],
  range: { start: Date; end: Date },
): ConvexTask[] {
  return tasks.filter((task) => {
    if (task.status !== "done") return false;
    const updatedAt = task.updatedAt ?? task.updated;
    if (!updatedAt) return false;
    return isWithinInterval(new Date(updatedAt), range);
  });
}

/**
 * Filter overdue tasks
 */
export function filterOverdueTasks(
  tasks: ConvexTask[],
  now: Date = new Date(),
): ConvexTask[] {
  return tasks.filter((task) => {
    if (task.status === "done") return false;
    if (!task.deadline) return false;
    return new Date(task.deadline) < now;
  });
}

/**
 * Filter tasks assigned to user
 */
export function filterTasksByUser(
  tasks: ConvexTask[],
  userId: string,
): ConvexTask[] {
  return tasks.filter((task) => {
    const assigneeId = task.assigneeUserId ?? task.assignee;
    return assigneeId === userId;
  });
}
