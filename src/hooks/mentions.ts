import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";

export function useMentions() {
  const mentions = useQuery(api.mentions.listForMe);
  type Mention = NonNullable<typeof mentions>[number];

  return {
    data: mentions?.map((m: Mention) => ({
      ...m,
      expand: {
        task: m.task ?? undefined,
        comment: m.comment ?? undefined,
        project: m.project ?? undefined,
        author: m.author ?? undefined,
      },
    })),
    isLoading: mentions === undefined,
  };
}
