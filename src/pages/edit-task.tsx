import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { TaskFields } from "@/components/forms/task-fields";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { common, errors, tasks } from "@/constants";
import { useTask, useUpdateTask } from "@/hooks";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { minutesToHoursAndMinutes, parseTimeInput } from "@/lib/time-utils";

const taskFormSchema = z.object({
  title: z
    .string({ required_error: common.validation.required })
    .min(1, { message: tasks.addTask.issueTitle }),
  description: z.string({ required_error: common.validation.required }),
  assignee: z.string({ required_error: common.validation.required }),
  priority: z.nativeEnum(TasksPriorityOptions, {
    required_error: errors.validation.invalidOption,
    invalid_type_error: errors.validation.invalidOption,
  }),
  status: z.nativeEnum(TasksStatusOptions, {
    required_error: errors.validation.invalidOption,
    invalid_type_error: errors.validation.invalidOption,
  }),
  project: z
    .string()
    .min(1, { message: errors.validation.projectIdRequired })
    .optional(),
  deadline: z
    .date({ invalid_type_error: errors.validation.invalidDate })
    .optional(),
  estimated_hours: z.coerce
    .number({
      invalid_type_error: errors.validation.numberInvalid,
    })
    .min(0, { message: errors.validation.estimatedHoursRange })
    .max(999, { message: errors.validation.estimatedHoursRange })
    .optional(),
  estimated_minutes: z.coerce
    .number({
      invalid_type_error: errors.validation.numberInvalid,
    })
    .min(0, { message: errors.validation.estimatedMinutesRange })
    .max(59, { message: errors.validation.estimatedMinutesRange })
    .optional(),
});

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading } = useTask({
    id: id ?? "",
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee: tasks.addTask.unassigned,
      priority: TasksPriorityOptions.medium,
      status: TasksStatusOptions.todo,
      project: "",
      deadline: undefined,
      estimated_hours: undefined,
      estimated_minutes: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      const { hours, minutes } = minutesToHoursAndMinutes(
        task.estimated_minutes,
      );
      form.reset({
        title: task.title,
        description: task.description,
        assignee: task.assignee ?? tasks.addTask.unassigned,
        priority: task.priority,
        status: task.status,
        project: task.project,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        estimated_hours: hours || undefined,
        estimated_minutes: minutes || undefined,
      });
    }
  }, [form, task]);

  const { mutate: updateTask, isPending } = useUpdateTask({
    onSuccess: () => {
      navigate(`/tasks/${id}`);
    },
  });

  function onSubmit(values: z.infer<typeof taskFormSchema>) {
    if (!task) return;

    const {
      estimated_hours,
      estimated_minutes: estimatedMinutesPart,
      ...rest
    } = values;
    const hasEstimate = estimated_hours != null || estimatedMinutesPart != null;
    const estimated_minutes = hasEstimate
      ? parseTimeInput(estimated_hours ?? 0, estimatedMinutesPart ?? 0)
      : undefined;

    updateTask({
      id: task.id,
      updates: {
        ...rest,
        estimated_minutes,
        // Only include project if present (not in project context or changed)
        project: values.project ?? task.project,
        assignee:
          values.assignee !== tasks.addTask.unassigned
            ? values.assignee
            : undefined,
        deadline: values.deadline?.toISOString(),
      },
    });
  }

  const handleCancel = () => {
    navigate(`/tasks/${id}`);
  };

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
            <p className="text-muted-foreground">{tasks.errors.notFound}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/tasks")}
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              {common.buttons.backToList}
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{tasks.edit.title}</h1>
          <p className="text-muted-foreground">{task.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tasks.edit.title}</CardTitle>
          <CardDescription>
            {common.buttons.view} {task.display_id || task.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TaskFields control={form.control} isInProject={true} />

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  {tasks.details.buttons.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                  ) : null}
                  {isPending
                    ? tasks.edit.buttons.saving
                    : tasks.edit.buttons.save}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
