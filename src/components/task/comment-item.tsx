import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatTaskDate } from "@/lib/date-utils";
import { tasks, comments as commentsConst } from "@/constants";
import type { CommentWithUser } from "@/hooks/comments";
import { useAuthUser } from "@/store/auth-store";
import { useUpdateComment, useSoftDeleteComment } from "@/hooks/comments";
import { UserAvatar } from "../user-avatar";
import { useToast } from "@/hooks/use-toast";

import { IconDots, IconEdit, IconTrash, IconX, IconCheck } from "@tabler/icons-react";

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

const reactionConfig = {
  "+1": { emoji: "👍", label: "+1" },
  "-1": { emoji: "👎", label: "-1" },
  laugh: { emoji: "😄", label: "Laugh" },
  heart: { emoji: "❤️", label: "Heart" },
  rocket: { emoji: "🚀", label: "Rocket" },
  eyes: { emoji: "👀", label: "Eyes" },
};

type ReactionMap = Record<string, string[]>;

function parseReactions(reactions: any): ReactionMap {
  if (!reactions) return {};
  if (typeof reactions === "string") {
    try {
      reactions = JSON.parse(reactions);
    } catch {
      return {};
    }
  }
  if (!reactions || typeof reactions !== "object") return {};
  const result: ReactionMap = {};
  for (const [key, value] of Object.entries(reactions)) {
    if (Array.isArray(value)) {
      result[key] = value.filter((v) => typeof v === "string");
    }
  }
  return result;
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentUser = useAuthUser();
  const isAuthor = currentUser?._id === comment.expand.user?._id;
  const isDeleted = !!comment.deleted_at;

  const updateComment = useUpdateComment();
  const softDeleteComment = useSoftDeleteComment();
  const { toast } = useToast();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: { content: comment.content || "" },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content || "");
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent.trim() !== comment.content) {
      try {
        await updateComment.mutate({
          id: comment.id,
          updates: { content: editContent.trim() },
        });
        setIsEditing(false);
      } catch (error) {
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
      await softDeleteComment.mutate(comment.id);
      onDeleted?.(comment.id);
    } catch {
      setLocallyDeleted(false);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const deleted = isDeleted || locallyDeleted;
  const indentStyle =
    typeof depth === "number" && depth > 0
      ? { marginInlineStart: depth * 18 }
      : undefined;

  const reactionMap = parseReactions(comment.reactions);

  const toggleReaction = async (key: string) => {
    if (!currentUser) return;

    const existing = reactionMap[key] ?? [];
    const hasReacted = existing.includes(currentUser._id || "");
    const updated: ReactionMap = { ...reactionMap };

    if (hasReacted) {
      updated[key] = existing.filter((id) => id !== (currentUser._id || ""));
      if (updated[key].length === 0) {
        delete updated[key];
      }
    } else {
      updated[key] = [...existing, currentUser._id || ""];
    }

    try {
      await updateComment.mutate({
        id: comment.id,
        updates: { reactions: updated },
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  };

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
              <span className="text-[10px] leading-none font-bold tracking-tight">
                {comment.user && comment.expand.user
                  ? `${comment.expand.user.firstName || comment.expand.user.first_name || ""} ${comment.expand.user.lastName || comment.expand.user.last_name || ""}`.trim() ||
                    comment.expand.user.username
                  : tasks.details.unknownUser}
              </span>
            </div>
            <p className="text-xs font-bold tracking-tight italic">
              {commentsConst.item.deleted}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={indentStyle} className="group">
      <div className="flex gap-3" data-comment={comment.id}>
        <UserAvatar
          user={comment.expand.user}
          className="border-border/40 mt-2 size-8 rounded-full border"
        />

        <div className="flex-1 space-y-1.5">
          <div className="bg-muted/30 border-border flex flex-col rounded-2xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-tight">
                  {comment.user && comment.expand.user
                    ? `${comment.expand.user.firstName || comment.expand.user.first_name || ""} ${comment.expand.user.lastName || comment.expand.user.last_name || ""}`.trim() ||
                      comment.expand.user.username
                    : tasks.details.unknownUser}
                </span>
                <span className="text-muted-foreground text-[9px] font-medium">
                  {formatTaskDate(comment.created)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 rounded-full"
                      >
                        <IconDots className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={handleEdit}
                      >
                        <IconEdit className="size-3" />
                        <span className="text-xs font-bold">
                          {commentsConst.item.edit}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-rose-500"
                        onClick={handleSoftDelete}
                      >
                        <IconTrash className="size-3" />
                        <span className="text-xs font-bold">
                          {commentsConst.item.delete}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {isEditing ? (
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
                            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-primary w-full resize-none rounded-xl border px-3 py-2 text-xs font-bold tracking-tight focus:outline-none focus:ring-1"
                            placeholder={commentsConst.item.editPlaceholder}
                            rows={3}
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              setEditContent(e.target.value);
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
                    onClick={handleCancelEdit}
                  >
                    <IconX className="mr-1.5 size-3" />
                    {commentsConst.item.cancel}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 rounded-lg px-2 text-xs font-bold"
                    onClick={handleSaveEdit}
                  >
                    <IconCheck className="mr-1.5 size-3" />
                    {commentsConst.item.save}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-xs font-bold leading-relaxed tracking-tight">
                {comment.content}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-3 px-1">
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

              {replyCount > 0 && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-primary text-[10px] font-bold transition-colors"
                  onClick={() => onToggleThread?.(comment.id)}
                >
                  {isCollapsed ? commentsConst.item.show : commentsConst.item.hide} (
                  {replyCount})
                </button>
              )}

              <button
                type="button"
                className="text-muted-foreground hover:text-primary text-[10px] font-bold transition-colors"
                onClick={() => onReply?.(comment)}
              >
                {commentsConst.item.reply}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
