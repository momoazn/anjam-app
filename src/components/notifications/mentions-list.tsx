import { formatDistanceToNow } from "date-fns-jalali";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconCheck, IconCircleCheck } from "@tabler/icons-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { notifications as notificationsText } from "@/constants";
import { stripHtml } from "@/lib/excel-export";
import type {
  CommentsResponse,
  MentionsResponse,
  ProjectsResponse,
  TasksResponse,
} from "@/lib/pocketbase-types";
import { pb } from "@/lib/pocketbase";
import { useQueryClient } from "@tanstack/react-query";

export type MentionWithExpand = MentionsResponse & {
  expand?: {
    comment?: CommentsResponse;
    task?: TasksResponse;
    project?: ProjectsResponse;
  };
};

type MentionsListProps = {
  mentions: MentionsResponse[];
  isLoading: boolean;
};

export function MentionsList({ mentions, isLoading }: MentionsListProps) {
  const queryClient = useQueryClient();

  const handleMarkAsRead = async (mentionId: string) => {
    await pb.collection("mentions").delete(mentionId);
    queryClient.invalidateQueries({ queryKey: ["mentions"] });
  };

  return (
    <section className="border-border/40 bg-card mt-10 space-y-4 border p-6 text-right">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase">
            {notificationsText.mentions.title}
          </p>
          <p className="text-muted-foreground text-xs">
            {notificationsText.mentions.description}
          </p>
        </div>
        <span className="text-[11px] font-black tracking-tight uppercase">
          {digitsEnToFa(mentions.length)}
        </span>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center text-xs font-black uppercase">
          {notificationsText.mentions.loading}
        </p>
      ) : mentions.length === 0 ? (
        <div className="text-muted-foreground text-center text-xs font-black uppercase opacity-70">
          {notificationsText.mentions.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {mentions.map((mention) => {
            const mentionWithExpand = mention as MentionWithExpand;
            const taskName =
              mentionWithExpand.expand?.task?.title ||
              mentionWithExpand.expand?.task?.display_id ||
              "-";
            const rawSnippet = stripHtml(
              mentionWithExpand.expand?.comment?.content ?? "",
            );
            const snippet =
              rawSnippet.length > 140
                ? `${rawSnippet.slice(0, 140)}...`
                : rawSnippet;
            const timeAgo = mention.created
              ? formatDistanceToNow(new Date(mention.created), {
                  addSuffix: true,
                })
              : "";

            return (
              <article
                key={mention.id}
                className="border-border/30 bg-muted/10 rounded-xl border p-4 text-right"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-black tracking-[0.3em] uppercase">
                      {notificationsText.mentions.byTask.replace(
                        "{task}",
                        taskName,
                      )}
                    </p>
                    <p className="text-muted-foreground text-[10px] font-black uppercase">
                      {timeAgo ? digitsEnToFa(timeAgo) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-none"
                      onClick={() => handleMarkAsRead(mention.id)}
                    >
                      <IconCheck className="size-4" />
                    </Button>
                    {mentionWithExpand.task && (
                      <Link
                        to={`/tasks/${mentionWithExpand.task}`}
                        className="text-primary text-[10px] font-black tracking-[0.3em] uppercase"
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
          <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase">
            <IconCircleCheck className="size-3" />
            {notificationsText.actions.markAsRead}
          </div>
        </div>
      )}
    </section>
  );
}
