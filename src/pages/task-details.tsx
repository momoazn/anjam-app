import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import {
  ArrowLeft,
  Clock,
  Loader2,
  MessageSquare,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageTransition } from "@/components/page-transition";
// Remove the UserAvatar import since it's no longer used
import { CommentComposer } from "@/components/task/comment-composer";
import { CommentsList } from "@/components/task/comments-list";
import { TimeComparison } from "@/components/task/time-comparison";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { useDeleteTask, useTask, useUpdateTask } from "@/hooks";
import { useComments } from "@/hooks/comments";
import {
  priorityColors,
  priorityIcons,
  taskStatusBadgeSolids,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import {
  formatTimeSpent,
  minutesToHoursAndMinutes,
  parseTimeInput,
} from "@/lib/time-utils";
import { formatUserName } from "@/lib/utils";
import { useAuthUser } from "@/store/auth-store";

const formatTaskDate = (dateString?: string | null) => {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "dd MMMM yyyy"));
};

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: task, isLoading: taskLoading } = useTask({
    id: id ?? "",
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useComments(
    id ?? "",
    { enabled: !!id },
  );

  const deleteTask = useDeleteTask({
    onSuccess: () => {
      toast.success(fa.tasks.delete.success);
      setShowDeleteDialog(false);
      navigate("/tasks");
    },
    onError: (error) => {
      toast.error(fa.tasks.delete.error.replace("{error}", error.message));
    },
  });

  // Time tracking state
  const [isEditingTime, setIsEditingTime] = useState(false);
  const currentTime = minutesToHoursAndMinutes(task?.time_spent_minutes ?? 0);
  const [hours, setHours] = useState(currentTime.hours);
  const [minutes, setMinutes] = useState(currentTime.minutes);

  // Update time inputs when task changes
  useEffect(() => {
    if (task) {
      const time = minutesToHoursAndMinutes(task.time_spent_minutes);
      setHours(time.hours);
      setMinutes(time.minutes);
    }
  }, [task]);

  // Check if user can edit time
  const canEditTime =
    authUser?.role === "admin" ||
    authUser?.role === "supervisor" ||
    (authUser?.id === task?.assignee && authUser?.role === "employee");

  // Mutation for updating time
  const { mutate: updateTime, isPending: isUpdatingTime } = useUpdateTask({
    onSuccess: () => {
      setIsEditingTime(false);
    },
  });

  const handleSaveTime = () => {
    if (!task) return;

    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;

    if (h < 0 || m < 0 || m >= 60) {
      toast.error(fa.tasks.details.timeTracking.invalidInput);
      return;
    }

    const totalMinutes = parseTimeInput(h, m);
    updateTime({
      id: task.id,
      updates: {
        time_spent_minutes: totalMinutes,
      },
    });
  };

  const handleCancelTimeEdit = () => {
    if (task) {
      const time = minutesToHoursAndMinutes(task.time_spent_minutes);
      setHours(time.hours);
      setMinutes(time.minutes);
    }
    setIsEditingTime(false);
  };

  if (taskLoading) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  if (!task) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">{fa.tasks.errors.notFound}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/tasks")}
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              بازگشت به لیست وظایف
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  const StatusIcon = taskStatusIcons[task.status];
  const PriorityIcon = priorityIcons[task.priority];

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/tasks")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Created</span>
              <span>{formatTaskDate(task.created)}</span>
              {task.expand?.creator && (
                <>
                  <span>•</span>
                  <span>by</span>
                  <span>
                    {formatUserName(
                      task.expand.creator.first_name,
                      task.expand.creator.last_name,
                      task.expand.creator.username,
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="default"
            className={`${taskStatusBadgeSolids[task.status]}`}
          >
            <StatusIcon className="mr-1 h-3 w-3" />
            {fa.tasks.status[task.status]}
          </Badge>
          <Badge
            variant="outline"
            className={`${priorityColors[task.priority]} border-current`}
          >
            <PriorityIcon className="mr-1 h-3 w-3" />
            {fa.tasks.priority[task.priority]}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/tasks/${id}/edit`)}
          >
            ویرایش
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteTask.isPending}
          >
            {deleteTask.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {deleteTask.isPending
              ? fa.tasks.details.buttons.deleting
              : fa.tasks.details.buttons.delete}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Task Meta */}
          <Card>
            <CardHeader>
              <CardTitle>جزئیات</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">مسئول:</span>{" "}
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
                    {fa.tasks.addTask.unassigned}
                  </span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">پروژه:</span>{" "}
                {task.expand?.project?.name || fa.tasks.details.unknownProject}
              </div>
              <div>
                <span className="text-muted-foreground">مهلت:</span>{" "}
                {formatTaskDate(task.deadline)}
              </div>
              <div>
                <span className="text-muted-foreground">شناسه نمایش:</span>{" "}
                {task.display_id || task.id}
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-5 w-5" />
                  <h3 className="font-medium">
                    {fa.tasks.details.timeTracking.title}
                  </h3>
                </div>
                {!isEditingTime && canEditTime && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingTime(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {fa.tasks.details.timeTracking.editTime}
                  </Button>
                )}
              </div>

              {isEditingTime ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium">
                        {fa.tasks.details.timeTracking.hours}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        disabled={isUpdatingTime}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium">
                        {fa.tasks.details.timeTracking.minutes}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        disabled={isUpdatingTime}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveTime}
                      disabled={isUpdatingTime}
                    >
                      {isUpdatingTime ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {fa.tasks.details.timeTracking.saveTime}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelTimeEdit}
                      disabled={isUpdatingTime}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {fa.tasks.details.timeTracking.cancelEdit}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-primary text-2xl font-semibold">
                    {formatTimeSpent(task.time_spent_minutes) ||
                      fa.tasks.details.timeTracking.noTimeTracked}
                  </p>
                  <TimeComparison
                    estimatedMinutes={
                      (task.estimated_hours || 0) * 60 +
                      (task.estimated_minutes || 0)
                    }
                    actualMinutes={task.time_spent_minutes}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Description */}
          {task.description && (
            <Card>
              <CardHeader>
                <CardTitle>توضیحات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>{fa.comments.title}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {digitsEnToFa(comments.length)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات سریع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">وضعیت:</span>
                <Badge
                  variant="default"
                  className={`${taskStatusBadgeSolids[task.status]}`}
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {fa.tasks.status[task.status]}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">اولویت:</span>
                <Badge
                  variant="outline"
                  className={`${priorityColors[task.priority]} border-current`}
                >
                  <PriorityIcon className="mr-1 h-3 w-3" />
                  {fa.tasks.priority[task.priority]}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">ایجاد شده:</span>
                <span>{formatTaskDate(task.created)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">بروزرسانی:</span>
                <span>{formatTaskDate(task.updated)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>عملیات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/tasks/${id}/edit`)}
              >
                <Pencil className="ml-2 h-4 w-4" />
                ویرایش وظیفه
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground w-full justify-start"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteTask.isPending}
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف وظیفه
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-lg font-bold">
              {fa.tasks.delete.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-right">
              {fa.tasks.delete.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
            <AlertDialogCancel
              className="order-2"
              disabled={deleteTask.isPending}
            >
              {fa.tasks.delete.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTask.mutate(task.id)}
              disabled={deleteTask.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 order-1"
            >
              {deleteTask.isPending ? (
                <Loader2 className="text-muted-foreground ml-2 h-4 w-4 animate-spin" />
              ) : null}
              {fa.tasks.delete.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
