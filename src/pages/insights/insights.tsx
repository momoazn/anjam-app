import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCheck,
  IconClock,
  IconRocket,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { faIR } from "date-fns/locale";
import { useMemo } from "react";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { MetricCardSkeleton } from "@/components/skeletons/metric-card-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insights as insightsLabels } from "@/constants";
import { useTasks } from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import { formatUserName } from "@/lib/utils";

/**
 * Insights Page - Product Mode
 *
 * Lightweight insightsLabels dashboard replacing heavy Reports page
 * Shows:
 * - Tasks created this week
 * - Tasks completed this week
 * - Currently in progress
 * - Cycle time trend
 * - On-time rate
 * - Workload by assignee
 */
export default function Insights() {
  const cardClassName =
    "rounded-xl border border-border/40 bg-background/30 shadow-none";

  // Date calculations for this week and last week
  const now = useMemo(() => new Date(), []);
  const thisWeekStart = useMemo(
    () => startOfWeek(now, { weekStartsOn: 1 }),
    [now],
  );
  const thisWeekEnd = useMemo(() => endOfWeek(now, { weekStartsOn: 1 }), [now]);
  const lastWeekStart = useMemo(
    () => startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
    [now],
  );
  const lastWeekEnd = useMemo(
    () => endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
    [now],
  );

  // Fetch all tasks for current organization
  const { data: allTasks, isLoading } = useTasks();

  // Fetch users for workload by assignee
  const { data: users } = useUsers({ enabled: true });

  // Compute insights from task data
  const metrics = useMemo(() => {
    if (!allTasks?.items) {
      return {
        createdThisWeek: 0,
        completedThisWeek: 0,
        inProgress: 0,
        createdLastWeek: 0,
        completedLastWeek: 0,
        cycleTime: 0,
        onTimeRate: 0,
        workloadByAssignee: [],
        weeklyCycleTime: [],
      };
    }

    const tasks = allTasks.items;

    // Helper to get created date from task (Convex uses _creationTime)
    const getCreatedDate = (t: (typeof tasks)[0]): Date => {
      return new Date(t._creationTime || 0);
    };

    // Helper to get updated date from task (Convex uses updatedAt)
    const getUpdatedDate = (t: (typeof tasks)[0]): Date | null => {
      if (t.updatedAt) {
        return new Date(t.updatedAt);
      }
      return null;
    };

    // Basic insightsLabels
    const createdThisWeek = tasks.filter(
      (t) =>
        getCreatedDate(t) >= thisWeekStart && getCreatedDate(t) <= thisWeekEnd,
    ).length;
    const completedThisWeek = tasks.filter((t) => {
      if (t.status !== "done") return false;
      const updated = getUpdatedDate(t);
      return updated && updated >= thisWeekStart && updated <= thisWeekEnd;
    }).length;
    const createdLastWeek = tasks.filter(
      (t) =>
        getCreatedDate(t) >= lastWeekStart && getCreatedDate(t) <= lastWeekEnd,
    ).length;
    const completedLastWeek = tasks.filter((t) => {
      if (t.status !== "done") return false;
      const updated = getUpdatedDate(t);
      return updated && updated >= lastWeekStart && updated <= lastWeekEnd;
    }).length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;

    // Cycle time (average days from created to done for completed tasks)
    const completedTasks = tasks.filter(
      (t) => t.status === "done" && getUpdatedDate(t) !== null,
    );
    let totalCycleTime = 0;
    let completedWithDeadline = 0;
    let onTimeCount = 0;

    completedTasks.forEach((t) => {
      const created = getCreatedDate(t);
      const updated = getUpdatedDate(t);
      if (!updated) return;

      const cycleDays =
        (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalCycleTime += cycleDays;

      // On-time calculation
      if (t.deadline) {
        completedWithDeadline++;
        const deadline = new Date(t.deadline);
        if (updated <= deadline) {
          onTimeCount++;
        }
      }
    });

    const avgCycleTime =
      completedTasks.length > 0 ? totalCycleTime / completedTasks.length : 0;
    const onTimeRate =
      completedWithDeadline > 0
        ? (onTimeCount / completedWithDeadline) * 100
        : 0;

    // Workload by assignee
    const workloadMap = new Map<string, number>();
    tasks.forEach((t) => {
      const assigneeId =
        typeof t.assignee === "string"
          ? t.assignee
          : typeof (t as { assigneeUserId?: unknown }).assigneeUserId ===
              "string"
            ? (t as { assigneeUserId: string }).assigneeUserId
            : typeof t.assignee === "object" &&
                t.assignee !== null &&
                "_id" in t.assignee &&
                typeof (t.assignee as { _id?: unknown })._id === "string"
              ? (t.assignee as { _id: string })._id
              : undefined;
      if (assigneeId) {
        workloadMap.set(assigneeId, (workloadMap.get(assigneeId) || 0) + 1);
      }
    });

    const workloadByAssignee = Array.from(workloadMap.entries())
      .map(([userId, count]) => {
        const user = users?.find((u) => u._id === userId);
        return {
          userId,
          name: user ? formatUserName(user.displayName, user.email) : "ناشناس",
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 assignees

    // Weekly cycle time for trend (last 8 weeks)
    const weeklyCycleTime = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i + 1), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });

      const weekTasks = tasks.filter((t) => {
        const created = getCreatedDate(t);
        return created >= weekStart && created <= weekEnd;
      });

      const weekCompleted = weekTasks.filter(
        (t) => t.status === "done" && getUpdatedDate(t) !== null,
      );

      let weekTotal = 0;
      weekCompleted.forEach((t) => {
        const created = getCreatedDate(t);
        const updated = getUpdatedDate(t);
        if (updated) {
          weekTotal +=
            (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }
      });

      const weekAvg =
        weekCompleted.length > 0 ? weekTotal / weekCompleted.length : 0;

      weeklyCycleTime.push({
        week: format(weekEnd, "dd MMM", { locale: faIR }),
        cycleTime: Math.round(weekAvg * 10) / 10,
        tasks: weekCompleted.length,
      });
    }

    return {
      createdThisWeek,
      completedThisWeek,
      inProgress,
      createdLastWeek,
      completedLastWeek,
      cycleTime: Math.round(avgCycleTime * 10) / 10,
      onTimeRate: Math.round(onTimeRate),
      workloadByAssignee,
      weeklyCycleTime,
    };
  }, [
    allTasks,
    users,
    now,
    thisWeekStart,
    thisWeekEnd,
    lastWeekStart,
    lastWeekEnd,
  ]);

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+۱۰۰٪" : "۰٪";
    const change = ((current - previous) / previous) * 100;
    const formattedChange = digitsEnToFa(Math.abs(change).toFixed(0));
    return change > 0 ? `+${formattedChange}٪` : `-${formattedChange}٪`;
  };

  if (isLoading) {
    return (
      <PageTransition
        data-testid="insights-page"
        className="container mx-auto max-w-7xl p-4 md:p-6"
      >
        <PageHeader
          title={insightsLabels.title}
          subtitle={insightsLabels.description}
          icon={IconRocket}
        />
        <MetricCardSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition
      data-testid="insights-page"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
      <PageHeader
        title={insightsLabels.title}
        subtitle={insightsLabels.description}
        icon={IconRocket}
      />

      {/* Top Metrics Grid */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {/* Created This Week */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{insightsLabels.createdThisWeek}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(metrics.createdThisWeek)}
            </div>
            <p className="text-muted-foreground text-xs">
              {getPercentageChange(
                metrics.createdThisWeek,
                metrics.createdLastWeek,
              )}{" "}
              {insightsLabels.fromLastWeek}
            </p>
          </CardContent>
        </Card>

        {/* Completed This Week */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{insightsLabels.completedThisWeek}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(metrics.completedThisWeek)}
            </div>
            <p className="text-muted-foreground text-xs">
              {getPercentageChange(
                metrics.completedThisWeek,
                metrics.completedLastWeek,
              )}{" "}
              {insightsLabels.fromLastWeek}
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{insightsLabels.inProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(metrics.inProgress)}
            </div>
            <p className="text-muted-foreground text-xs">
              {insightsLabels.currentlyActive}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics Row */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {/* Cycle Time */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{insightsLabels.cycleTime}</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(metrics.cycleTime)}
              <span className="text-sm font-normal text-muted-foreground mr-1">
                {insightsLabels.cycleTimeUnit}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              میانگین زمان ساخت تا تکمیل
            </p>
          </CardContent>
        </Card>

        {/* On-Time Rate */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{insightsLabels.onTimeRate}</CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(insightsLabels.onTimeRate)}٪
            </div>
            <p className="text-muted-foreground text-xs">
              تسک‌های تکمیل‌شده قبل از مهلت
            </p>
          </CardContent>
        </Card>

        {/* Total Active */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>کل تسک‌های فعال</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(
                metrics.inProgress +
                  metrics.createdThisWeek -
                  metrics.completedThisWeek,
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              مجموع تسک‌های در جریان
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Cycle Time Trend Chart */}
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4" />
              روند زمان چرخه (۸ هفته اخیر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.weeklyCycleTime.length > 0 &&
            metrics.weeklyCycleTime.some((w) => w.tasks > 0) ? (
              <div className="h-[200px] w-full overflow-hidden">
                <BarChart
                  width={560}
                  height={200}
                  data={metrics.weeklyCycleTime}
                >
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => digitsEnToFa(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                    }}
                    formatter={(
                      value: number | undefined,
                      name: string | undefined,
                    ) => [
                      name === "cycleTime" && value
                        ? `${digitsEnToFa(value)} روز`
                        : digitsEnToFa(value || 0),
                      name === "cycleTime" ? "زمان چرخه" : "تکمیل‌شده",
                    ]}
                    labelFormatter={(label) => `هفته ${label}`}
                  />
                  <Bar
                    dataKey="cycleTime"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                {insightsLabels.noData}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workload by Assignee */}
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              {insightsLabels.workloadByAssignee}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.workloadByAssignee.length > 0 ? (
              <div className="h-[200px] w-full overflow-hidden">
                <BarChart
                  width={560}
                  height={200}
                  data={metrics.workloadByAssignee}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => digitsEnToFa(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                    }}
                    formatter={(value: number | undefined) => [
                      digitsEnToFa(value || 0),
                      insightsLabels.tasks,
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                {insightsLabels.noData}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
