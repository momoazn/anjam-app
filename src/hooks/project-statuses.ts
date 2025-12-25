import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { ProjectStatusesResponse } from "@/lib/pocketbase-types";
import { queryKeys } from "./query-keys";

export function useProjectStatuses({
  projectId,
  enabled = true,
}: {
  projectId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.projectStatuses.byProject(projectId),
    queryFn: () =>
      pb.collection("project_statuses").getFullList<ProjectStatusesResponse>({
        filter: `project = "${projectId}"`,
        sort: "order",
      }),
    enabled: enabled && Boolean(projectId),
    staleTime: 60_000,
  });
}
