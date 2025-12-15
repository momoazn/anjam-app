import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BoardCard } from "./board-card";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import {
  TaskStatusConfig,
  taskStatusBgColors,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface BoardColumnProps {
  status: TaskStatusConfig;
  tasks: TaskWithProject[];
}

export function BoardColumn({ status, tasks }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status.key,
    data: {
      type: "Column",
      status: status.key,
    },
  });

  const Icon = taskStatusIcons[status.key as TasksStatusOptions];
  const iconColor = taskStatusColors[status.key as TasksStatusOptions];
  const bgColor = taskStatusBgColors[status.key as TasksStatusOptions];

  return (
    <div className="bg-muted/50 border-border/40 flex h-full w-[280px] min-w-[280px] flex-col rounded-lg border">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b p-3",
          bgColor,
        )}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
          <span className="text-foreground/80 text-sm font-medium">
            {status.name}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="flex h-5 min-w-[1.25rem] items-center justify-center px-1.5 py-0 text-xs"
        >
          {tasks.length}
        </Badge>
      </div>

      {/* Droppable Area */}
      <ScrollArea className="flex-1 p-2">
        <div
          ref={setNodeRef}
          className="flex min-h-[150px] flex-col gap-2 pb-4"
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <BoardCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}
