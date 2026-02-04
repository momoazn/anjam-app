import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconChecklist,
  IconLoader2,
  IconMessages,
  IconQuote,
  IconTarget,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";

import { CommentComposer } from "@/components/task/comments/comment-composer";
import { CommentsList } from "@/components/task/comments/comments-list";
import { Subtasks } from "@/components/task/subtasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { comments as commentsText, shared, tasks } from "@/constants";
import type { CommentWithUser } from "@/hooks/comments";
import { formatTaskDate } from "@/lib/date-utils";
import { cn, formatUserName } from "@/lib/utils";
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
  const [replyTarget, setReplyTarget] = useState<CommentWithUser | null>(null);

  // Computed ID for compatibility
  const taskId = task._id;

  const handleCommentAdded = () => {
    onTaskRefresh?.();
    setReplyTarget(null);
  };

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

  const getStringProp = (value: unknown, key: string): string | undefined =>
    isRecord(value) && typeof value[key] === "string" ? value[key] : undefined;

  const project =
    typeof task.project === "object" && task.project ? task.project : undefined;
  const assignee =
    typeof task.assignee === "object" && task.assignee
      ? task.assignee
      : undefined;

  const assigneeDisplayName = getStringProp(assignee, "displayName");
  const assigneeEmail = getStringProp(assignee, "email");
  const projectName = getStringProp(project, "name");
  const projectId = getStringProp(project, "_id");

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Detail Grid */}
      <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
        {[
          {
            label: tasks.details.assignee,
            value: assignee
              ? formatUserName(assigneeDisplayName, assigneeEmail)
              : tasks.addTask.unassigned,
            icon: IconUser,
            muted: !assignee,
          },
          {
            label: shared.project,
            value: projectName || tasks.details.unknownProject,
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

      {/* Description */}
      {task.description && (
        <section className="relative">
          <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold">
              <IconQuote className="size-4 opacity-70" />
              <span>{shared.description}</span>
            </div>
            <p className="text-foreground/80 whitespace-pre-wrap text-right text-sm leading-relaxed font-medium">
              {task.description}
            </p>
          </div>
        </section>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="comments" className="w-full" dir="rtl">
        <TabsList className="w-full justify-start gap-1 bg-muted/30 h-9 rounded-lg border border-border/40 p-0.5">
          <TabsTrigger
            value="comments"
            className="data-[state=active]:bg-background h-full flex-1 rounded-lg text-xs font-bold transition-all data-[state=active]:shadow-sm px-3"
          >
            <IconMessages className="ms-1.5 size-4" />
            {commentsText.title}
            <span className="bg-primary/10 text-primary ms-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {digitsEnToFa(comments.length)}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="subtasks"
            className="data-[state=active]:bg-background h-full flex-1 rounded-lg text-xs font-bold transition-all data-[state=active]:shadow-sm px-3"
          >
            <IconChecklist className="ms-1.5 size-4" />
            {tasks.details.subtasks.title}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 overflow-hidden rounded-xl border border-border/40 bg-background/30 shadow-none">
          <TabsContent value="comments" className="m-0 outline-none">
            <div className="space-y-5 p-4">
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
                  <div className="border-t pt-5">
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

          <TabsContent value="subtasks" className="m-0 outline-none">
            <div className="space-y-5 p-4">
              <Subtasks taskId={taskId} projectId={projectId} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
