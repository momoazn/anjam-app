import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCheck,
  IconDots,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { UserAvatar } from "@/components/user-avatar";
import { comments as commentsConst, tasks } from "@/constants";
import type { CommentWithUser } from "@/hooks/comments";
import { useSoftDeleteComment, useUpdateComment } from "@/hooks/comments";
import { useCommentReactions } from "@/hooks/use-comment-reactions";
import { useToast } from "@/hooks/use-toast";
import { formatTaskDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useAuthUser, useCurrentOrgRole } from "@/store/app-context-store";

type CommentItemProps = {
  comment: CommentWithUser;
  onDeleted?: (commentId: string) => void;
  onToggleThread?: (commentId: string) => void;
  onReply?: (comment: CommentWithUser) => void;
  replyCount?: number;
  isCollapsed?: boolean;
  depth?: number;
};

const editFormSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

type EditFormValues = z.infer<typeof editFormSchema>;

function CommentAuthor({
  user,
}: {
  user?: {
    displayName?: string;
    email?: string;
  } | null;
}) {
  if (!user) {
    return (
      <span className="text-xs leading-none font-semibold">
        {tasks.details.unknownUser}
      </span>
    );
  }
  const name = user.displayName || user.email;
  return <span className="text-xs font-semibold">{name}</span>;
}

function CommentActionsMenu({
  isAuthor,
  canDelete,
  onEdit,
  onDelete,
}: {
  isAuthor: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!isAuthor && !canDelete) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6 rounded-full">
          <IconDots className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAuthor && (
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onEdit}
          >
            <IconEdit className="size-3" />
            <span className="text-xs font-bold">{commentsConst.item.edit}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="flex items-center gap-2 text-rose-500"
          onClick={onDelete}
        >
          <IconTrash className="size-3" />
          <span className="text-xs font-bold">{commentsConst.item.delete}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommentReactions({
  reactionConfig,
  reactionMap,
  toggleReaction,
  currentUser,
}: {
  reactionConfig: Record<string, { emoji: string }>;
  reactionMap: Record<string, string[]>;
  toggleReaction: (key: string) => void;
  currentUser: { _id?: string } | null;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Object.entries(reactionConfig).map(([key, config]) => {
        const users = reactionMap[key] || [];
        const hasReacted = users.includes(currentUser?._id || "");
        return (
          <button
            key={key}
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-1.5 py-0.5 text-[10px] font-bold transition-colors",
              hasReacted
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground",
            )}
            onClick={() => toggleReaction(key)}
          >
            {config.emoji} {users.length > 0 && users.length}
          </button>
        );
      })}
    </div>
  );
}

function CommentActionButtons({
  comment,
  replyCount,
  isCollapsed,
  onToggleThread,
  onReply,
  commentId,
}: {
  comment: CommentWithUser;
  replyCount: number;
  isCollapsed: boolean;
  onToggleThread?: (commentId: string) => void;
  onReply?: (comment: CommentWithUser) => void;
  commentId: string;
}) {
  if (replyCount === 0) {
    return (
      <button
        type="button"
        className="text-muted-foreground hover:text-primary text-[10px] font-bold transition-colors"
        onClick={() => onReply?.(comment)}
      >
        {commentsConst.item.reply}
      </button>
    );
  }
  return (
    <>
      <button
        type="button"
        className="text-muted-foreground hover:text-primary text-[10px] font-bold transition-colors"
        onClick={() => onToggleThread?.(commentId)}
      >
        {isCollapsed ? commentsConst.item.show : commentsConst.item.hide} (
        {replyCount})
      </button>
      <button
        type="button"
        className="text-muted-foreground hover:text-primary text-[10px] font-bold transition-colors"
        onClick={() => onReply?.(comment)}
      >
        {commentsConst.item.reply}
      </button>
    </>
  );
}

function DeletedCommentContent() {
  return (
    <p className="text-xs font-bold tracking-tight italic">
      {commentsConst.item.deleted}
    </p>
  );
}

function CommentEditForm({
  content,
  onSave,
  onCancel,
}: {
  content: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: { content },
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, []);

  return (
    <div className="space-y-2 pt-2">
      <Form {...form}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <textarea
                  {...field}
                  ref={textareaRef}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-primary w-full resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  placeholder={commentsConst.item.editPlaceholder}
                  rows={3}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg px-2 text-xs font-bold"
          onClick={onCancel}
        >
          <IconX className="mr-1.5 size-3" />
          {commentsConst.item.cancel}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-7 rounded-lg px-2 text-xs font-bold"
          onClick={onSave}
        >
          <IconCheck className="mr-1.5 size-3" />
          {commentsConst.item.save}
        </Button>
      </div>
    </div>
  );
}

export function CommentItem({
  comment,
  onDeleted,
  onToggleThread,
  onReply,
  replyCount = 0,
  isCollapsed = false,
  depth = 0,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || "");
  const [locallyDeleted, setLocallyDeleted] = useState(false);

  const currentUser = useAuthUser();
  const isAuthor = currentUser?._id === comment.expand.user?._id;
  const canModerate = useCurrentOrgRole() === "owner";
  const isDeleted = !!comment.deletedAt;

  const updateComment = useUpdateComment();
  const softDeleteComment = useSoftDeleteComment();
  const { toast } = useToast();

  const { reactionConfig, reactionMap, toggleReaction } = useCommentReactions(
    comment._id,
    comment.reactions,
  );

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content || "");
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent.trim() !== comment.content) {
      try {
        await updateComment.mutate({
          id: comment._id,
          updates: { content: editContent.trim() },
        });
        setIsEditing(false);
      } catch {
        toast({
          title: "Error",
          description: "Failed to update comment",
          variant: "destructive",
        });
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content || "");
  };

  const handleSoftDelete = async () => {
    if (softDeleteComment.isPending) return;
    setLocallyDeleted(true);
    try {
      await softDeleteComment.mutate(comment._id);
      onDeleted?.(comment._id);
    } catch {
      setLocallyDeleted(false);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const deleted = isDeleted || locallyDeleted;
  const indentStyle =
    typeof depth === "number" && depth > 0
      ? { marginInlineStart: depth * 18 }
      : undefined;

  if (deleted) {
    return (
      <div style={indentStyle}>
        <div className="bg-muted/10 border-border/20 flex gap-4 rounded-2xl border p-4 text-right opacity-30 grayscale">
          <UserAvatar
            user={comment.expand.user}
            className="border-border/40 size-8 rounded-full border"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-end gap-3">
              <CommentAuthor user={comment.expand.user} />
            </div>
            <DeletedCommentContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={indentStyle} className="group">
      <div className="flex gap-3" data-comment={comment._id}>
        <UserAvatar
          user={comment.expand.user}
          className="border-border/40 mt-2 size-8 rounded-full border"
        />
        <div className="flex-1 space-y-1.5">
          <div className="bg-muted/30 border-border/60 flex flex-col gap-1 rounded-2xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CommentAuthor user={comment.expand.user} />
                <span className="text-muted-foreground text-[11px]">
                  {formatTaskDate(
                    new Date(comment._creationTime).toISOString(),
                  )}
                </span>
              </div>
              <CommentActionsMenu
                isAuthor={isAuthor}
                canDelete={isAuthor || canModerate}
                onEdit={handleEdit}
                onDelete={handleSoftDelete}
              />
            </div>

            {isEditing ? (
              <CommentEditForm
                content={editContent}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {comment.content}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-3 px-1">
              <CommentReactions
                reactionConfig={reactionConfig}
                reactionMap={reactionMap}
                toggleReaction={toggleReaction}
                currentUser={currentUser}
              />
              <CommentActionButtons
                comment={comment}
                replyCount={replyCount}
                isCollapsed={isCollapsed}
                onToggleThread={onToggleThread}
                onReply={onReply}
                commentId={comment._id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
