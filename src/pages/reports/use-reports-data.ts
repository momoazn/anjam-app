import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys, useProjects, useTasks, useUsers } from "@/hooks";
import { ProjectWithSupervisor, pb } from "@/lib/pocketbase";

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
