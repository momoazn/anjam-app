import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "@/hooks/comments";
import { useAuthUser } from "@/store/auth-store";

type CommentComposerProps = {
  taskId: string;
  onCommentAdded?: () => void;
};

export function CommentComposer({
  taskId,
  onCommentAdded,
}: CommentComposerProps) {
  const [content, setContent] = useState("");

  const currentUser = useAuthUser();
  const createComment = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !currentUser) return;

    createComment.mutate(
      {
        content: content.trim(),
        task: taskId,
        user: currentUser.id,
      },
      {
        onSuccess: () => {
          setContent("");
          onCommentAdded?.();
        },
      },
    );
  };

  const isDisabled = !currentUser || createComment.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              currentUser ? "نظر خود را بنویسید..." : "برای ارسال نظر وارد شوید"
            }
            className="min-h-[80px] resize-none"
            disabled={isDisabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <div className="shrink-0 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={isDisabled || !content.trim()}
            onClick={handleSubmit}
            className="h-10 px-3"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">ارسال نظر</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
