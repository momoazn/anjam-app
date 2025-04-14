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
  ChartTooltip,
} from "@/components/ui/chart";
import { pb } from "@/lib/pocketbase";
import {
  TasksResponse,
  TasksStatusOptions,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";

// Custom hook to fetch task statistics
function useTaskStats() {
  return useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
      const tasks = await pb.collection("tasks").getFullList<TasksResponse>();

      // Status distribution
      const statusDistribution = Object.values(TasksStatusOptions).map(
        (status) => ({
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
        }),
      );

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
      const completionTrend = Object.entries(completedOverTime).map(
        ([date, count]) => ({
          date,
          completed: count,
        }),
      );

      // Priority distribution
      const priorityDistribution = ["urgent", "high", "medium", "low"].map(
        (priority) => ({
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
        }),
      );

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

      const userStats = users
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
      <div className="mx-auto mt-20">
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
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">توزیع وضعیت وظایف</h2>
          </div>
          <div className="h-64">
            <ChartContainer
              config={{
                todo: { color: "#9333ea" },
                in_progress: { color: "#f97316" },
                done: { color: "#10b981" },
                canceled: { color: "#ef4444" },
              }}
            >
              <PieChart>
                <Pie
                  data={taskStats?.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) =>
                    `${entry.name}: ${digitsEnToFa(entry.value)}`
                  }
                >
                  {taskStats?.statusDistribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.status}`}
                      fill={
                        entry.status === "todo"
                          ? "#9333ea"
                          : entry.status === "in_progress"
                            ? "#f97316"
                            : entry.status === "done"
                              ? "#10b981"
                              : "#ef4444"
                      }
                    />
                  ))}
                </Pie>
                <ChartTooltip />
                <ChartLegend />
              </PieChart>
            </ChartContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">توزیع اولویت وظایف</h2>
          </div>
          <div className="h-64">
            <ChartContainer
              config={{
                high: { color: "#ef4444" },
                medium: { color: "#f59e0b" },
                low: { color: "#10b981" },
              }}
            >
              <PieChart>
                <Pie
                  data={taskStats?.priorityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) =>
                    `${entry.name}: ${digitsEnToFa(entry.value)}`
                  }
                >
                  {taskStats?.priorityDistribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.priority}`}
                      fill={
                        entry.priority === "high"
                          ? "#ef4444"
                          : entry.priority === "medium"
                            ? "#f59e0b"
                            : "#10b981"
                      }
                    />
                  ))}
                </Pie>
                <ChartTooltip />
                <ChartLegend />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Task Completion Trend */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              روند تکمیل وظایف (۳۰ روز گذشته)
            </h2>
          </div>
          <div className="h-64">
            <ChartContainer
              config={{
                completed: { color: "#3b82f6" },
              }}
            >
              <BarChart
                data={taskStats?.completionTrend}
                margin={{ left: 0, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Bar
                  dataKey="completed"
                  name="وظایف تکمیل شده"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* User Performance */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">عملکرد کاربران برتر</h2>
          </div>
          <div className="h-64">
            <ChartContainer
              config={{
                completionRate: { color: "#10b981" },
              }}
            >
              <BarChart
                data={userStats}
                layout="vertical"
                margin={{ left: 100, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="%" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" />
                <ChartTooltip />
                <Bar
                  dataKey="completionRate"
                  name="درصد تکمیل"
                  fill="#10b981"
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
