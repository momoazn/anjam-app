import { IconX } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { comments } from "@/constants";
import { useCreateComment } from "@/hooks/comments";
import type { CommentWithUser } from "@/hooks/comments";
import { useAuthUser } from "@/store/auth-store";

type CommentComposerProps = {
  taskId: string;
  replyTarget?: CommentWithUser | null;
  onCommentAdded?: () => void;
  onCancelReply?: () => void;
};

export function CommentComposer({
  taskId,
  replyTarget = null,
  onCommentAdded,
  onCancelReply,
}: CommentComposerProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<FileWithPreview[]>([]);
  const createComment = useCreateComment();
  const currentUser = useAuthUser();

  const trimmedContent = useMemo(() => content.trim(), [content]);
  const isDisabled = !currentUser || createComment.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || !trimmedContent) return;

    const formData = new FormData();
    formData.append("content", trimmedContent);
    formData.append("task", taskId);
    formData.append("user", currentUser.id);
    if (replyTarget) {
      formData.append("parent", replyTarget.id);
    }
    attachments.forEach((file) => {
      formData.append("attachments+", file);
    });

    createComment.mutate(
      { formData, task: taskId },
      {
        onSuccess: () => {
          setContent("");
          setAttachments([]);
          onCommentAdded?.();
          if (replyTarget) {
            onCancelReply?.();
          }
        },
      },
    );
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {replyTarget && (
        <div className="border-border/40 bg-muted/10 flex items-center justify-between rounded-lg border px-4 py-2 text-right text-[11px] font-black tracking-[0.3em] uppercase">
          <span>
            {comments.item.replyingTo}
            {replyTarget.expand?.user?.first_name ||
              replyTarget.expand?.user?.username}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            onClick={() => onCancelReply?.()}
            className="h-7 w-7 rounded-none border border-transparent"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            currentUser
              ? comments.composer.placeholder
              : comments.composer.placeholderDisabled
          }
          className="min-h-[100px] rounded-none text-right"
          disabled={isDisabled}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              handleSubmit(event);
            }
          }}
        />

        <FileUpload
          value={attachments}
          onChange={setAttachments}
          disabled={isDisabled}
          maxFiles={5}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          className="h-10 rounded-none px-4 text-[10px] font-black tracking-widest uppercase"
          disabled={isDisabled || !trimmedContent}
        >
          {comments.composer.send}
        </Button>
      </div>
    </form>
  );
}
