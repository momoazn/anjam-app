import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconClock,
  IconDeviceFloppy,
  IconHistory,
  IconLoader2,
  IconMessages,
  IconPencil,
  IconQuote,
  IconTarget,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import { ActivityStream } from "@/components/audit/activity-stream";
import { CommentComposer } from "@/components/task/comment-composer";
import { CommentsList } from "@/components/task/comments-list";
import { TaskSubtasksSection } from "@/components/task/task-subtasks-section";
import { TimeComparison } from "@/components/task/time-comparison";
import { TimeEntries } from "@/components/task/time-entries";
import { TimeEntryDialog } from "@/components/task/time-entry-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  auditLogs,
  comments as commentsText,
  settings,
  shared,
  tasks,
} from "@/constants";
import {
  DEFAULT_USER_PREFERENCES,
  useCreateTimeEntry,
  useUserPreferences,
} from "@/hooks";
import type { CommentWithUser } from "@/hooks/comments";
import { formatTaskDate } from "@/lib/date-utils";
import { handlePocketBaseError } from "@/lib/error-handler";
import { isFeatureEnabled } from "@/lib/mode";
import type { TaskWithProject } from "@/lib/pocketbase";
import { formatTimeSpent } from "@/lib/time-utils";
import { cn, formatUserName } from "@/lib/utils";
import {
  useAuthUser,
  useCurrentOrgFeatures,
  useCurrentOrgMode,
} from "@/store/auth-store";

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
  const features = useCurrentOrgFeatures();
  const mode = useCurrentOrgMode();
  const showTimeTracking = isFeatureEnabled(features, "timeTracking");
  // In product mode, activity stream is available but collapsed by default
  // This allows users to expand and view history if needed
  const isProductMode = mode === "product";
  const activityFeedAvailable = isProductMode || showActivityFeed;
  const [activityExpanded, setActivityExpanded] = useState(!isProductMode);

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
      toast.error(tasks.details.timeTracking.authRequired);
      return;
    }

    try {
      await timeEntryMutation.mutateAsync({
        task: task.id,
        user: authUser.id,
        minutes: payload.minutes,
        note: payload.note,
      });
      toast.success(tasks.details.timeTracking.saveSuccess);
      onTaskRefresh?.();
      setIsTimeEntryDialogOpen(false);
    } catch (error: unknown) {
      handlePocketBaseError(error as Error);
    }
  };

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
              value: task.expand?.assignee
                ? formatUserName(
                    task.expand.assignee.first_name,
                    task.expand.assignee.last_name,
                    task.expand.assignee.username,
                  )
                : tasks.addTask.unassigned,
              icon: IconUser,
              muted: !task.expand?.assignee,
            },
            {
              label: shared.project,
              value: task.expand?.project?.name || tasks.details.unknownProject,
              icon: IconTarget,
            },
            {
              label: tasks.details.deadline,
              value: task.deadline
                ? digitsEnToFa(formatTaskDate(task.deadline))
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
              value: task.expand?.assignee ? (
                formatUserName(
                  task.expand.assignee.first_name,
                  task.expand.assignee.last_name,
                  task.expand.assignee.username,
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
              value: task.expand?.project?.name || tasks.details.unknownProject,
              icon: IconTarget,
            },
            {
              label: tasks.details.deadline,
              value: task.deadline ? (
                digitsEnToFa(formatTaskDate(task.deadline))
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

      {/* Time Tracking - Only show if feature enabled */}
      {showTimeTracking && (
        <section className="bg-card relative overflow-hidden rounded-xl border shadow-sm">
          <div className="relative z-10 p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <IconClock className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {tasks.details.timeTracking.title}
                  </h3>
                  <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
                    {tasks.details.timeTracking.metrics}
                  </span>
                </div>
              </div>
              {!isEditingTime && canEditTime && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartTimeEdit}
                  className="h-9 rounded-lg px-4 text-xs font-bold transition-all"
                >
                  <IconPencil className="ms-1.5 size-3.5" />
                  {tasks.details.timeTracking.editTime}
                </Button>
              )}
            </div>

            {isEditingTime ? (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
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
                      className="bg-background focus:ring-primary/20 h-12 rounded-lg border text-right text-2xl font-bold tabular-nums"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
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
                      className="bg-background focus:ring-primary/20 h-12 rounded-lg border text-right text-2xl font-bold tabular-nums"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-6">
                  <Button
                    variant="ghost"
                    onClick={onCancelTimeEdit}
                    disabled={isUpdatingTime}
                    className="h-10 rounded-lg px-6 text-xs font-bold"
                  >
                    <IconX className="ms-1.5 size-4" />
                    {tasks.details.timeTracking.cancelEdit}
                  </Button>
                  <Button
                    onClick={onSaveTime}
                    disabled={isUpdatingTime}
                    className="h-10 rounded-lg px-8 text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    {isUpdatingTime ? (
                      <IconLoader2 className="me-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="ms-1.5 size-4" />
                    )}
                    {tasks.details.timeTracking.saveTime}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-baseline justify-between gap-8 md:flex-row md:items-center">
                <div className="text-right">
                  <div className="text-muted-foreground mb-1.5 text-[10px] font-bold tracking-tight">
                    {tasks.details.timeTracking.totalTimeSpent}
                  </div>
                  <p className="text-primary text-5xl font-bold tracking-tighter md:text-6xl">
                    {formatTimeSpent(task.time_spent_minutes) ||
                      digitsEnToFa("0h 0m")}
                  </p>
                </div>

                <div className="w-full max-w-md flex-1">
                  <div className="text-muted-foreground mb-3 text-right text-[10px] font-bold tracking-tight">
                    {tasks.details.timeTracking.efficiencyIndex}
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
      )}

      {/* Time Entries & Subtasks - Only show if time tracking enabled */}
      {showTimeTracking && (
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex flex-col text-right">
                <h3 className="text-lg font-bold tracking-tight">
                  {tasks.details.timeEntries.title}
                </h3>
                <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
                  {tasks.details.timeEntries.entriesLabel}
                </span>
              </div>
              <Button
                onClick={() => setIsTimeEntryDialogOpen(true)}
                variant="outline"
                className="h-9 rounded-lg px-4 text-xs font-bold transition-all"
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
      )}

      {/* Subtasks - Always show regardless of mode */}
      <TaskSubtasksSection task={task} />

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
          {activityFeedAvailable && (
            <TabsTrigger
              value="history"
              className={cn(
                "data-[state=active]:bg-background h-full flex-1 rounded-lg text-xs font-bold transition-all data-[state=active]:shadow-sm",
                isProductMode && "px-3",
              )}
              onClick={() => setActivityExpanded(true)}
            >
              <IconHistory className="ms-1.5 size-4" />
              {auditLogs.activityStream.title}
              {isProductMode && !activityExpanded && (
                <span className="bg-muted text-muted-foreground ms-2 rounded px-1.5 py-0.5 text-[10px]">
                  {auditLogs.activityStream.collapsed}
                </span>
              )}
            </TabsTrigger>
          )}
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
                      projectId={task.project}
                      onReply={(comment) => setReplyTarget(comment)}
                    />
                    <div
                      className={cn("border-t pt-8", isProductMode && "pt-5")}
                    >
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
              {activityFeedAvailable ? (
                activityExpanded ? (
                  <ActivityStream resource="tasks" resourceId={task.id} />
                ) : (
                  <div
                    className="text-muted-foreground cursor-pointer py-12 text-center text-xs font-bold tracking-tight opacity-50 transition-opacity hover:opacity-80"
                    dir="rtl"
                    onClick={() => setActivityExpanded(true)}
                  >
                    {auditLogs.activityStream.clickToLoad}
                  </div>
                )
              ) : (
                <div
                  className="text-muted-foreground py-12 text-center text-xs font-bold tracking-tight opacity-50"
                  dir="rtl"
                >
                  {settings.preferences.activityDisabled}
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Time Entry Dialog - Only show if time tracking enabled */}
      {showTimeTracking && (
        <TimeEntryDialog
          open={isTimeEntryDialogOpen}
          onOpenChange={setIsTimeEntryDialogOpen}
          currentMinutes={task.time_spent_minutes ?? 0}
          estimatedMinutes={task.estimated_minutes}
          onSave={handleTimeEntrySave}
          taskTitle={task.title}
        />
      )}
    </div>
  );
}
