import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { Textarea } from "@/components/ui/textarea";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import {
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
import { useProjects, useProjectUsers, useUsers } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";
import DatePicker from "../ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserAvatar } from "../user-avatar";

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
  const [open, setOpen] = useState(false);
  const user = useAuthUser();
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
  const { data: projects } = useProjects({ enabled: !isInProject });

  // Fetch project users when in project context
  const { data: projectUsers } = useProjectUsers({
    projectId: projectId || "",
    enabled: Boolean(projectId), // Enable only when we have a project ID
  });

  // Fetch all users when not in project context
  const { data: users } = useUsers({ enabled: !projectId });

  // Use projectUsers when in project context, otherwise use all users
  const assignees = projectId ? projectUsers : users;

  const { mutate: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: (task: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(task),
    onSuccess: () => {
      onSuccess?.();
      form.reset();
      toast.success(TEXT.tasks.addTask.success);
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogTitle className="sr-only">{TEXT.tasks.addTask.title}</DialogTitle>
      <DialogContent className="sm:max-w-[800px]">
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
                      autoFocus
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
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger size="default">
                          <SelectValue
                            placeholder={TEXT.tasks.addTask.unassigned}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TEXT.tasks.addTask.unassigned}>
                            <UserAvatar
                              username={TEXT.tasks.addTask.unassigned}
                            />
                            {TEXT.tasks.addTask.unassigned}
                          </SelectItem>
                          {assignees?.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              <UserAvatar username={u.username} />
                              <span>
                                {u.first_name} {u.last_name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        buttonProps={{
                          className: "w-38",
                          size: "sm",
                        }}
                      />
                    </FormControl>
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

              {!isInProject && (
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger size="default">
                            <SelectValue
                              placeholder={TEXT.tasks.addTask.selectProject}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {projects?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <span>{p.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

            <div className="flex items-center justify-end gap-2 pt-0">
              <DialogClose asChild>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  disabled={isCreatingTask}
                >
                  {TEXT.tasks.details.buttons.cancel}
                </Button>
              </DialogClose>
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
