import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { format, isWithinInterval, startOfQuarter } from "date-fns-jalali";

const Leaderboard = lazy(() =>
  import("@/components/reports/leaderboard").then((m) => ({
    default: m.Leaderboard,
  })),
);
const PriorityDistribution = lazy(() =>
  import("@/components/reports/priority-distribution").then((m) => ({
    default: m.PriorityDistribution,
  })),
);
const TimelinessDonut = lazy(() =>
  import("@/components/reports/timeliness-donut").then((m) => ({
    default: m.TimelinessDonut,
  })),
);
const EmployeeComparisonChart = lazy(() =>
  import("@/components/reports/employee-comparison-chart").then((m) => ({
    default: m.EmployeeComparisonChart,
  })),
);
const EmployeeOverviewCards = lazy(() =>
  import("@/components/reports/employee-overview-cards").then((m) => ({
    default: m.EmployeeOverviewCards,
  })),
);
const EmployeeProductivityChart = lazy(() =>
  import("@/components/reports/employee-productivity-chart").then((m) => ({
    default: m.EmployeeProductivityChart,
  })),
);
const OvertimeAnalysisChart = lazy(() =>
  import("@/components/reports/overtime-analysis-chart").then((m) => ({
    default: m.OvertimeAnalysisChart,
  })),
);
const ProductivityTrendsChart = lazy(() =>
  import("@/components/reports/productivity-trends-chart").then((m) => ({
    default: m.ProductivityTrendsChart,
  })),
);
const WorkloadDistributionChart = lazy(() =>
  import("@/components/reports/workload-distribution-chart").then((m) => ({
    default: m.WorkloadDistributionChart,
  })),
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { reports } from "@/constants";
import type { TaskWithProject } from "@/lib/pocketbase";
import type {
  TasksPriorityOptions,
  UsersResponse,
} from "@/lib/pocketbase-types";
import type {
  buildLeaderboard,
  EmployeeBucket,
  computeEmployeeSummary,
  computeOvertimeAnalysis,
  computeProductivityTrends,
  computeTeamAverages,
  computeWorkloadDistribution,
} from "@/lib/reports-utils";

type TimelinessKey = "on_time" | "overdue" | "no_deadline";

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
    {message}
  </div>
);

type ChartsSectionProps = {
  timelinessData: Array<{ key: TimelinessKey; name: string; value: number }>;
  priorityData: Array<{
    key: TasksPriorityOptions;
    name: string;
    value: number;
  }>;
  hasTimeliness: boolean;
  hasPriority: boolean;
  leaderboardData: ReturnType<typeof buildLeaderboard>;
  users: UsersResponse[] | undefined;
  timeRange: { start: Date; end: Date };
  onDrilldown: (
    title: string,
    predicate: (task: TaskWithProject) => boolean,
  ) => void;
  overtimeAnalysis: ReturnType<typeof computeOvertimeAnalysis>;
  workloadDistribution: ReturnType<typeof computeWorkloadDistribution>;
  employeeSummaries: ReturnType<typeof computeEmployeeSummary>[];
  employeeBuckets: EmployeeBucket[];
  employeeBucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  onEmployeeBucketChange: (
    bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
  ) => void;
  onSelectEmployee: (userId: string) => void;
  selectedEmployeeSummary: ReturnType<typeof computeEmployeeSummary> | null;
  productivityTrends: ReturnType<typeof computeProductivityTrends> | null;
  teamAverages: ReturnType<typeof computeTeamAverages>;
  tableSection: ReactNode;
};

export function ChartsSection({
  timelinessData,
  priorityData,
  hasTimeliness,
  hasPriority,
  leaderboardData,
  users,
  timeRange,
  onDrilldown,
  overtimeAnalysis,
  workloadDistribution,
  employeeSummaries,
  employeeBuckets,
  employeeBucket,
  onEmployeeBucketChange,
  onSelectEmployee,
  selectedEmployeeSummary,
  productivityTrends,
  teamAverages,
  tableSection,
}: ChartsSectionProps) {
  return (
    <Tabs defaultValue="overview" className="w-full" dir="rtl">
      <TabsList className="mb-4 w-full justify-start overflow-x-auto" dir="rtl">
        <TabsTrigger value="overview">{reports.tabs.overview}</TabsTrigger>
        <TabsTrigger value="team">{reports.tabs.team}</TabsTrigger>
        <TabsTrigger value="individuals">
          {reports.tabs.individuals}
        </TabsTrigger>
        <TabsTrigger value="insights">{reports.tabs.insights}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6" data-animate-stagger>
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          data-animate-stagger
        >
          <Card role="region" aria-label={reports.charts.timeliness.title}>
            <CardHeader className="pb-4 text-right">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold md:text-lg">
                  {reports.charts.timeliness.title}
                </CardTitle>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label={reports.aria.timelinessChart}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {reports.charts.timeliness.title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-80 w-full p-4 pt-0" dir="ltr">
              {hasTimeliness ? (
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <TimelinessDonut
                    data={timelinessData}
                    onSliceClick={(key) =>
                      onDrilldown(
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
                </Suspense>
              ) : (
                <EmptyState message={reports.charts.timeliness.noData} />
              )}
            </CardContent>
          </Card>

          <Card role="region" aria-label={reports.charts.priorities.title}>
            <CardHeader className="pb-4 text-right">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold md:text-lg">
                  {reports.charts.priorities.title}
                </CardTitle>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label={reports.aria.prioritiesChart}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {reports.charts.priorities.title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-80 w-full p-4 pt-0" dir="ltr">
              {hasPriority ? (
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <PriorityDistribution
                    data={priorityData}
                    onSliceClick={(key) =>
                      onDrilldown(
                        reports.charts.priorities.drilldownTitle.replace(
                          "{name}",
                          priorityData.find((d) => d.key === key)?.name || "",
                        ),
                        (task) => task.priority === key,
                      )
                    }
                  />
                </Suspense>
              ) : (
                <EmptyState message={reports.charts.priorities.noData} />
              )}
            </CardContent>
          </Card>
        </div>

        <Card role="region" aria-label={reports.topPerformers}>
          <CardContent className="p-4 md:p-6" dir="rtl">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <Leaderboard
                rows={leaderboardData}
                onRowClick={(userId) =>
                  onDrilldown(
                    reports.charts.users.drilldownTitle
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
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <div dir="ltr">
              <OvertimeAnalysisChart data={overtimeAnalysis} />
            </div>
          </Suspense>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <div dir="ltr">
              <WorkloadDistributionChart data={workloadDistribution} />
            </div>
          </Suspense>
        </div>
      </TabsContent>

      <TabsContent value="individuals" className="space-y-6">
        <div className="mb-2">
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <EmployeeOverviewCards
              summaries={employeeSummaries}
              onCardClick={(userId) => onSelectEmployee(userId)}
            />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <div dir="ltr">
              <EmployeeProductivityChart
                buckets={employeeBuckets}
                bucket={employeeBucket}
                onBucketChange={onEmployeeBucketChange}
                onBarClick={(key, label) =>
                  onDrilldown(
                    reports.charts.employee.productivityChart.drilldownTitle.replace(
                      "{label}",
                      label,
                    ),
                    (task) => {
                      if (task.status !== "done" || !task.updated) return false;
                      const updated = new Date(task.updated);
                      if (employeeBucket === "daily") {
                        return format(updated, "yyyy-MM-dd") === key;
                      }
                      if (employeeBucket === "weekly") {
                        const weekStart = new Date(key);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        weekEnd.setHours(23, 59, 59, 999);
                        return updated >= weekStart && updated <= weekEnd;
                      }
                      if (employeeBucket === "monthly") {
                        return format(updated, "yyyy-MM") === key;
                      }
                      if (employeeBucket === "quarterly") {
                        const s = startOfQuarter(updated);
                        const quarterKey = `${s.getFullYear()}-Q${Math.floor(s.getMonth() / 3) + 1}`;
                        return quarterKey === key;
                      }
                      if (employeeBucket === "annual") {
                        return String(updated.getFullYear()) === key;
                      }
                      return false;
                    },
                  )
                }
              />
            </div>
          </Suspense>

          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <div dir="ltr">
              <EmployeeComparisonChart
                selectedEmployee={selectedEmployeeSummary}
                teamAverages={teamAverages}
              />
            </div>
          </Suspense>
        </div>

        {selectedEmployeeSummary && productivityTrends && (
          <div data-animate-stagger>
            <div className="mb-2 text-right">
              <h3 className="text-lg font-semibold md:text-xl">
                {reports.charts.employee.productivityTrends.title} -{" "}
                {selectedEmployeeSummary.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {reports.charts.employee.productivityTrends.description}
              </p>
            </div>
            <Suspense fallback={<Skeleton className="h-80 w-full" />}>
              <div dir="ltr">
                <ProductivityTrendsChart
                  historical={productivityTrends.historical}
                  trend={productivityTrends.trend}
                  projectedNextPeriod={productivityTrends.projectedNextPeriod}
                />
              </div>
            </Suspense>
          </div>
        )}

        {tableSection}
      </TabsContent>

      <TabsContent value="insights" className="space-y-6" data-animate-stagger>
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          data-animate-stagger
        >
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <div dir="ltr">
              <OvertimeAnalysisChart data={overtimeAnalysis} />
            </div>
          </Suspense>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <div dir="ltr">
              <WorkloadDistributionChart data={workloadDistribution} />
            </div>
          </Suspense>
        </div>
      </TabsContent>
    </Tabs>
  );
}
