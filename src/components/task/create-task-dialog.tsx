import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import {
  ProjectsResponse,
  TasksPriorityOptions,
  TasksRecord,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { cn } from "@/lib/utils";
import { useSpecificProjectUsers } from "@/pb-hooks";
import { useAuthStore } from "@/store/auth-store";
import { format } from "date-fns-jalali";
import { faIR } from "date-fns/locale";

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string(),
  assignee: z.string(),
  priority: z.nativeEnum(TasksPriorityOptions),
  status: z.nativeEnum(TasksStatusOptions),
  project: z.string().min(1, { message: "Project is required" }),
  deadline: z.date().optional(),
});

interface CreateTaskDialogProps {
  children: React.ReactNode;
  initialStatus?: TasksStatusOptions;
  onSuccess?: () => void;
}

export function CreateTaskDialog({
  children,
  initialStatus = TasksStatusOptions.todo,
  onSuccess,
}: CreateTaskDialogProps) {
  const user = useAuthStore().user;
  const { id: projectId } = useParams<{ id: string }>();
  const isInProject = Boolean(projectId);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee: TEXT.tasks.addTask.unassigned,
      priority: TasksPriorityOptions.medium,
      status: initialStatus,
      project: projectId ?? "",
      deadline: undefined,
    },
  });

  // Fetch available projects
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => pb.collection("projects").getFullList<ProjectsResponse>(),
    enabled: !isInProject, // Only fetch if we're not in a project view
  });

  // Fetch project users when in project context
  const { data: projectUsers } = useSpecificProjectUsers(
    projectId ?? "",
    Boolean(projectId), // Enable only when we have a project ID
  );

  // Fetch all users when not in project context
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => pb.collection("users").getFullList(),
    enabled: !projectId, // Enable only when we don't have a project ID
  });

  // Use projectUsers when in project context, otherwise use all users
  const assignees = projectId ? projectUsers : users;

  const { mutate: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: (task: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(task),
    onSuccess: () => {
      onSuccess?.();
      form.reset();
      toast.success(TEXT.tasks.addTask.success);
    },
    onError: (error) => {
      toast.error(TEXT.tasks.addTask.error.replace("{error}", error.message));
    },
  });

  function onSubmit(values: z.infer<typeof taskFormSchema>) {
    if (!user) return;

    createTask({
      ...values,
      creator: user.id,
      assignee:
        values.assignee !== TEXT.tasks.addTask.unassigned
          ? values.assignee
          : undefined,
      deadline: values.deadline?.toISOString(),
    });
  }

  const status = form.watch("status");
  const priority = form.watch("priority");
  const StatusIcon = taskStatusIcons[status];
  const statusIconColor = taskStatusColors[status];
  const PriorityIcon = priorityIcons[priority];
  const priorityIconColor = priorityColors[priority];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">{TEXT.tasks.addTask.title}</DialogTitle>
      <DialogContent className="sm:max-w-[640px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-auto border-none p-0 text-xl font-semibold shadow-none focus-visible:ring-0"
                      placeholder={TEXT.tasks.addTask.issueTitle}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[60px] w-full resize-none border-none bg-transparent p-0 text-sm shadow-none outline-none focus-visible:ring-0"
                      placeholder={TEXT.tasks.addTask.description}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            size="sm"
                            className={cn(
                              "gap-2",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="size-3" />
                            {field.value ? (
                              format(field.value, "yyyy MMMM d", {
                                locale: faIR,
                              })
                            ) : (
                              <span>موعد مقرر</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={faIR}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          // Toggle through statuses
                          const currentIndex = Object.values(
                            TasksStatusOptions,
                          ).indexOf(field.value);
                          const nextIndex =
                            (currentIndex + 1) %
                            Object.values(TasksStatusOptions).length;
                          field.onChange(
                            Object.values(TasksStatusOptions)[nextIndex],
                          );
                        }}
                      >
                        <StatusIcon className={`size-3 ${statusIconColor}`} />
                        {TEXT.tasks.status[field.value]}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          // Toggle through priorities
                          const currentIndex = Object.values(
                            TasksPriorityOptions,
                          ).indexOf(field.value);
                          const nextIndex =
                            (currentIndex + 1) %
                            Object.values(TasksPriorityOptions).length;
                          field.onChange(
                            Object.values(TasksPriorityOptions)[nextIndex],
                          );
                        }}
                      >
                        <PriorityIcon
                          className={`size-3 ${priorityIconColor}`}
                        />
                        {TEXT.tasks.priority[field.value]}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Toggle through assignees
                          const assigneeList = [
                            TEXT.tasks.addTask.unassigned,
                            ...(assignees?.map((u) => u.id) ?? []),
                          ];
                          const currentIndex = assigneeList.indexOf(
                            field.value,
                          );
                          const nextIndex =
                            (currentIndex + 1) % assigneeList.length;
                          field.onChange(assigneeList[nextIndex]);
                        }}
                      >
                        {field.value === TEXT.tasks.addTask.unassigned
                          ? TEXT.tasks.addTask.unassigned
                          : (assignees?.find((u) => u.id === field.value)
                              ?.username ?? field.value)}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />

              {!isInProject && (
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Toggle through projects
                            const projectList =
                              projects?.map((p) => p.id) ?? [];
                            const currentIndex = projectList.indexOf(
                              field.value,
                            );
                            const nextIndex =
                              (currentIndex + 1) % projectList.length;
                            field.onChange(projectList[nextIndex]);
                          }}
                        >
                          {projects?.find((p) => p.id === field.value)?.name ??
                            TEXT.tasks.addTask.selectProject}
                        </Button>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 border-dashed"
                aria-label={TEXT.tasks.addTask.buttons.more}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center justify-end pt-0">
              <Button size="sm" type="submit" disabled={isCreatingTask}>
                {isCreatingTask ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {isCreatingTask
                  ? TEXT.tasks.addTask.buttons.creating
                  : TEXT.tasks.addTask.buttons.create}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
