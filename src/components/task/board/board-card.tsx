import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconClock, IconHash, IconTarget } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { dashboard } from "@/constants";
import { formatDateShort } from "@/lib/date-utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { UsersResponse } from "@/lib/pocketbase-types";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";

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
        className="border-primary/20 bg-primary/5 relative h-40 rounded-xl border-2 border-dashed"
      />
    );
  }

  const PriorityIcon = priorityIcons[task.priority];
  const priorityIconColor = priorityColors[task.priority];
  const assigneeRecord = task.expand?.assignee as UsersResponse | undefined;

  return (
    <Button
      variant="ghost"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group border-border/40 bg-card hover:bg-muted/30 relative flex h-auto w-full cursor-grab flex-col gap-3 border-b p-4 text-right transition-all duration-200 hover:z-10 focus-visible:ring-0 active:cursor-grabbing",
        "hover:border-primary/40",
      )}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 opacity-40">
          <IconHash className="size-3" />
          <span className="text-[10px] font-bold">
            {digitsEnToFa(task.display_id)}
          </span>
        </div>
        <div
          className={cn(
            "bg-background/50 border-border/40 flex size-6 items-center justify-center rounded-md border",
            priorityIconColor,
          )}
        >
          <PriorityIcon className="size-4" />
        </div>
      </div>

      <div className="group-hover:text-primary relative z-10 w-full text-right text-sm leading-tight font-bold transition-colors">
        {task.title}
      </div>

      <div className="relative z-10 mt-1 flex w-full items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
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
              className="border-border/20 size-8 rounded-full border shadow-sm"
            />
            {assigneeRecord && (
              <div className="bg-primary border-card absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2" />
            )}
          </div>

          <div className="flex items-center gap-1 opacity-40">
            <IconTarget className="size-3" />
            <span className="max-w-[100px] truncate text-[10px] font-bold">
              {task.expand?.project?.name || dashboard.cards.noProject}
            </span>
          </div>
        </div>

        {task.deadline && (
          <div className="bg-muted/20 flex items-center gap-1.5 rounded-md px-2 py-0.5 opacity-60">
            <IconClock className="size-3" />
            <span className="text-[10px] font-bold tabular-nums">
              {digitsEnToFa(formatDateShort(task.deadline))}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
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
          "absolute inset-y-0 end-0 w-1 scale-y-0 transition-transform duration-300 group-hover:scale-y-100",
          getStatusColorVariant(task.status, "icon").replace("text", "bg"),
        )}
      />
    </Button>
  );
}
