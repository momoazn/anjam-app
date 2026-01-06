import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useMentions() {
  const mentions = useQuery(api.mentions.listForMe);

  return {
    data: mentions?.map((m: any) => ({
      ...m,
      expand: {
        task: m.task ? { ...m.task, id: m.task._id } : undefined,
        comment: m.comment ? { ...m.comment, id: m.comment._id } : undefined,
        project: m.project ? { ...m.project, id: m.project._id } : undefined,
        author: m.author ? { ...m.author, id: m.author._id } : undefined,
      },
    })),
    isLoading: mentions === undefined,
  };
}
