import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
import { tasks } from "@/constants";
import { useCreateTask } from "@/hooks/tasks";
import { useAuthUser } from "@/store/app-context-store";
import {
  useCloseModal,
  useModalData,
  useModalIsOpen,
  useModalType,
} from "@/store/modal-store";
import type { TaskPriority, TaskStatus } from "@/types/tasks";

export function CreateTaskModal() {
  const isOpen = useModalIsOpen();
  const type = useModalType();
  const closeModal = useCloseModal();
  const data = useModalData();
  const navigate = useNavigate();
  const user = useAuthUser();

  const handleClose = (open: boolean) => {
    if (!open) {
      navigate(-1);
    }
  };

  const isInProject = Boolean(data?.projectId);
  const initialProject = data?.projectId ?? "";

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
      tags: [],
    },
  });

  const { mutate: createTask, isPending } = useCreateTask({
    onSuccess: (taskId) => {
      form.reset();
      navigate(`/tasks/${taskId}`);
    },
  });

  const handleSubmit = (values: TaskFormData) => {
    if (!user) return;

    createTask({
      ...values,
      project: values.project || initialProject,
      assignee:
        values.assignee !== tasks.addTask.unassigned
          ? values.assignee
          : undefined,
      deadline: values.deadline?.getTime(),
    });
  };

  if (type !== "create-task") return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tasks.addTask.title}</DialogTitle>
          <DialogDescription>
            {isInProject
              ? tasks.addTask.descriptionProject
              : tasks.addTask.description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="max-h-[60vh] overflow-y-auto">
              <TaskFields
                control={form.control}
                isInProject={isInProject}
                projectId={data?.projectId}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <IconLoader2 className="me-1 size-4 animate-spin" />
                ) : (
                  <IconPlus className="me-1 size-4" />
                )}
                {isPending
                  ? tasks.addTask.buttons.creating
                  : tasks.addTask.buttons.create}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
