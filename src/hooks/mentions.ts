import { useQuery } from "@tanstack/react-query";

import { pb } from "@/lib/pocketbase";
import type { MentionsResponse } from "@/lib/pocketbase-types";

export function useMentions() {
  const user = pb.authStore.record;

  return useQuery<MentionsResponse[]>({
    queryKey: ["mentions", user?.id ?? ""],
    queryFn: async (): Promise<MentionsResponse[]> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      return pb.collection("mentions").getFullList<MentionsResponse>({
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
