import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  BarChart3,
  CheckCircle,
  Clock,
  ListTodo,
  Loader2,
  PieChart as PieChartIcon,
  Users,
} from "lucide-react";
import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  calculateTaskStats,
  calculateUserPerformance,
  type CompletionTrendData,
  type PriorityDistributionData,
  type StatusDistributionData,
  type UserPerformanceData,
} from "@/lib/reports-utils";
import { useTasks, useUsers } from "@/hooks";

// Chart configurations
const statusChartConfig = {
  todo: {
    label: "در انتظار",
    color: "#9333ea",
  },
  in_progress: {
    label: "در حال انجام",
    color: "#f97316",
  },
  done: {
    label: "تکمیل شده",
    color: "#10b981",
  },
  canceled: {
    label: "لغو شده",
    color: "#ef4444",
  },
};

const priorityChartConfig = {
  urgent: {
    label: "فوری",
    color: "#ef4444",
  },
  high: {
    label: "اولویت بالا",
    color: "#f97316",
  },
  medium: {
    label: "اولویت متوسط",
    color: "#f59e0b",
  },
  low: {
    label: "اولویت پایین",
    color: "#10b981",
  },
};

const completionTrendConfig = {
  completed: {
    label: "تسک‌های تکمیل شده",
    color: "#3b82f6",
  },
};

const userPerformanceConfig = {
  completionRate: {
    label: "درصد تکمیل",
    color: "#10b981",
  },
};

// Memoize the StatCard component
const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`rounded-lg ${color} p-4 transition-colors md:p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-medium md:text-sm">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold md:mt-2 md:text-3xl">
            {digitsEnToFa(value)}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0 md:ml-0">{icon}</div>
      </div>
    </div>
  );
});

// Simplified task stats hook
function useTaskStats() {
  const {
    data: tasks,
    isPending,
    error,
  } = useTasks({
    expandFields: "project,assignee",
  });

  return {
    data: tasks ? calculateTaskStats(tasks) : undefined,
    isPending,
    error,
  };
}

// Simplified user performance hook
function useUserPerformance() {
  const {
    data: users,
    isPending: usersPending,
    error: usersError,
  } = useUsers({});
  const {
    data: tasks,
    isPending: tasksPending,
    error: tasksError,
  } = useTasks({
    expandFields: "project,assignee",
  });

  return {
    data: users && tasks ? calculateUserPerformance(users, tasks) : undefined,
    isPending: usersPending || tasksPending,
    error: usersError || tasksError,
  };
}

// Memoize chart components
const StatusDistributionChart = memo(function StatusDistributionChart({
  data,
}: {
  data: StatusDistributionData[];
}) {
  return (
    <ChartContainer config={statusChartConfig}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={2}
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${digitsEnToFa((percent * 100).toFixed(0))}%`
          }
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={statusChartConfig[entry.status].color}
            />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [digitsEnToFa(value as number), "تسک‌های"]}
            />
          }
        />
        <ChartLegend
          content={
            <ChartLegendContent className="text-muted-foreground text-xs" />
          }
        />
      </PieChart>
    </ChartContainer>
  );
});

const PriorityDistributionChart = memo(function PriorityDistributionChart({
  data,
}: {
  data: PriorityDistributionData[];
}) {
  return (
    <ChartContainer config={priorityChartConfig}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={2}
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${digitsEnToFa((percent * 100).toFixed(0))}%`
          }
        >
          {data.map((entry) => (
            <Cell
              key={entry.priority}
              fill={
                priorityChartConfig[
                  entry.priority as keyof typeof priorityChartConfig
                ].color
              }
            />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [digitsEnToFa(value as number), "تسک‌های"]}
            />
          }
        />
        <ChartLegend
          content={
            <ChartLegendContent className="text-muted-foreground text-xs" />
          }
        />
      </PieChart>
    </ChartContainer>
  );
});

const CompletionTrendChart = memo(function CompletionTrendChart({
  data,
}: {
  data: CompletionTrendData[];
}) {
  return (
    <ChartContainer config={completionTrendConfig}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-muted/20"
        />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          tick={{ fontSize: 10 }}
          height={60}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => digitsEnToFa(value)}
          className="text-muted-foreground"
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [
                digitsEnToFa(value as number),
                "تسک‌های تکمیل شده",
              ]}
              labelFormatter={(label) => `تاریخ: ${label}`}
            />
          }
        />
        <Bar
          dataKey="completed"
          name="تسک‌های تکمیل شده"
          fill={completionTrendConfig.completed.color}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
});

const UserPerformanceChart = memo(function UserPerformanceChart({
  data,
}: {
  data: UserPerformanceData[];
}) {
  return (
    <ChartContainer config={userPerformanceConfig}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 10, left: 80, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          className="stroke-muted/20"
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(value) => `${digitsEnToFa(value)}%`}
          tick={{ fontSize: 10 }}
          className="text-muted-foreground"
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 10 }}
          width={80}
          className="text-muted-foreground"
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [
                `${digitsEnToFa(value as number)}%`,
                "درصد تکمیل",
              ]}
              labelFormatter={(label) => `کاربر: ${label}`}
            />
          }
        />
        <Bar
          dataKey="completionRate"
          name="درصد تکمیل"
          fill={userPerformanceConfig.completionRate.color}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
});

export default function Reports() {
  const { data: taskStats, isPending: isLoadingTaskStats } = useTaskStats();
  const { data: userStats, isPending: isLoadingUserStats } =
    useUserPerformance();

  if (isLoadingTaskStats || isLoadingUserStats) {
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
        <div className="flex gap-2">
          <button className="hover:bg-muted rounded-md border px-3 py-2 text-sm">
            فیلتر تاریخ
          </button>
          <button className="hover:bg-muted rounded-md border px-3 py-2 text-sm">
            دانلود گزارش
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 md:mb-8 md:grid-cols-4 md:gap-4">
        <StatCard
          title="کل تسک‌های"
          value={taskStats?.totalTasks ?? 0}
          icon={
            <ListTodo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          }
          color="bg-blue-50 dark:bg-blue-400/15"
        />
        <StatCard
          title="تکمیل شده"
          value={taskStats?.completedTasks ?? 0}
          icon={
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          }
          color="bg-green-50 dark:bg-emerald-400/15"
        />
        <StatCard
          title="در حال انجام"
          value={taskStats?.inProgressTasks ?? 0}
          icon={
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          }
          color="bg-orange-50 dark:bg-amber-400/15"
        />
        <StatCard
          title="در انتظار"
          value={taskStats?.pendingTasks ?? 0}
          icon={
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          }
          color="bg-purple-50 dark:bg-purple-400/15"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Task Status Distribution */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 md:h-5 md:w-5" />
            <h2 className="text-base font-semibold md:text-lg">
              توزیع وضعیت تسک‌های
            </h2>
          </div>
          <div className="h-48 w-full md:h-64">
            {taskStats?.statusDistribution && (
              <StatusDistributionChart data={taskStats.statusDistribution} />
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
            <h2 className="text-base font-semibold md:text-lg">
              توزیع اولویت تسک‌های
            </h2>
          </div>
          <div className="h-48 w-full md:h-64">
            {taskStats?.priorityDistribution && (
              <PriorityDistributionChart
                data={taskStats.priorityDistribution}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Task Completion Trend */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
            <h2 className="text-base font-semibold md:text-lg">
              روند تکمیل تسک‌های (۳۰ روز گذشته)
            </h2>
          </div>
          <div className="h-48 w-full md:h-64">
            {taskStats?.completionTrend && (
              <CompletionTrendChart data={taskStats.completionTrend} />
            )}
          </div>
        </div>

        {/* User Performance */}
        <div className="bg-card overflow-hidden rounded-lg border p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 md:h-5 md:w-5" />
            <h2 className="text-base font-semibold md:text-lg">
              عملکرد کاربران برتر
            </h2>
          </div>
          <div className="h-48 w-full md:h-64">
            {userStats && <UserPerformanceChart data={userStats} />}
          </div>
        </div>
      </div>
    </div>
  );
}
