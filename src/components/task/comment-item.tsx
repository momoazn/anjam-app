import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import {
  IconPencil,
  IconDotsVertical,
  IconTrash,
  IconClock,
  IconCheck,
  IconX,
  IconLoader2,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { comments as commentsConst, tasks } from "@/constants";
import {
  CommentWithUser,
  useSoftDeleteComment,
  useUpdateComment,
} from "@/hooks/comments";
import { useAuthUser } from "@/store/auth-store";
import { UserAvatar } from "../user-avatar";

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "dd MMMM yyyy — HH:mm"));
};

type CommentItemProps = {
  comment: CommentWithUser;
  onDeleted?: (id: string) => void;
};

export function CommentItem({ comment, onDeleted }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || "");
  const [locallyDeleted, setLocallyDeleted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentUser = useAuthUser();
  const isAuthor = currentUser?.id === comment.expand.user?.id;
  const isDeleted = !!comment.deleted_at;

  const updateComment = useUpdateComment();
  const softDeleteComment = useSoftDeleteComment();

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content || "");
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== comment.content) {
      updateComment.mutate(
        {
          id: comment.id,
          updates: { content: editContent.trim() },
        },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        },
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content || "");
  };

  const handleSoftDelete = () => {
    if (softDeleteComment.isPending) return;
    setLocallyDeleted(true);
    softDeleteComment.mutate(comment.id, {
      onSuccess: () => onDeleted?.(comment.id),
      onError: () => setLocallyDeleted(false),
    });
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

  if (deleted) {
    return (
      <div className="bg-muted/10 border-border/20 flex gap-4 border p-4 text-right opacity-30 grayscale">
        <UserAvatar
          user={comment.expand.user}
          className="border-border/40 size-8 rounded-none border"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-end gap-3">
            <span className="text-[10px] leading-none font-black tracking-widest uppercase">
              {comment.user
                ? `${comment.expand.user.first_name} ${comment.expand.user.last_name}`.trim() ||
                  comment.expand.user.username
                : tasks.details.unknownUser}
            </span>
          </div>
          <p className="text-xs font-bold tracking-widest uppercase italic">
            {commentsConst.item.deleted}
          </p>
        </div>
      </div>
    );
  }

  const wasEdited = comment.updated && comment.updated !== comment.created;

  return (
    <div className="group border-border/10 bg-card hover:bg-muted/30 relative flex items-stretch border-b transition-all duration-200">
      {/* Visual Identity Strip */}
      <div className="bg-muted/5 border-border/5 flex w-12 shrink-0 flex-col items-center border-l pt-4">
        <UserAvatar
          user={comment.expand.user}
          className="border-border/20 size-8 rounded-none border shadow-sm"
        />
      </div>

      {/* Content Engine */}
      <div className="flex-1 space-y-3 p-4 pb-6 text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAuthor && !deleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:border-border/40 hover:bg-muted h-7 w-7 rounded-none border border-transparent"
                    disabled={
                      updateComment.isPending || softDeleteComment.isPending
                    }
                  >
                    <IconDotsVertical className="size-3.5 opacity-40 group-hover:opacity-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-foreground bg-card rounded-none border-2"
                >
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleEdit();
                    }}
                    className="rounded-none p-3 text-[9px] font-black tracking-widest uppercase"
                  >
                    <IconPencil className="ml-2 size-3.5 opacity-40" />
                    {commentsConst.item.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSoftDelete();
                    }}
                    className="rounded-none p-3 text-[9px] font-black tracking-widest text-rose-500 uppercase focus:text-rose-500"
                    disabled={softDeleteComment.isPending}
                  >
                    <IconTrash className="ml-2 size-3.5 opacity-40" />
                    {softDeleteComment.isPending
                      ? commentsConst.item.deleting
                      : commentsConst.item.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-foreground text-[10px] leading-none font-black tracking-tight uppercase">
                {comment.user
                  ? `${comment.expand.user.first_name} ${comment.expand.user.last_name}`.trim() ||
                    comment.expand.user.username
                  : tasks.details.unknownUser}
              </span>
              <div className="mt-1 flex items-center gap-1.5 opacity-40">
                <span className="font-mono text-[8px] font-black tabular-nums">
                  {formatCommentDate(comment.created)}
                </span>
                <IconClock className="size-2.5" />
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
            <div className="relative">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border-border/40 bg-muted/5 focus:border-primary/40 min-h-[100px] rounded-none text-right leading-relaxed font-medium focus:ring-0"
                placeholder={commentsConst.item.editPlaceholder}
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                disabled={updateComment.isPending}
              />
              <div className="bg-primary/40 absolute top-0 right-0 h-0.5 w-8" />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={updateComment.isPending}
                className="text-muted-foreground/60 h-9 rounded-none text-[9px] font-black tracking-widest uppercase"
              >
                <IconX className="ml-2 size-3.5" />
                {commentsConst.item.cancel}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || updateComment.isPending}
                className="h-9 rounded-none px-6 text-[9px] font-black tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
              >
                {updateComment.isPending ? (
                  <IconLoader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconCheck className="ml-2 size-3.5" />
                )}
                {updateComment.isPending
                  ? commentsConst.item.saving
                  : commentsConst.item.save}
              </Button>
            </div>
          </div>
        ) : (
          <div className="group/content relative">
            <div
              className="text-sm leading-relaxed font-medium whitespace-pre-wrap opacity-90"
              dir="auto"
            >
              {comment.content?.trim() || "—"}
            </div>
            {!deleted && wasEdited && (
              <div className="mt-2 flex items-center justify-end gap-1 opacity-20 transition-opacity group-hover/content:opacity-40">
                <IconPencil className="size-2.5" />
                <span className="text-[8px] font-black tracking-widest uppercase">
                  {commentsConst.item.edited}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Selection Indicator */}
      <div className="bg-primary absolute right-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
    </div>
  );
}
