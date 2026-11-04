import { useQuery } from "convex/react";
import { isToday } from "date-fns";
import { useMemo } from "react";

import { Id, api } from "@/lib/convex";
import { isTaskOverdue } from "@/lib/date-utils";
import {
  useAuthIsAuthenticatedStrict,
  useAuthUser,
  useCurrentOrganization,
} from "@/store/app-context-store";

export function useTaskCounts() {
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const user = useAuthUser();
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;

  const tasks = useQuery(
    api.tasks.listAll,
    isAuthenticated && organizationId ? { organizationId } : "skip",
  );

  const counts = useMemo(() => {
    if (!tasks) {
      return {
        myTasks: 0,
        dueToday: 0,
        overdue: 0,
        inProgress: 0,
        byProject: new Map<string, number>(),
      };
    }

    const userId = user?._id;

    // Convex listAll already filters out deleted tasks

    const myTasks = tasks.filter(
      (task) =>
        task.assigneeUserId === userId &&
        (task.status === "todo" || task.status === "in_progress"),
    ).length;

    const dueToday = tasks.filter((task) => {
      return (
        task.deadline &&
        isToday(new Date(task.deadline)) &&
        task.status !== "done"
      );
    }).length;

    const overdue = tasks.filter((task) => isTaskOverdue(task)).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in_progress",
    ).length;

    const byProject = new Map<string, number>();
    tasks.forEach((task) => {
      if (task.status === "done") {
        return;
      }

      const projectId = task.projectId;
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
  }, [tasks, user?._id]);

  return counts;
}
