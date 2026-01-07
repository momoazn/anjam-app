import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconLoader2, IconPlus } from "@tabler/icons-react";
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
import { useCreateTask } from "@/hooks";
import { parseTimeInput } from "@/lib/time-utils";
import { useAuthUser } from "@/store/auth-store";
import type { TaskPriority, TaskStatus } from "@/types/tasks";

export default function CreateTask() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const { id: projectId } = useParams<{ id: string }>();

  const isInProject = Boolean(projectId);
  const initialProject = projectId ?? "";

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      assignee: tasks.addTask.unassigned,
      priority: "medium" as TaskPriority,
      status: "todo" as TaskStatus,
      project: initialProject,
      deadline: undefined,
      estimated_hours: 0,
      estimated_minutes: 0,
      tags: [],
    },
  });

  const { mutate: createTask, isPending } = useCreateTask({
    onSuccess: (taskId) => {
      navigate(`/tasks/${taskId}`);
    },
  });

  function onSubmit(values: TaskFormData) {
    if (!user) return;

    const {
      estimated_hours,
      estimated_minutes: estimatedMinutesPart,
      ...rest
    } = values;
    const hasEstimate = estimated_hours != null || estimatedMinutesPart != null;
    const estimated_minutes = hasEstimate
      ? parseTimeInput(estimated_hours ?? 0, estimatedMinutesPart ?? 0)
      : undefined;

    createTask({
      ...rest,
      estimated_minutes,
      project: values.project || initialProject,
      assignee:
        values.assignee !== tasks.addTask.unassigned
          ? values.assignee
          : undefined,
      deadline: values.deadline?.getTime(),
    });
  }

  const handleCancel = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/tasks`);
    } else {
      navigate("/tasks");
    }
  };

  return (
    <PageTransition className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 text-right">
              <h1 className="truncate text-base font-semibold">
                {tasks.addTask.title}
              </h1>
              <p className="text-muted-foreground mt-1 text-xs">
                {isInProject
                  ? tasks.addTask.descriptionProject
                  : tasks.addTask.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {Object.keys(form.formState.errors).length > 0 ? (
                <div className="text-destructive me-auto text-xs font-semibold">
                  {common.messages.invalidForm}
                </div>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleCancel}
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
                  <IconPlus className="me-1 size-4" />
                )}
                {isPending
                  ? tasks.addTask.buttons.creating
                  : tasks.addTask.buttons.create}
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
            <TaskFields
              control={form.control}
              isInProject={isInProject}
              projectId={projectId}
              variant="product"
            />
          </div>
        </form>
      </Form>
    </PageTransition>
  );
}
