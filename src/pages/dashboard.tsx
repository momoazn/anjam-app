import {
  endOfWeek,
  format,
  isPast,
  isToday,
  startOfWeek,
} from "date-fns-jalali";
import { useMemo } from "react";

import { ChartsWidget } from "@/components/dashboard/charts-widget";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OverdueTasksWidget } from "@/components/dashboard/overdue-tasks-widget";
import { ProductivityWidget } from "@/components/dashboard/productivity-widget";
import { ProjectsWidget } from "@/components/dashboard/projects-widget";
import { PageTransition } from "@/components/page-transition";
import { tasks } from "@/constants";
import { useNotifications, useProjects, useTasks } from "@/hooks";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { getStatusColorVariant } from "@/lib/status-utils";

export default function Dashboard() {
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
      );
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
      getStatusColorVariant(TasksStatusOptions.todo, "fill"),
      getStatusColorVariant(TasksStatusOptions.in_progress, "fill"),
      getStatusColorVariant(TasksStatusOptions.done, "fill"),
      getStatusColorVariant(TasksStatusOptions.pending, "fill"),
    ];

    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: tasks.status[status as TasksStatusOptions] || status,
      value: count,
      fill: colors[index % colors.length],
    }));
  }, [userTasks, isLoadingTasks]);

  const projectStats = useMemo(() => {
    if (isLoadingProjects || !projects || isLoadingTasks || !userTasks)
      return [];

    return projects
      .map((project) => ({
        id: project.id,
        name: project.name,
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
      .filter((n) => n.read !== undefined)
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

  // Loading state
  const isLoading = isLoadingTasks || isLoadingProjects;

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-4">
      <DashboardHeader stats={stats} isLoading={isLoading} />
      <ProductivityWidget
        stats={stats}
        recentNotifications={recentNotifications}
        isLoading={isLoading}
      />
      <ProjectsWidget projects={projectStats} isLoading={isLoading} />
      <ChartsWidget
        pieChartData={pieChartData}
        productivityTrend={productivityTrend}
        recentTasks={recentTasks}
        isLoading={isLoading}
      />
      <OverdueTasksWidget overdueTasks={overdueTasks} />
    </PageTransition>
  );
}
