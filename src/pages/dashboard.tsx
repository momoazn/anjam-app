import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { useProjects, useTasks } from "@/hooks";
import { taskStatusBgColors } from "@/lib/tasks-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format, isPast } from "date-fns-jalali";
import {
  BarChart3,
  CheckCircle,
  Clock,
  LayoutDashboard,
  ListTodo,
  Target,
  AlertTriangle,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userTasks, isPending: isLoadingTasks } = useTasks({});
  const { data: projects, isPending: isLoadingProjects } = useProjects({});

  const stats = useMemo(() => {
    if (isLoadingTasks || !userTasks) return null;

    const overdue = userTasks.filter(
      (t) =>
        t.deadline &&
        isPast(new Date(t.deadline)) &&
        t.status !== TasksStatusOptions.done,
    ).length;

    return {
      total: userTasks.length,
      completed: userTasks.filter((t) => t.status === TasksStatusOptions.done)
        .length,
      inProgress: userTasks.filter(
        (t) => t.status === TasksStatusOptions.in_progress,
      ).length,
      pending: userTasks.filter((t) => t.status === TasksStatusOptions.todo)
        .length,
      overdue,
    };
  }, [userTasks, isLoadingTasks]);

  const recentTasks = useMemo(() => {
    if (isLoadingTasks || !userTasks) return [];
    return [...userTasks]
      .sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
      )
      .slice(0, 5);
  }, [userTasks, isLoadingTasks]);

  const overdueTasks = useMemo(() => {
    if (isLoadingTasks || !userTasks) return [];
    return userTasks
      .filter(
        (t) =>
          t.deadline &&
          isPast(new Date(t.deadline)) &&
          t.status !== TasksStatusOptions.done,
      )
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
      )
      .slice(0, 3);
  }, [userTasks, isLoadingTasks]);

  const chartData = useMemo(() => {
    if (isLoadingTasks || !userTasks) return [];
    const statusCounts = userTasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(statusCounts).map(([status, count]) => ({
      status:
        status === "todo"
          ? "برای انجام"
          : status === "in_progress"
            ? "در حال انجام"
            : status === "done"
              ? "انجام‌شده"
              : "لغوشده",
      count,
      fill: taskStatusBgColors[status as TasksStatusOptions],
    }));
  }, [userTasks, isLoadingTasks]);

  const projectStats = useMemo(() => {
    if (isLoadingProjects || !projects || isLoadingTasks || !userTasks)
      return [];

    return projects.map((project) => ({
      ...project,
      taskCount: userTasks.filter((task) => task.project === project.id).length,
      completedTasks: userTasks.filter(
        (task) =>
          task.project === project.id &&
          task.status === TasksStatusOptions.done,
      ).length,
      progress:
        userTasks.filter((task) => task.project === project.id).length > 0
          ? Math.round(
              (userTasks.filter(
                (task) =>
                  task.project === project.id &&
                  task.status === TasksStatusOptions.done,
              ).length /
                userTasks.filter((task) => task.project === project.id)
                  .length) *
                100,
            )
          : 0,
    }));
  }, [projects, userTasks, isLoadingProjects, isLoadingTasks]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-foreground flex items-center gap-2 text-xl font-bold md:text-2xl">
          <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
          داشبورد
        </h1>
        <Button
          onClick={() => navigate("/tasks")}
          className="w-full gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">تسک جدید</span>
          <span className="sm:hidden">تسک</span>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mb-8 md:gap-4 lg:grid-cols-5">
        <StatCard
          title="کل وظایف"
          value={stats?.total ?? 0}
          icon={<ListTodo className="text-primary h-6 w-6" />}
          color="bg-blue-50 dark:bg-blue-400/15"
        />
        <StatCard
          title="تکمیل شده"
          value={stats?.completed ?? 0}
          icon={<CheckCircle className="text-accent h-6 w-6" />}
          color="bg-green-50 dark:bg-emerald-400/15"
        />
        <StatCard
          title="در حال انجام"
          value={stats?.inProgress ?? 0}
          icon={<Clock className="h-6 w-6 text-orange-500" />}
          color="bg-orange-50 dark:bg-amber-400/15"
        />
        <StatCard
          title="در انتظار"
          value={stats?.pending ?? 0}
          icon={<BarChart3 className="text-secondary h-6 w-6" />}
          color="bg-purple-50 dark:bg-purple-400/15"
        />
        <StatCard
          title="گذشته‌موعد"
          value={stats?.overdue ?? 0}
          icon={<AlertTriangle className="text-destructive h-6 w-6" />}
          color="bg-red-50 dark:bg-red-400/15"
        />
      </div>

      {/* Project Summary Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold md:text-lg">
          <Target className="h-4 w-4 md:h-5 md:w-5" />
          خلاصه پروژه‌ها
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {projectStats.map((project) => (
            <div
              key={project.id}
              className="bg-card rounded-lg border p-4 shadow-sm transition-colors"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{project.name}</h3>
                <span className="text-muted-foreground text-sm">
                  {digitsEnToFa(project.completedTasks)} از{" "}
                  {digitsEnToFa(project.taskCount)} وظیفه
                </span>
              </div>
              <div className="bg-muted/60 mb-2 h-2 w-full rounded-full">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>٪{digitsEnToFa(project.progress)} تکمیل شده</span>
                <span>{digitsEnToFa(project.taskCount)} وظیفه</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {/* Task Status Chart */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              وضعیت تسک‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "تعداد",
                },
              }}
              className="h-[180px] md:h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="status" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Tasks Section */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              وظایف اخیر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="hover:bg-muted/60 dark:hover:bg-muted/40 flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors md:p-3"
                  onClick={() => navigate(`/tasks`)}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        taskStatusBgColors[task.status]
                      }`}
                    />
                    <span className="text-sm font-medium md:text-base">
                      {task.title}
                    </span>
                  </div>
                  <span
                    className="text-muted-foreground text-xs md:text-sm"
                    dir="ltr"
                  >
                    {task?.created
                      ? format(new Date(task.created), "yyyy/MM/dd")
                      : "بدون تاریخ"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks & Quick Actions */}
        <div className="space-y-4 md:col-span-2 md:space-y-6 lg:col-span-1">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2 text-sm md:text-base">
                  <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                  تسک‌های گذشته‌موعد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border-destructive/20 bg-destructive/5 flex items-center justify-between rounded-lg border p-2"
                    >
                      <span className="text-sm font-medium">{task.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {task.deadline
                          ? format(new Date(task.deadline), "MM/dd")
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                اقدامات سریع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs md:text-sm"
                  onClick={() => navigate("/tasks")}
                >
                  <ListTodo className="h-3 w-3 md:h-4 md:w-4" />
                  مشاهده همه تسک‌ها
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs md:text-sm"
                  onClick={() => navigate("/projects")}
                >
                  <Target className="h-3 w-3 md:h-4 md:w-4" />
                  مدیریت پروژه‌ها
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs md:text-sm"
                  onClick={() => navigate("/reports")}
                >
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                  مشاهده گزارشات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
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
    <div
      className={`border-border rounded-lg border ${color} p-4 transition-colors md:p-6`}
    >
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
}
