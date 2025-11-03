import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fa } from "@/constants/text";
import { useProjects, useTasks } from "@/hooks";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { taskStatusBgColors } from "@/lib/tasks-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format, isPast } from "date-fns-jalali";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  LayoutDashboard,
  ListTodo,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userTasks, isPending: isLoadingTasks } = useTasks({
    expandFields: "project,assignee",
  });
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
          ? fa.tasks.status.todo
          : status === "in_progress"
            ? fa.tasks.status.in_progress
            : status === "done"
              ? fa.tasks.status.done
              : fa.tasks.status.canceled,
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
    <PageTransition className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
          {fa.dashboard.title}
        </h1>
        <Button
          onClick={() => navigate("/tasks")}
          className="w-full gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{fa.dashboard.newTask}</span>
          <span className="sm:hidden">{fa.dashboard.taskShort}</span>
        </Button>
      </div>

      {/* Stats Section */}
      <div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5"
        data-animate-stagger
      >
        <StatCard
          title={fa.dashboard.stats.totalTasks}
          value={stats?.total ?? 0}
          icon={
            <ListTodo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          }
          color="bg-blue-50 dark:bg-blue-400/15"
        />
        <StatCard
          title={fa.dashboard.stats.completed}
          value={stats?.completed ?? 0}
          icon={
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          }
          color="bg-green-50 dark:bg-emerald-400/15"
        />
        <StatCard
          title={fa.dashboard.stats.inProgress}
          value={stats?.inProgress ?? 0}
          icon={
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          }
          color="bg-orange-50 dark:bg-amber-400/15"
        />
        <StatCard
          title={fa.dashboard.stats.pending}
          value={stats?.pending ?? 0}
          icon={
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          }
          color="bg-purple-50 dark:bg-purple-400/15"
        />
        <StatCard
          title={fa.dashboard.stats.overdue}
          value={stats?.overdue ?? 0}
          icon={
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          }
          color="bg-red-50 dark:bg-red-400/15"
        />
      </div>

      {/* Project Summary Section */}
      <div className="mb-8" data-animate-stagger>
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold md:text-xl">
          <Target className="h-4 w-4 md:h-5 md:w-5" />
          {fa.dashboard.projectSummary}
        </h2>
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
          data-animate-stagger
        >
          {projectStats.map((project) => (
            <div
              key={project.id}
              className="bg-card rounded-lg border p-4 shadow-sm transition-colors"
              data-interactive-item
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{project.name}</h3>
                <span className="text-muted-foreground text-sm">
                  {digitsEnToFa(project.completedTasks)} {fa.dashboard.of}{" "}
                  {digitsEnToFa(project.taskCount)} {fa.dashboard.taskShort}
                </span>
              </div>
              <div className="bg-muted/60 mb-2 h-2 w-full rounded-full">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>
                  {fa.dashboard.tasksCompleted.replace(
                    "{percentage}",
                    digitsEnToFa(project.progress),
                  )}
                </span>
                <span>
                  {digitsEnToFa(project.taskCount)} {fa.dashboard.taskShort}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-animate-stagger
      >
        {/* Task Status Chart */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              {fa.dashboard.taskStatus}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <ChartContainer
              config={{
                count: {
                  label: fa.dashboard.chart.count,
                },
              }}
              className="mx-auto h-[200px] max-w-[520px] md:h-[200px]"
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
              {fa.dashboard.recentTasks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3" data-animate-stagger>
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="hover:bg-muted/60 dark:hover:bg-muted/40 flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors md:p-3"
                  data-interactive-item
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
                      : fa.dashboard.fallbacks.noDate}
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
                  {fa.dashboard.overdueTasks}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2" data-animate-stagger>
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border-destructive/20 bg-destructive/5 flex items-center justify-between rounded-lg border p-2"
                      data-interactive-item
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
                {fa.dashboard.quickActions}
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
                  {fa.dashboard.viewAllTasks}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs md:text-sm"
                  onClick={() => navigate("/projects")}
                >
                  <Target className="h-3 w-3 md:h-4 md:w-4" />
                  {fa.dashboard.manageProjects}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs md:text-sm"
                  onClick={() => navigate("/reports")}
                >
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                  {fa.dashboard.viewReports}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
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
      data-interactive-item
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
