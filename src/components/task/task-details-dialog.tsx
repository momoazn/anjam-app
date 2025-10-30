import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { fa } from "@/constants/text";
import {
  TasksPriorityOptions,
  TasksResponse,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { useEntityUpdateMutation } from "@/hooks/use-entity-mutation";
import { useComments } from "@/hooks/comments";
import { TaskFields } from "@/components/forms/task-fields";
import { CommentsList } from "./comments-list";
import { CommentComposer } from "./comment-composer";
import { Loader2, MessageSquare } from "lucide-react";
import { priorityColors, priorityIcons, taskStatusIcons, taskStatusBadgeSolids } from "@/lib/tasks-utils";
import { UserAvatar } from "../user-avatar";
import { Badge } from "@/components/ui/badge";

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

export function TaskDetailsDialog({ children, task, onEdit }: TaskDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: comments = [], isLoading: commentsLoading } = useComments(task.id, { enabled: open });

  const StatusIcon = taskStatusIcons[task.status];
  const PriorityIcon = priorityIcons[task.priority];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">{fa.tasks.details.title}</DialogTitle>
      <DialogContent className="sm:max-w-[960px] max-h-[90vh] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Task Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h2 className="text-2xl font-semibold leading-relaxed">
                  {task.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Created</span>
                  <span>{formatTaskDate(task.created)}</span>
                  {task.expand?.creator && (
                    <>
                      <span>•</span>
                      <span>by</span>
                      <div className="flex items-center gap-2">
                        <UserAvatar user={task.expand.creator} />
                        <span>
                          {task.expand.creator.first_name && task.expand.creator.last_name
                            ? `${task.expand.creator.first_name} ${task.expand.creator.last_name}`.trim()
                            : task.expand.creator.username}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Badge
                  variant="default"
                  className={`${taskStatusBadgeSolids[task.status]}`}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {fa.tasks.status[task.status]}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${priorityColors[task.priority]} border-current`}
                >
                  <PriorityIcon className="w-3 h-3 mr-1" />
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
                      {task.expand.assignee.first_name && task.expand.assignee.last_name
                        ? `${task.expand.assignee.first_name} ${task.expand.assignee.last_name}`.trim()
                        : task.expand.assignee.username}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">{fa.tasks.addTask.unassigned}</span>
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
              <h3 className="font-medium">نظرات</h3>
              <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
            </div>

            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
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
    </Dialog>
  );
}
