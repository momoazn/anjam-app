import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateShort } from "@/lib/date-utils";
import { TaskWithProject } from "@/lib/pocketbase";
import { UsersResponse } from "@/lib/pocketbase-types";
import { priorityColors, priorityIcons } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { useNavigate } from "react-router-dom";

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
        className="border-primary/50 bg-primary/5 h-[100px] rounded-lg border-2 border-dashed p-4 opacity-50"
      />
    );
  }

  const PriorityIcon = priorityIcons[task.priority];
  const priorityIconColor = priorityColors[task.priority];
  const assigneeRecord = task.expand?.assignee as UsersResponse | undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "hover:ring-primary/20 cursor-grab hover:ring-2 active:cursor-grabbing",
        "relative flex flex-col gap-2 p-3 shadow-sm",
      )}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground font-mono text-xs">
          {task.display_id}
        </span>
        <PriorityIcon className={cn("h-4 w-4 shrink-0", priorityIconColor)} />
      </div>

      <div className="line-clamp-2 text-sm leading-tight font-medium">
        {task.title}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
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
            username={
              !assigneeRecord && task.assignee ? task.assignee : undefined
            }
            showUnassigned={!assigneeRecord && !task.assignee}
            className="h-6 w-6"
          />
        </div>

        {task.deadline && (
          <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px]">
            {formatDateShort(task.deadline)}
          </span>
        )}
      </div>

      {task.expand?.project && (
        <div className="mt-1">
          <Badge
            variant="outline"
            className="h-5 max-w-full truncate px-1 py-0 text-[10px]"
          >
            {task.expand.project.name}
          </Badge>
        </div>
      )}
    </Card>
  );
}
