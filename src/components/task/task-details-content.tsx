import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconLoader2,
  IconMessages,
  IconQuote,
  IconTarget,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";

import { CommentComposer } from "@/components/task/comment-composer";
import { CommentsList } from "@/components/task/comments-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  comments as commentsText,
  shared,
  tasks,
} from "@/constants";
import type { CommentWithUser } from "@/hooks/comments";
import { formatTaskDate } from "@/lib/date-utils";
import { cn, formatUserName } from "@/lib/utils";
import {
  useCurrentOrgFeatures,
  useCurrentOrgMode,
} from "@/store/auth-store";
import { TaskWithDetails } from "@/types/tasks";

export type TaskDetailsContentProps = {
  task: TaskWithDetails;
  comments: CommentWithUser[];
  commentsLoading: boolean;
  onTaskRefresh?: () => void;
};

export function TaskDetailsContent({
  task,
  comments,
  commentsLoading,
  onTaskRefresh,
}: TaskDetailsContentProps) {
  const features = useCurrentOrgFeatures();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  void features;

  const [replyTarget, setReplyTarget] = useState<CommentWithUser | null>(null);

  // Computed ID for compatibility
  const taskId = task.id ?? task._id;

  const handleCommentAdded = () => {
    onTaskRefresh?.();
    setReplyTarget(null);
  };

  const project =
    typeof task.project === "object" ? task.project : task.expand?.project;
  const assignee =
    typeof task.assignee === "object" && task.assignee
      ? task.assignee
      : task.expand?.assignee;

  return (
    <div
      className={cn(
        "lg:col-span-2",
        isProductMode ? "space-y-6" : "space-y-12",
      )}
    >
      {/* Detail Grid */}
      {isProductMode ? (
        <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
          {[
            {
              label: tasks.details.assignee,
              value: assignee
                ? formatUserName(
                    assignee.firstName,
                    assignee.lastName,
                    assignee.username,
                  )
                : tasks.addTask.unassigned,
              icon: IconUser,
              muted: !assignee,
            },
            {
              label: shared.project,
              value: project?.name || tasks.details.unknownProject,
              icon: IconTarget,
            },
            {
              label: tasks.details.deadline,
              value: task.deadline
                ? digitsEnToFa(
                    formatTaskDate(new Date(task.deadline).toISOString()),
                  )
                : "—",
              icon: IconCalendar,
              muted: !task.deadline,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 last:border-b-0"
            >
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
                <item.icon className="size-4 opacity-70" />
                <span>{item.label}</span>
              </div>
              <div
                className={cn(
                  "text-right text-sm font-semibold",
                  item.muted && "text-muted-foreground/60",
                )}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: tasks.details.assignee,
              value: assignee ? (
                formatUserName(
                  assignee.firstName,
                  assignee.lastName,
                  assignee.username,
                )
              ) : (
                <span className="text-muted-foreground/40">
                  {tasks.addTask.unassigned}
                </span>
              ),
              icon: IconUser,
            },
            {
              label: shared.project,
              value: project?.name || tasks.details.unknownProject,
              icon: IconTarget,
            },
            {
              label: tasks.details.deadline,
              value: task.deadline ? (
                digitsEnToFa(
                  formatTaskDate(new Date(task.deadline).toISOString()),
                )
              ) : (
                <span className="opacity-20">—</span>
              ),
              icon: IconCalendar,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group bg-card hover:bg-muted/30 relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all"
            >
              <div className="relative z-10 flex h-full flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
                    {item.label}
                  </span>
                  <item.icon className="text-primary/40 group-hover:text-primary size-4 transition-colors" />
                </div>
                <div className="text-right text-sm font-bold">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {task.description && (
        <section className="relative">
          {isProductMode ? (
            <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold">
                <IconQuote className="size-4 opacity-70" />
                <span>{shared.description}</span>
              </div>
              <p className="text-foreground/80 whitespace-pre-wrap text-right text-sm leading-relaxed font-medium">
                {task.description}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-primary text-primary-foreground absolute -top-3 -right-3 z-10 flex size-10 items-center justify-center rounded-full shadow-lg">
                <IconQuote className="size-5" />
              </div>
              <div className="bg-card relative overflow-hidden rounded-xl border p-6 shadow-sm">
                <p className="text-foreground/80 relative z-10 text-right text-base leading-relaxed font-medium whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </>
          )}
        </section>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="comments" className="w-full" dir="rtl">
        <TabsList
          className={cn(
            "w-full justify-start gap-1",
            isProductMode
              ? "bg-muted/30 h-9 rounded-lg border border-border/40 p-0.5"
              : "bg-muted/50 h-12 rounded-xl p-1",
          )}
        >
          <TabsTrigger
            value="comments"
            className={cn(
              "data-[state=active]:bg-background h-full flex-1 rounded-lg text-xs font-bold transition-all data-[state=active]:shadow-sm",
              isProductMode && "px-3",
            )}
          >
            <IconMessages className="ms-1.5 size-4" />
            {commentsText.title}
            <span className="bg-primary/10 text-primary ms-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {digitsEnToFa(comments.length)}
            </span>
          </TabsTrigger>
        </TabsList>

        <div
          className={cn(
            "mt-4 overflow-hidden rounded-xl border border-border/40",
            isProductMode
              ? "bg-background/30 shadow-none"
              : "bg-card shadow-sm",
          )}
        >
          <div className={cn(isProductMode ? "p-4" : "p-6 md:p-8")}>
            <TabsContent value="comments" className="m-0 outline-none">
              <div className={cn("space-y-8", isProductMode && "space-y-5")}>
                {commentsLoading ? (
                  <div className="flex justify-center py-12 opacity-20">
                    <IconLoader2 className="h-10 w-10 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommentsList
                      comments={comments}
                      onReply={(comment) => setReplyTarget(comment)}
                    />
                    <div
                      className={cn("border-t pt-8", isProductMode && "pt-5")}
                    >
                      <CommentComposer
                        taskId={taskId}
                        replyTarget={replyTarget}
                        onCancelReply={() => setReplyTarget(null)}
                        onCommentAdded={handleCommentAdded}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
