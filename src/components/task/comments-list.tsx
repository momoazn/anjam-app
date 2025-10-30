import { useMemo, useState } from "react";

import { fa } from "@/constants/text";
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
        <p>{fa.comments.empty.noComments}</p>
        <p className="text-sm">{fa.comments.empty.beFirst}</p>
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
