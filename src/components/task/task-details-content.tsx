import {
  Clock,
  History,
  Loader2,
  MessageSquare,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { ActivityStream } from "@/components/audit/activity-stream";
import { CommentComposer } from "@/components/task/comment-composer";
import { CommentsList } from "@/components/task/comments-list";
import { TimeComparison } from "@/components/task/time-comparison";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auditLogs, comments as commentsText, tasks } from "@/constants";
import type { CommentWithUser } from "@/hooks/comments";
import type { TaskWithProject } from "@/lib/pocketbase";
import { formatTaskDate } from "@/lib/date-utils";
import { formatTimeSpent } from "@/lib/time-utils";
import { formatUserName } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
}: TaskDetailsContentProps) {
  return (
    <div className="space-y-6 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>{tasks.details.detailsCardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">
              {tasks.details.assigneeLabel}
            </span>{" "}
            {task.expand?.assignee ? (
              <span>
                {formatUserName(
                  task.expand.assignee.first_name,
                  task.expand.assignee.last_name,
                  task.expand.assignee.username,
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {tasks.addTask.unassigned}
              </span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">
              {tasks.details.projectLabel}
            </span>{" "}
            {task.expand?.project?.name || tasks.details.unknownProject}
          </div>
          <div>
            <span className="text-muted-foreground">
              {tasks.details.deadlineLabel}
            </span>{" "}
            {formatTaskDate(task.deadline)}
          </div>
          <div>
            <span className="text-muted-foreground">
              {tasks.details.displayIdLabel}
            </span>{" "}
            {task.display_id || task.id}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              <h3 className="font-medium">
                {tasks.details.timeTracking.title}
              </h3>
            </div>
            {!isEditingTime && canEditTime && (
              <Button size="sm" variant="ghost" onClick={onStartTimeEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                {tasks.details.timeTracking.editTime}
              </Button>
            )}
          </div>

          {isEditingTime ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">
                    {tasks.details.timeTracking.hours}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(event) =>
                      onHoursChange(Number(event.target.value))
                    }
                    disabled={isUpdatingTime}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">
                    {tasks.details.timeTracking.minutes}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(event) =>
                      onMinutesChange(Number(event.target.value))
                    }
                    disabled={isUpdatingTime}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={onSaveTime}
                  disabled={isUpdatingTime}
                >
                  {isUpdatingTime ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {tasks.details.timeTracking.saveTime}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancelTimeEdit}
                  disabled={isUpdatingTime}
                >
                  <X className="mr-2 h-4 w-4" />
                  {tasks.details.timeTracking.cancelEdit}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <p className="text-primary text-2xl font-semibold">
                {formatTimeSpent(task.time_spent_minutes) ||
                  tasks.details.timeTracking.noTimeTracked}
              </p>
              <TimeComparison
                estimatedMinutes={task.estimated_minutes || 0}
                actualMinutes={task.time_spent_minutes}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {task.description && (
        <Card>
          <CardHeader>
            <CardTitle>{tasks.details.descriptionCardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <Tabs defaultValue="comments" className="w-full">
            <TabsList>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {commentsText.title}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {digitsEnToFa(comments.length)}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {auditLogs.activityStream.title}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommentsList comments={comments} />
                    <CommentComposer taskId={task.id} />
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <ActivityStream resource="tasks" resourceId={task.id} />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
