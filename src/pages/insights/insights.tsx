import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCheck,
  IconClock,
  IconRocket,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { endOfWeek, startOfWeek, subWeeks } from "date-fns";
import { format } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
const DAY_MS = 1000 * 60 * 60 * 24;
const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" };
const GRID_STROKE = "var(--border)";
const formatFa = (n: number) => digitsEnToFa(String(n).replace(".", "٫"));
const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
};
const BAR_FILL = "var(--primary)";

export default function Insights() {
  const cardClassName =
    "rounded-xl border border-border/40 bg-background/30 shadow-none";

  // Date calculations for this week and last week
  const now = useMemo(() => new Date(), []);
  const thisWeekStart = useMemo(
    () => startOfWeek(now, { weekStartsOn: 6 }),
    [now],
  );
  const thisWeekEnd = useMemo(() => endOfWeek(now, { weekStartsOn: 6 }), [now]);
  const lastWeekStart = useMemo(
    () => startOfWeek(subWeeks(now, 1), { weekStartsOn: 6 }),
    [now],
  );
  const lastWeekEnd = useMemo(
    () => endOfWeek(subWeeks(now, 1), { weekStartsOn: 6 }),
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
        onTimeRate: null as number | null,
        activeTotal: 0,
        workloadByAssignee: [],
        weeklyCycleTime: [],
      };
    }

    const tasks = allTasks.items;

    const getCreatedDate = (t: (typeof tasks)[0]): Date =>
      new Date(t.createdAt ?? t._creationTime ?? 0);

    // Completion time: explicit completedAt, falling back to last update
    const getUpdatedDate = (t: (typeof tasks)[0]): Date | null => {
      const ts = t.completedAt ?? t.updatedAt;
      return ts ? new Date(ts) : null;
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

      const cycleDays = (updated.getTime() - created.getTime()) / DAY_MS;
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
        : null;
    const activeTotal = tasks.filter(
      (t) => t.status !== "done" && t.status !== "cancelled",
    ).length;

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

    // Weekly cycle time trend (last 8 weeks), bucketed by completion week
    const weeklyCycleTime = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 6 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 6 });

      const weekCompleted = tasks.filter((t) => {
        const done = getUpdatedDate(t);
        return (
          t.status === "done" && done && done >= weekStart && done <= weekEnd
        );
      });

      const weekTotal = weekCompleted.reduce((sum, t) => {
        const done = getUpdatedDate(t) as Date;
        return sum + (done.getTime() - getCreatedDate(t).getTime()) / DAY_MS;
      }, 0);

      weeklyCycleTime.push({
        week: digitsEnToFa(format(weekStart, "d MMMM", { locale: faIR })),
        cycleTime:
          weekCompleted.length > 0
            ? Math.round((weekTotal / weekCompleted.length) * 10) / 10
            : 0,
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
      onTimeRate: onTimeRate === null ? null : Math.round(onTimeRate),
      activeTotal,
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
    if (previous === 0) return current > 0 ? "جدید" : "—";
    const change = Math.round(((current - previous) / previous) * 100);
    if (change === 0) return "۰٪";
    const formattedChange = digitsEnToFa(Math.abs(change));
    return change > 0 ? `+${formattedChange}٪` : `−${formattedChange}٪`;
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
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
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
              <span dir="ltr">
                {getPercentageChange(
                  metrics.createdThisWeek,
                  metrics.createdLastWeek,
                )}
              </span>{" "}
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
              <span dir="ltr">
                {getPercentageChange(
                  metrics.completedThisWeek,
                  metrics.completedLastWeek,
                )}
              </span>{" "}
              {insightsLabels.fromLastWeek}
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className={`${cardClassName} col-span-2 md:col-span-1`}>
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
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {/* Cycle Time */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{insightsLabels.cycleTime}</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFa(metrics.cycleTime)}
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
              {metrics.onTimeRate === null
                ? "—"
                : `${digitsEnToFa(metrics.onTimeRate)}٪`}
            </div>
            <p className="text-muted-foreground text-xs">
              تسک‌های تکمیل‌شده قبل از مهلت
            </p>
          </CardContent>
        </Card>

        {/* Total Active */}
        <Card className={`${cardClassName} col-span-2 md:col-span-1`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>کل تسک‌های فعال</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(metrics.activeTotal)}
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
            {metrics.weeklyCycleTime.some((w) => w.tasks > 0) ? (
              <div className="h-[220px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.weeklyCycleTime}
                    margin={{ top: 8, right: 0, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke={GRID_STROKE}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="week"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      reversed
                    />
                    <YAxis
                      orientation="right"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      allowDecimals={false}
                      tickFormatter={(v) => digitsEnToFa(v)}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                      contentStyle={{ ...TOOLTIP_STYLE, direction: "rtl" }}
                      formatter={(value, name) => [
                        name === "cycleTime"
                          ? `${formatFa(Number(value))} روز`
                          : digitsEnToFa(Number(value)),
                        name === "cycleTime" ? "زمان چرخه" : "تکمیل‌شده",
                      ]}
                      labelFormatter={(label) => `هفته‌ی ${label}`}
                    />
                    <Bar
                      dataKey="cycleTime"
                      fill={BAR_FILL}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
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
              <div className="h-[220px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.workloadByAssignee}
                    layout="vertical"
                    margin={{ top: 0, right: 0, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke={GRID_STROKE}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      type="number"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      tickFormatter={(v) => digitsEnToFa(v)}
                      reversed
                    />
                    <YAxis
                      orientation="right"
                      type="category"
                      dataKey="name"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                      contentStyle={{ ...TOOLTIP_STYLE, direction: "rtl" }}
                      formatter={(value) => [
                        digitsEnToFa(Number(value)),
                        insightsLabels.tasks,
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      fill={BAR_FILL}
                      radius={[4, 0, 0, 4]}
                      maxBarSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                {insightsLabels.noData}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
