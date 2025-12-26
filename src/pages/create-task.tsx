import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPlus, IconCheck } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { TaskFields } from "@/components/forms/task-fields";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, errors, tasks } from "@/constants";
import { useCreateTask } from "@/hooks";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { parseTimeInput } from "@/lib/time-utils";
import { useAuthUser } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";

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
      estimated_hours: 0,
      estimated_minutes: 0,
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
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
      <PageHeader
        title={tasks.addTask.title}
        description={
          isInProject
            ? tasks.addTask.descriptionProject
            : tasks.addTask.description
        }
        icon={IconPlus}
      />

      <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
        <CardContent className="bg-muted/5 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <TaskFields control={form.control} isInProject={isInProject} />

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
                      ? tasks.addTask.buttons.creating
                      : tasks.addTask.buttons.create}
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
