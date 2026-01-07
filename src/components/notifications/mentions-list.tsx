import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconCheck, IconCircleCheck } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns-jalali";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { notifications as notificationsText } from "@/constants";
import { useDeleteNotification } from "@/hooks/notifications";
import { cn, stripHtml } from "@/lib/utils";

type MentionsListProps = {
  mentions: Array<{
    _id: string;
    createdAt: number;
    taskId?: string;
    task?: { title?: string; displayId?: string } | null;
    comment?: { content?: string } | null;
  }>;
  isLoading: boolean;
};

export function MentionsList({ mentions, isLoading }: MentionsListProps) {
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = async (mentionId: string) => {
    await deleteNotification.mutateAsync(mentionId);
  };

  return (
    <section
      className={cn(
        "mt-8 overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4 shadow-none space-y-4 text-right",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-foreground text-sm font-bold">
            {notificationsText.mentions.title}
          </p>
          <p className="text-muted-foreground text-xs">
            {notificationsText.mentions.description}
          </p>
        </div>
        <span className="text-sm font-bold">
          {digitsEnToFa(mentions.length)}
        </span>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center text-xs font-bold">
          {notificationsText.mentions.loading}
        </p>
      ) : mentions.length === 0 ? (
        <div className="text-muted-foreground text-center text-xs font-bold opacity-70">
          {notificationsText.mentions.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {mentions.map((mention) => {
            const taskName =
              mention.task?.title || mention.task?.displayId || "-";
            const rawSnippet = stripHtml(mention.comment?.content ?? "");
            const snippet =
              rawSnippet.length > 140
                ? `${rawSnippet.slice(0, 140)}...`
                : rawSnippet;
            const timeAgo = mention.createdAt
              ? formatDistanceToNow(new Date(mention.createdAt), {
                  addSuffix: true,
                })
              : "";

            return (
              <article
                key={mention._id}
                className="border-border/30 bg-muted/10 rounded-lg border p-4 text-right"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">
                      {notificationsText.mentions.byTask.replace(
                        "{task}",
                        taskName,
                      )}
                    </p>
                    <p className="text-muted-foreground text-[10px] font-bold">
                      {timeAgo ? digitsEnToFa(timeAgo) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-lg"
                      onClick={() => handleMarkAsRead(mention._id)}
                    >
                      <IconCheck className="size-4" />
                    </Button>
                    {mention.taskId && (
                      <Link
                        to={`/tasks/${mention.taskId}`}
                        className="text-primary text-xs font-bold"
                      >
                        {notificationsText.mentions.viewTask}
                      </Link>
                    )}
                  </div>
                </div>
                {snippet && (
                  <p className="text-muted-foreground mt-3 text-sm">
                    {snippet}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && mentions.length > 0 && (
        <div className="border-border/20 flex items-center justify-end gap-2 border-t pt-4">
          <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-bold">
            <IconCircleCheck className="size-3" />
            {notificationsText.actions.markAsRead}
          </div>
        </div>
      )}
    </section>
  );
}
