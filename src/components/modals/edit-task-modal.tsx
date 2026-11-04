import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TaskFields } from "@/components/forms/task-fields";
import {
  type TaskFormData,
  taskFormSchema,
} from "@/components/forms/task-fields-schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { common, tasks } from "@/constants";
import { useTask, useUpdateTask } from "@/hooks/tasks";
import { useAuthUser } from "@/store/app-context-store";
import {
  useCloseModal,
  useModalData,
  useModalIsOpen,
  useModalType,
} from "@/store/modal-store";
import { TaskPriority, TaskStatus } from "@/types/tasks";

export function EditTaskModal() {
  const isOpen = useModalIsOpen();
  const type = useModalType();
  const closeModal = useCloseModal();
  const data = useModalData();
  const user = useAuthUser();
  const [isMutationPending, setIsMutationPending] = useState(false);

  const taskId = data?.taskId;

  const { data: task, isLoading: isLoadingTask } = useTask({
    id: taskId ?? "",
    enabled: !!taskId,
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
      tags: [],
    },
  });

  const lastResetKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (task) {
      const resetKey = `${task._id}:${task.updatedAt ?? ""}`;
      if (lastResetKeyRef.current === resetKey) return;
      lastResetKeyRef.current = resetKey;

      form.reset({
        title: task.title,
        description: task.description || "",
        assignee: task.assigneeUserId || tasks.addTask.unassigned,
        priority: task.priority,
        status: task.status,
        project: task.projectId,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        tags: task.tags || [],
      });
    }
  }, [task, form]);

  const { mutate: updateTask } = useUpdateTask();

  const handleClose = () => {
    closeModal();
    form.reset();
  };

  const handleSubmit = async (values: TaskFormData) => {
    if (!taskId || !user) return;

    setIsMutationPending(true);
    try {
      await updateTask({
        id: taskId,
        updates: {
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          tags: values.tags,
          assigneeUserId:
            values.assignee !== tasks.addTask.unassigned
              ? values.assignee
              : null,
          deadline: values.deadline?.getTime() ?? null,
        },
      });

      toast.success(tasks.edit.success);
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task");
    } finally {
      setIsMutationPending(false);
    }
  };

  if (type !== "edit-task") return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {task ? `Edit Task: ${task.title}` : tasks.edit.title}
          </DialogTitle>
          <DialogDescription>{tasks.edit.error}</DialogDescription>
        </DialogHeader>

        {isLoadingTask ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="max-h-[60vh] overflow-y-auto">
                <TaskFields
                  control={form.control}
                  isInProject={!!task?.projectId}
                  projectId={task?.projectId}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isMutationPending}
                >
                  {common.cancel}
                </Button>
                <Button type="submit" disabled={isMutationPending}>
                  {isMutationPending ? (
                    <IconLoader2 className="me-2 size-4 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="me-2 size-4" />
                  )}
                  {tasks.edit.buttons.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
