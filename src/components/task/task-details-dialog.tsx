import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { fa } from "@/constants/text";
import {
  TasksPriorityOptions,
  TasksResponse,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { useEntityUpdateMutation } from "@/hooks/use-entity-mutation";
import { TaskFields } from "@/components/forms/task-fields";
import { Loader2 } from "lucide-react";

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string(),
  assignee: z.string(),
  priority: z.nativeEnum(TasksPriorityOptions),
  status: z.nativeEnum(TasksStatusOptions),
  deadline: z.date().optional(),
});

interface EditTaskDialogProps {
  children: React.ReactNode;
  task: TasksResponse;
  onSuccess?: () => void;
}

export function EditTaskDialog({
  children,
  task,
  onSuccess,
}: EditTaskDialogProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const isInProject = Boolean(projectId);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      assignee: task.assignee ?? fa.tasks.addTask.unassigned,
      priority: task.priority,
      status: task.status,
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
            <TaskFields control={form.control} isInProject={isInProject} />

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
                  <Loader2 className="mr-2 size-4 animate-spin" />
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
