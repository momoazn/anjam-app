import { digitsEnToFa } from "@persian-tools/persian-tools";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns-jalali";
import {
  BarChart3,
  CheckCircle,
  Clock,
  ListTodo,
  Loader2,
  PieChart as PieChartIcon,
  Users,
} from "lucide-react";
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
import { pb } from "@/lib/pocketbase";
import {
  TasksResponse,
  TasksStatusOptions,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";

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
    label: "وظایف تکمیل شده",
    color: "#3b82f6",
  },
};

const userPerformanceConfig = {
  completionRate: {
    label: "درصد تکمیل",
    color: "#10b981",
  },
};

// Types for chart data
type StatusDistributionData = {
  name: string;
  value: number;
  status: TasksStatusOptions;
};

type PriorityDistributionData = {
  name: string;
  value: number;
  priority: string;
};

type CompletionTrendData = {
  date: string;
  completed: number;
};

type UserPerformanceData = {
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
};

// Custom hook to fetch task statistics
function useTaskStats() {
  return useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
      const tasks = await pb.collection("tasks").getFullList<TasksResponse>();

      // Status distribution
      const statusDistribution: StatusDistributionData[] = Object.values(
        TasksStatusOptions,
      ).map((status) => ({
        name:
          status === "todo"
            ? "در انتظار"
            : status === "in_progress"
              ? "در حال انجام"
              : status === "done"
                ? "تکمیل شده"
                : status === "canceled"
                  ? "لغو شده"
                  : status,
        value: tasks.filter((task) => task.status === status).length,
        status,
      }));

      // Tasks completed over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const completedOverTime = tasks
        .filter(
          (task) =>
            task.status === TasksStatusOptions.done &&
            new Date(task.updated) >= thirtyDaysAgo,
        )
        .reduce(
          (acc, task) => {
            const date = format(new Date(task.updated), "jMMM jdd");
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

      // Convert to array format for charts
      const completionTrend: CompletionTrendData[] = Object.entries(
        completedOverTime,
      ).map(([date, count]) => ({
        date,
        completed: count,
      }));

      // Priority distribution
      const priorityDistribution: PriorityDistributionData[] = [
        "urgent",
        "high",
        "medium",
        "low",
      ].map((priority) => ({
        name:
          priority === "urgent"
            ? "فوری"
            : priority === "high"
              ? "اولویت بالا"
              : priority === "medium"
                ? "اولویت متوسط"
                : "اولویت پایین",
        value: tasks.filter((task) => task.priority === priority).length,
        priority,
      }));

      return {
        statusDistribution,
        completionTrend,
        priorityDistribution,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(
          (task) => task.status === TasksStatusOptions.done,
        ).length,
        inProgressTasks: tasks.filter(
          (task) => task.status === TasksStatusOptions.in_progress,
        ).length,
        pendingTasks: tasks.filter(
          (task) => task.status === TasksStatusOptions.todo,
        ).length,
      };
    },
  });
}

// Custom hook to fetch user performance statistics
function useUserPerformance() {
  return useQuery({
    queryKey: ["user-performance"],
    queryFn: async () => {
      const users = await pb.collection("users").getFullList();
      const tasks = await pb.collection("tasks").getFullList<TasksResponse>();

      const userStats: UserPerformanceData[] = users
        .filter((user) => user.role === UsersRoleOptions.employee)
        .map((user) => {
          const userTasks = tasks.filter((task) => task.assignee === user.id);
          const completedTasks = userTasks.filter(
            (task) => task.status === TasksStatusOptions.done,
          );

          return {
            name:
              user.first_name && user.last_name
                ? user.first_name + " " + user.last_name
                : user.username,
            totalTasks: userTasks.length,
            completedTasks: completedTasks.length,
            completionRate: userTasks.length
              ? (completedTasks.length / userTasks.length) * 100
              : 0,
          };
        })
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 5); // Just top 5 users for better visualization

      return userStats;
    },
  });
}

function StatCard({
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
    <div className={`rounded-lg ${color} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold">{digitsEnToFa(value)}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

export default function Reports() {
  const { data: taskStats, isLoading: isLoadingTaskStats } = useTaskStats();
  const { data: userStats, isLoading: isLoadingUserStats } =
    useUserPerformance();

  if (isLoadingTaskStats || isLoadingUserStats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-8 text-3xl font-bold">داشبورد گزارشات</h1>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="کل وظایف"
          value={taskStats?.totalTasks ?? 0}
          icon={<ListTodo className="text-primary h-6 w-6" />}
          color="bg-blue-50"
        />
        <StatCard
          title="تکمیل شده"
          value={taskStats?.completedTasks ?? 0}
          icon={<CheckCircle className="text-accent h-6 w-6" />}
          color="bg-green-50"
        />
        <StatCard
          title="در حال انجام"
          value={taskStats?.inProgressTasks ?? 0}
          icon={<Clock className="h-6 w-6 text-orange-500" />}
          color="bg-orange-50"
        />
        <StatCard
          title="در انتظار"
          value={taskStats?.pendingTasks ?? 0}
          icon={<BarChart3 className="text-secondary h-6 w-6" />}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Task Status Distribution */}
        <div className="bg-card overflow-hidden rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">توزیع وضعیت وظایف</h2>
          </div>
          <div className="h-64 w-full">
            <ChartContainer config={statusChartConfig}>
              <PieChart>
                <Pie
                  data={taskStats?.statusDistribution}
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
                  {taskStats?.statusDistribution.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusChartConfig[entry.status].color}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        digitsEnToFa(value as number),
                        name,
                      ]}
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
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-card overflow-hidden rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">توزیع اولویت وظایف</h2>
          </div>
          <div className="h-64 w-full">
            <ChartContainer config={priorityChartConfig}>
              <PieChart>
                <Pie
                  data={taskStats?.priorityDistribution}
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
                  {taskStats?.priorityDistribution.map((entry) => (
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
                      formatter={(value, name) => [
                        digitsEnToFa(value as number),
                        name,
                      ]}
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Task Completion Trend */}
        <div className="bg-card overflow-hidden rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              روند تکمیل وظایف (۳۰ روز گذشته)
            </h2>
          </div>
          <div className="h-64 w-full">
            <ChartContainer config={completionTrendConfig}>
              <BarChart
                data={taskStats?.completionTrend}
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
                        "وظایف تکمیل شده",
                      ]}
                      labelFormatter={(label) => `تاریخ: ${label}`}
                    />
                  }
                />
                <Bar
                  dataKey="completed"
                  name="وظایف تکمیل شده"
                  fill={completionTrendConfig.completed.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* User Performance */}
        <div className="bg-card overflow-hidden rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">عملکرد کاربران برتر</h2>
          </div>
          <div className="h-64 w-full">
            <ChartContainer config={userPerformanceConfig}>
              <BarChart
                data={userStats}
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
          </div>
        </div>
      </div>
    </div>
  );
}
