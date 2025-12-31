/* eslint-disable react-hooks/set-state-in-effect */
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageTransition } from "@/components/page-transition";
import { TaskDetailsContent } from "@/components/task/task-details-content";
import { TaskDetailsHeader } from "@/components/task/task-details-header";
import { TaskDetailsSidebar } from "@/components/task/task-details-sidebar";
import { TaskDetailsSkeleton } from "@/components/task/task-details-skeleton";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { common, tasks } from "@/constants";
import { useDeleteTask, useTask, useUpdateTask } from "@/hooks";
import { useComments } from "@/hooks/comments";
import { handlePocketBaseError } from "@/lib/error-handler";
import { minutesToHoursAndMinutes, parseTimeInput } from "@/lib/time-utils";
import { useAuthUser } from "@/store/auth-store";

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const pendingDeleteRef = useRef<number | null>(null);

  const {
    data: task,
    isLoading: taskLoading,
    refetch: refetchTask,
  } = useTask({
    id: id ?? "",
    enabled: !!id,
  });

  const { data: commentsData = [], isLoading: commentsLoading } = useComments(
    id ?? "",
    { enabled: !!id },
  );

  const deleteTask = useDeleteTask({
    onSuccess: () => {
      toast.success(tasks.delete.success);
      setShowDeleteDialog(false);
      navigate("/tasks");
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  const [isEditingTime, setIsEditingTime] = useState(false);
  const currentTime = minutesToHoursAndMinutes(task?.time_spent_minutes ?? 0);
  const [hours, setHours] = useState(currentTime.hours);
  const [minutes, setMinutes] = useState(currentTime.minutes);

  useEffect(() => {
    if (task) {
      const time = minutesToHoursAndMinutes(task.time_spent_minutes);
      setHours(time.hours);
      setMinutes(time.minutes);
    }
  }, [task]);

  const canEditTime =
    authUser?.role === "admin" ||
    authUser?.role === "supervisor" ||
    (authUser?.id === task?.assignee && authUser?.role === "employee");

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
      toast.error(tasks.details.timeTracking.invalidInput);
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
    return <TaskDetailsSkeleton />;
  }

  if (!task) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">{tasks.errors.notFound}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/tasks")}
            >
              {tasks.details.backToList}
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <TaskDetailsHeader
        task={task}
        onBack={() => navigate("/tasks")}
        onEdit={() => navigate(`/tasks/${id}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
        isDeleting={deleteTask.isPending}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TaskDetailsContent
          task={task}
          comments={commentsData}
          commentsLoading={commentsLoading}
          isEditingTime={isEditingTime}
          canEditTime={canEditTime}
          hours={hours}
          minutes={minutes}
          isUpdatingTime={isUpdatingTime}
          onStartTimeEdit={() => setIsEditingTime(true)}
          onHoursChange={setHours}
          onMinutesChange={setMinutes}
          onSaveTime={handleSaveTime}
          onCancelTimeEdit={handleCancelTimeEdit}
          onTaskRefresh={refetchTask}
        />

        <TaskDetailsSidebar
          task={task}
          onEdit={() => navigate(`/tasks/${id}/edit`)}
          onDelete={() => setShowDeleteDialog(true)}
          isDeleting={deleteTask.isPending}
        />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-lg font-bold">
              {tasks.delete.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-right">
              {tasks.delete.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
            <AlertDialogCancel
              className="order-2"
              disabled={deleteTask.isPending}
            >
              {tasks.delete.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!task?.id) return;

                if (pendingDeleteRef.current) {
                  window.clearTimeout(pendingDeleteRef.current);
                }

                pendingDeleteRef.current = window.setTimeout(() => {
                  pendingDeleteRef.current = null;
                  deleteTask.mutate(task.id);
                }, 5000);

                toast(tasks.delete.queued, {
                  duration: 5000,
                  action: {
                    label: common.undo,
                    onClick: () => {
                      if (pendingDeleteRef.current) {
                        window.clearTimeout(pendingDeleteRef.current);
                        pendingDeleteRef.current = null;
                      }
                    },
                  },
                });

                setShowDeleteDialog(false);
              }}
              disabled={deleteTask.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 order-1"
            >
              {deleteTask.isPending ? (
                <Loader2 className="text-muted-foreground ms-2 h-4 w-4 animate-spin" />
              ) : null}
              {tasks.delete.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
