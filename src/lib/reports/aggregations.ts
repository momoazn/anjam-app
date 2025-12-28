import { isWithinInterval, format, startOfQuarter } from "date-fns-jalali";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { faIR } from "date-fns/locale";
import type { TaskWithProject } from "../pocketbase";
import type { UsersRecord, IsoAutoDateString } from "../pocketbase-types";
import { TasksStatusOptions, UsersRoleOptions } from "../pocketbase-types";
import type {
  EmployeeBucketsResult,
  EmployeeBucket,
  EmployeeSummary,
  OvertimeAnalysis,
  WorkloadDistribution,
  LeaderboardEntry,
} from "./types";

/**
 * Compute employee buckets for productivity tracking
 */
export function computeEmployeeBuckets(
  tasksList: TaskWithProject[],
  users: UsersRecord[],
  range: { start: Date; end: Date },
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
): EmployeeBucketsResult[] {
  // Build a map userId -> { key -> count }
  const countsByUser = new Map<string, Map<string, number>>();

  tasksList.forEach((task) => {
    if (
      task.status !== TasksStatusOptions.done ||
      !task.updated ||
      !task.assignee
    )
      return;
    const updated = new Date(task.updated);
    if (!isWithinInterval(updated, range)) return;

    const { key } = getBucketKeyAndLabel(updated, bucket);
    const userMap =
      countsByUser.get(task.assignee) || new Map<string, number>();
    userMap.set(key, (userMap.get(key) || 0) + 1);
    countsByUser.set(task.assignee, userMap);
  });

  // Collect all keys across all users then sort
  const allKeysSet = new Set<string>();
  for (const m of countsByUser.values()) {
    for (const k of m.keys()) {
      allKeysSet.add(k);
    }
  }
  const allKeys = Array.from(allKeysSet).sort((a, b) => a.localeCompare(b));

  // Build results for active users (employees)
  const results: EmployeeBucketsResult[] = users
    .filter((u) => u.role === UsersRoleOptions.employee)
    .map((user) => {
      const userMap = countsByUser.get(user.id) || new Map<string, number>();
      const buckets = allKeys.map((k) => {
        let label = k;
        try {
          if (bucket === "daily" || bucket === "weekly") {
            const formattedLabel = format(new Date(k), "MMM dd", {
              locale: faIR,
            });
            label = digitsEnToFa(formattedLabel);
          } else if (bucket === "monthly") {
            const parts = k.split("-");
            const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
            const formattedLabel = format(dt, "MMM yyyy", { locale: faIR });
            label = digitsEnToFa(formattedLabel);
          } else if (bucket === "quarterly") {
            label = k;
          } else if (bucket === "annual") {
            label = digitsEnToFa(k);
          }
        } catch {
          /* fallback label = k */
        }
        return { key: k, label, count: userMap.get(k) || 0 };
      });
      const totalCompleted = buckets.reduce((s, b) => s + b.count, 0);
      return {
        userId: user.id,
        name:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username,
        buckets,
        totalCompleted,
      };
    });

  return results;
}

/**
 * Compute productivity trend for a single user
 */
export function computeProductivityTrend(
  userId: string,
  tasksList: TaskWithProject[],
  range: { start: Date; end: Date },
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
): EmployeeBucket[] {
  const userTasks = tasksList.filter((t) => t.assignee === userId);
  const bucketsResult = computeEmployeeBuckets(
    userTasks,
    [
      {
        id: userId,
        username: "",
        role: UsersRoleOptions.employee,
        password: "",
        tokenKey: "",
        created: "" as unknown as IsoAutoDateString,
        updated: "" as unknown as IsoAutoDateString,
      },
    ],
    range,
    bucket,
  );
  return bucketsResult.length > 0 ? bucketsResult[0].buckets : [];
}

/**
 * Compute employee summary statistics
 */
export function computeEmployeeSummary(
  userId: string,
  tasksList: TaskWithProject[],
  range: { start: Date; end: Date },
  users?: UsersRecord[],
): EmployeeSummary {
  const now = new Date();

  const assigned = tasksList.filter((task) => {
    if (task.assignee !== userId) return false;
    const createdInRange =
      task.created && isWithinInterval(new Date(task.created), range);
    const updatedInRange =
      task.updated && isWithinInterval(new Date(task.updated), range);
    return !!(createdInRange || updatedInRange);
  });

  const completedTasks = assigned.filter(
    (task) => task.status === TasksStatusOptions.done && task.updated,
  );

  const completed = completedTasks.length;
  const inProgress = tasksList.filter(
    (task) =>
      task.assignee === userId &&
      task.status === TasksStatusOptions.in_progress,
  ).length;
  const overdue = tasksList.filter(
    (task) =>
      task.assignee === userId &&
      task.status !== TasksStatusOptions.done &&
      task.deadline &&
      new Date(task.deadline) < now,
  ).length;

  // avg time-to-complete in days
  const timeDiffs: number[] = [];
  completedTasks.forEach((task) => {
    if (task.created && task.updated) {
      const created = new Date(task.created).getTime();
      const updated = new Date(task.updated).getTime();
      if (updated >= created) {
        const days = (updated - created) / (1000 * 60 * 60 * 24);
        timeDiffs.push(days);
      }
    }
  });
  const avgTimeToCompleteDays = timeDiffs.length
    ? timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
    : 0;

  const efficiencyScore = assigned.length ? completed / assigned.length : 0;

  // on-time rate among completed
  const onTimeCompleted = completedTasks.filter(
    (task) =>
      task.deadline &&
      task.updated &&
      new Date(task.updated) <= new Date(task.deadline),
  ).length;
  const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

  const user = users?.find((u) => u.id === userId);
  const name = user
    ? user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username
    : userId;

  return {
    userId,
    name,
    totalAssigned: assigned.length,
    completed,
    inProgress,
    overdue,
    avgTimeToCompleteDays,
    efficiencyScore,
    onTimeRate,
  };
}

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
    .filter((user) => user.role === "employee")
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
          task.status === "done" &&
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

// Helper function for bucket key and label
function getBucketKeyAndLabel(
  date: Date,
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
) {
  switch (bucket) {
    case "daily": {
      const key = format(date, "yyyy-MM-dd");
      const formattedLabel = format(date, "MMM dd", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "weekly": {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d);
      weekStart.setDate(diff);
      const key = format(weekStart, "yyyy-MM-dd");
      const formattedLabel = format(weekStart, "MMM dd", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "monthly": {
      const key = format(date, "yyyy-MM");
      const formattedLabel = format(date, "MMM yyyy", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "quarterly": {
      const s = startOfQuarter(date);
      const key = `${s.getFullYear()}-Q${Math.floor(s.getMonth() / 3) + 1}`;
      const formattedLabel = format(s, "MMM yyyy", { locale: faIR });
      return { key, label: digitsEnToFa(formattedLabel) };
    }
    case "annual": {
      const key = String(date.getFullYear());
      return { key, label: digitsEnToFa(key) };
    }
    default: {
      const defaultKey = format(date, "yyyy-MM-dd");
      const defaultFormattedLabel = format(date, "MMM dd", { locale: faIR });
      return {
        key: defaultKey,
        label: digitsEnToFa(defaultFormattedLabel),
      };
    }
  }
}
