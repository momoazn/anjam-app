import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconClock, IconHash, IconTarget } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { TaskAssigneeAvatar } from "@/components/task/task-assignee-avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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
import { projects, shared, tasks } from "@/constants";
import { useTags } from "@/hooks/tags";
import { useUpdateTask } from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import { formatDateShort } from "@/lib/date-utils";
import { getStatusColorVariant } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { TaskWithProject } from "@/types/tasks";

interface BoardCardProps {
  task: TaskWithProject;
}

export function BoardCard({ task }: BoardCardProps) {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
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
  const { data: tags } = useTags();
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
  const showProjectLabel = !projectId;
  const displayId = task.displayId || "";

  const handleAssigneeChange = (value: string) => {
    updateTask.mutate({
      id: taskId,
      updates: { assigneeUserId: value === "__unassigned" ? null : value },
    });
    toast.success(tasks.edit.success);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    updateTask.mutate({
      id: taskId,
      updates: { deadline: date ? date.getTime() : null },
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
      className={cn(
        "group relative flex h-auto w-full cursor-grab flex-col text-right transition-colors hover:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:cursor-grabbing hover:bg-muted/30 gap-2 rounded-none bg-transparent px-3 py-2.5",
      )}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="relative z-10 flex w-full items-start gap-2">
        <div className="flex items-center gap-1.5 opacity-40">
          <IconHash className="size-3" />
          <span className="text-[10px] font-bold">
            {digitsEnToFa(displayId)}
          </span>
        </div>
      </div>

      <div className="group-hover:text-primary relative z-10 w-full text-right text-sm leading-tight font-bold transition-colors">
        {task.title}
      </div>

      <div className="relative z-10 mt-1 flex w-full items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <TaskAssigneeAvatar
                  assignee={assigneeRecord}
                  hasAssigneeId={!!task.assigneeUserId}
                  size="md"
                  indicatorClassName="border-background"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-45 p-1.5" align="start">
              <Select
                value={task.assigneeUserId || "__unassigned"}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="border-transparent bg-transparent h-8 text-right text-xs focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border rounded-lg border">
                  <SelectItem
                    value="__unassigned"
                    className="text-xs font-bold"
                  >
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

          {showProjectLabel && (
            <div className="flex items-center gap-1 opacity-40">
              <IconTarget className="size-3" />
              <span className="max-w-25 truncate text-[10px] font-bold">
                {task.project?.name || projects.details.noProject}
              </span>
            </div>
          )}
        </div>

        {task.deadline && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="bg-muted/20 flex items-center gap-1.5 rounded-md px-2 py-0.5 opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <IconClock className="size-3" />
                <span className="text-[10px] font-bold tabular-nums">
                  {digitsEnToFa(
                    formatDateShort(new Date(task.deadline).toISOString()),
                  )}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <Calendar
                mode="single"
                selected={task.deadline ? new Date(task.deadline) : undefined}
                onSelect={handleDueDateChange}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="relative z-10 flex w-full flex-wrap justify-end gap-1">
          {task.tags.map((tag) => {
            const tagRecord = tags?.find(
              (candidate) => candidate.id === tag || candidate._id === tag,
            );
            return (
              <Badge
                key={tag}
                variant="outline"
                className="border-border/40 bg-background/50 rounded-md px-1.5 py-0 text-[10px] font-bold"
              >
                {tagRecord?.name ?? tag}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Visual Status Bar */}
      <div
        className={cn(
          "absolute inset-y-0 end-0 w-0.5 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          getStatusColorVariant(task.status, "icon").replace("text", "bg"),
        )}
      />
    </div>
  );
}
