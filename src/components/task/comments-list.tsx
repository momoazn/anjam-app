import { useMemo, useState } from "react";

import { comments as commentsText } from "@/constants";
import { CommentWithUser } from "@/hooks/comments";
import { useProjectMembers } from "@/hooks/project-members";
import { cn } from "@/lib/utils";
import { CommentItem } from "./comment-item";

type CommentsListProps = {
  comments: CommentWithUser[];
  projectId: string;
  className?: string;
  onReply?: (comment: CommentWithUser) => void;
};

const toTimestamp = (value?: string) => (value ? new Date(value).getTime() : 0);

export function CommentsList({
  comments,
  projectId,
  className,
  onReply,
}: CommentsListProps) {
  const [locallyDeleted, setLocallyDeleted] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(
    () => new Set(),
  );

  const { data: projectMembers } = useProjectMembers(projectId, {
    enabled: Boolean(projectId),
  });

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    projectMembers?.forEach((member) => {
      const user = member.expand?.user;
      if (!user) return;
      const displayName =
        `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
        user.username;
      map.set(user.id, displayName);
    });
    return map;
  }, [projectMembers]);

  const resolveUserName = (id: string) => memberNameMap.get(id) ?? id;

  const visibleComments = useMemo(() => {
    const filtered = comments.filter((c) => !locallyDeleted.has(c.id));
    return [...filtered].sort(
      (a, b) => toTimestamp(a.created) - toTimestamp(b.created),
    );
  }, [comments, locallyDeleted]);

  const replyMap = useMemo(() => {
    const map = new Map<string, CommentWithUser[]>();
    visibleComments.forEach((comment) => {
      if (!comment.parent) return;
      const list = map.get(comment.parent) ?? [];
      list.push(comment);
      map.set(comment.parent, list);
    });
    map.forEach((list) =>
      list.sort((a, b) => toTimestamp(a.created) - toTimestamp(b.created)),
    );
    return map;
  }, [visibleComments]);

  const topLevelComments = useMemo(
    () => visibleComments.filter((comment) => !comment.parent),
    [visibleComments],
  );

  const renderThread = (comment: CommentWithUser, depth = 0) => {
    const replies = replyMap.get(comment.id) ?? [];
    const isCollapsed = collapsedThreads.has(comment.id);

    return (
      <div key={comment.id} className="space-y-2">
        <CommentItem
          comment={comment}
          depth={depth}
          onDeleted={(id) => setLocallyDeleted((prev) => new Set(prev).add(id))}
          onReply={onReply}
          resolveUserName={resolveUserName}
          replyCount={replies.length}
          isCollapsed={isCollapsed}
          onToggleThread={() =>
            setCollapsedThreads((prev) => {
              const next = new Set(prev);
              if (next.has(comment.id)) {
                next.delete(comment.id);
              } else {
                next.add(comment.id);
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
