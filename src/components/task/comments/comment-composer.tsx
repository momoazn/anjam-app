import { IconX } from "@tabler/icons-react";
import { useMemo } from "react";

import { MentionAutocomplete } from "@/components/comments/mention-autocomplete";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { comments } from "@/constants";
import { useCreateComment } from "@/hooks/comments";
import type { CommentWithUser } from "@/hooks/comments";
import { useCommentMentions } from "@/hooks/use-comment-mentions";

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
  const {
    content,
    setContent,
    selectedIndex,
    setSelectedIndex,
    currentUser,
    textareaRef,
    mentionOptions,
    isMentionOpen,
    updateMentionState,
    handleMentionSelect,
  } = useCommentMentions();
  const createComment = useCreateComment();

  const trimmedContent = useMemo(() => content.trim(), [content]);
  const isDisabled = !currentUser || createComment.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || !trimmedContent) return;

    createComment.mutate({
      taskId,
      content: trimmedContent,
      parentCommentId: replyTarget?._id,
    });

    setContent("");
    onCommentAdded?.();
    if (replyTarget) {
      onCancelReply?.();
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {replyTarget && (
        <div className="bg-muted/30 border-border/40 flex items-center justify-between rounded-xl border px-4 py-2 text-right text-[11px] font-bold tracking-tight">
          <span>
            {comments.item.replyingTo}
            {replyTarget.expand?.user?.displayName ||
              replyTarget.expand?.user?.email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            onClick={() => onCancelReply?.()}
            className="h-7 w-7 rounded-lg border border-transparent"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            const nextValue = event.target.value;
            const cursor = event.target.selectionStart ?? nextValue.length;
            setContent(nextValue);
            updateMentionState(nextValue, cursor);
          }}
          placeholder={
            currentUser
              ? comments.composer.placeholder
              : comments.composer.placeholderDisabled
          }
          className="min-h-[100px] rounded-xl text-right"
          disabled={isDisabled}
          onKeyDown={(event) => {
            if (isMentionOpen) {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelectedIndex((prev) =>
                  Math.min(prev + 1, mentionOptions.length - 1),
                );
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
                return;
              }
              if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault();
                handleMentionSelect(selectedIndex);
                return;
              }
              if (event.key === "Escape") {
                event.preventDefault();
                return;
              }
            }
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              handleSubmit(event);
            }
          }}
        />

        <MentionAutocomplete
          items={mentionOptions}
          selectedIndex={selectedIndex}
          onSelect={(item) => {
            const index = mentionOptions.findIndex((i) => i.id === item.id);
            handleMentionSelect(index);
          }}
          onHover={(index) => setSelectedIndex(index)}
          visible={isMentionOpen}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          className="h-10 rounded-xl px-6 text-[11px] font-bold tracking-tight"
          disabled={isDisabled || !trimmedContent}
        >
          {comments.composer.send}
        </Button>
      </div>
    </form>
  );
}
