import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconActivity,
  IconArrowLeft,
  IconCpu,
  IconDeviceFloppy,
  IconLoader2,
  IconTerminal2,
} from "@tabler/icons-react";
import { useEffect } from "react";
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
import { Form } from "@/components/ui/form";
import { common, tasks } from "@/constants";
import { useTask, useUpdateTask } from "@/hooks";
import { minutesToHoursAndMinutes, parseTimeInput } from "@/lib/time-utils";
import { useCurrentOrgMode } from "@/store/auth-store";
import { TaskPriority, TaskStatus } from "@/types/tasks";

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";

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
      estimated_hours: 0,
      estimated_minutes: 0,
      tags: [],
    },
  });

  useEffect(() => {
    if (task) {
      const { hours, minutes } = minutesToHoursAndMinutes(
        task.estimatedMinutes,
      );

      form.reset({
        title: task.title,
        description: task.description,
        assignee: task.assignee || tasks.addTask.unassigned,
        priority: task.priority,
        status: task.status,
        project: task.project,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        estimated_hours: hours || 0,
        estimated_minutes: minutes || 0,
        tags: task.tags || [],
      });
    }
  }, [task, form]);

  function onSubmit(values: TaskFormData) {
    if (!id) return;

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
      id,
      updates: {
        ...rest,
        estimated_minutes,
        assignee:
          values.assignee !== tasks.addTask.unassigned
            ? values.assignee
            : undefined,
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

  if (isProductMode) {
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
                isInProject={!!task?.project}
                projectId={task?.project ?? undefined}
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
          title={tasks.edit.title}
          description={`ویرایش جزئیات تسک ${task?.displayId || task?.id}`}
          icon={IconTerminal2}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
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
                <div className="bg-card rounded-xl border p-8 shadow-sm">
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
                    isInProject={!!task?.project}
                    projectId={task?.project ?? undefined}
                  />
                </div>
              </div>

              {/* Sidebar / Actions */}
              <div className="space-y-8 lg:col-span-4">
                <div className="bg-primary text-primary-foreground shadow-primary/20 rounded-xl border p-6 shadow-xl">
                  <div className="border-primary-foreground/20 mb-6 flex items-center gap-3 border-b pb-4">
                    <IconActivity size={20} stroke={2.5} />
                    <span className="text-sm font-bold">
                      {common.messages.quickActions}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="text-primary h-12 w-full rounded-lg bg-white text-sm font-bold transition-all hover:bg-white/90 disabled:opacity-50"
                    >
                      {isPending ? (
                        <IconLoader2 className="me-2 size-5 animate-spin" />
                      ) : (
                        <IconDeviceFloppy
                          className="me-2"
                          size={22}
                          stroke={3}
                        />
                      )}
                      {isPending
                        ? tasks.edit.buttons.saving
                        : tasks.edit.buttons.save}
                    </Button>

                    <div className="text-primary-foreground/70 space-y-2 text-[11px] leading-relaxed font-medium">
                      <p>• فیلدهای ستاره‌دار الزامی هستند</p>
                      <p>• تسک‌ها برای جستجوی سراسری ایندکس می‌شوند</p>
                      <p>• مسئول تسک اعلان دریافت خواهد کرد</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl border p-6">
                  <h3 className="text-muted-foreground mb-4 text-xs font-bold tracking-tight">
                    System Status
                  </h3>
                  <div className="space-y-3">
                    <div className="border-border/50 flex justify-between border-b pb-2">
                      <span className="text-muted-foreground text-[11px] font-medium">
                        Network
                      </span>
                      <span className="text-[11px] font-bold text-green-500">
                        Online
                      </span>
                    </div>
                    <div className="border-border/50 flex justify-between border-b pb-2">
                      <span className="text-muted-foreground text-[11px] font-medium">
                        Database
                      </span>
                      <span className="text-[11px] font-bold text-green-500">
                        Connected
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-[11px] font-medium">
                        Latency
                      </span>
                      <span className="text-[11px] font-bold">18ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
