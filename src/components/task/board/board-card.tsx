import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/date-utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { UsersResponse } from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  getStatusColorVariant,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { useNavigate } from "react-router-dom";
import { IconHash, IconClock } from "@tabler/icons-react";
import { digitsEnToFa } from "@persian-tools/persian-tools";

interface BoardCardProps {
  task: TaskWithProject;
}

export function BoardCard({ task }: BoardCardProps) {
  const navigate = useNavigate();
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-primary/5 border-primary/20 h-32 rounded-none border-2 border-dashed opacity-50"
      />
    );
  }

  const PriorityIcon = priorityIcons[task.priority];
  const priorityIconColor = priorityColors[task.priority];
  const assigneeRecord = task.expand?.assignee as UsersResponse | undefined;

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group border-border/40 bg-card hover:bg-muted/30 relative flex flex-col gap-3 rounded-none border p-4 text-right shadow-sm transition-all duration-200 hover:z-10",
        "hover:border-primary/30 w-full cursor-grab active:cursor-grabbing",
      )}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 opacity-40">
          <IconHash className="size-2.5" />
          <span className="font-mono text-[9px] leading-none font-black tracking-widest uppercase">
            {task.display_id}
          </span>
        </div>
        <PriorityIcon className={cn("size-4 shrink-0", priorityIconColor)} />
      </div>

      <div className="group-hover:text-primary line-clamp-2 w-full text-right text-sm leading-tight font-black tracking-tight uppercase transition-colors">
        {task.title}
      </div>

      <div className="mt-2 flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            user={
              assigneeRecord
                ? {
                    first_name: assigneeRecord.first_name,
                    last_name: assigneeRecord.last_name,
                    username: assigneeRecord.username,
                    avatar: assigneeRecord.avatar,
                    id: assigneeRecord.id,
                    collectionId: assigneeRecord.collectionId,
                    collectionName: assigneeRecord.collectionName,
                  }
                : undefined
            }
            showUnassigned={!assigneeRecord && !task.assignee}
            className="border-border/20 size-7 rounded-none border shadow-sm"
          />

          {task.expand?.project && (
            <span className="text-muted-foreground/40 max-w-[80px] truncate text-[8px] font-black tracking-[0.15em] uppercase">
              {task.expand.project.name}
            </span>
          )}
        </div>

        {task.deadline && (
          <div className="flex items-center gap-1.5 opacity-60">
            <IconClock className="size-2.5" />
            <span className="text-[9px] font-black tabular-nums">
              {digitsEnToFa(formatDateShort(task.deadline))}
            </span>
          </div>
        )}
      </div>

      {/* Tags Protocol */}
      {task.tags && task.tags.length > 0 && (
        <div className="mt-1 flex w-full flex-wrap justify-end gap-1">
          {task.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border/40 bg-muted/30 text-muted-foreground rounded-none px-1.5 py-0 text-[7px] font-black tracking-widest uppercase"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Visual Status Bar */}
      <div
        className={cn(
          "absolute inset-y-0 end-0 w-0.5 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          getStatusColorVariant(task.status, "icon").replace("text", "bg"),
        )}
      />
    </button>
  );
}
