import { isWithinInterval } from "date-fns-jalali";
import type { TaskWithProject } from "../pocketbase";
import type { UsersRecord } from "../pocketbase-types";
import { TasksStatusOptions, UsersRoleOptions } from "../pocketbase-types";
import type { OvertimeAnalysis, WorkloadDistribution } from "./types";

/**
 * Compute overtime analysis
 */
export function computeOvertimeAnalysis(
  users: UsersRecord[],
  tasksList: TaskWithProject[],
  range: { start: Date; end: Date },
): OvertimeAnalysis[] {
  const now = new Date();

  return users
    .filter((u) => u.role === UsersRoleOptions.employee)
    .map((user) => {
      const userTasks = tasksList.filter((t) => t.assignee === user.id);

      // Tasks in range (created or updated)
      const tasksInRange = userTasks.filter((task) => {
        const createdInRange =
          task.created && isWithinInterval(new Date(task.created), range);
        const updatedInRange =
          task.updated && isWithinInterval(new Date(task.updated), range);
        return createdInRange || updatedInRange;
      });

      // Completed tasks in range
      const completedTasks = tasksInRange.filter(
        (task) =>
          task.status === TasksStatusOptions.done &&
          task.updated &&
          isWithinInterval(new Date(task.updated), range),
      );

      // Overdue tasks (past deadline and not done)
      const overdueTasks = userTasks.filter(
        (task) =>
          task.status !== TasksStatusOptions.done &&
          task.deadline &&
          new Date(task.deadline) < now,
      );

      // Calculate average completion time
      const completionTimes: number[] = [];
      completedTasks.forEach((task) => {
        if (task.created && task.updated) {
          const created = new Date(task.created).getTime();
          const updated = new Date(task.updated).getTime();
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
        (t) => t.status === TasksStatusOptions.in_progress,
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
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
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
  users: UsersRecord[],
  tasksList: TaskWithProject[],
): WorkloadDistribution[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return users
    .filter((u) => u.role === UsersRoleOptions.employee)
    .map((user) => {
      const userTasks = tasksList.filter((t) => t.assignee === user.id);

      // Active tasks (in progress)
      const activeTasks = userTasks.filter(
        (t) => t.status === TasksStatusOptions.in_progress,
      ).length;

      // Upcoming tasks (todo with deadline in next week)
      const upcomingTasks = userTasks.filter(
        (t) =>
          t.status === TasksStatusOptions.todo &&
          t.deadline &&
          new Date(t.deadline) >= now &&
          new Date(t.deadline) <= nextWeek,
      ).length;

      // Overdue tasks
      const overdueTasks = userTasks.filter(
        (t) =>
          t.status !== TasksStatusOptions.done &&
          t.deadline &&
          new Date(t.deadline) < now,
      ).length;

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
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        activeTasks,
        upcomingTasks,
        overdueTasks,
        capacityUtilization,
        workloadLevel,
      };
    })
    .sort((a, b) => b.capacityUtilization - a.capacityUtilization);
}
