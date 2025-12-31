import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format, isWithinInterval } from "date-fns-jalali";
import { faIR } from "date-fns/locale";

import type { TaskWithProject } from "../pocketbase";
import { TasksStatusOptions } from "../pocketbase-types";
import type { CompletionTrendData, ThroughputDataPoint } from "./types";

/**
 * Calculate completion trend over the last 30 days
 */
export function calculateCompletionTrend(
  tasks: TaskWithProject[],
): CompletionTrendData[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completedOverTime = tasks
    .filter(
      (task) =>
        task.status === TasksStatusOptions.done &&
        task.updated &&
        new Date(task.updated) >= thirtyDaysAgo,
    )
    .reduce(
      (acc, task) => {
        if (task.updated) {
          const taskDate = new Date(task.updated);
          const date = format(taskDate, "MMM dd", {
            locale: undefined,
          });
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

  return Object.entries(completedOverTime).map(([date, count]) => ({
    date,
    completed: count,
  }));
}

/**
 * Group throughput by time bucket
 */
export function groupThroughput(
  tasks: TaskWithProject[],
  bucket: "daily" | "weekly",
  range: { start: Date; end: Date },
): ThroughputDataPoint[] {
  const map = new Map<string, number>();

  tasks.forEach((task) => {
    if (task.status === "done" && task.updated) {
      const taskDate = new Date(task.updated);
      if (isWithinInterval(taskDate, range)) {
        let key: string;
        if (bucket === "daily") {
          key = format(taskDate, "yyyy-MM-dd");
        } else {
          // Weekly: ISO week start Monday
          const weekStart = new Date(taskDate);
          const day = taskDate.getDay();
          const diff = taskDate.getDate() - day + (day === 0 ? -6 : 1);
          weekStart.setDate(diff);
          key = format(weekStart, "yyyy-MM-dd");
        }
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
  });

  // Convert to sorted array with Jalali display labels
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const formattedLabel = format(new Date(key), "MMM dd", { locale: faIR });
      const labelWithPersianDigits = digitsEnToFa(formattedLabel);
      return {
        key,
        label: labelWithPersianDigits,
        count,
      };
    });
}

/**
 * Prepare data for status distribution chart
 */
export function prepareStatusDistributionData(
  statusDistribution: Array<{ name: string; value: number; status: string }>,
) {
  return statusDistribution
    .filter((item) => item.value > 0)
    .map((item) => ({
      id: item.status,
      label: item.name,
      value: item.value,
    }));
}

/**
 * Prepare data for priority distribution chart
 */
export function preparePriorityDistributionData(
  priorityDistribution: Array<{
    name: string;
    value: number;
    priority: string;
  }>,
) {
  return priorityDistribution
    .filter((item) => item.value > 0)
    .map((item) => ({
      id: item.priority,
      label: item.name,
      value: item.value,
    }));
}

/**
 * Prepare data for completion trend chart
 */
export function prepareCompletionTrendData(trendData: CompletionTrendData[]) {
  return trendData.map((item) => ({
    date: item.date,
    completed: item.completed,
  }));
}

/**
 * Prepare data for user performance chart
 */
export function prepareUserPerformanceData(
  performanceData: Array<{
    name: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>,
) {
  return performanceData.map((item) => ({
    name: item.name,
    total: item.totalTasks,
    completed: item.completedTasks,
    rate: item.completionRate,
  }));
}
