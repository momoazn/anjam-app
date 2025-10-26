import { format, isWithinInterval } from "date-fns-jalali";
import { Loader2 } from "lucide-react";
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
    () => getTimeRange(debouncedFilters.timeRange.preset),
    [debouncedFilters.timeRange.preset],
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
      { name: "به‌موقع", value: counts.on_time, key: "on_time" as const },
      { name: "گذشته مهلت", value: counts.overdue, key: "overdue" as const },
      {
        name: "بدون مهلت",
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
      title: task.title || "بدون عنوان",
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
        : "نامشخص",
      projectName: task.expand?.project?.name || "نامشخص",
      tags: task.tags || [],
    }));

    setDrilldown({ title, rows });
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">داشبورد گزارشات</h1>
      </div>

      {/* Filters */}
      <FiltersBar
        value={filtersState}
        onChange={setFiltersState}
        projects={projects || []}
        users={users || []}
      />

      {/* Overview Metrics */}
      {overviewMetrics && <MetricCards totals={overviewMetrics} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Throughput Trend */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold md:text-lg">
              روند تکمیل تسک‌ها
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setBucket("daily")}
                className={`rounded px-2 py-1 text-xs ${
                  bucket === "daily"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                روزانه
              </button>
              <button
                onClick={() => setBucket("weekly")}
                className={`rounded px-2 py-1 text-xs ${
                  bucket === "weekly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                هفتگی
              </button>
            </div>
          </div>
          <div className="h-48 w-full md:h-64">
            <ThroughputChart
              data={throughputData}
              bucket={bucket}
              onBarClick={(key, label) =>
                handleDrilldown(`تسک‌های تکمیل شده در ${label}`, (task) => {
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
                })
              }
            />
          </div>
        </div>

        {/* Timeliness Donut */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold md:text-lg">
              توزیع به‌موقعی تکمیل
            </h2>
          </div>
          <div className="h-48 w-full md:h-64">
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Priority Distribution */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold md:text-lg">
              توزیع اولویت‌ها
            </h2>
          </div>
          <div className="h-48 w-full md:h-64">
            <PriorityDistribution
              data={priorityData}
              onSliceClick={(key) =>
                handleDrilldown(
                  `اولویت ${priorityData.find((d) => d.key === key)?.name || ""}`,
                  (task) => task.priority === key,
                )
              }
            />
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <Leaderboard
            rows={leaderboardData}
            onRowClick={(userId) =>
              handleDrilldown(
                `تسک‌های ${users?.find((u) => u.id === userId)?.first_name || ""} ${users?.find((u) => u.id === userId)?.last_name || ""}`,
                (task) => task.assignee === userId,
              )
            }
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
