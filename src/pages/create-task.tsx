import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { fa } from "@/constants/text";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { useCreateTask } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";

const taskFormSchema = z.object({
  title: z.string().min(1, { message: fa.errors.validation.titleRequired }),
  description: z.string(),
  assignee: z.string(),
  priority: z.nativeEnum(TasksPriorityOptions),
  status: z.nativeEnum(TasksStatusOptions),
  project: z.string().optional(),
  deadline: z.date().optional(),
  estimated_hours: z.coerce.number().min(0).max(999).optional(),
  estimated_minutes: z.coerce.number().min(0).max(59).optional(),
});

export default function CreateTask() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const { id: projectId } = useParams<{ id: string }>();

  // Check if we're in a project context
  const isInProject = Boolean(projectId);
  const initialProject = projectId ?? "";

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee: fa.tasks.addTask.unassigned,
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

    createTask({
      ...values,
      creator: user.id,
      project: values.project || initialProject,
      assignee:
        values.assignee !== fa.tasks.addTask.unassigned
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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fa.tasks.addTask.title}</h1>
          <p className="text-muted-foreground">
            {isInProject
              ? fa.tasks.addTask.descriptionProject
              : fa.tasks.addTask.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.tasks.addTask.title}</CardTitle>
          <CardDescription>
            {isInProject
              ? fa.tasks.addTask.descriptionProject
              : fa.tasks.addTask.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  {fa.tasks.details.buttons.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
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
        </CardContent>
      </Card>
    </PageTransition>
  );
}
