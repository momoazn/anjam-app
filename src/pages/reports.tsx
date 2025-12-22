import { format } from "date-fns-jalali";
import { Suspense, lazy, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

const DrilldownDrawer = lazy(() =>
  import("@/components/reports/drilldown-drawer").then((m) => ({
    default: m.DrilldownDrawer,
  })),
);
import type { Filters, TimeRange } from "@/components/reports/filters-bar";
import { FiltersSection } from "@/components/reports/filters-section";
import { MetricsSection } from "@/components/reports/metrics-section";
import { ChartsSection } from "@/components/reports/charts-section";
import { TableSection } from "@/components/reports/table-section";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { reports } from "@/constants";
import { useProjects, useTasks, useUsers, queryKeys } from "@/hooks";
import type { TaskWithProject } from "@/lib/pocketbase";
import { useQuery } from "@tanstack/react-query";
import { pb, ProjectWithSupervisor } from "@/lib/pocketbase";

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

type TimelinessDatum = {
  key: "on_time" | "overdue" | "no_deadline";
  name: string;
  value: number;
};

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

  const { data: tasksResult, isPending: tasksPending } = useTasks({
    expandFields: "project,assignee",
    mode: "full",
  });
  const tasks = useMemo(() => tasksResult?.items ?? [], [tasksResult]);
  const { data: users, isPending: usersPending } = useUsers();
  const { data: projects, isPending: projectsPending } = useProjects();

  // Fetch projects with supervisor expanded for export
  const { data: projectsWithSupervisor } = useQuery({
    queryKey: [...queryKeys.projects.all, "supervisor"],
    queryFn: () =>
      pb.collection("projects").getFullList<ProjectWithSupervisor>({
        expand: "supervisor",
      }),
    enabled: !projectsPending && !!projects,
  });

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
    const matchingTasks = filteredTasks.filter(predicate);
    const rows = matchingTasks.map((task) => ({
      id: task.id,
      title: task.title || reports.fallbacks.taskTitle,
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
        : reports.fallbacks.assigneeName,
      projectName: task.expand?.project?.name || reports.fallbacks.projectName,
      tags: task.tags || [],
    }));

    setDrilldown({ title, rows });
  };

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-4 md:p-6">
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          data-animate-stagger
        >
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-5"
          data-animate-stagger
        >
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
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          data-animate-stagger
        >
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
      </PageTransition>
    );
  }

  const rangeLabel = `${format(timeRange.start, "yyyy/MM/dd")} ${reports.range.connector} ${format(timeRange.end, "yyyy/MM/dd")}`;

  const totalTimeliness = timelinessData?.reduce(
    (a, b) => a + (b.value || 0),
    0,
  );
  const hasTimeliness = (totalTimeliness || 0) > 0;
  const totalPriority = priorityData?.reduce((a, b) => a + (b.value || 0), 0);
  const hasPriority = (totalPriority || 0) > 0;

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <FiltersSection
        value={filtersState}
        onChange={setFiltersState}
        rangeLabel={rangeLabel}
        projects={projects || []}
        users={users || []}
        projectsWithSupervisor={projectsWithSupervisor}
        tasks={tasks}
      />

      <MetricsSection totals={overviewMetrics} />

      <ChartsSection
        timelinessData={timelinessData}
        priorityData={priorityData}
        hasTimeliness={hasTimeliness}
        hasPriority={hasPriority}
        leaderboardData={leaderboardData}
        users={users}
        timeRange={timeRange}
        onDrilldown={handleDrilldown}
        overtimeAnalysis={overtimeAnalysis}
        workloadDistribution={workloadDistribution}
        employeeSummaries={employeeSummaries}
        employeeBuckets={employeeBuckets}
        employeeBucket={employeeBucket}
        onEmployeeBucketChange={setEmployeeBucket}
        onSelectEmployee={setSelectedEmployeeId}
        selectedEmployeeSummary={selectedEmployeeSummary}
        productivityTrends={productivityTrends}
        teamAverages={teamAverages}
        tableSection={
          <TableSection
            summaries={employeeSummaries}
            users={users}
            onSelectEmployee={setSelectedEmployeeId}
            onDrilldown={handleDrilldown}
          />
        }
      />
      <Suspense>
        <DrilldownDrawer
          open={!!drilldown}
          onOpenChange={(open) => !open && setDrilldown(null)}
          rows={drilldown?.rows || []}
          title={drilldown?.title || ""}
        />
      </Suspense>
    </PageTransition>
  );
}
