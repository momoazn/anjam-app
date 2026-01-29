import { useMemo, useState } from "react";

import { comments as commentsText } from "@/constants";
import { CommentWithUser } from "@/hooks/comments";
import { cn } from "@/lib/utils";

import { CommentItem } from "./comment-item";

type CommentsListProps = {
  comments: CommentWithUser[];
  className?: string;
  onReply?: (comment: CommentWithUser) => void;
};

const toTimestamp = (value?: number) => value ?? 0;

export function CommentsList({
  comments,
  className,
  onReply,
}: CommentsListProps) {
  const [locallyDeleted, setLocallyDeleted] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(
    () => new Set(),
  );

  const visibleComments = useMemo(() => {
    const filtered = comments.filter((c) => !locallyDeleted.has(c._id));
    return [...filtered].sort(
      (a, b) => toTimestamp(a._creationTime) - toTimestamp(b._creationTime),
    );
  }, [comments, locallyDeleted]);

  const replyMap = useMemo(() => {
    const map = new Map<string, CommentWithUser[]>();
    visibleComments.forEach((comment) => {
      if (!comment.parentCommentId) return;
      const list = map.get(comment.parentCommentId) ?? [];
      list.push(comment);
      map.set(comment.parentCommentId, list);
    });
    map.forEach((list) =>
      list.sort(
        (a, b) => toTimestamp(a._creationTime) - toTimestamp(b._creationTime),
      ),
    );
    return map;
  }, [visibleComments]);

  const topLevelComments = useMemo(
    () => visibleComments.filter((comment) => !comment.parentCommentId),
    [visibleComments],
  );

  const renderThread = (comment: CommentWithUser, depth = 0) => {
    const replies = replyMap.get(comment._id) ?? [];
    const isCollapsed = collapsedThreads.has(comment._id);

    return (
      <div key={comment._id} className="space-y-2">
        <CommentItem
          comment={comment}
          depth={depth}
          onDeleted={(id) => setLocallyDeleted((prev) => new Set(prev).add(id))}
          onReply={onReply}
          replyCount={replies.length}
          isCollapsed={isCollapsed}
          onToggleThread={() =>
            setCollapsedThreads((prev) => {
              const next = new Set(prev);
              if (next.has(comment._id)) {
                next.delete(comment._id);
              } else {
                next.add(comment._id);
              }
              return next;
            })
          }
        />
        {!isCollapsed && replies.map((reply) => renderThread(reply, depth + 1))}
      </div>
    );
  };

  if (topLevelComments.length === 0) {
    return (
      <div className={cn("text-muted-foreground py-10 text-center", className)}>
        <p>{commentsText.empty.noComments}</p>
        <p className="text-sm">{commentsText.empty.beFirst}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {topLevelComments.map((comment) => renderThread(comment))}
    </div>
  );
}
