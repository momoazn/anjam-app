import { CommentWithUser } from "@/hooks/comments";
import { cn } from "@/lib/utils";
import { CommentItem } from "./comment-item";

type CommentsListProps = {
  comments: CommentWithUser[];
  className?: string;
};

export function CommentsList({ comments, className }: CommentsListProps) {
  if (comments.length === 0) {
    return (
      <div className={cn("text-muted-foreground py-10 text-center", className)}>
        <p>هنوز نظری ثبت نشده است.</p>
        <p className="text-sm">اولین نفری باشید که نظر می‌دهد!</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
