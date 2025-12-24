import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { TaskFields } from "@/components/forms/task-fields";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { common, errors, tasks } from "@/constants";
import { useCreateTask } from "@/hooks";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { parseTimeInput } from "@/lib/time-utils";
import { useAuthUser } from "@/store/auth-store";

const taskFormSchema = z
  .object({
    title: z
      .string({ required_error: common.validation.required })
      .min(1, { message: errors.validation.titleRequired }),
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
    project: z.string().optional(),
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
  })
  .superRefine((data, ctx) => {
    if (!data.deadline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: common.validation.required,
        path: ["deadline"],
      });
    }
  });

export default function CreateTask() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const { id: projectId } = useParams<{ id: string }>();

  const isInProject = Boolean(projectId);
  const initialProject = projectId ?? "";

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      assignee: tasks.addTask.unassigned,
      priority: TasksPriorityOptions.medium,
      status: TasksStatusOptions.todo,
      project: initialProject,
      deadline: undefined,
      estimated_hours: undefined,
      estimated_minutes: undefined,
    },
  });

  const { mutate: createTask, isPending } = useCreateTask({
    onSuccess: () => {
      if (projectId) {
        navigate(`/projects/${projectId}/tasks`);
      } else {
        navigate("/tasks");
      }
    },
  });

  function onSubmit(values: z.infer<typeof taskFormSchema>) {
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
      creator: user.id,
      project: values.project || initialProject,
      assignee:
        values.assignee !== tasks.addTask.unassigned
          ? values.assignee
          : undefined,
      deadline: values.deadline?.toISOString(),
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
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{tasks.addTask.title}</h1>
          <p className="text-muted-foreground">
            {isInProject
              ? tasks.addTask.descriptionProject
              : tasks.addTask.description}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TaskFields control={form.control} isInProject={isInProject} />

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
                    ? tasks.addTask.buttons.creating
                    : tasks.addTask.buttons.create}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
