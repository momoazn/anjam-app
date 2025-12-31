import { format } from "date-fns-jalali";
import { useMemo } from "react";

import { reports } from "@/constants";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { UsersRecord } from "@/lib/pocketbase-types";
import {
  buildLeaderboard,
  classifyTimeliness,
  computeEmployeeBuckets,
  computeEmployeeSummary,
  computeOvertimeAnalysis,
  computeOverviewMetrics,
  computeProductivityTrends,
  computeTeamAverages,
  computeWorkloadDistribution,
  countByPriority,
  filterTasksByControls,
  filterTasksNonTime,
  getTimeRange,
} from "@/lib/reports";

import type { BucketType, FilterState, TimelinessDatum } from "./types";

export function useReportsMetrics(
  tasks: TaskWithProject[],
  users: UsersRecord[] | undefined,
  debouncedFilters: FilterState,
  employeeBucket: BucketType,
  selectedEmployeeId: string | null,
) {
  const timeRange = useMemo(
    () =>
      getTimeRange(
        debouncedFilters.timeRange.preset,
        debouncedFilters.timeRange.preset === "CUSTOM"
          ? {
              start: debouncedFilters.timeRange.start!,
              end: debouncedFilters.timeRange.end!,
            }
          : undefined,
      ),
    [debouncedFilters.timeRange],
  );

  const filteredTasks = useMemo(() => {
    return filterTasksByControls(tasks, {
      start: timeRange.start,
      end: timeRange.end,
      projectIds: debouncedFilters.filters.projectIds,
      assigneeIds: debouncedFilters.filters.assigneeIds,
      statuses: debouncedFilters.filters.statuses,
      priorities: debouncedFilters.filters.priorities,
    });
  }, [tasks, timeRange, debouncedFilters.filters]);

  const filteredNonTime = useMemo(() => {
    return filterTasksNonTime(tasks, {
      projectIds: debouncedFilters.filters.projectIds,
      assigneeIds: debouncedFilters.filters.assigneeIds,
      statuses: debouncedFilters.filters.statuses,
      priorities: debouncedFilters.filters.priorities,
    });
  }, [tasks, debouncedFilters.filters]);

  const overviewMetrics = useMemo(() => {
    const base = computeOverviewMetrics({
      tasks: filteredTasks,
      now: new Date(),
      range: timeRange,
    });
    const wip = filteredNonTime.filter(
      (t) => t.status === "in_progress",
    ).length;
    const overdue = filteredNonTime.filter(
      (t) =>
        t.status !== "done" && t.deadline && new Date(t.deadline) < new Date(),
    ).length;
    return { ...base, wip, overdue };
  }, [filteredTasks, filteredNonTime, timeRange]);

  const timelinessData = useMemo<TimelinessDatum[]>(() => {
    const counts = classifyTimeliness(filteredTasks, timeRange);
    return [
      {
        name: reports.chart.timeliness.onTime,
        value: counts.on_time,
        key: "on_time" as const,
      },
      {
        name: reports.chart.timeliness.overdue,
        value: counts.overdue,
        key: "overdue" as const,
      },
      {
        name: reports.chart.timeliness.noDeadline,
        value: counts.no_deadline,
        key: "no_deadline" as const,
      },
    ];
  }, [filteredTasks, timeRange]);

  const priorityData = useMemo(() => {
    return countByPriority(filteredTasks);
  }, [filteredTasks]);

  const leaderboardData = useMemo(() => {
    if (!users || !filteredTasks) return [];
    return buildLeaderboard(users, filteredTasks, timeRange);
  }, [users, filteredTasks, timeRange]);

  const employeeSummaries = useMemo(() => {
    if (!users || !tasks) return [];
    return users
      .filter((u) => u.role === "employee")
      .map((user) => computeEmployeeSummary(user.id, tasks, timeRange, users));
  }, [users, tasks, timeRange]);

  const employeeBuckets = useMemo(() => {
    if (!tasks || !users) return [];
    const bucketsResult = computeEmployeeBuckets(
      tasks,
      users,
      timeRange,
      employeeBucket,
    );
    const aggregatedMap = new Map<
      string,
      { key: string; label: string; count: number }
    >();
    bucketsResult.forEach((employee) => {
      employee.buckets.forEach((bucket) => {
        const existing = aggregatedMap.get(bucket.key);
        if (existing) {
          existing.count += bucket.count;
        } else {
          aggregatedMap.set(bucket.key, {
            key: bucket.key,
            label: bucket.label,
            count: bucket.count,
          });
        }
      });
    });
    return Array.from(aggregatedMap.values()).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }, [tasks, users, timeRange, employeeBucket]);

  const teamAverages = useMemo(() => {
    if (!users || !tasks)
      return {
        averageCompleted: 0,
        averageCompletionRate: 0,
        averageOnTimeRate: 0,
      };
    return computeTeamAverages(users, tasks, timeRange);
  }, [users, tasks, timeRange]);

  const selectedEmployeeSummary = useMemo(() => {
    if (!selectedEmployeeId || !tasks) return null;
    return computeEmployeeSummary(selectedEmployeeId, tasks, timeRange, users);
  }, [selectedEmployeeId, tasks, timeRange, users]);

  const overtimeAnalysis = useMemo(() => {
    if (!users || !tasks) return [];
    return computeOvertimeAnalysis(users, tasks, timeRange);
  }, [users, tasks, timeRange]);

  const workloadDistribution = useMemo(() => {
    if (!users || !tasks) return [];
    return computeWorkloadDistribution(users, tasks);
  }, [users, tasks]);

  const productivityTrendsData = useMemo(() => {
    if (!selectedEmployeeId || !tasks) return null;
    const validBucket =
      employeeBucket === "quarterly" || employeeBucket === "annual"
        ? "monthly"
        : employeeBucket;
    return computeProductivityTrends(
      selectedEmployeeId,
      tasks,
      timeRange,
      validBucket as "daily" | "weekly" | "monthly",
    );
  }, [selectedEmployeeId, tasks, timeRange, employeeBucket]);

  const rangeLabel = `${format(timeRange.start, "yyyy/MM/dd")} ${reports.range.connector} ${format(timeRange.end, "yyyy/MM/dd")}`;

  return {
    timeRange,
    filteredTasks,
    overviewMetrics,
    timelinessData,
    priorityData,
    leaderboardData,
    employeeSummaries,
    employeeBuckets,
    teamAverages,
    selectedEmployeeSummary,
    overtimeAnalysis,
    workloadDistribution,
    productivityTrendsData,
    rangeLabel,
  };
}
