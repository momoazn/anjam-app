import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { TaskAssigneeAvatar } from "@/components/task/task-assignee-avatar";
import {
  TaskDueDate,
  TaskPriorityLabel,
  TaskTags,
} from "@/components/task/task-meta";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shared, tasks } from "@/constants";
import { useUpdateTask } from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import { getStatusColorVariant } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { TaskWithProject } from "@/types/tasks";

interface BoardCardProps {
  task: TaskWithProject;
}

export function BoardCard({ task }: BoardCardProps) {
  const navigate = useNavigate();
  const taskId = task._id;
  const { setNodeRef, attributes, listeners, transform, isDragging } =
    useSortable({
      id: taskId,
      data: {
        type: "Task",
        task,
      },
    });

  const updateTask = useUpdateTask();
  const { data: users } = useUsers({ enabled: true });

  const style = {
    ...(isDragging ? {} : { transition: "all 150ms ease-out" }),
    transform: CSS.Transform.toString(transform),
    viewTransitionName: `task-${taskId}`,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-primary/20 bg-primary/5 relative h-18 min-h-18 rounded-xl border-2 border-dashed opacity-40"
      />
    );
  }

  const assigneeRecord = task.assignee;
  const displayId = task.displayId || "";

  const handleAssigneeChange = (value: string) => {
    updateTask.mutate({
      id: taskId,
      updates: { assigneeUserId: value === "__unassigned" ? undefined : value },
    });
    toast.success(tasks.edit.success);
  };

  const handleCardClick = () => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleCardClick();
    }
  };

  return (
    <div
      id={`task-${task._id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      className="group focus-visible:ring-primary/30 hover:bg-muted/30 relative flex w-full cursor-grab flex-col gap-2 px-3 py-3 text-right transition-colors focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold transition-colors">
        {task.title}
      </div>

      <div className="flex w-full items-center gap-x-2.5 gap-y-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
            {digitsEnToFa(displayId)}
          </span>
          <TaskPriorityLabel priority={task.priority} iconOnly />
          <TaskDueDate task={task} className="-mx-1.5 text-[11px]" />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="shrink-0 cursor-pointer transition-transform hover:scale-110"
              onClick={(e) => e.stopPropagation()}
            >
              <TaskAssigneeAvatar
                assignee={assigneeRecord}
                hasAssigneeId={!!task.assigneeUserId}
                size="sm"
                showIndicator={false}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-45 p-1.5" align="start">
            <Select
              value={task.assigneeUserId || "__unassigned"}
              onValueChange={handleAssigneeChange}
            >
              <SelectTrigger className="h-8 border-transparent bg-transparent text-right text-xs focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border rounded-lg border">
                <SelectItem value="__unassigned" className="text-xs font-bold">
                  {tasks.addTask.unassigned}
                </SelectItem>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <SelectItem
                      key={user._id}
                      value={user._id}
                      className="text-xs font-bold"
                    >
                      {user.displayName || user.email}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty" disabled>
                    {shared.noData}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>
      </div>

      <TaskTags tagIds={task.tags} />

      {/* Visual Status Bar */}
      <div
        className={cn(
          "absolute inset-y-0 end-0 w-0.5 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          getStatusColorVariant(task.status, "bar"),
        )}
      />
    </div>
  );
}
