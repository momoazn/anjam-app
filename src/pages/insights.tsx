import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconRocket } from "@tabler/icons-react";
import { endOfWeek, startOfWeek, subWeeks } from "date-fns";
import { useMemo } from "react";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/constants";
import { useTasks } from "@/hooks/tasks";
import { useCurrentOrganization } from "@/store/auth-store";

/**
 * Insights Page - Product Mode
 *
 * Lightweight metrics dashboard replacing heavy Reports page
 * Shows:
 * - Tasks created this week
 * - Tasks completed this week
 * - Currently in progress
 * - Percentage changes from previous week
 */
export default function Insights() {
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?.id;

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

  // Compute insights from task data
  const insights = useMemo(() => {
    if (!allTasks?.items) {
      return {
        createdThisWeek: 0,
        completedThisWeek: 0,
        inProgress: 0,
        createdLastWeek: 0,
        completedLastWeek: 0,
      };
    }

    const tasks = allTasks.items;

    return {
      createdThisWeek: tasks.filter(
        (t) =>
          new Date(t.created) >= thisWeekStart &&
          new Date(t.created) <= thisWeekEnd,
      ).length,
      completedThisWeek: tasks.filter(
        (t) =>
          t.status === "done" &&
          t.updated &&
          new Date(t.updated) >= thisWeekStart &&
          new Date(t.updated) <= thisWeekEnd,
      ).length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      createdLastWeek: tasks.filter(
        (t) =>
          new Date(t.created) >= lastWeekStart &&
          new Date(t.created) <= lastWeekEnd,
      ).length,
      completedLastWeek: tasks.filter(
        (t) =>
          t.status === "done" &&
          t.updated &&
          new Date(t.updated) >= lastWeekStart &&
          new Date(t.updated) <= lastWeekEnd,
      ).length,
    };
  }, [allTasks, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd]);

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+۱۰۰٪" : "۰٪";
    const change = ((current - previous) / previous) * 100;
    const formattedChange = digitsEnToFa(Math.abs(change).toFixed(0));
    return change > 0 ? `+${formattedChange}٪` : `-${formattedChange}٪`;
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground animate-pulse">
            {reports.insights.loading}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto space-y-6 p-6">
        <PageHeader
          variant="minimal"
          title={reports.insights.title}
          subtitle={reports.insights.description}
          icon={IconRocket}
        />

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Created This Week */}
          <Card className="bg-card/50">
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
          <Card className="bg-card/50">
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
          <Card className="bg-card/50">
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
      </div>
    </PageTransition>
  );
}
