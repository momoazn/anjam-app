import { IconX } from "@tabler/icons-react";
import { useMemo, useRef, useState } from "react";

import { MentionAutocomplete } from "@/components/comments/mention-autocomplete";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { comments } from "@/constants";
import { useCreateComment } from "@/hooks/comments";
import type { CommentWithUser } from "@/hooks/comments";
import { useOrganizationMembers } from "@/hooks/organization-members";
import { formatUserName } from "@/lib/utils";
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
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionCursor, setMentionCursor] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const createComment = useCreateComment();
  const currentUser = useAuthUser();
  const { data: orgMembers } = useOrganizationMembers();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedContent = useMemo(() => content.trim(), [content]);
  const isDisabled = !currentUser || createComment.isPending;

  const mentionOptions = useMemo(() => {
    if (!orgMembers) return [];
    const normalized = mentionQuery.toLowerCase();
    return orgMembers
      .map((member) => member.expand?.user)
      .filter((user): user is NonNullable<typeof user> => Boolean(user))
      .filter((user) => {
        if (!normalized) return true;
        const fullName = formatUserName(
          user.first_name,
          user.last_name,
          user.username,
        ).toLowerCase();
        return (
          user.username.toLowerCase().includes(normalized) ||
          fullName.includes(normalized)
        );
      })
      .map((user) => ({
        id: user._id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
      }));
  }, [orgMembers, mentionQuery]);

  const isMentionOpen = mentionStart !== null && mentionOptions.length > 0;

  const updateMentionState = (value: string, cursor: number) => {
    const textBefore = value.slice(0, cursor);
    const match = /(?:^|\s)@([\w.-]*)$/.exec(textBefore);
    if (!match) {
      setMentionStart(null);
      setMentionQuery("");
      return;
    }
    const query = match[1] ?? "";
    const startIndex = textBefore.lastIndexOf("@");
    setMentionStart(startIndex);
    setMentionQuery(query);
    setSelectedIndex(0);
  };

  const handleMentionSelect = (index: number) => {
    const option = mentionOptions[index];
    if (!option || mentionStart === null) return;
    const before = content.slice(0, mentionStart);
    const after = content.slice(mentionCursor);
    const mentionText = `@${option.username} `;
    const nextValue = `${before}${mentionText}${after}`;
    setContent(nextValue);
    setMentionStart(null);
    setMentionQuery("");
    requestAnimationFrame(() => {
      const nextCursor = before.length + mentionText.length;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

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
            {replyTarget.expand?.user?.first_name ||
              replyTarget.expand?.user?.username}
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
            setMentionCursor(cursor);
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
                setMentionStart(null);
                setMentionQuery("");
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

        {/* File uploads are out of scope for v1 (Convex migration). */}
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
