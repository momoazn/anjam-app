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
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { MetricCardSkeleton } from "@/components/skeletons/metric-card-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/constants";
import { useTasks } from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import { cn, formatUserName } from "@/lib/utils";
import { useCurrentOrgMode, useCurrentOrganization } from "@/store/auth-store";

/**
 * Insights Page - Product Mode
 *
 * Lightweight metrics dashboard replacing heavy Reports page
 * Shows:
 * - Tasks created this week
 * - Tasks completed this week
 * - Currently in progress
 * - Cycle time trend
 * - On-time rate
 * - Workload by assignee
 */
export default function Insights() {
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?.id;
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const cardClassName = cn(
    "rounded-xl border border-border/40",
    isProductMode ? "bg-background/30 shadow-none" : "bg-card/50",
  );

  // Date calculations for this week and last week
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // Fetch all tasks for current organization
  const { data: allTasks, isLoading } = useTasks({
    filter: orgId ? `project.organization = "${orgId}"` : undefined,
    expandFields: "project,assignee,project.organization",
    mode: "full",
  });

  // Fetch users for workload by assignee
  const { data: users } = useUsers({
    batch: 100,
    sort: "-created",
  });

  // Compute insights from task data
  const insights = useMemo(() => {
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

    // Basic metrics
    const createdThisWeek = tasks.filter(
      (t) =>
        new Date(t.created) >= thisWeekStart &&
        new Date(t.created) <= thisWeekEnd,
    ).length;
    const completedThisWeek = tasks.filter(
      (t) =>
        t.status === "done" &&
        t.updated &&
        new Date(t.updated) >= thisWeekStart &&
        new Date(t.updated) <= thisWeekEnd,
    ).length;
    const createdLastWeek = tasks.filter(
      (t) =>
        new Date(t.created) >= lastWeekStart &&
        new Date(t.created) <= lastWeekEnd,
    ).length;
    const completedLastWeek = tasks.filter(
      (t) =>
        t.status === "done" &&
        t.updated &&
        new Date(t.updated) >= lastWeekStart &&
        new Date(t.updated) <= lastWeekEnd,
    ).length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;

    // Cycle time (average days from created to done for completed tasks)
    const completedTasks = tasks.filter(
      (t) => t.status === "done" && t.updated,
    );
    let totalCycleTime = 0;
    let completedWithDeadline = 0;
    let onTimeCount = 0;

    completedTasks.forEach((t) => {
      const created = new Date(t.created);
      const updated = new Date(t.updated);
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
      if (t.assignee) {
        workloadMap.set(t.assignee, (workloadMap.get(t.assignee) || 0) + 1);
      }
    });

    const workloadByAssignee = Array.from(workloadMap.entries())
      .map(([userId, count]) => {
        const user = users?.find((u) => u.id === userId);
        return {
          userId,
          name: user
            ? formatUserName(user.first_name, user.last_name, user.username)
            : "ناشناس",
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
        const created = new Date(t.created);
        return created >= weekStart && created <= weekEnd;
      });

      const weekCompleted = weekTasks.filter(
        (t) => t.status === "done" && t.updated,
      );

      let weekTotal = 0;
      weekCompleted.forEach((t) => {
        const created = new Date(t.created);
        const updated = new Date(t.updated);
        weekTotal +=
          (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
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
  }, [allTasks, users, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd]);

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+۱۰۰٪" : "۰٪";
    const change = ((current - previous) / previous) * 100;
    const formattedChange = digitsEnToFa(Math.abs(change).toFixed(0));
    return change > 0 ? `+${formattedChange}٪` : `-${formattedChange}٪`;
  };

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
        <PageHeader
          title={reports.insights.title}
          subtitle={reports.insights.description}
          icon={IconRocket}
        />
        <MetricCardSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={reports.insights.title}
        subtitle={reports.insights.description}
        icon={IconRocket}
      />

      {/* Top Metrics Grid */}
      <div
        className={cn(
          "mb-6 grid gap-4 md:grid-cols-3",
          isProductMode && "mb-4 gap-3",
        )}
      >
        {/* Created This Week */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {reports.insights.createdThisWeek}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(insights.createdThisWeek)}
            </div>
            <p className="text-muted-foreground text-xs">
              {getPercentageChange(
                insights.createdThisWeek,
                insights.createdLastWeek,
              )}{" "}
              {reports.insights.fromLastWeek}
            </p>
          </CardContent>
        </Card>

        {/* Completed This Week */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {reports.insights.completedThisWeek}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(insights.completedThisWeek)}
            </div>
            <p className="text-muted-foreground text-xs">
              {getPercentageChange(
                insights.completedThisWeek,
                insights.completedLastWeek,
              )}{" "}
              {reports.insights.fromLastWeek}
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {reports.insights.inProgress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(insights.inProgress)}
            </div>
            <p className="text-muted-foreground text-xs">
              {reports.insights.currentlyActive}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics Row */}
      <div
        className={cn(
          "mb-6 grid gap-4 md:grid-cols-3",
          isProductMode && "mb-4 gap-3",
        )}
      >
        {/* Cycle Time */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {reports.insights.cycleTime}
            </CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(insights.cycleTime)}
              <span className="text-sm font-normal text-muted-foreground mr-1">
                {reports.insights.cycleTimeUnit}
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
            <CardTitle className="text-sm font-medium">
              {reports.insights.onTimeRate}
            </CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(insights.onTimeRate)}٪
            </div>
            <p className="text-muted-foreground text-xs">
              تسک‌های تکمیل‌شده قبل از مهلت
            </p>
          </CardContent>
        </Card>

        {/* Total Active */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              کل تسک‌های فعال
            </CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsEnToFa(
                insights.inProgress +
                  insights.createdThisWeek -
                  insights.completedThisWeek,
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              مجموع تسک‌های در جریان
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div
        className={cn("grid gap-4 md:grid-cols-2", isProductMode && "gap-3")}
      >
        {/* Cycle Time Trend Chart */}
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4" />
              روند زمان چرخه (۸ هفته اخیر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.weeklyCycleTime.length > 0 &&
            insights.weeklyCycleTime.some((w) => w.tasks > 0) ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights.weeklyCycleTime}>
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
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                {reports.insights.noData}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workload by Assignee */}
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              {reports.insights.workloadByAssignee}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.workloadByAssignee.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={insights.workloadByAssignee}
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
                        reports.insights.tasks,
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                {reports.insights.noData}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
