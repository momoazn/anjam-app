import { useQuery } from "@tanstack/react-query";

import { pb } from "@/lib/pocketbase";
import type {
  MentionsResponse,
  ProjectsResponse,
  TasksResponse,
} from "@/lib/pocketbase-types";

import { queryKeys } from "./query-keys";

type MentionWithExpand = MentionsResponse<{
  comment: Record<string, unknown>;
  task: TasksResponse<{ project: ProjectsResponse }>;
  project: ProjectsResponse;
}>;

export function useMentions() {
  const user = pb.authStore.record;

  return useQuery<MentionWithExpand[]>({
    queryKey: queryKeys.mentions.byUser(user?.id),
    queryFn: async (): Promise<MentionWithExpand[]> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      return pb.collection("mentions").getFullList<MentionWithExpand>({
        filter: `mentioned_user = "${user.id}"`,
        sort: "-created",
        expand: "comment,task,project",
        batch: 20,
      });
    },
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
