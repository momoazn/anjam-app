import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format, isWithinInterval, startOfQuarter } from "date-fns-jalali";
import { faIR } from "date-fns/locale";

import type { TaskWithProject } from "../pocketbase";
import type { IsoAutoDateString, UsersRecord } from "../pocketbase-types";
import { TasksStatusOptions, UsersRoleOptions } from "../pocketbase-types";
import type {
  EmployeeBucket,
  EmployeeBucketsResult,
  EmployeeSummary,
} from "./types";

function formatBucketLabel(
  key: string,
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
): string {
  try {
    if (bucket === "daily" || bucket === "weekly") {
      return digitsEnToFa(format(new Date(key), "MMM dd", { locale: faIR }));
    } else if (bucket === "monthly") {
      const parts = key.split("-");
      const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      return digitsEnToFa(format(dt, "MMM yyyy", { locale: faIR }));
    } else if (bucket === "annual") {
      return digitsEnToFa(key);
    }
  } catch {
    // fallback to key
  }
  return key;
}

function getUserName(user: UsersRecord): string {
  return user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;
}

/**
 * Compute employee buckets for productivity tracking
 */
export function computeEmployeeBuckets(
  tasksList: TaskWithProject[],
  users: UsersRecord[],
  range: { start: Date; end: Date },
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
): EmployeeBucketsResult[] {
  const countsByUser = new Map<string, Map<string, number>>();

  for (const task of tasksList) {
    if (
      task.status !== TasksStatusOptions.done ||
      !task.updated ||
      !task.assignee
    )
      continue;
    const updated = new Date(task.updated);
    if (!isWithinInterval(updated, range)) continue;

    const { key } = getBucketKeyAndLabel(updated, bucket);
    const userMap =
      countsByUser.get(task.assignee) || new Map<string, number>();
    userMap.set(key, (userMap.get(key) || 0) + 1);
    countsByUser.set(task.assignee, userMap);
  }

  const allKeysSet = new Set<string>();
  for (const m of countsByUser.values()) {
    for (const k of m.keys()) allKeysSet.add(k);
  }
  const allKeys = Array.from(allKeysSet).sort((a, b) => a.localeCompare(b));

  return users
    .filter((u) => u.role === UsersRoleOptions.employee)
    .map((user) => {
      const userMap = countsByUser.get(user.id) || new Map<string, number>();
      const buckets = allKeys.map((k) => ({
        key: k,
        label: formatBucketLabel(k, bucket),
        count: userMap.get(k) || 0,
      }));
      const totalCompleted = buckets.reduce((s, b) => s + b.count, 0);
      return {
        userId: user.id,
        name: getUserName(user),
        buckets,
        totalCompleted,
      };
    });
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

  // Calculate avg time-to-complete in days
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const avgTimeToCompleteDays =
    completedTasks.reduce((sum, task) => {
      if (!task.created || !task.updated) return sum;
      const created = new Date(task.created).getTime();
      const updated = new Date(task.updated).getTime();
      if (updated >= created) {
        return sum + (updated - created) / MS_PER_DAY;
      }
      return sum;
    }, 0) / (completedTasks.length || 1);

  const efficiencyScore = assigned.length ? completed / assigned.length : 0;

  // Calculate on-time rate
  const onTimeCompleted = completedTasks.filter(
    (task) =>
      task.deadline &&
      task.updated &&
      new Date(task.updated) <= new Date(task.deadline),
  ).length;
  const onTimeRate = completed > 0 ? onTimeCompleted / completed : 0;

  const user = users?.find((u) => u.id === userId);

  return {
    userId,
    name: user ? getUserName(user) : userId,
    totalAssigned: assigned.length,
    completed,
    inProgress,
    overdue,
    avgTimeToCompleteDays,
    efficiencyScore,
    onTimeRate,
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
