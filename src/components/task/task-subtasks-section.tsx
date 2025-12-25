import { useMemo, useState } from "react";
import { IconCheck, IconPlus, IconTrash, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";

import { tasks } from "@/constants";
import {
  useCreateSubtask,
  useDeleteSubtask,
  useProjectUsers,
  useSubtasks,
  useUpdateSubtask,
} from "@/hooks";
import { TaskWithProject } from "@/lib/pocketbase";
import { formatTaskDate } from "@/lib/date-utils";
import { formatUserName } from "@/lib/utils";
import { handlePocketBaseError } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TaskSubtasksSectionProps = {
  task: TaskWithProject;
};

export function TaskSubtasksSection({ task }: TaskSubtasksSectionProps) {
  const { data: subtasksData, isFetching: isLoadingSubtasks } = useSubtasks(
    task.id,
  );
  const { data: users } = useProjectUsers({ projectId: task.project });

  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<string>("");

  const createSubtask = useCreateSubtask();

  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  const assigneeOptions = useMemo(() => {
    const options = users?.map((user) => ({
      value: user.id,
      label: formatUserName(user.first_name, user.last_name, user.username),
    }));
    return options ?? [];
  }, [users]);

  const handleCreate = () => {
    const title = newTitle.trim();
    if (!title) {
      toast.error("عنوان مورد را وارد کنید");
      return;
    }
    createSubtask.mutate(
      {
        task: task.id,
        title,
        assignee: newAssignee || undefined,
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewAssignee("");
          toast.success("مورد جدید اضافه شد");
        },
        onError: (error: unknown) => {
          handlePocketBaseError(error as Error);
        },
      },
    );
  };

  const toggleCompletion = (subtaskId: string, done: boolean) => {
    updateSubtask.mutate({
      id: subtaskId,
      updates: { is_done: !done },
    });
  };

  const handleDelete = (id: string) => {
    deleteSubtask.mutate(id, {
      onSuccess: () => toast.success("مورد حذف شد"),
      onError: (error: unknown) => handlePocketBaseError(error as Error),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
          03_Work_Breakdown
        </span>
        <div className="bg-border/20 h-px flex-1" />
      </div>

      <div className="bg-border/40 border-border/40 border p-6">
        <div className="border-border/20 space-y-4 border-b pb-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-muted-foreground/40 text-[10px] font-black tracking-[0.3em] uppercase">
                {tasks.details.subtasks.title}
              </label>
              <Input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder={tasks.details.subtasks.addPlaceholder}
                className="border-border/40 bg-muted/5 mt-2 rounded-none text-right text-sm font-black"
              />
            </div>
            <div className="w-56">
              <div className="text-muted-foreground/40 flex items-center justify-end gap-1 text-[10px] font-black tracking-[0.3em] uppercase">
                <IconUser className="size-3" />
                {tasks.details.subtasks.assigneeLabel}
              </div>
              <div className="mt-2">
                <Select
                  value={newAssignee}
                  onValueChange={(value) => setNewAssignee(value)}
                >
                  <SelectTrigger className="border-border/40 bg-muted/5 rounded-none text-right text-[11px] uppercase">
                    <span className="text-muted-foreground/60">
                      {newAssignee
                        ? assigneeOptions.find(
                            (opt) => opt.value === newAssignee,
                          )?.label
                        : tasks.addTask.unassigned}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="border-foreground bg-card rounded-none border-2">
                    <SelectItem
                      value=""
                      className="text-[10px] font-black uppercase"
                    >
                      {tasks.addTask.unassigned}
                    </SelectItem>
                    {assigneeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-[10px] font-black uppercase"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createSubtask.isPending}
              className="border-border/40 h-10 rounded-none text-[10px] font-black tracking-widest uppercase"
            >
              <IconPlus className="size-4" />
              {tasks.details.subtasks.addButton}
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {isLoadingSubtasks ? (
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          ) : subtasksData && subtasksData.length > 0 ? (
            subtasksData.map((subtask) => {
              const assigneeName = subtask.expand?.assignee
                ? formatUserName(
                    subtask.expand.assignee.first_name,
                    subtask.expand.assignee.last_name,
                    subtask.expand.assignee.username,
                  )
                : tasks.details.unknownUser;
              return (
                <div
                  key={subtask.id}
                  className="border-border/10 bg-card rounded-none border p-4 text-right"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black tracking-tight">
                        {subtask.title}
                      </p>
                      <p className="text-muted-foreground text-[11px] font-medium">
                        {assigneeName} · {formatTaskDate(subtask.created)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "rounded-none text-[10px] font-black uppercase",
                          subtask.is_done
                            ? "text-success"
                            : "text-muted-foreground",
                        )}
                        onClick={() =>
                          toggleCompletion(subtask.id, Boolean(subtask.is_done))
                        }
                        disabled={updateSubtask.isPending}
                      >
                        <IconCheck className="size-3" />
                        {subtask.is_done
                          ? tasks.details.subtasks.reopen
                          : tasks.details.subtasks.markDone}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-black text-rose-500 uppercase"
                        onClick={() => handleDelete(subtask.id)}
                        disabled={deleteSubtask.isPending}
                      >
                        <IconTrash className="size-3" />
                        {tasks.details.subtasks.delete}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">
              {tasks.details.subtasks.empty}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
