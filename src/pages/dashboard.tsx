import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  endOfWeek,
  format,
  isPast,
  isToday,
  startOfWeek,
} from "date-fns-jalali";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  LayoutDashboard,
  ListTodo,
  Plus,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { useNotifications, useProjects, useTasks } from "@/hooks";
import { useAuthRole, useAuthUser } from "@/store/auth-store";
import { TasksStatusOptions, UsersRoleOptions } from "@/lib/pocketbase-types";
import { taskStatusBgColors } from "@/lib/status-utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userTasksResult, isPending: isLoadingTasks } = useTasks({
    expandFields: "project,assignee",
    mode: "full",
  });
  const userTasks = useMemo(
    () => userTasksResult?.items ?? [],
    [userTasksResult],
  );
  const { data: projects, isPending: isLoadingProjects } = useProjects({});
  const { data: notifications } = useNotifications();
  const userRole = useAuthRole();
  const user = useAuthUser();

  const stats = useMemo(() => {
    if (isLoadingTasks || !userTasks) return null;

    const overdue = userTasks.filter(
      (t) =>
        t.deadline &&
        isPast(new Date(t.deadline)) &&
        t.status !== TasksStatusOptions.done,
    ).length;

    const dueToday = userTasks.filter(
      (t) =>
        t.deadline &&
        isToday(new Date(t.deadline)) &&
        t.status !== TasksStatusOptions.done,
    ).length;

    const waitingStatuses: TasksStatusOptions[] = [
      TasksStatusOptions.todo,
      TasksStatusOptions.pending,
    ];

    const thisWeekCompleted = userTasks.filter((t) => {
      if (t.status !== TasksStatusOptions.done || !t.updated) return false;
      const updatedDate = new Date(t.updated);
      return (
        updatedDate >= startOfWeek(new Date()) &&
        updatedDate <= endOfWeek(new Date())
      );
    }).length;

    const completionRate =
      userTasks.length > 0
        ? Math.round(
            (userTasks.filter((t) => t.status === TasksStatusOptions.done)
              .length /
              userTasks.length) *
              100,
          )
        : 0;

    return {
      total: userTasks.length,
      completed: userTasks.filter((t) => t.status === TasksStatusOptions.done)
        .length,
      inProgress: userTasks.filter(
        (t) => t.status === TasksStatusOptions.in_progress,
      ).length,
      pending: userTasks.filter((t) =>
        waitingStatuses.includes(t.status as TasksStatusOptions),
      ).length,
      overdue,
      dueToday,
      thisWeekCompleted,
      completionRate,
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

  // Pie chart data for status distribution
  const pieChartData = useMemo(() => {
    if (isLoadingTasks || !userTasks) return [];
    const statusCounts = userTasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const colors = [
      taskStatusBgColors[TasksStatusOptions.todo],
      taskStatusBgColors[TasksStatusOptions.in_progress],
      taskStatusBgColors[TasksStatusOptions.done],
      taskStatusBgColors[TasksStatusOptions.pending],
    ];

    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: fa.tasks.status[status as TasksStatusOptions] || status,
      value: count,
      fill: colors[index % colors.length],
    }));
  }, [userTasks, isLoadingTasks]);

  const projectStats = useMemo(() => {
    if (isLoadingProjects || !projects || isLoadingTasks || !userTasks)
      return [];

    return projects
      .map((project) => ({
        ...project,
        taskCount: userTasks.filter((task) => task.project === project.id)
          .length,
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
      }))
      .sort((a, b) => b.taskCount - a.taskCount); // Sort by task count
  }, [projects, userTasks, isLoadingProjects, isLoadingTasks]);

  // Recent notifications (unread first)
  const recentNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort((a, b) => {
        // Unread first, then by created date
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.created!).getTime() - new Date(a.created!).getTime();
      })
      .slice(0, 4);
  }, [notifications]);

  // Productivity trend data for the last 7 days
  const productivityTrend = useMemo(() => {
    if (!userTasks) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map((date) => {
      const completedTasks = userTasks.filter((task) => {
        if (task.status !== TasksStatusOptions.done || !task.updated)
          return false;
        const updatedDate = new Date(task.updated);
        return updatedDate.toDateString() === date.toDateString();
      }).length;

      return {
        date: format(date, "yyyy/MM/dd"),
        completed: completedTasks,
        day: format(date, "EEEE").slice(0, 3), // Short day name
      };
    });
  }, [userTasks]);

  // Role-based welcome message and quick actions
  const dashboardConfig = useMemo(() => {
    const isEmployee = userRole === UsersRoleOptions.employee;
    const isSupervisor = userRole === UsersRoleOptions.supervisor;
    const isAdmin = userRole === UsersRoleOptions.admin;

    return {
      welcomeMessage: isEmployee
        ? fa.dashboard.welcome.employee
            .replace("{firstName}", user?.first_name || "")
            .replace("{lastName}", user?.last_name || "")
            .trim()
        : isSupervisor
          ? fa.dashboard.welcome.supervisor
              .replace("{firstName}", user?.first_name || "")
              .replace("{lastName}", user?.last_name || "")
              .trim()
          : fa.dashboard.welcome.admin
              .replace("{firstName}", user?.first_name || "")
              .replace("{lastName}", user?.last_name || "")
              .trim(),
      subtitle: isEmployee
        ? fa.dashboard.welcome.employeeSubtitle
        : isSupervisor
          ? fa.dashboard.welcome.supervisorSubtitle
          : fa.dashboard.welcome.adminSubtitle,
      showTeamOverview: isSupervisor || isAdmin,
      showSystemMetrics: isAdmin,
      quickActions: [
        {
          title: fa.dashboard.newTask,
          icon: <Plus className="h-4 w-4" />,
          action: () => navigate("/tasks/new"),
          variant: "default" as const,
          show: true,
        },
        {
          title: fa.dashboard.viewReports,
          icon: <BarChart3 className="h-4 w-4" />,
          action: () => navigate("/reports"),
          variant: "outline" as const,
          show: isSupervisor || isAdmin,
        },
        {
          title: fa.dashboard.manageProjects,
          icon: <Target className="h-4 w-4" />,
          action: () => navigate("/projects"),
          variant: "outline" as const,
          show: true,
        },
        {
          title: fa.users.title,
          icon: <Users className="h-4 w-4" />,
          action: () => navigate("/users"),
          variant: "outline" as const,
          show: isAdmin,
        },
      ].filter((action) => action.show),
    };
  }, [userRole, user, navigate]);

  // Loading state
  if (isLoadingTasks || isLoadingProjects) {
    return (
      <PageTransition className="container mx-auto p-4 md:p-6">
        {/* Loading Welcome Section */}
        <div className="from-primary/10 via-primary/5 mb-8 rounded-lg bg-gradient-to-r to-transparent p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="mb-2 h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Loading Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`stat-skeleton-${i}`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Productivity Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`productivity-skeleton-${i}`}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Projects */}
        <div className="mb-8">
          <Skeleton className="mb-6 h-6 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={`project-skeleton-${i}`}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-3 h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`chart-skeleton-${i}`}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Welcome Section */}
      <div className="from-primary/10 via-primary/5 mb-8 rounded-lg bg-gradient-to-r to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
              {dashboardConfig.welcomeMessage}
            </h1>
            <p className="text-muted-foreground mt-2">
              {dashboardConfig.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            {dashboardConfig.quickActions.map((action) => (
              <Button
                key={action.title}
                onClick={action.action}
                variant={action.variant}
                className="gap-2"
              >
                {action.icon}
                <span className="hidden sm:inline">{action.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        data-animate-stagger
      >
        <StatCard
          title={fa.dashboard.stats.totalTasks}
          value={stats?.total ?? 0}
          icon={<ListTodo className="h-5 w-5" />}
          color="bg-blue-50 dark:bg-blue-400/10"
          textColor="text-blue-700 dark:text-blue-300"
        />
        <StatCard
          title={fa.dashboard.stats.completed}
          value={stats?.completed ?? 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-green-50 dark:bg-green-400/10"
          textColor="text-green-700 dark:text-green-300"
        />
        <StatCard
          title={fa.dashboard.stats.inProgress}
          value={stats?.inProgress ?? 0}
          icon={<Clock className="h-5 w-5" />}
          color="bg-orange-50 dark:bg-orange-400/10"
          textColor="text-orange-700 dark:text-orange-300"
        />
        <StatCard
          title={fa.dashboard.stats.pending}
          value={stats?.pending ?? 0}
          icon={<BarChart3 className="h-5 w-5" />}
          color="bg-purple-50 dark:bg-purple-400/10"
          textColor="text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title={fa.dashboard.cards.todayDue}
          value={stats?.dueToday ?? 0}
          icon={<Calendar className="h-5 w-5" />}
          color="bg-yellow-50 dark:bg-yellow-400/10"
          textColor="text-yellow-700 dark:text-yellow-300"
        />
        <StatCard
          title={fa.dashboard.stats.overdue}
          value={stats?.overdue ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-red-50 dark:bg-red-400/10"
          textColor="text-red-700 dark:text-red-300"
        />
      </div>

      {/* Productivity Insights Row */}
      <div
        className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-animate-stagger
      >
        {/* Completion Rate Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              {fa.dashboard.cards.completionRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-3xl font-bold">
              {digitsEnToFa(stats?.completionRate ?? 0)}%
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {digitsEnToFa(stats?.thisWeekCompleted ?? 0)}{" "}
              {fa.dashboard.cards.completedThisWeek}
            </p>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              {fa.dashboard.cards.recentNotifications}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentNotifications.length > 0 ? (
              recentNotifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-2 rounded p-2 text-sm ${
                    !notification.read
                      ? "bg-primary/5 border-primary/20 border"
                      : ""
                  }`}
                >
                  {!notification.read && (
                    <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />
                  )}
                  <span className="truncate">{notification.title}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                {fa.dashboard.cards.noNewNotifications}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              {fa.dashboard.cards.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate("/my-tasks")}
            >
              <ListTodo className="h-4 w-4" />
              {fa.dashboard.cards.myTasks}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate("/tasks/calendar")}
            >
              <Calendar className="h-4 w-4" />
              {fa.dashboard.cards.tasksCalendar}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-4 w-4" />
              {fa.dashboard.cards.notifications}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Project Summary Section */}
      <div className="mb-8" data-animate-stagger>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold md:text-xl">
            <Target className="h-4 w-4 md:h-5 md:w-5" />
            {fa.dashboard.projectSummary}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
          >
            {fa.dashboard.cards.viewAll}
          </Button>
        </div>
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
          data-animate-stagger
        >
          {projectStats.slice(0, 6).map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/projects/${project.id}/details`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/projects/${project.id}/details`);
                }
              }}
              tabIndex={0}
              role="button"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {digitsEnToFa(project.taskCount)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{fa.dashboard.cards.progress}</span>
                    <span>{digitsEnToFa(project.progress)}%</span>
                  </div>
                  <div className="bg-muted/60 h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-muted-foreground flex justify-between text-sm">
                  <span>
                    {digitsEnToFa(project.completedTasks)}{" "}
                    {fa.dashboard.cards.completed}
                  </span>
                  <span>
                    {digitsEnToFa(project.taskCount - project.completedTasks)}{" "}
                    {fa.dashboard.cards.remaining}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Charts and Activity Section */}
      <div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
        data-animate-stagger
      >
        {/* Task Status Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              {fa.dashboard.cards.taskStatusDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: fa.dashboard.chart.count,
                },
              }}
              className="mx-auto h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${digitsEnToFa((percent * 100).toFixed(0))}%`
                    }
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Productivity Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              {fa.dashboard.cards.productivityTrend}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: {
                  label: fa.dashboard.cards.completed,
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productivityTrend}>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(label) =>
                      fa.dashboard.cards.dayLabel.replace("{label}", label)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              {fa.dashboard.cards.recentActivity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-animate-stagger>
              {recentTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/tasks/${task.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <div
                    className={`h-3 w-3 flex-shrink-0 rounded-full ${
                      taskStatusBgColors[task.status]
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {task?.expand?.project?.name ||
                        fa.dashboard.cards.noProject}{" "}
                      • {format(new Date(task.created), "MM/dd")}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {fa.tasks.status[task.status]}
                  </Badge>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  {fa.dashboard.cards.noActivityFound}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5 mt-6">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {fa.dashboard.cards.overdueTasks} (
              {digitsEnToFa(overdueTasks.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {overdueTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="border-destructive/20 bg-background/80 hover:bg-background flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/tasks/${task.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <span className="truncate text-sm font-medium">
                    {task.title}
                  </span>
                  <span className="text-destructive text-xs font-medium">
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
    </PageTransition>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  textColor = "text-foreground",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  textColor?: string;
}) {
  return (
    <Card className={`${color} border-0`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground text-xs font-medium md:text-sm">
              {title}
            </p>
            <p
              className={`mt-1 text-2xl font-bold md:mt-2 md:text-3xl ${textColor}`}
            >
              {digitsEnToFa(value)}
            </p>
          </div>
          <div className={`flex-shrink-0 ${textColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
