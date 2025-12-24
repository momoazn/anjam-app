import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/store/auth-store";
import { queryKeys } from "./query-keys";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { ProjectsResponse } from "@/lib/pocketbase-types";
import { isToday, isPast } from "date-fns";

export function useTaskCounts() {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  const tasks = useMemo(() => {
    const tasksData = queryClient.getQueryData<TaskWithProject[]>(
      queryKeys.tasks.list({
        projectId: undefined,
        expandFields: "project,assignee",
        mode: "full",
      }),
    );
    return (tasksData ?? []).filter((task) => !task.deleted_at);
  }, [queryClient]);

  const counts = useMemo(() => {
    const userId = user?.id;

    const myTasks = tasks.filter(
      (task) =>
        task.assignee === userId &&
        (task.status === "todo" || task.status === "in_progress"),
    ).length;

    const dueToday = tasks.filter((task) => {
      return (
        task.deadline &&
        isToday(new Date(task.deadline)) &&
        task.status !== "done"
      );
    }).length;

    const overdue = tasks.filter((task) => {
      return (
        task.deadline &&
        isPast(new Date(task.deadline)) &&
        task.status !== "done"
      );
    }).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in_progress",
    ).length;

    const byProject = new Map<string, number>();
    tasks.forEach((task) => {
      if (task.status === "done") {
        return;
      }

      const projectId =
        typeof task.project === "string"
          ? task.project
          : (task.project as ProjectsResponse)?.id;

      if (!projectId) {
        return;
      }

      byProject.set(projectId, (byProject.get(projectId) ?? 0) + 1);
    });

    return {
      myTasks,
      dueToday,
      overdue,
      inProgress,
      byProject,
    };
  }, [tasks, user?.id]);

  return counts;
}
