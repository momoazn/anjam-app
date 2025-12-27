/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconLoader2,
  IconPlus,
  IconTerminal2,
  IconArrowLeft,
  IconCpu,
  IconActivity,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { TaskFields } from "@/components/forms/task-fields";
import { PageTransition } from "@/components/page-transition";
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

const taskFormSchema = z.object({
  title: z.string().min(1, { message: errors.validation.titleRequired }),
  description: z.string().min(1, { message: common.validation.required }),
  assignee: z.string().min(1, { message: common.validation.required }),
  priority: z.nativeEnum(TasksPriorityOptions),
  status: z.nativeEnum(TasksStatusOptions),
  project: z.string().optional(),
  deadline: z.date().optional(),
  estimated_hours: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .pipe(z.number().min(0).max(999).optional()),
  estimated_minutes: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .pipe(z.number().min(0).max(59).optional()),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function CreateTask() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const { id: projectId } = useParams<{ id: string }>();

  const isInProject = Boolean(projectId);
  const initialProject = projectId ?? "";

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema) as any,
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
    <PageTransition className="bg-background relative min-h-screen p-4 lg:p-8">
      <div className="relative mx-auto max-w-5xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="text-primary flex items-center gap-2">
              <IconTerminal2 size={18} stroke={2.5} />
              <span className="text-[10px] font-bold tracking-wider uppercase">
                Task Creation
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {tasks.addTask.title}
            </h1>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed font-medium">
              {isInProject
                ? tasks.addTask.descriptionProject
                : tasks.addTask.description}
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={handleCancel}
            className="h-11 rounded-lg px-6 font-bold"
          >
            <IconArrowLeft className="me-2" size={18} stroke={2.5} />
            {common.cancel}
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Main Form Area */}
              <div className="space-y-10 lg:col-span-8">
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
                    isInProject={isInProject}
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
                </div>

                <div className="bg-muted/30 rounded-xl border p-6">
                  <h3 className="text-muted-foreground mb-4 text-xs font-bold tracking-wider uppercase">
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
                      <span className="text-[11px] font-bold">24ms</span>
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
