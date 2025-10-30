import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { fa } from "@/constants/text";
import { CommentWithUser } from "@/hooks/comments";
import { useUpdateComment, useSoftDeleteComment } from "@/hooks/comments";
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
};

export function CommentItem({ comment }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || "");

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
    softDeleteComment.mutate({
      id: comment.id,
      updates: { deleted_at: new Date().toISOString() },
    });
  };

  if (isDeleted) {
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
            Comment deleted
          </p>
        </div>
      </div>
    );
  }

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
          {isAuthor && !isDeleted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">اقدامات نظر</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-3 w-3" />
                  ویرایش
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSoftDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  حذف
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
              placeholder="ویرایش نظر..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || updateComment.isPending}
              >
                {updateComment.isPending ? "در حال ذخیره..." : "ذخیره"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateComment.isPending}
              >
                انصراف
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>
    </div>
  );
}
