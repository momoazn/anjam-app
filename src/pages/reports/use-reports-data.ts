import { useMemo } from "react";
import { pb, ProjectWithSupervisor } from "@/lib/pocketbase";
import { useProjects, useTasks, useUsers, queryKeys } from "@/hooks";
import { useQuery } from "@tanstack/react-query";

export function useReportsData() {
  const { data: tasksResult, isPending: tasksPending } = useTasks({
    expandFields: "project,assignee",
    mode: "full",
  });
  const tasks = useMemo(() => tasksResult?.items ?? [], [tasksResult]);
  const { data: users, isPending: usersPending } = useUsers();
  const { data: projects, isPending: projectsPending } = useProjects();

  const { data: projectsWithSupervisor } = useQuery({
    queryKey: [...queryKeys.projects.all, "supervisor"],
    queryFn: () =>
      pb.collection("projects").getFullList<ProjectWithSupervisor>({
        expand: "supervisor",
      }),
    enabled: !projectsPending && !!projects,
  });

  const isLoading = tasksPending || usersPending || projectsPending;

  return {
    tasks,
    users,
    projects,
    projectsWithSupervisor,
    isLoading,
  };
}
