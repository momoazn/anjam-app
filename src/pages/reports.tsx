import { format, isWithinInterval } from "date-fns-jalali";
import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import { DrilldownDrawer } from "@/components/reports/drilldown-drawer";
import {
  FiltersBar,
  type Filters,
  type TimeRange,
} from "@/components/reports/filters-bar";
import { Leaderboard } from "@/components/reports/leaderboard";
import { MetricCards } from "@/components/reports/metric-cards";
import { PriorityDistribution } from "@/components/reports/priority-distribution";
import { ThroughputChart } from "@/components/reports/throughput-chart";
import { TimelinessDonut } from "@/components/reports/timeliness-donut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { useProjects, useTasks, useUsers } from "@/hooks";
import type { TaskWithProject } from "@/lib/pocketbase";
import {
  buildLeaderboard,
  classifyTimeliness,
  computeOverviewMetrics,
  countByPriority,
  filterTasksByControls,
  filterTasksNonTime,
  getTimeRange,
  groupThroughput,
} from "@/lib/reports-utils";

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
  const [bucket, setBucket] = useState<"daily" | "weekly">("daily");

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

  const throughputData = useMemo(() => {
    if (!filteredTasks) return [];
    return groupThroughput(filteredTasks, bucket, timeRange);
  }, [filteredTasks, bucket, timeRange]);

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

  const hasThroughput = throughputData?.length > 0;
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
        {/* Throughput Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-semibold md:text-lg">
              {fa.reports.charts.throughput.title}
            </CardTitle>
            <Select
              value={bucket}
              onValueChange={(value: "daily" | "weekly") => setBucket(value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  {fa.reports.charts.throughput.periods.daily}
                </SelectItem>
                <SelectItem value="weekly">
                  {fa.reports.charts.throughput.periods.weekly}
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-80 w-full p-4 pt-0">
            {hasThroughput ? (
              <ThroughputChart
                data={throughputData}
                bucket={bucket}
                onBarClick={(key, label) =>
                  handleDrilldown(
                    fa.reports.charts.throughput.drilldownTitle.replace(
                      "{label}",
                      label,
                    ),
                    (task) => {
                      if (task.status !== "done" || !task.updated) return false;
                      const updated = new Date(task.updated);
                      if (bucket === "daily") {
                        return format(updated, "yyyy-MM-dd") === key;
                      } else {
                        // Weekly: match if updated within [weekStart, weekStart+6d 23:59:59]
                        const weekStart = new Date(key);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        weekEnd.setHours(23, 59, 59, 999);
                        return updated >= weekStart && updated <= weekEnd;
                      }
                    },
                  )
                }
              />
            ) : (
              <EmptyState message={fa.reports.charts.throughput.noData} />
            )}
          </CardContent>
        </Card>

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
