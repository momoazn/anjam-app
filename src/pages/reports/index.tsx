import { lazy, Suspense, useState, useMemo } from "react";
import { IconChartBar } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { digitsEnToFa } from "@persian-tools/persian-tools";

const DrilldownDrawer = lazy(() =>
  import("@/components/reports/drilldown-drawer").then((m) => ({
    default: m.DrilldownDrawer,
  })),
);
import { FiltersSection } from "@/components/reports/filters-section";
import { ChartsSection } from "@/components/reports/charts-section";
import { TableSection } from "@/components/reports/table-section";
import { PageTransition } from "@/components/page-transition";
import { reports } from "@/constants";
import { useReportsData } from "./use-reports-data";
import { useReportsFilters } from "./use-reports-filters";
import { useReportsMetrics } from "./use-reports-metrics";
import { ReportsSkeleton } from "./reports-skeleton";
import { ReportsMetricCards } from "./metric-cards";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { DrilldownState } from "./types";
import { filterTasksByControls } from "@/lib/reports";

export default function Reports() {
  const { tasks, users, projects, projectsWithSupervisor, isLoading } =
    useReportsData();

  const {
    filtersState,
    setFiltersState,
    debouncedFilters,
    employeeBucket,
    setEmployeeBucket,
    selectedEmployeeId,
    setSelectedEmployeeId,
  } = useReportsFilters();

  const [drilldown, setDrilldown] = useState<DrilldownState>(null);

  const {
    timeRange,
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
  } = useReportsMetrics(
    tasks,
    users,
    debouncedFilters,
    employeeBucket,
    selectedEmployeeId,
  );

  const filteredTasks = useMemo(
    () =>
      filterTasksByControls(tasks, {
        start: timeRange.start,
        end: timeRange.end,
        projectIds: filtersState.filters.projectIds,
        assigneeIds: filtersState.filters.assigneeIds,
        statuses: filtersState.filters.statuses,
        priorities: filtersState.filters.priorities,
      }),
    [tasks, timeRange, filtersState.filters],
  );

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
            (Date.now() - new Date(task.created).getTime()) /
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

  const totalTimeliness = useMemo(
    () => timelinessData?.reduce((a, b) => a + (b.value || 0), 0) || 0,
    [timelinessData],
  );
  const totalPriority = useMemo(
    () => priorityData?.reduce((a, b) => a + (b.value || 0), 0) || 0,
    [priorityData],
  );
  const hasTimeliness = totalTimeliness > 0;
  const hasPriority = totalPriority > 0;

  if (isLoading) {
    return <ReportsSkeleton rangeLabel={rangeLabel} />;
  }

  return (
    <PageTransition className="container mx-auto max-w-7xl p-6 md:p-10">
      <PageHeader
        title={reports.dashboardTitle}
        description={`${reports.range.label} ${digitsEnToFa(rangeLabel)}`}
        icon={IconChartBar}
      />

      <div className="space-y-16">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-primary/60 text-[10px] font-bold tracking-tight">
              {reports.sections.configuration}
            </span>
            <div className="bg-border/20 h-px flex-1" />
          </div>
          <FiltersSection
            value={filtersState}
            onChange={setFiltersState}
            rangeLabel={rangeLabel}
            projects={projects || []}
            users={users || []}
            projectsWithSupervisor={projectsWithSupervisor}
            tasks={tasks}
          />
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-primary/60 text-[10px] font-bold tracking-tight">
              {reports.sections.statistics}
            </span>
            <div className="bg-border/20 h-px flex-1" />
          </div>
          <ReportsMetricCards
            totalTasks={overviewMetrics.total}
            completedTasks={overviewMetrics.completed}
            wip={overviewMetrics.wip}
            overdue={overviewMetrics.overdue}
            onTimeRate={overviewMetrics.onTimeRate}
          />
        </section>

        <ChartsSection
          timelinessData={timelinessData}
          priorityData={priorityData}
          leaderboardData={leaderboardData}
          hasTimeliness={hasTimeliness}
          hasPriority={hasPriority}
          employeeBuckets={employeeBuckets}
          employeeBucket={employeeBucket}
          onEmployeeBucketChange={setEmployeeBucket}
          employeeSummaries={employeeSummaries}
          onSelectEmployee={setSelectedEmployeeId}
          selectedEmployeeSummary={selectedEmployeeSummary}
          teamAverages={teamAverages}
          overtimeAnalysis={overtimeAnalysis}
          workloadDistribution={workloadDistribution}
          productivityTrends={productivityTrendsData}
          users={users}
          timeRange={timeRange}
          onDrilldown={handleDrilldown}
          tableSection={
            <TableSection
              summaries={employeeSummaries}
              users={users}
              onSelectEmployee={setSelectedEmployeeId}
              onDrilldown={handleDrilldown}
            />
          }
        />
      </div>

      {drilldown && (
        <Suspense fallback={null}>
          <DrilldownDrawer
            open={!!drilldown}
            onOpenChange={(open) => !open && setDrilldown(null)}
            title={drilldown.title}
            rows={drilldown.rows}
          />
        </Suspense>
      )}
    </PageTransition>
  );
}
