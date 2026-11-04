import { useToggleReaction } from "@/hooks/comments";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/store/app-context-store";

type ReactionMap = Record<string, string[]>;

const reactionConfig = {
  "+1": { emoji: "👍", label: "+1" },
  "-1": { emoji: "👎", label: "-1" },
  laugh: { emoji: "😄", label: "Laugh" },
  heart: { emoji: "❤️", label: "Heart" },
  rocket: { emoji: "🚀", label: "Rocket" },
  eyes: { emoji: "👀", label: "Eyes" },
};

function parseReactions(reactions: unknown): ReactionMap {
  if (!reactions) return {};
  if (typeof reactions === "string") {
    try {
      reactions = JSON.parse(reactions);
    } catch {
      return {};
    }
  }
  if (!reactions || typeof reactions !== "object") return {};
  const result: ReactionMap = {};
  for (const [key, value] of Object.entries(reactions)) {
    if (Array.isArray(value)) {
      result[key] = value.filter((v) => typeof v === "string");
    }
  }
  return result;
}

export function useCommentReactions(commentId: string, reactions: unknown) {
  const currentUser = useAuthUser();
  const toggle = useToggleReaction();
  const { toast } = useToast();
  const reactionMap = parseReactions(reactions);

  const toggleReaction = async (key: string) => {
    if (!currentUser) return;

    try {
      await toggle.mutate({ id: commentId, emoji: key });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  };

  return {
    reactionConfig,
    reactionMap,
    toggleReaction,
    currentUser,
  };
}
