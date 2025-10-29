import { format, isWithinInterval, startOfQuarter } from "date-fns-jalali";
import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import { EmployeeComparisonChart } from "@/components/reports/employee-comparison-chart";
import { EmployeeOverviewCards } from "@/components/reports/employee-overview-cards";
import { EmployeePerformanceTable } from "@/components/reports/employee-performance-table";
import { EmployeeProductivityChart } from "@/components/reports/employee-productivity-chart";
import { OvertimeAnalysisChart } from "@/components/reports/overtime-analysis-chart";
import { WorkloadDistributionChart } from "@/components/reports/workload-distribution-chart";
import { ProductivityTrendsChart } from "@/components/reports/productivity-trends-chart";
import { DrilldownDrawer } from "@/components/reports/drilldown-drawer";
import {
  FiltersBar,
  type Filters,
  type TimeRange,
} from "@/components/reports/filters-bar";
import { Leaderboard } from "@/components/reports/leaderboard";
import { MetricCards } from "@/components/reports/metric-cards";
import { PriorityDistribution } from "@/components/reports/priority-distribution";
import { TimelinessDonut } from "@/components/reports/timeliness-donut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/lib/reports-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { useProjects, useTasks, useUsers } from "@/hooks";
import type { TaskWithProject } from "@/lib/pocketbase";

type DrilldownState = {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: string | null;
    ageDays: number;
    assigneeName: string;
    projectName: string;
    tags: string[];
  }>;
} | null;

export default function Reports() {
  const [filtersState, setFiltersState] = useState<{
    timeRange: TimeRange;
    filters: Filters;
  }>({
    timeRange: { preset: "30D" },
    filters: {
      projectIds: [],
      assigneeIds: [],
      statuses: [],
      priorities: [],
    },
  });

  const [drilldown, setDrilldown] = useState<DrilldownState>(null);
  const [employeeBucket, setEmployeeBucket] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "annual"
  >("weekly");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const [debouncedFilters] = useDebounce(filtersState, 200);

  const { data: tasks, isPending: tasksPending } = useTasks({
    expandFields: "project,assignee",
    mode: "full",
  });
  const { data: users, isPending: usersPending } = useUsers();
  const { data: projects, isPending: projectsPending } = useProjects();

  const isLoading = tasksPending || usersPending || projectsPending;

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
    if (!tasks) return [];
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
    if (!tasks) return [];
    return filterTasksNonTime(tasks, {
      projectIds: debouncedFilters.filters.projectIds,
      assigneeIds: debouncedFilters.filters.assigneeIds,
      statuses: debouncedFilters.filters.statuses,
      priorities: debouncedFilters.filters.priorities,
    });
  }, [tasks, debouncedFilters.filters]);

  const overviewMetrics = useMemo(() => {
    if (!filteredTasks) return null;
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

  const timelinessData = useMemo(() => {
    if (!filteredTasks) return [];
    const counts = classifyTimeliness(filteredTasks, timeRange);
    return [
      {
        name: fa.reports.chart.timeliness.onTime,
        value: counts.on_time,
        key: "on_time" as const,
      },
      {
        name: fa.reports.chart.timeliness.overdue,
        value: counts.overdue,
        key: "overdue" as const,
      },
      {
        name: fa.reports.chart.timeliness.noDeadline,
        value: counts.no_deadline,
        key: "no_deadline" as const,
      },
    ];
  }, [filteredTasks, timeRange]);

  const priorityData = useMemo(() => {
    if (!filteredTasks) return [];
    return countByPriority(filteredTasks);
  }, [filteredTasks]);

  const leaderboardData = useMemo(() => {
    if (!users || !filteredTasks) return [];
    return buildLeaderboard(users, filteredTasks, timeRange);
  }, [users, filteredTasks, timeRange]);

  // Employee reports data
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
    // Aggregate buckets by key across all employees
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

  // Overtime and workload analysis data
  const overtimeAnalysis = useMemo(() => {
    if (!users || !tasks) return [];
    return computeOvertimeAnalysis(users, tasks, timeRange);
  }, [users, tasks, timeRange]);

  const workloadDistribution = useMemo(() => {
    if (!users || !tasks) return [];
    return computeWorkloadDistribution(users, tasks);
  }, [users, tasks]);

  const productivityTrends = useMemo(() => {
    if (!selectedEmployeeId || !tasks) return null;
    // Convert employeeBucket to valid bucket type for trends
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
  const handleDrilldown = (
    title: string,
    predicate: (task: TaskWithProject) => boolean,
  ) => {
    if (!filteredTasks) return;

    const matchingTasks = filteredTasks.filter(predicate);
    const rows = matchingTasks.map((task) => ({
      id: task.id,
      title: task.title || fa.reports.fallbacks.taskTitle,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline || null,
      ageDays: task.created
        ? Math.ceil(
            (new Date().getTime() - new Date(task.created).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0,
      assigneeName: task.expand?.assignee
        ? `${task.expand.assignee.first_name || ""} ${task.expand.assignee.last_name || ""}`.trim() ||
          task.expand.assignee.username
        : fa.reports.fallbacks.assigneeName,
      projectName:
        task.expand?.project?.name || fa.reports.fallbacks.projectName,
      tags: task.tags || [],
    }));

    setDrilldown({ title, rows });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="h-64 w-full p-4 pt-0 md:h-80">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-muted-foreground flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm">
      {message}
    </div>
  );

  const rangeLabel = `${format(timeRange.start, "yyyy/MM/dd")} ${fa.reports.range.connector} ${format(timeRange.end, "yyyy/MM/dd")}`;

  const totalTimeliness = timelinessData?.reduce(
    (a, b) => a + (b.value || 0),
    0,
  );
  const hasTimeliness = (totalTimeliness || 0) > 0;
  const totalPriority = priorityData?.reduce((a, b) => a + (b.value || 0), 0);
  const hasPriority = (totalPriority || 0) > 0;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />
            {fa.reports.dashboardTitle}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {fa.reports.range.label} {rangeLabel}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FiltersBar
          value={filtersState}
          onChange={setFiltersState}
          projects={projects || []}
          users={users || []}
        />
      </div>

      {/* Overview Metrics */}
      {overviewMetrics && (
        <div className="mb-8">
          <MetricCards totals={overviewMetrics} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Timeliness Donut */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold md:text-lg">
              {fa.reports.charts.timeliness.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full p-4 pt-0">
            {hasTimeliness ? (
              <TimelinessDonut
                data={timelinessData}
                onSliceClick={(key) =>
                  handleDrilldown(
                    timelinessData.find((d) => d.key === key)?.name || "",
                    (task) => {
                      if (
                        task.status !== "done" ||
                        !task.updated ||
                        !isWithinInterval(new Date(task.updated), timeRange)
                      )
                        return false;
                      if (key === "no_deadline") return !task.deadline;
                      if (!task.deadline) return false;
                      const isOnTime =
                        new Date(task.updated) <= new Date(task.deadline);
                      return key === "on_time" ? isOnTime : !isOnTime;
                    },
                  )
                }
              />
            ) : (
              <EmptyState message={fa.reports.charts.timeliness.noData} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold md:text-lg">
              {fa.reports.charts.priorities.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full p-4 pt-0">
            {hasPriority ? (
              <PriorityDistribution
                data={priorityData}
                onSliceClick={(key) =>
                  handleDrilldown(
                    fa.reports.charts.priorities.drilldownTitle.replace(
                      "{name}",
                      priorityData.find((d) => d.key === key)?.name || "",
                    ),
                    (task) => task.priority === key,
                  )
                }
              />
            ) : (
              <EmptyState message={fa.reports.charts.priorities.noData} />
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <Leaderboard
              rows={leaderboardData}
              onRowClick={(userId) =>
                handleDrilldown(
                  fa.reports.charts.users.drilldownTitle
                    .replace(
                      "{firstName}",
                      users?.find((u) => u.id === userId)?.first_name || "",
                    )
                    .replace(
                      "{lastName}",
                      users?.find((u) => u.id === userId)?.last_name || "",
                    ),
                  (task) => task.assignee === userId,
                )
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Employee Reports Section */}
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold md:text-2xl">
            {fa.reports.charts.employee.sectionTitle}
          </h2>
        </div>

        {/* Employee Overview Cards */}
        <div className="mb-8">
          <EmployeeOverviewCards
            summaries={employeeSummaries}
            onCardClick={(userId) => setSelectedEmployeeId(userId)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Employee Productivity Chart */}
          <EmployeeProductivityChart
            buckets={employeeBuckets}
            bucket={employeeBucket}
            onBucketChange={setEmployeeBucket}
            onBarClick={(key, label) =>
              handleDrilldown(
                fa.reports.charts.employee.productivityChart.drilldownTitle.replace(
                  "{label}",
                  label,
                ),
                (task) => {
                  if (task.status !== "done" || !task.updated) return false;
                  const updated = new Date(task.updated);
                  if (employeeBucket === "daily") {
                    return format(updated, "yyyy-MM-dd") === key;
                  } else if (employeeBucket === "weekly") {
                    const weekStart = new Date(key);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);
                    return updated >= weekStart && updated <= weekEnd;
                  } else if (employeeBucket === "monthly") {
                    return format(updated, "yyyy-MM") === key;
                  } else if (employeeBucket === "quarterly") {
                    const s = startOfQuarter(updated);
                    const quarterKey = `${s.getFullYear()}-Q${Math.floor(s.getMonth() / 3) + 1}`;
                    return quarterKey === key;
                  } else if (employeeBucket === "annual") {
                    return String(updated.getFullYear()) === key;
                  }
                  return false;
                },
              )
            }
          />

          {/* Employee Comparison Chart */}
          <EmployeeComparisonChart
            selectedEmployee={selectedEmployeeSummary}
            teamAverages={teamAverages}
          />
        </div>

        {/* Overtime Analysis Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold md:text-xl">
              {fa.reports.charts.employee.overtimeAnalysis.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {fa.reports.charts.employee.overtimeAnalysis.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Overtime Analysis Chart */}
            <OvertimeAnalysisChart data={overtimeAnalysis} />

            {/* Workload Distribution Chart */}
            <WorkloadDistributionChart data={workloadDistribution} />
          </div>
        </div>

        {/* Productivity Trends Section */}
        {selectedEmployeeSummary && productivityTrends && (
          <div className="mt-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold md:text-xl">
                {fa.reports.charts.employee.productivityTrends.title} -{" "}
                {selectedEmployeeSummary.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {fa.reports.charts.employee.productivityTrends.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
              <ProductivityTrendsChart
                historical={productivityTrends.historical}
                trend={productivityTrends.trend}
                projectedNextPeriod={productivityTrends.projectedNextPeriod}
              />
            </div>
          </div>
        )}

        {/* Employee Performance Table */}
        <div className="mt-6">
          <EmployeePerformanceTable
            summaries={employeeSummaries}
            onRowClick={(userId) => {
              setSelectedEmployeeId(userId);
              const user = users?.find((u) => u.id === userId);
              if (user) {
                handleDrilldown(
                  fa.reports.charts.employee.performanceTable.drilldownTitle.replace(
                    "{name}",
                    user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username,
                  ),
                  (task) => task.assignee === userId,
                );
              }
            }}
          />
        </div>
      </div>

      {/* Drilldown Drawer */}
      <DrilldownDrawer
        open={!!drilldown}
        onOpenChange={(open) => !open && setDrilldown(null)}
        rows={drilldown?.rows || []}
        title={drilldown?.title || ""}
      />
    </div>
  );
}
