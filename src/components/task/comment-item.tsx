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
  IconCornerUpLeft,
  IconPaperclip,
  IconPhoto,
  IconFileTypePdf,
  IconFile,
  IconDownload,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { pb } from "@/lib/pocketbase";

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
import { cn } from "@/lib/utils";
import { UserAvatar } from "../user-avatar";
import { handlePocketBaseError } from "@/lib/error-handler";

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "dd MMMM yyyy — HH:mm"));
};

type ReactionMap = Record<string, string[]>;

const reactionOptions = [
  { key: "thumbs_up", label: "👍" },
  { key: "thumbs_down", label: "👎" },
  { key: "heart", label: "❤️" },
  { key: "party", label: "🎉" },
  { key: "smile", label: "😄" },
  { key: "think", label: "🤔" },
];

const parseReactions = (value: unknown): ReactionMap => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as ReactionMap;
    } catch {
      return {};
    }
  }
  return value as ReactionMap;
};

const imageExtensions = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
]);

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return IconFile;
  if (ext === "pdf") return IconFileTypePdf;
  if (imageExtensions.has(ext)) return IconPhoto;
  return IconFile;
};

type CommentItemProps = {
  comment: CommentWithUser;
  onDeleted?: (id: string) => void;
  onReply?: (comment: CommentWithUser) => void;
  onToggleThread?: () => void;
  replyCount?: number;
  isCollapsed?: boolean;
  resolveUserName?: (id: string) => string;
  depth?: number;
};

export function CommentItem({
  comment,
  onDeleted,
  onReply,
  onToggleThread,
  replyCount = 0,
  isCollapsed = false,
  resolveUserName,
  depth = 0,
}: CommentItemProps) {
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
  const indentStyle =
    typeof depth === "number" && depth > 0
      ? { marginInlineStart: depth * 18 }
      : undefined;

  const reactionMap = parseReactions(comment.reactions);
  const attachments = comment.attachments ?? [];
  const hasAttachments = attachments.length > 0;

  const toggleReaction = (key: string) => {
    if (!currentUser) return;

    const existing = reactionMap[key] ?? [];
    const hasReacted = existing.includes(currentUser.id);
    const updated: ReactionMap = { ...reactionMap };

    if (hasReacted) {
      updated[key] = existing.filter((id) => id !== currentUser.id);
      if (updated[key].length === 0) {
        delete updated[key];
      }
    } else {
      updated[key] = [...existing, currentUser.id];
    }

    updateComment.mutate(
      {
        id: comment.id,
        updates: { reactions: updated },
      },
      {
        onError: (error) => handlePocketBaseError(error as Error),
      },
    );
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
                {comment.user
                  ? `${comment.expand.user.first_name} ${comment.expand.user.last_name}`.trim() ||
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

  const wasEdited = comment.updated && comment.updated !== comment.created;

  return (
    <div style={indentStyle}>
      <div className="group border-border/10 bg-card hover:bg-muted/30 relative flex items-stretch border-b transition-all duration-200">
        {/* Visual Identity Strip */}
        <div className="bg-muted/5 border-border/5 flex w-12 shrink-0 flex-col items-center border-s pt-4">
          <UserAvatar
            user={comment.expand.user}
            className="border-border/20 size-8 rounded-full border shadow-sm"
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
                      className="hover:border-border/40 hover:bg-muted h-7 w-7 rounded-lg border border-transparent"
                      disabled={
                        updateComment.isPending || softDeleteComment.isPending
                      }
                    >
                      <IconDotsVertical className="size-3.5 opacity-40 group-hover:opacity-100" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-border bg-background rounded-xl border shadow-lg"
                  >
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        handleEdit();
                      }}
                      className="rounded-lg p-3 text-[10px] font-bold tracking-tight"
                    >
                      <IconPencil className="ms-2 size-3.5 opacity-40" />
                      {commentsConst.item.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        handleSoftDelete();
                      }}
                      className="rounded-lg p-3 text-[10px] font-bold tracking-tight text-rose-500 focus:text-rose-500"
                      disabled={softDeleteComment.isPending}
                    >
                      <IconTrash className="ms-2 size-3.5 opacity-40" />
                      {softDeleteComment.isPending
                        ? commentsConst.item.deleting
                        : commentsConst.item.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {currentUser && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="border-border/40 rounded-lg text-[10px] font-bold tracking-tight"
                  onClick={() => onReply(comment)}
                >
                  <IconCornerUpLeft className="ms-2 size-3" />
                  {commentsConst.item.reply}
                </Button>
              )}
              {replyCount > 0 && onToggleThread && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="border-border/40 rounded-lg text-[10px] font-bold tracking-tight"
                  onClick={onToggleThread}
                >
                  {isCollapsed ? "نمایش" : "پنهان‌سازی"} (
                  {digitsEnToFa(replyCount)})
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-foreground text-[10px] leading-none font-bold tracking-tight">
                  {comment.user
                    ? `${comment.expand.user.first_name} ${comment.expand.user.last_name}`.trim() ||
                      comment.expand.user.username
                    : tasks.details.unknownUser}
                </span>
                <div className="mt-1 flex items-center gap-1.5 opacity-40">
                  <span className="font-mono text-[8px] font-bold tabular-nums">
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
                  className="border-border/40 bg-muted/5 focus:border-primary/40 min-h-[100px] rounded-xl text-right leading-relaxed font-medium focus:ring-0"
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
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={updateComment.isPending}
                  className="text-muted-foreground/60 h-9 rounded-xl text-[10px] font-bold tracking-tight"
                >
                  <IconX className="ms-2 size-3.5" />
                  {commentsConst.item.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || updateComment.isPending}
                  className="h-9 rounded-xl px-6 text-[10px] font-bold tracking-tight shadow-sm transition-all active:scale-95"
                >
                  {updateComment.isPending ? (
                    <IconLoader2 className="me-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <IconCheck className="ms-2 size-3.5" />
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
                  <span className="text-[8px] font-bold tracking-tight">
                    {commentsConst.item.edited}
                  </span>
                </div>
              )}
            </div>
          )}
          {!isEditing && (
            <div className="border-border/10 space-y-3 border-t pt-3 text-right">
              {hasAttachments && (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-[10px] font-bold tracking-tight">
                    {commentsConst.item.attachments}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {attachments.map((filename) => {
                      const fileUrl = pb.files.getUrl(comment, filename);
                      const FileIcon = getFileIcon(filename);
                      const isImage = imageExtensions.has(
                        filename.split(".").pop()?.toLowerCase() ?? "",
                      );
                      return (
                        <div
                          key={filename}
                          className="border-border/30 bg-muted/5 flex items-center justify-between gap-3 rounded-xl border p-3"
                        >
                          <div className="flex items-center gap-3">
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt={filename}
                                className="border-border/30 h-10 w-10 rounded-lg border object-cover"
                              />
                            ) : (
                              <div className="border-border/30 bg-card flex h-10 w-10 items-center justify-center rounded-lg border">
                                <FileIcon className="size-5" />
                              </div>
                            )}
                            <div className="text-xs font-bold tracking-tight">
                              {filename}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="border-border/30 hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[10px] font-bold tracking-tight transition-colors"
                            >
                              <IconDownload className="size-3" />
                              Download
                            </a>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="border-border/30 hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[10px] font-bold tracking-tight transition-colors"
                            >
                              <IconPaperclip className="size-3" />
                              View
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {reactionOptions.map((reaction) => {
                  const count = reactionMap[reaction.key]?.length ?? 0;
                  const hasReacted =
                    currentUser &&
                    reactionMap[reaction.key]?.includes(currentUser.id);
                  const reactionNames =
                    reactionMap[reaction.key]
                      ?.map((id) => resolveUserName?.(id) ?? id)
                      .join("، ") ?? "";
                  return (
                    <Button
                      key={reaction.key}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "border-border/30 rounded-xl border px-3 py-1 text-[11px] font-bold tracking-tight transition-colors",
                        hasReacted
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground/80 hover:bg-muted/20",
                      )}
                      onClick={() => toggleReaction(reaction.key)}
                      disabled={!currentUser || updateComment.isPending}
                      title={reactionNames}
                    >
                      <span className="text-lg">{reaction.label}</span>
                      {count > 0 && (
                        <span className="ms-1 text-[10px] font-bold tabular-nums">
                          {digitsEnToFa(String(count))}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
