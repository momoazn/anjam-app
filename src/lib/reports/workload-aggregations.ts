import { isWithinInterval } from "date-fns-jalali";

import type { ConvexTask, ConvexUser } from "./types";
import type { OvertimeAnalysis, WorkloadDistribution } from "./types";

/**
 * Compute overtime analysis
 */
export function computeOvertimeAnalysis(
  users: ConvexUser[],
  tasksList: ConvexTask[],
  range: { start: Date; end: Date },
): OvertimeAnalysis[] {
  const now = new Date();

  return users
    .map((user) => {
      const userId = user._id || user.id;
      const userTasks = tasksList.filter(
        (t) =>
          t.assigneeUserId === userId || t.assignee === userId,
      );

      // Tasks in range (created or updated)
      const tasksInRange = userTasks.filter((task) => {
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

      // Completed tasks in range
      const completedTasks = tasksInRange.filter((task) => {
        if (task.status !== "done") return false;
        const updatedAt = task.updatedAt ?? task.updated;
        if (!updatedAt) return false;
        return isWithinInterval(new Date(updatedAt), range);
      });

      // Overdue tasks (past deadline and not done)
      const overdueTasks = userTasks.filter((task) => {
        if (task.status === "done") return false;
        if (!task.deadline) return false;
        return new Date(task.deadline) < now;
      });

      // Calculate average completion time
      const completionTimes: number[] = [];
      completedTasks.forEach((task) => {
        const created = new Date(task._creationTime).getTime();
        const updatedAt = task.updatedAt ?? task.updated;
        if (updatedAt) {
          const updated = new Date(updatedAt).getTime();
          if (updated >= created) {
            const days = (updated - created) / (1000 * 60 * 60 * 24);
            completionTimes.push(days);
          }
        }
      });
      const avgCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
          : 0;

      // Workload score
      const activeTasks = userTasks.filter(
        (t) => t.status === "in_progress",
      ).length;
      const completionRate =
        tasksInRange.length > 0
          ? completedTasks.length / tasksInRange.length
          : 0;
      const workloadScore = Math.min(
        100,
        activeTasks * 10 + overdueTasks.length * 15 + (1 - completionRate) * 20,
      );

      // Overtime indicator
      const overtimeIndicator =
        overdueTasks.length * 4 + Math.max(0, (activeTasks - 3) * 2);

      return {
        userId,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username || "Unknown",
        totalTasks: tasksInRange.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        avgCompletionTime,
        workloadScore,
        overtimeIndicator,
      };
    })
    .sort((a, b) => b.workloadScore - a.workloadScore);
}

/**
 * Compute workload distribution
 */
export function computeWorkloadDistribution(
  users: ConvexUser[],
  tasksList: ConvexTask[],
): WorkloadDistribution[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return users
    .map((user) => {
      const userId = user._id || user.id;
      const userTasks = tasksList.filter(
        (t) =>
          t.assigneeUserId === userId || t.assignee === userId,
      );

      // Active tasks (in progress)
      const activeTasks = userTasks.filter(
        (t) => t.status === "in_progress",
      ).length;

      // Upcoming tasks (todo with deadline in next week)
      const upcomingTasks = userTasks.filter((task) => {
        if (task.status !== "todo") return false;
        if (!task.deadline) return false;
        const deadline = new Date(task.deadline);
        return deadline >= now && deadline <= nextWeek;
      }).length;

      // Overdue tasks
      const overdueTasks = userTasks.filter((task) => {
        if (task.status === "done") return false;
        if (!task.deadline) return false;
        return new Date(task.deadline) < now;
      }).length;

      // Capacity utilization
      const estimatedCapacity = 5;
      const capacityUtilization = Math.min(
        100,
        ((activeTasks + upcomingTasks) / estimatedCapacity) * 100,
      );

      // Workload level classification
      let workloadLevel: "low" | "medium" | "high" | "critical";
      if (capacityUtilization < 40) workloadLevel = "low";
      else if (capacityUtilization < 70) workloadLevel = "medium";
      else if (capacityUtilization < 90) workloadLevel = "high";
      else workloadLevel = "critical";

      return {
        userId,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username || "Unknown",
        activeTasks,
        upcomingTasks,
        overdueTasks,
        capacityUtilization,
        workloadLevel,
      };
    })
    .sort((a, b) => b.capacityUtilization - a.capacityUtilization);
}
