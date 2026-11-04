import { digitsEnToFa } from "@persian-tools/persian-tools";
import { ChevronRight, Hash, Loader2, Pencil, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { TaskDetailsContent } from "@/components/task/details/task-details-content";
import { TaskDetailsSidebar } from "@/components/task/details/task-details-sidebar";
import { TaskDetailsSkeleton } from "@/components/task/details/task-details-skeleton";
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
import { tasks } from "@/constants";
import { useComments } from "@/hooks/comments";
import { useDeleteTask, useTask } from "@/hooks/tasks";
import { handleError } from "@/lib/error-handler";
import { canDeleteTask, canEditTask } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuthUser, useCurrentOrgRole } from "@/store/app-context-store";
import { useOpenModal } from "@/store/modal-store";

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const openModal = useOpenModal();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const pendingDeleteRef = useRef<number | null>(null);

  const { data: task, isLoading: taskLoading } = useTask({
    id: id ?? "",
    enabled: !!id,
  });

  const { data: commentsData = [], isLoading: commentsLoading } = useComments(
    id ?? "",
    { enabled: !!id },
  );

  const deleteTask = useDeleteTask();
  const role = useCurrentOrgRole();
  const user = useAuthUser();
  const canEdit = !!task && canEditTask(role, task, user?._id);
  const canDelete = !!task && canDeleteTask(role, task, user?._id);

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
    <PageTransition
      data-testid="task-details"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
      <PageHeader
        title={task.title}
        subtitle={
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-muted-foreground">
            <span className="font-mono">
              {digitsEnToFa(task.displayId || "TASK-ID")}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span>
              {tasks.details.createdBy}{" "}
              {task.creator?.displayName || tasks.details.system}
            </span>
          </div>
        }
        icon={Hash}
        eyebrow={undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate("/tasks")}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              {tasks.details.backToList}
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => openModal("edit-task", { taskId: id })}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                {tasks.details.editButton}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteTask.isPending}
                className="text-destructive hover:bg-destructive/10 gap-2"
              >
                <Trash className="h-4 w-4" />
                {tasks.details.buttons.delete}
              </Button>
            )}
          </div>
        }
      />

      <div className={cn("grid grid-cols-1 lg:grid-cols-3", "gap-4")}>
        <TaskDetailsContent
          task={task}
          comments={commentsData}
          commentsLoading={commentsLoading}
          onTaskRefresh={() => {}} // No-op for Convex real-time
        />

        <TaskDetailsSidebar
          task={task}
          onEdit={
            canEdit ? () => openModal("edit-task", { taskId: id }) : undefined
          }
          onDelete={canDelete ? () => setShowDeleteDialog(true) : undefined}
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
                if (!task?._id) return;

                if (pendingDeleteRef.current) {
                  window.clearTimeout(pendingDeleteRef.current);
                }

                pendingDeleteRef.current = window.setTimeout(async () => {
                  pendingDeleteRef.current = null;
                  try {
                    await deleteTask.mutate(task._id);
                    navigate("/tasks");
                  } catch (error) {
                    handleError(error);
                  }
                }, 100);
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
