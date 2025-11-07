import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { fa } from "@/constants/text";
import { TasksPriorityOptions } from "@/lib/pocketbase-types";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { TaskFields } from "@/components/forms/task-fields";
import { useAuthUser } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string(),
  assignee: z.string(),
  priority: z.nativeEnum(TasksPriorityOptions),
  status_config: z.string().optional(),
  project: z.string().min(1, { message: "Project is required" }),
  deadline: z.date().optional(),
});

type CreateTaskDialogProps = {
  children: React.ReactNode;
  initialStatusConfig?: string;
  onSuccess?: () => void;
};

export function CreateTaskDialog({
  children,
  initialStatusConfig,
  onSuccess,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const user = useAuthUser();
  const { id: projectId } = useParams<{ id: string }>();
  const isInProject = Boolean(projectId);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee: fa.tasks.addTask.unassigned,
      priority: TasksPriorityOptions.medium,
      status_config: initialStatusConfig,
      project: projectId ?? "",
      deadline: undefined,
    },
  });

  const { mutate: createTask, isPending } = useEntityMutation({
    collection: "tasks",
    successMessage: fa.tasks.addTask.success,
    errorMessage: fa.tasks.addTask.error,
    invalidateQueries: ["tasks"],
    onSuccess: () => {
      onSuccess?.();
      form.reset();
      setOpen(false);
    },
  });

  function onSubmit(values: z.infer<typeof taskFormSchema>) {
    if (!user) return;

    createTask({
      ...values,
      creator: user.id,
      assignee:
        values.assignee !== fa.tasks.addTask.unassigned
          ? values.assignee
          : undefined,
      deadline: values.deadline?.toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">{fa.tasks.addTask.title}</DialogTitle>
      <DialogContent className="sm:max-w-[800px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <TaskFields control={form.control} isInProject={isInProject} />

            <div className="flex items-center justify-end gap-2 pt-0">
              <DialogClose asChild>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  disabled={isPending}
                >
                  {fa.tasks.details.buttons.cancel}
                </Button>
              </DialogClose>
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                ) : null}
                {isPending
                  ? fa.tasks.addTask.buttons.creating
                  : fa.tasks.addTask.buttons.create}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
