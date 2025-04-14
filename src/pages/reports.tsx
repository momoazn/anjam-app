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
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

import { pb } from "@/lib/pocketbase";
import {
  TasksResponse,
  TasksStatusOptions,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";

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

const COLORS = {
  TODO: "#9333ea",
  IN_PROGRESS: "#f97316",
  DONE: "#10b981",
  CANCELED: "#ef4444",
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
} as const;

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card rounded-md border p-3 shadow-md">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="text-sm font-medium"
            style={{ color: entry.color }}
          >
            {`${entry.name}: ${digitsEnToFa(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

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
            <ResponsiveContainer width="100%" height="100%">
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
                  {taskStats?.statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === "todo"
                          ? COLORS.TODO
                          : entry.status === "in_progress"
                            ? COLORS.IN_PROGRESS
                            : entry.status === "done"
                              ? COLORS.DONE
                              : COLORS.CANCELED
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => (
                    <span className="text-muted-foreground text-xs">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-card overflow-hidden rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">توزیع اولویت وظایف</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                  {taskStats?.priorityDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.priority === "urgent"
                          ? COLORS.URGENT
                          : entry.priority === "high"
                            ? COLORS.HIGH
                            : entry.priority === "medium"
                              ? COLORS.MEDIUM
                              : COLORS.LOW
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => (
                    <span className="text-muted-foreground text-xs">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip
                  formatter={(value) => [
                    digitsEnToFa(value as number),
                    "وظایف تکمیل شده",
                  ]}
                  labelFormatter={(label) => `تاریخ: ${label}`}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="completed"
                  name="وظایف تکمیل شده"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Performance */}
        <div className="bg-card overflow-hidden rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">عملکرد کاربران برتر</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip
                  formatter={(value) => [
                    `${digitsEnToFa(value as number)}%`,
                    "درصد تکمیل",
                  ]}
                  labelFormatter={(label) => `کاربر: ${label}`}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="completionRate"
                  name="درصد تکمیل"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
