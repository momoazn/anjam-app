import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconActivity,
  IconArrowLeft,
  IconCpu,
  IconLoader2,
  IconPlus,
  IconTerminal2,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { TaskFields } from "@/components/forms/task-fields";
import {
  type TaskFormData,
  taskFormSchema,
} from "@/components/forms/task-fields-schema";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { common, tasks } from "@/constants";
import { useCreateTask } from "@/hooks";
import { TaskPriority, TaskStatus } from "@/types/tasks";
import { parseTimeInput } from "@/lib/time-utils";
import { useAuthUser, useCurrentOrgMode } from "@/store/auth-store";

export default function CreateTask() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const { id: projectId } = useParams<{ id: string }>();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";

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
    onSuccess: (task) => {
      // Redirect to the created task so it is visible even if the list view is filtered.
      navigate(`/tasks/${task.id}`);
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

  if (isProductMode) {
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

  return (
    <PageTransition className="bg-background relative min-h-full p-4 lg:p-8">
      <div className="relative mx-auto max-w-5xl space-y-8">
        <PageHeader
          title={tasks.addTask.title}
          description={
            isInProject
              ? tasks.addTask.descriptionProject
              : tasks.addTask.description
          }
          icon={IconTerminal2}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <IconArrowLeft className="me-2" size={18} stroke={2.5} />
              {common.cancel}
            </Button>
          }
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Main Form Area */}
              <div className="space-y-6 lg:col-span-8">
                <Card className="p-0">
                  <CardContent className="p-8">
                    <div className="mb-8 flex items-center gap-3 border-b pb-6">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <IconCpu size={22} stroke={2} />
                      </div>
                      <h2 className="text-xl font-bold">
                        {tasks.details.detailsCardTitle}
                      </h2>
                    </div>

                    <TaskFields
                      control={form.control}
                      isInProject={isInProject}
                      projectId={projectId}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar / Actions */}
              <div className="space-y-8 lg:col-span-4">
                <Card className="bg-primary text-primary-foreground shadow-primary/20 border p-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="border-primary-foreground/20 mb-6 flex items-center gap-3 border-b pb-4">
                      <IconActivity size={20} stroke={2.5} />
                      <span className="text-sm font-bold">
                        {common.messages.quickActions}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {Object.keys(form.formState.errors).length > 0 && (
                        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-[10px] font-bold">
                          {common.messages.invalidForm}
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="text-primary h-12 w-full rounded-lg bg-white text-sm font-bold transition-all hover:bg-white/90 disabled:opacity-50"
                      >
                        {isPending ? (
                          <IconLoader2 className="me-2 size-5 animate-spin" />
                        ) : (
                          <IconPlus className="me-2" size={22} stroke={3} />
                        )}
                        {isPending
                          ? tasks.addTask.buttons.creating
                          : tasks.addTask.buttons.create}
                      </Button>

                      <div className="text-primary-foreground/70 space-y-2 text-[11px] leading-relaxed font-medium">
                        <p>• فیلدهای ستاره‌دار الزامی هستند</p>
                        <p>• تسک‌ها برای جستجوی سراسری ایندکس می‌شوند</p>
                        <p>• مسئول تسک اعلان دریافت خواهد کرد</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
