import {
  IconClock,
  IconHistory,
  IconLoader2,
  IconMessages,
  IconPencil,
  IconDeviceFloppy,
  IconX,
  IconTerminal,
  IconUser,
  IconTarget,
  IconCalendar,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import { ActivityStream } from "@/components/audit/activity-stream";
import { CommentComposer } from "@/components/task/comment-composer";
import { CommentsList } from "@/components/task/comments-list";
import { TimeComparison } from "@/components/task/time-comparison";
import { TaskSubtasksSection } from "@/components/task/task-subtasks-section";
import { TimeEntries } from "@/components/task/time-entries";
import { TimeEntryDialog } from "@/components/task/time-entry-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  auditLogs,
  comments as commentsText,
  settings,
  tasks,
} from "@/constants";
import type { CommentWithUser } from "@/hooks/comments";
import type { TaskWithProject } from "@/lib/pocketbase";
import { formatTaskDate } from "@/lib/date-utils";
import { formatTimeSpent } from "@/lib/time-utils";
import { formatUserName } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { handlePocketBaseError } from "@/lib/error-handler";
import { useAuthUser } from "@/store/auth-store";
import {
  useCreateTimeEntry,
  useUserPreferences,
  DEFAULT_USER_PREFERENCES,
} from "@/hooks";

export type TaskDetailsContentProps = {
  task: TaskWithProject;
  comments: CommentWithUser[];
  commentsLoading: boolean;
  isEditingTime: boolean;
  canEditTime: boolean;
  hours: number;
  minutes: number;
  isUpdatingTime: boolean;
  onStartTimeEdit: () => void;
  onHoursChange: (value: number) => void;
  onMinutesChange: (value: number) => void;
  onSaveTime: () => void;
  onCancelTimeEdit: () => void;
  onTaskRefresh?: () => void;
};

export function TaskDetailsContent({
  task,
  comments,
  commentsLoading,
  isEditingTime,
  canEditTime,
  hours,
  minutes,
  isUpdatingTime,
  onStartTimeEdit,
  onHoursChange,
  onMinutesChange,
  onSaveTime,
  onCancelTimeEdit,
  onTaskRefresh,
}: TaskDetailsContentProps) {
  const [isTimeEntryDialogOpen, setIsTimeEntryDialogOpen] = useState(false);
  const authUser = useAuthUser();
  const { data: userPreferences } = useUserPreferences();
  const userPreferencesData: typeof DEFAULT_USER_PREFERENCES = {
    ...DEFAULT_USER_PREFERENCES,
    ...(userPreferences?.preferences as
      | typeof DEFAULT_USER_PREFERENCES
      | undefined),
  };

  const showActivityFeed = userPreferencesData.ui.showActivityFeed;

  const timeEntryMutation = useCreateTimeEntry();
  const [replyTarget, setReplyTarget] = useState<CommentWithUser | null>(null);

  const handleCommentAdded = () => {
    onTaskRefresh?.();
    setReplyTarget(null);
  };

  const handleTimeEntrySave = async (payload: {
    minutes: number;
    note?: string;
  }) => {
    if (!authUser?.id) {
      toast.error("برای ثبت زمان باید وارد شوید");
      return;
    }

    try {
      await timeEntryMutation.mutateAsync({
        task: task.id,
        user: authUser.id,
        minutes: payload.minutes,
        note: payload.note,
      });
      toast.success("زمان با موفقیت ثبت شد");
      onTaskRefresh?.();
      setIsTimeEntryDialogOpen(false);
    } catch (error: unknown) {
      handlePocketBaseError(error as Error);
    }
  };

  return (
    <div className="space-y-10 lg:col-span-2">
      {/* Registry Metadata Module */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
            01_Registry_Metadata
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>
        <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border sm:grid-cols-2">
          <div className="bg-card border-border/10 flex h-24 flex-col justify-between border-s p-6">
            <div className="flex items-center justify-end gap-2 opacity-40">
              <span className="text-[8px] font-black tracking-widest uppercase">
                Assignee_ID
              </span>
              <IconUser className="size-3" />
            </div>
            <div className="text-right text-sm font-black tracking-tight uppercase">
              {task.expand?.assignee ? (
                formatUserName(
                  task.expand.assignee.first_name,
                  task.expand.assignee.last_name,
                  task.expand.assignee.username,
                )
              ) : (
                <span className="text-muted-foreground/40">
                  {tasks.addTask.unassigned}
                </span>
              )}
            </div>
          </div>

          <div className="bg-card flex h-24 flex-col justify-between p-6">
            <div className="flex items-center justify-end gap-2 opacity-40">
              <span className="text-[8px] font-black tracking-widest uppercase">
                Project_Node
              </span>
              <IconTarget className="size-3" />
            </div>
            <div className="truncate text-right text-sm font-black tracking-tight uppercase">
              {task.expand?.project?.name || tasks.details.unknownProject}
            </div>
          </div>

          <div className="bg-card border-border/10 flex h-24 flex-col justify-between border-s p-6">
            <div className="flex items-center justify-end gap-2 opacity-40">
              <span className="text-[8px] font-black tracking-widest uppercase">
                Temporal_Goal
              </span>
              <IconCalendar className="size-3" />
            </div>
            <div className="text-right text-sm font-black tabular-nums">
              {task.deadline ? (
                digitsEnToFa(formatTaskDate(task.deadline))
              ) : (
                <span className="opacity-20">—</span>
              )}
            </div>
          </div>

          <div className="bg-card flex h-24 flex-col justify-between p-6">
            <div className="flex items-center justify-end gap-2 opacity-40">
              <span className="text-[8px] font-black tracking-widest uppercase">
                Internal_Serial
              </span>
              <IconTerminal className="size-3" />
            </div>
            <div className="text-right font-mono text-xs font-black tracking-widest uppercase opacity-60">
              {task.display_id || task.id}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col text-right">
                <span className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase">
                  {tasks.details.timeEntries.title}
                </span>
                <span className="text-muted-foreground text-[11px] font-black tracking-tight uppercase">
                  {tasks.details.timeEntries.entriesLabel}
                </span>
              </div>
              <Button
                onClick={() => setIsTimeEntryDialogOpen(true)}
                className="border-border/40 h-9 rounded-none border text-[10px] font-black tracking-[0.3em] uppercase"
                disabled={timeEntryMutation.isPending}
              >
                {tasks.details.timeEntries.logButton}
              </Button>
            </div>

            <TimeEntries
              taskId={task.id}
              taskTitle={task.title}
              estimatedMinutes={task.estimated_minutes}
            />
          </div>
        </div>
      </section>

      {/* Telemetry Log (Time Tracking) */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
            02_Telemetry_Log
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="bg-muted/5 border-border/40 border p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconClock className="text-primary size-5" />
              <h3 className="text-sm font-black tracking-widest uppercase">
                {tasks.details.timeTracking.title}
              </h3>
            </div>
            {!isEditingTime && canEditTime && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartTimeEdit}
                className="border-border/40 hover:bg-primary/10 hover:text-primary h-9 rounded-none border text-[9px] font-black tracking-widest uppercase transition-all"
              >
                <IconPencil className="ms-2 size-3.5" />
                {tasks.details.timeTracking.editTime}
              </Button>
            )}
          </div>

          {isEditingTime ? (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
              <div className="bg-border/40 border-border/40 grid grid-cols-2 gap-px overflow-hidden border">
                <div className="bg-card border-border/10 space-y-2 border-s p-4 text-right">
                  <span className="text-muted-foreground/40 text-[8px] font-black tracking-[0.3em] uppercase">
                    {tasks.details.timeTracking.hours}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(event) =>
                      onHoursChange(Number(event.target.value))
                    }
                    disabled={isUpdatingTime}
                    className="bg-muted/10 h-10 rounded-none border-none text-right text-lg font-black tabular-nums focus:ring-0"
                  />
                </div>
                <div className="bg-card space-y-2 p-4 text-right">
                  <span className="text-muted-foreground/40 text-[8px] font-black tracking-[0.3em] uppercase">
                    {tasks.details.timeTracking.minutes}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(event) =>
                      onMinutesChange(Number(event.target.value))
                    }
                    disabled={isUpdatingTime}
                    className="bg-muted/10 h-10 rounded-none border-none text-right text-lg font-black tabular-nums focus:ring-0"
                  />
                </div>
              </div>

              <div className="border-border/10 flex items-center justify-end gap-3 border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={onCancelTimeEdit}
                  disabled={isUpdatingTime}
                  className="text-muted-foreground/60 h-10 rounded-none text-[9px] font-black tracking-widest uppercase"
                >
                  <IconX className="ms-2 size-3.5" />
                  {tasks.details.timeTracking.cancelEdit}
                </Button>
                <Button
                  onClick={onSaveTime}
                  disabled={isUpdatingTime}
                  className="h-10 rounded-none px-6 text-[10px] font-black tracking-widest uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95 dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]"
                >
                  {isUpdatingTime ? (
                    <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="ms-2 size-4" />
                  )}
                  {tasks.details.timeTracking.saveTime}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-baseline justify-between gap-6 md:flex-row md:items-center">
              <div className="text-right">
                <div className="text-muted-foreground/40 mb-1 text-[10px] font-black tracking-[0.3em] uppercase">
                  Elapsed_Resource
                </div>
                <p className="text-primary text-5xl font-black tracking-tighter">
                  {formatTimeSpent(task.time_spent_minutes) ||
                    digitsEnToFa("0h 0m")}
                </p>
              </div>

              <div className="w-full max-w-sm flex-1">
                <div className="text-muted-foreground/40 mb-3 text-right text-[10px] font-black tracking-[0.3em] uppercase">
                  Burn_Rate_Comparison
                </div>
                <TimeComparison
                  estimatedMinutes={task.estimated_minutes || 0}
                  actualMinutes={task.time_spent_minutes}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <TaskSubtasksSection task={task} />

      {/* Functional Context (Tabs) */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
            03_Functional_Context
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Tabs defaultValue="comments" className="w-full" dir="rtl">
          <TabsList className="bg-border/40 border-border/40 h-14 w-full justify-start gap-px overflow-hidden rounded-none border p-0">
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-card data-[state=active]:text-primary h-full flex-1 rounded-none text-[11px] font-black tracking-widest uppercase transition-none"
            >
              <IconMessages className="ms-2 size-4" />
              {commentsText.title}
              <span className="bg-muted/20 me-2 px-1.5 py-0.5 text-[9px] font-black tabular-nums">
                {digitsEnToFa(comments.length)}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-card data-[state=active]:text-primary h-full flex-1 rounded-none text-[11px] font-black tracking-widest uppercase transition-none"
            >
              <IconHistory className="ms-2 size-4" />
              {auditLogs.activityStream.title}
            </TabsTrigger>
          </TabsList>

          <div className="border-border/40 bg-muted/5 mt-6 border p-8">
            <TabsContent value="comments" className="m-0 outline-none">
              <div className="space-y-10">
                {commentsLoading ? (
                  <div className="flex justify-center py-12 opacity-20">
                    <IconLoader2 className="h-10 w-10 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommentsList
                      comments={comments}
                      projectId={task.project}
                      onReply={(comment) => setReplyTarget(comment)}
                    />
                    <div className="border-border/20 border-t pt-8">
                      <CommentComposer
                        taskId={task.id}
                        projectId={task.project}
                        replyTarget={replyTarget}
                        onCancelReply={() => setReplyTarget(null)}
                        onCommentAdded={handleCommentAdded}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="history" className="m-0 outline-none">
              {showActivityFeed ? (
                <ActivityStream resource="tasks" resourceId={task.id} />
              ) : (
                <div
                  className="text-muted-foreground/40 py-12 text-center text-xs font-black uppercase opacity-30 grayscale"
                  dir="rtl"
                >
                  {settings.preferences.activityDisabled}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </section>
      <TimeEntryDialog
        open={isTimeEntryDialogOpen}
        onOpenChange={setIsTimeEntryDialogOpen}
        currentMinutes={task.time_spent_minutes ?? 0}
        estimatedMinutes={task.estimated_minutes}
        onSave={handleTimeEntrySave}
        taskTitle={task.title}
      />
    </div>
  );
}
