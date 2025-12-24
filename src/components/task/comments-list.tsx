import { useMemo, useState } from "react";

import { comments as commentsText } from "@/constants";
import { CommentWithUser } from "@/hooks/comments";
import { cn } from "@/lib/utils";
import { CommentItem } from "./comment-item";

type CommentsListProps = {
  comments: CommentWithUser[];
  className?: string;
};

export function CommentsList({ comments, className }: CommentsListProps) {
  const [locallyDeleted, setLocallyDeleted] = useState<Set<string>>(
    () => new Set(),
  );

  const visibleComments = useMemo(
    () => comments.filter((c) => !locallyDeleted.has(c.id)),
    [comments, locallyDeleted],
  );

  if (visibleComments.length === 0) {
    return (
      <div className={cn("text-muted-foreground py-10 text-center", className)}>
        <p>{commentsText.empty.noComments}</p>
        <p className="text-sm">{commentsText.empty.beFirst}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {visibleComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDeleted={(id) => setLocallyDeleted((prev) => new Set(prev).add(id))}
        />
      ))}
    </div>
  );
}
