import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { fa } from "@/constants/text";
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
  return digitsEnToFa(format(date, "dd MMMM yyyy - HH:mm"));
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
      <div className="bg-muted/30 flex gap-3 rounded-lg p-4">
        <div className="shrink-0">
          <UserAvatar user={comment.expand.user} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              {comment.user
                ? `${comment.expand.user.first_name} ${comment.expand.user.last_name}`.trim() ||
                  comment.expand.user.username
                : fa.tasks.details.unknownUser}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatCommentDate(comment.created)}
            </span>
          </div>
          <p className="text-muted-foreground text-sm italic">
            {fa.comments.item.deleted}
          </p>
        </div>
      </div>
    );
  }

  const wasEdited = comment.updated && comment.updated !== comment.created;

  return (
    <div className="hover:bg-muted/30 flex gap-3 rounded-lg p-4 transition-colors">
      <div className="shrink-0">
        <UserAvatar user={comment.expand.user} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.user
                ? `${comment.expand.user.first_name} ${comment.expand.user.last_name}`.trim() ||
                  comment.expand.user.username
                : fa.tasks.details.unknownUser}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatCommentDate(comment.created)}
            </span>
          </div>
          {isAuthor && !deleted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  aria-label={fa.comments.item.actions}
                  disabled={
                    updateComment.isPending || softDeleteComment.isPending
                  }
                >
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">{fa.comments.item.actions}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleEdit();
                  }}
                >
                  <Edit className="mr-2 h-3 w-3" />
                  {fa.comments.item.edit}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSoftDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                  disabled={softDeleteComment.isPending}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  {softDeleteComment.isPending
                    ? fa.comments.item.deleting
                    : fa.comments.item.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] resize-none"
              placeholder={fa.comments.item.editPlaceholder}
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
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || updateComment.isPending}
              >
                {updateComment.isPending
                  ? fa.comments.item.saving
                  : fa.comments.item.save}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateComment.isPending}
              >
                {fa.comments.item.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap" dir="auto">
            {comment.content?.trim() || "—"}
            {!deleted && wasEdited && (
              <span className="text-muted-foreground ml-2 text-[10px]">
                {fa.comments.item.edited}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
