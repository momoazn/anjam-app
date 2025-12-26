import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPencil, IconCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { TaskFields } from "@/components/forms/task-fields";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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

import { Card, CardContent } from "@/components/ui/card";

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading } = useTask({
    id: id ?? "",
    enabled: !!id,
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      assignee: tasks.addTask.unassigned,
      priority: TasksPriorityOptions.medium,
      status: TasksStatusOptions.todo,
      project: "",
      deadline: undefined,
      estimated_hours: 0,
      estimated_minutes: 0,
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
        estimated_hours: hours || 0,
        estimated_minutes: minutes || 0,
      });
    }
  }, [form, task]);

  const { mutate: updateTask, isPending } = useUpdateTask({
    onSuccess: () => {
      navigate(`/tasks/${id}`);
    },
  });

  function onSubmit(values: TaskFormValues) {
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
      <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="animate-pulse space-y-10">
          <div className="bg-muted/20 h-24 w-full" />
          <div className="bg-muted/10 border-border/20 h-96 w-full border" />
        </div>
      </PageTransition>
    );
  }

  if (!task) {
    return (
      <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
        <Card className="border-border/40 border border-dashed opacity-30 shadow-none grayscale">
          <CardContent className="p-12 text-center">
            <IconPencil className="mx-auto mb-4 size-12 stroke-1" />
            <p className="text-sm font-black tracking-tight uppercase">
              {tasks.errors.notFound}
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-none"
              onClick={() => navigate("/tasks")}
            >
              {common.buttons.backToList}
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
      <PageHeader
        title={tasks.edit.title}
        description={`Update details for task :: ${task.display_id || task.id}`}
        icon={IconPencil}
      />

      <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
        <CardContent className="bg-muted/5 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <TaskFields control={form.control} isInProject={true} />

              <div className="border-border/20 flex items-center justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="border-border/40 h-12 rounded-none text-[10px] font-black tracking-tight uppercase"
                >
                  {tasks.details.buttons.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 gap-3 rounded-none px-8 font-black shadow-md transition-all hover:shadow-lg active:scale-95"
                >
                  {isPending ? (
                    <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <IconCheck className="ms-2 size-4" />
                  )}
                  <span className="tracking-tight uppercase">
                    {isPending
                      ? tasks.edit.buttons.saving
                      : tasks.edit.buttons.save}
                  </span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
