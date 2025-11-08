import { zodResolver } from "@hookform/resolvers/zod";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import { Clock, Loader2, MessageSquare, Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TaskFields } from "@/components/forms/task-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { fa } from "@/constants/text";
import { useComments } from "@/hooks/comments";
import { useDeleteTask } from "@/hooks/tasks";
import { useEntityUpdateMutation } from "@/hooks/use-entity-mutation";
import {
  TasksPriorityOptions,
  TasksResponse,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
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
import { useAuthUser } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "../user-avatar";
import { CommentComposer } from "./comment-composer";
import { CommentsList } from "./comments-list";

const taskFormSchema = z.object({
  title: z.string().min(1, { message: fa.tasks.addTask.issueTitle }),
  description: z.string(),
  assignee: z.string(),
  priority: z.nativeEnum(TasksPriorityOptions),
  status: z.nativeEnum(TasksStatusOptions),
  project: z.string().min(1).optional(),
  deadline: z.date().optional(),
});

type EditTaskDialogProps = {
  children: React.ReactNode;
  task: TasksResponse;
  onSuccess?: () => void;
};

export function EditTaskDialog({
  children,
  task,
  onSuccess,
}: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      assignee: task.assignee ?? fa.tasks.addTask.unassigned,
      priority: task.priority,
      status: task.status,
      project: task.project,
      deadline: task.deadline ? new Date(task.deadline) : undefined,
    },
  });

  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description,
      assignee: task.assignee ?? fa.tasks.addTask.unassigned,
      priority: task.priority,
      status: task.status,
      project: task.project,
      deadline: task.deadline ? new Date(task.deadline) : undefined,
    });
  }, [form, task]);

  const { mutate: updateTask, isPending } = useEntityUpdateMutation({
    collection: "tasks",
    successMessage: fa.tasks.edit.success,
    errorMessage: fa.tasks.edit.error,
    invalidateQueries: ["tasks"],
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });

  function onSubmit(values: z.infer<typeof taskFormSchema>) {
    updateTask({
      id: task.id,
      updates: {
        ...values,
        // Only include project if present (not in project context or changed)
        project: values.project ?? task.project,
        assignee:
          values.assignee !== fa.tasks.addTask.unassigned
            ? values.assignee
            : undefined,
        deadline: values.deadline?.toISOString(),
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">{fa.tasks.edit.title}</DialogTitle>
      <DialogContent className="sm:max-w-[800px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <TaskFields control={form.control} isInProject={true} />

            <div className="flex items-center justify-end gap-2 pt-0">
              <Button
                size="sm"
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                {fa.tasks.details.buttons.cancel}
              </Button>
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                ) : null}
                {isPending
                  ? fa.tasks.edit.buttons.saving
                  : fa.tasks.edit.buttons.save}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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

type TaskDetailsDialogProps = {
  children: React.ReactNode;
  task: TasksResponse & {
    expand?: {
      project?: { name?: string };
      assignee?: { first_name?: string; last_name?: string; username?: string };
      creator?: { first_name?: string; last_name?: string; username?: string };
    };
  };
  onEdit?: () => void;
};

export function TaskDetailsDialog({
  children,
  task,
  onEdit,
}: TaskDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: comments = [], isLoading: commentsLoading } = useComments(
    task.id,
    { enabled: open },
  );

  const deleteTask = useDeleteTask({
    onSuccess: () => {
      toast.success(fa.tasks.delete.success);
      setShowDeleteDialog(false);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(fa.tasks.delete.error.replace("{error}", error.message));
    },
  });

  // Time tracking state
  const authUser = useAuthUser();
  const [isEditingTime, setIsEditingTime] = useState(false);
  const currentTime = minutesToHoursAndMinutes(task.time_spent_minutes);
  const [hours, setHours] = useState(currentTime.hours);
  const [minutes, setMinutes] = useState(currentTime.minutes);

  // Update time inputs when task changes
  useEffect(() => {
    const time = minutesToHoursAndMinutes(task.time_spent_minutes);
    setHours(time.hours);
    setMinutes(time.minutes);
  }, [task.time_spent_minutes]);

  // Check if user can edit time
  const canEditTime =
    authUser?.role === "admin" ||
    authUser?.role === "supervisor" ||
    (authUser?.id === task.assignee && authUser?.role === "employee");

  // Mutation for updating time
  const { mutate: updateTime, isPending: isUpdatingTime } =
    useEntityUpdateMutation({
      collection: "tasks",
      successMessage: fa.tasks.details.timeTracking.updateSuccess,
      errorMessage: fa.tasks.details.timeTracking.updateError,
      invalidateQueries: ["tasks"],
      onSuccess: () => {
        setIsEditingTime(false);
      },
    });

  const handleSaveTime = () => {
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
    const time = minutesToHoursAndMinutes(task.time_spent_minutes);
    setHours(time.hours);
    setMinutes(time.minutes);
    setIsEditingTime(false);
  };

  const StatusIcon = taskStatusIcons[task.status];
  const PriorityIcon = priorityIcons[task.priority];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">{fa.tasks.details.title}</DialogTitle>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-6 sm:max-w-[960px]">
        <div className="space-y-6">
          {/* Task Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl leading-relaxed font-semibold">
                  {task.title}
                </h2>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span>Created</span>
                  <span>{formatTaskDate(task.created)}</span>
                  {task.expand?.creator && (
                    <>
                      <span>•</span>
                      <span>by</span>
                      <div className="flex items-center gap-2">
                        <UserAvatar user={task.expand.creator} />
                        <span>
                          {task.expand.creator.first_name &&
                          task.expand.creator.last_name
                            ? `${task.expand.creator.first_name} ${task.expand.creator.last_name}`.trim()
                            : task.expand.creator.username}
                        </span>
                      </div>
                    </>
                  )}
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
                  onClick={() => {
                    setOpen(false);
                    onEdit?.();
                  }}
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

            {/* Task Meta */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">مسئول:</span>{" "}
                {task.expand?.assignee ? (
                  <div className="inline-flex items-center gap-2">
                    <UserAvatar user={task.expand.assignee} />
                    <span>
                      {task.expand.assignee.first_name &&
                      task.expand.assignee.last_name
                        ? `${task.expand.assignee.first_name} ${task.expand.assignee.last_name}`.trim()
                        : task.expand.assignee.username}
                    </span>
                  </div>
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
            </div>

            {/* Time Tracking Section */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
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
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-primary">
                    {formatTimeSpent(task.time_spent_minutes) ||
                      fa.tasks.details.timeTracking.noTimeTracked}
                  </p>
                </div>
              )}
            </div>

            {/* Task Description */}
            {task.description && (
              <div className="space-y-2">
                <h3 className="font-medium">توضیحات</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-medium">{fa.comments.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {comments.length}
              </Badge>
            </div>

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
        </div>
      </DialogContent>
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
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
              ) : null}
              {fa.tasks.delete.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
