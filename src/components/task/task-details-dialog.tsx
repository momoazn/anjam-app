import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksResponse,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { useSpecificProjectUsers } from "@/pb-hooks";
import DatePicker from "../ui/date-picker";
import {
  Select,
  SelectItem,
  SelectContent,
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
  deadline: z.date().optional(),
});

interface EditTaskDialogProps {
  children: React.ReactNode;
  task: TasksResponse;
  onSuccess?: () => void;
}

export function EditTaskDialog({
  children,
  task,
  onSuccess,
}: EditTaskDialogProps) {
  const { id: projectId } = useParams<{ id: string }>();

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      assignee: task.assignee ?? TEXT.tasks.addTask.unassigned,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? new Date(task.deadline) : undefined,
    },
  });

  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description,
      assignee: task.assignee ?? TEXT.tasks.addTask.unassigned,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? new Date(task.deadline) : undefined,
    });
  }, [form, task]);

  // Fetch project users when in project context
  const { data: projectUsers } = useSpecificProjectUsers(
    projectId ?? task.project,
    true,
  );

  // Fetch all users when not in project context
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => pb.collection("users").getFullList(),
    enabled: !projectId, // Enable only when we don't have a project ID
  });

  // Use projectUsers when in project context, otherwise use all users
  const assignees = projectId ? projectUsers : users;

  const { mutate: updateTask, isPending: isUpdatingTask } = useMutation({
    mutationFn: (data: z.infer<typeof taskFormSchema>) => {
      return pb.collection("tasks").update(task.id, {
        ...data,
        assignee:
          data.assignee === TEXT.tasks.addTask.unassigned
            ? null
            : data.assignee,
        deadline: data.deadline?.toISOString(),
      });
    },
    onSuccess: () => {
      onSuccess?.();
      toast.success(TEXT.tasks.edit.success);
    },
    onError: (error) => {
      toast.error(TEXT.tasks.edit.error.replace("{error}", error.message));
    },
  });

  function onSubmit(values: z.infer<typeof taskFormSchema>) {
    updateTask(values);
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
      <DialogContent className="overflow-y-auto sm:max-h-[95vh] sm:max-w-[800px]">
        <DialogTitle className="flex items-center gap-2 text-base">
          <span className="font-mono text-sm text-gray-400">
            {task.display_id}
          </span>
          <span>{TEXT.tasks.details.title}</span>
        </DialogTitle>
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
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isUpdatingTask}
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
              <Button size="sm" type="submit" disabled={isUpdatingTask}>
                {isUpdatingTask ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {TEXT.tasks.edit.buttons.save}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
