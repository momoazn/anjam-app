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
import { dashboard, shared, tasks } from "@/constants";
import { useUpdateTask } from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import { formatDateShort } from "@/lib/date-utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { UsersResponse } from "@/lib/pocketbase-types";
import { getStatusColorVariant } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

interface BoardCardProps {
  task: TaskWithProject;
}

export function BoardCard({ task }: BoardCardProps) {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const { setNodeRef, attributes, listeners, transform, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: "Task",
        task,
      },
    });

  const updateTask = useUpdateTask({
    onSuccess: () => {
      toast.success(tasks.edit.success);
    },
  });

  const { data: users } = useUsers({ batch: 100, sort: "-created" });

  const style = {
    ...(isDragging ? {} : { transition: "all 150ms ease-out" }),
    transform: CSS.Transform.toString(transform),
    viewTransitionName: `task-${task.id}`,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-primary/20 bg-primary/5 relative h-[4.5rem] min-h-[4.5rem] rounded-xl border-2 border-dashed opacity-40"
      />
    );
  }

  const assigneeRecord = task.expand?.assignee as UsersResponse | undefined;
  const showProjectLabel = !projectId;

  const handleAssigneeChange = (value: string) => {
    updateTask.mutate({
      id: task.id,
      updates: { assignee: value === "__unassigned" ? "" : value },
    });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    updateTask.mutate({
      id: task.id,
      updates: { deadline: date ? date.toISOString() : undefined },
    });
  };

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleCardClick();
    }
  };

  return (
    <div
      id={`task-${task.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      className={cn(
        "group relative flex h-auto w-full cursor-grab flex-col text-right transition-colors hover:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:cursor-grabbing",
        isProductMode
          ? "hover:bg-muted/30 gap-2 rounded-none bg-transparent px-3 py-2.5"
          : "border-border/40 bg-card hover:bg-muted/30 hover:border-primary/40 gap-3 border-b p-4",
      )}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="relative z-10 flex w-full items-start gap-2">
        <div className="flex items-center gap-1.5 opacity-40">
          <IconHash className="size-3" />
          <span className="text-[10px] font-bold">
            {digitsEnToFa(task.display_id)}
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
                  hasAssigneeId={!!task.assignee}
                  size="md"
                  indicatorClassName={
                    isProductMode ? "border-background" : "border-card"
                  }
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-1.5" align="start">
              <Select
                value={task.assignee || "__unassigned"}
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
                        key={user.id}
                        value={user.id}
                        className="text-xs font-bold"
                      >
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username}
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
              <span className="max-w-[100px] truncate text-[10px] font-bold">
                {task.expand?.project?.name || dashboard.cards.noProject}
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
                  {digitsEnToFa(formatDateShort(task.deadline))}
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
      {!isProductMode && task.tags && task.tags.length > 0 && (
        <div className="relative z-10 flex w-full flex-wrap justify-end gap-1">
          {task.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border/40 bg-background/50 rounded-md px-1.5 py-0 text-[10px] font-bold"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Visual Status Bar */}
      <div
        className={cn(
          "absolute inset-y-0 end-0 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          isProductMode ? "w-0.5" : "w-1",
          getStatusColorVariant(task.status, "icon").replace("text", "bg"),
        )}
      />
    </div>
  );
}
