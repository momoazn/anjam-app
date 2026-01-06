import { isWithinInterval } from "date-fns-jalali";

import type { ConvexTask, ConvexUser } from "./types";
import {
  computeEmployeeSummary,
  computeProductivityTrend,
} from "./employee-aggregations";
import type { EmployeeBucket, LeaderboardEntry } from "./types";

/**
 * Compute team averages
 */
export function computeTeamAverages(
  users: ConvexUser[],
  tasksList: ConvexTask[],
  range: { start: Date; end: Date },
): {
  averageCompleted: number;
  averageCompletionRate: number;
  averageOnTimeRate: number;
} {
  if (users.length === 0) {
    return {
      averageCompleted: 0,
      averageCompletionRate: 0,
      averageOnTimeRate: 0,
    };
  }

  let totalCompleted = 0;
  let totalCompletionRate = 0;
  let totalOnTimeRate = 0;

  users.forEach((user) => {
    const userId = user._id || user.id;
    const summary = computeEmployeeSummary(userId, tasksList, range);
    totalCompleted += summary.completed;
    totalCompletionRate += summary.efficiencyScore;
    totalOnTimeRate += summary.onTimeRate;
  });

  return {
    averageCompleted: totalCompleted / users.length,
    averageCompletionRate: totalCompletionRate / users.length,
    averageOnTimeRate: totalOnTimeRate / users.length,
  };
}

/**
 * Build leaderboard for top performers
 */
export function buildLeaderboard(
  users: ConvexUser[],
  tasksList: ConvexTask[],
  range: { start: Date; end: Date },
): LeaderboardEntry[] {
  return users
    .map((user) => {
      const userId = user._id || user.id;

      // Assigned: tasks assigned to user with created or updated in range
      const assigned = tasksList.filter((task) => {
        const assigneeId = task.assigneeUserId ?? task.assignee;
        if (assigneeId !== userId) return false;
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

      // Completed: assigned tasks that are done with updated in range
      const completedTasks = assigned.filter((task) => {
        if (task.status !== "done") return false;
        const updatedAt = task.updatedAt ?? task.updated;
        if (!updatedAt) return false;
        return isWithinInterval(new Date(updatedAt), range);
      });

      const completed = completedTasks.length;
      const completionRate =
        Math.max(assigned.length, 1) > 0 ? completed / assigned.length : 0;

      // On-time: among completed, with deadline and updated <= deadline
      const onTimeCompleted = completedTasks.filter((task) => {
        if (!task.deadline) return false;
        const updatedAt = task.updatedAt ?? task.updated;
        if (!updatedAt) return false;
        return new Date(updatedAt) <= new Date(task.deadline);
      }).length;
      const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

      return {
        userId,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username || "Unknown",
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
  tasksList: ConvexTask[],
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
