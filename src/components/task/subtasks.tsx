/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconCheck,
  IconGripVertical,
  IconPlus,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { tasks } from "@/constants";
import {
  useCreateSubtask,
  useDeleteSubtask,
  useProjectUsers,
  useSubtasks,
  useUpdateSubtask,
} from "@/hooks";
import { formatTaskDate } from "@/lib/date-utils";
import { formatUserName, cn } from "@/lib/utils";
import { handlePocketBaseError } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { pb } from "@/lib/pocketbase";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import type { SubtasksResponse, UsersResponse } from "@/lib/pocketbase-types";

type SubtaskWithAssignee = SubtasksResponse<{ assignee?: UsersResponse }>;

const getSubtaskOrder = (subtask: SubtaskWithAssignee) => subtask.order ?? 0;

type SubtasksProps = {
  taskId: string;
  projectId: string;
};

type SortableSubtaskRowProps = {
  subtask: SubtaskWithAssignee;
  onToggle: () => void;
  onDelete: () => void;
  assigneeName: string;
  isUpdating: boolean;
  isDeleting: boolean;
};

function SortableSubtaskRow({
  subtask,
  onToggle,
  onDelete,
  assigneeName,
  isUpdating,
  isDeleting,
}: SortableSubtaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border/10 bg-card rounded-xl border p-4 text-right",
        isDragging && "bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-muted-foreground/40"
            {...attributes}
            {...listeners}
          >
            <IconGripVertical className="size-4" />
          </button>
          <div>
            <p className="text-sm font-bold tracking-tight">{subtask.title}</p>
            <p className="text-muted-foreground text-[11px] font-medium">
              {assigneeName} · {formatTaskDate(subtask.created)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-lg text-[10px] font-bold",
              subtask.is_done ? "text-success" : "text-muted-foreground",
            )}
            onClick={onToggle}
            disabled={isUpdating}
          >
            <IconCheck className="size-3" />
            {subtask.is_done
              ? tasks.details.subtasks.reopen
              : tasks.details.subtasks.markDone}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] font-bold text-rose-500"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <IconTrash className="size-3" />
            {tasks.details.subtasks.delete}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Subtasks({ taskId, projectId }: SubtasksProps) {
  const queryClient = useQueryClient();
  const { data: subtasksData, isFetching: isLoadingSubtasks } =
    useSubtasks(taskId);
  const { data: users } = useProjectUsers({ projectId });

  const [ordered, setOrdered] = useState<SubtaskWithAssignee[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<string>("");

  const createSubtask = useCreateSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  useEffect(() => {
    if (!subtasksData) return;
    const sorted = [...subtasksData].sort((a, b) => {
      if (getSubtaskOrder(a) === getSubtaskOrder(b)) {
        return new Date(a.created).getTime() - new Date(b.created).getTime();
      }
      return getSubtaskOrder(a) - getSubtaskOrder(b);
    });
    setOrdered(sorted);
  }, [subtasksData]);

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
      toast.error(tasks.details.subtasks.titleRequired);
      return;
    }
    createSubtask.mutate(
      {
        task: taskId,
        title,
        assignee:
          newAssignee === "unassigned" || !newAssignee
            ? undefined
            : newAssignee,
        order: ordered.length + 1,
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewAssignee("");
          toast.success(tasks.details.subtasks.addSuccess);
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
      onSuccess: () => toast.success(tasks.details.subtasks.deleteSuccess),
      onError: (error: unknown) => handlePocketBaseError(error as Error),
    });
  };

  const persistOrder = async (nextOrder: SubtaskWithAssignee[]) => {
    await Promise.all(
      nextOrder.map((subtask, index) =>
        pb.collection("subtasks").update(subtask.id, { order: index + 1 }),
      ),
    );
    queryClient.invalidateQueries({
      queryKey: queryKeys.subtasks.listByTask(taskId),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrdered((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const nextOrder = arrayMove(items, oldIndex, newIndex);
      persistOrder(nextOrder).catch(() => {
        toast.error(tasks.details.subtasks.orderUpdateError);
      });
      return nextOrder;
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-primary/60 text-[10px] font-bold tracking-tight">
          {tasks.details.subtasks.workBreakdown}
        </span>
        <div className="bg-border/20 h-px flex-1" />
      </div>

      <div className="bg-border/40 border-border/40 rounded-xl border p-6">
        <div className="border-border/20 space-y-4 border-b pb-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-muted-foreground/40 text-[10px] font-bold tracking-tight">
                {tasks.details.subtasks.title}
              </label>
              <Input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder={tasks.details.subtasks.addPlaceholder}
                className="border-border/40 bg-muted/5 mt-2 rounded-lg text-right text-sm font-bold"
              />
            </div>
            <div className="w-56">
              <div className="text-muted-foreground/40 flex items-center justify-end gap-1 text-[10px] font-bold tracking-tight">
                <IconUser className="size-3" />
                {tasks.details.subtasks.assigneeLabel}
              </div>
              <div className="mt-2">
                <Select
                  value={newAssignee || "unassigned"}
                  onValueChange={(value) => setNewAssignee(value)}
                >
                  <SelectTrigger className="border-border/40 bg-muted/5 rounded-lg text-right text-[11px]">
                    <span className="text-muted-foreground/60">
                      {newAssignee && newAssignee !== "unassigned"
                        ? assigneeOptions.find(
                            (opt) => opt.value === newAssignee,
                          )?.label
                        : tasks.addTask.unassigned}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card rounded-xl border">
                    <SelectItem
                      value="unassigned"
                      className="text-[10px] font-bold"
                    >
                      {tasks.addTask.unassigned}
                    </SelectItem>
                    {assigneeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-[10px] font-bold"
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
              className="border-border/40 h-10 rounded-lg text-[10px] font-bold tracking-tight"
            >
              <IconPlus className="size-4" />
              {tasks.details.subtasks.addButton}
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {isLoadingSubtasks ? (
            <p className="text-muted-foreground">
              {tasks.details.timeTracking.loading}
            </p>
          ) : ordered.length > 0 ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={ordered.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {ordered.map((subtask) => {
                    const assigneeName = subtask.expand?.assignee
                      ? formatUserName(
                          subtask.expand.assignee.first_name,
                          subtask.expand.assignee.last_name,
                          subtask.expand.assignee.username,
                        )
                      : tasks.details.unknownUser;
                    return (
                      <SortableSubtaskRow
                        key={subtask.id}
                        subtask={subtask}
                        assigneeName={assigneeName}
                        onToggle={() =>
                          toggleCompletion(subtask.id, Boolean(subtask.is_done))
                        }
                        onDelete={() => handleDelete(subtask.id)}
                        isUpdating={updateSubtask.isPending}
                        isDeleting={deleteSubtask.isPending}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
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
