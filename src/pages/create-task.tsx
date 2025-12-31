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
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { parseTimeInput } from "@/lib/time-utils";
import { useAuthUser } from "@/store/auth-store";

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
      priority: TasksPriorityOptions.medium,
      status: TasksStatusOptions.todo,
      project: initialProject,
      deadline: undefined,
      estimated_hours: 0,
      estimated_minutes: 0,
      tags: [],
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
              onClick={handleCancel}
              className="h-11 rounded-lg px-6 font-bold"
            >
              <IconArrowLeft className="me-2" size={18} stroke={2.5} />
              {common.cancel}
            </Button>
          }
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Main Form Area */}
              <div className="space-y-10 lg:col-span-8">
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
                <Card className="bg-muted/30 p-0">
                  <CardContent className="p-6">
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
                        <span className="text-[11px] font-bold">24ms</span>
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
