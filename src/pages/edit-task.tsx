import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconLoader2,
} from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { TaskFields } from "@/components/forms/task-fields";
import {
  type TaskFormData,
  taskFormSchema,
} from "@/components/forms/task-fields-schema";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, tasks } from "@/constants";
import { useTask, useUpdateTask } from "@/hooks";
import { TaskPriority, TaskStatus } from "@/types/tasks";

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading } = useTask({
    id: id ?? "",
    enabled: !!id,
  });
  const { mutate: updateTask, isPending } = useUpdateTask({
    onSuccess: () => {
      navigate(`/tasks/${id}`);
    },
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      assignee: tasks.addTask.unassigned,
      priority: "medium" as TaskPriority,
      status: "todo" as TaskStatus,
      project: "",
      deadline: undefined,
      tags: [],
    },
  });

  const lastResetKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (task) {
      const resetKey = `${task._id}:${task.updatedAt ?? ""}`;
      if (lastResetKeyRef.current === resetKey) return;
      lastResetKeyRef.current = resetKey;

      form.reset({
        title: task.title,
        description: task.description || "",
        assignee: task.assigneeUserId || tasks.addTask.unassigned,
        priority: task.priority,
        status: task.status,
        project: task.projectId,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        tags: task.tags || [],
      });
    }
  }, [task, form]);

  function onSubmit(values: TaskFormData) {
    if (!id) return;

    const { assignee, ...rest } = values;

    updateTask({
      id,
      updates: {
        ...rest,
        assigneeUserId:
          assignee !== tasks.addTask.unassigned ? assignee : undefined,
        deadline: values.deadline?.getTime(),
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <IconLoader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  const projectID = task?.projectId;

  return (
    <PageTransition className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 text-right">
              <h1 className="truncate text-base font-semibold">
                {tasks.edit.title}
              </h1>
              <p className="text-muted-foreground mt-1 text-xs">
                {tasks.details.displayIdLabel}: {task?.displayId || task?.id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <IconArrowLeft className="me-2 size-4" />
                {common.cancel}
              </Button>
              <Button
                type="submit"
                size="xs"
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <IconLoader2 className="me-1 size-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="me-1 size-4" />
                )}
                {isPending
                  ? tasks.edit.buttons.saving
                  : tasks.edit.buttons.save}
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
            <TaskFields
              control={form.control}
              isInProject={!!projectID}
              projectId={projectID}
            />
          </div>
        </form>
      </Form>
    </PageTransition>
  );
}
