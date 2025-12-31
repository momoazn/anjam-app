import { isWithinInterval } from "date-fns-jalali";

import type { TaskWithProject } from "../pocketbase";
import type { UsersRecord } from "../pocketbase-types";
import { TasksStatusOptions, UsersRoleOptions } from "../pocketbase-types";
import {
  computeEmployeeSummary,
  computeProductivityTrend,
} from "./employee-aggregations";
import type { EmployeeBucket, LeaderboardEntry } from "./types";

/**
 * Compute team averages
 */
export function computeTeamAverages(
  users: UsersRecord[],
  tasksList: TaskWithProject[],
  range: { start: Date; end: Date },
): {
  averageCompleted: number;
  averageCompletionRate: number;
  averageOnTimeRate: number;
} {
  const employeeUsers = users.filter(
    (u) => u.role === UsersRoleOptions.employee,
  );
  if (employeeUsers.length === 0) {
    return {
      averageCompleted: 0,
      averageCompletionRate: 0,
      averageOnTimeRate: 0,
    };
  }

  let totalCompleted = 0;
  let totalCompletionRate = 0;
  let totalOnTimeRate = 0;

  employeeUsers.forEach((user) => {
    const summary = computeEmployeeSummary(user.id, tasksList, range);
    totalCompleted += summary.completed;
    totalCompletionRate += summary.efficiencyScore;
    totalOnTimeRate += summary.onTimeRate;
  });

  return {
    averageCompleted: totalCompleted / employeeUsers.length,
    averageCompletionRate: totalCompletionRate / employeeUsers.length,
    averageOnTimeRate: totalOnTimeRate / employeeUsers.length,
  };
}

/**
 * Build leaderboard for top performers
 */
export function buildLeaderboard(
  users: UsersRecord[],
  tasksList: TaskWithProject[],
  range: { start: Date; end: Date },
): LeaderboardEntry[] {
  return users
    .filter((user) => user.role === UsersRoleOptions.employee)
    .map((user) => {
      // Assigned: tasks assigned to user with created or updated in range
      const assigned = tasksList.filter(
        (task) =>
          task.assignee === user.id &&
          ((task.created && isWithinInterval(new Date(task.created), range)) ||
            (task.updated && isWithinInterval(new Date(task.updated), range))),
      );

      // Completed: assigned tasks that are done with updated in range
      const completedTasks = assigned.filter(
        (task) =>
          task.status === TasksStatusOptions.done &&
          task.updated &&
          isWithinInterval(new Date(task.updated), range),
      );

      const completed = completedTasks.length;
      const completionRate =
        Math.max(assigned.length, 1) > 0 ? completed / assigned.length : 0;

      // On-time: among completed, with deadline and updated <= deadline
      const onTimeCompleted = completedTasks.filter(
        (task) =>
          task.deadline &&
          task.updated &&
          new Date(task.updated) <= new Date(task.deadline),
      ).length;
      const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

      return {
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        completed,
        completionRate,
        onTimeRate,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);
}

/**
 * Compute productivity trends with forecasting
 */
export function computeProductivityTrends(
  userId: string,
  tasksList: TaskWithProject[],
  range: { start: Date; end: Date },
  bucket: "daily" | "weekly" | "monthly",
): {
  historical: EmployeeBucket[];
  trend: "increasing" | "decreasing" | "stable";
  projectedNextPeriod: number;
} {
  const buckets = computeProductivityTrend(userId, tasksList, range, bucket);

  if (buckets.length < 2) {
    return {
      historical: buckets,
      trend: "stable",
      projectedNextPeriod: 0,
    };
  }

  // Calculate trend using simple linear regression
  const n = buckets.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = buckets.reduce((sum, b) => sum + b.count, 0);
  const sumXY = buckets.reduce((sum, b, index) => sum + index * b.count, 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  let trend: "increasing" | "decreasing" | "stable";
  if (slope > 0.5) trend = "increasing";
  else if (slope < -0.5) trend = "decreasing";
  else trend = "stable";

  const lastValue = buckets[buckets.length - 1]?.count || 0;
  const projectedNextPeriod = Math.max(0, lastValue + slope);

  return {
    historical: buckets,
    trend,
    projectedNextPeriod: Math.round(projectedNextPeriod),
  };
}
