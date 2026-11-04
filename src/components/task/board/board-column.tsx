import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { digitsEnToFa } from "@persian-tools/persian-tools";

import { ScrollArea } from "@/components/ui/scroll-area";
import { tasks as tasksText } from "@/constants";
import {
  TaskStatusConfig,
  getStatusColorVariant,
  taskStatusIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { TaskStatus, TaskWithProject } from "@/types/tasks";

import { BoardCard } from "./board-card";

interface BoardColumnProps {
  status: TaskStatusConfig;
  tasks: TaskWithProject[];
  showPlaceholder?: boolean;
}

function BoardPlaceholder() {
  return (
    <div className="border-primary/30 bg-primary/5 animate-pulse rounded-xl border-2 border-dashed h-[4.5rem] min-h-[4.5rem] mx-3 my-2" />
  );
}

export function BoardColumn({
  status,
  tasks,
  showPlaceholder,
}: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status.key,
    data: {
      type: "Column",
      status: status.key,
    },
  });

  const Icon = taskStatusIcons[status.key as TaskStatus];
  const iconColor = getStatusColorVariant(status.key as TaskStatus, "icon");
  const borderColor = getStatusColorVariant(status.key as TaskStatus, "border")
    .replace("border-", "border-t-")
    .replace("/20", "");

  return (
    <div
      data-testid="kanban-column"
      data-status={status.key}
      className="relative flex h-full min-w-[280px] w-[280px] flex-col overflow-hidden rounded-xl border border-border/40 bg-background/30 transition-all"
    >
      {/* Column Header */}
      <div
        className={cn(
          "border-border/40 relative overflow-hidden border-b text-right",
          borderColor,
          "border-t-2 bg-transparent p-3",
        )}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-semibold">{status.name}</span>
            {Icon && <Icon className={cn("size-5", iconColor)} />}
          </div>

          <span className="bg-muted text-muted-foreground inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
            {digitsEnToFa(tasks.length)}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="scrollbar-none h-full [&>div]:overflow-auto [&>div]:!overflow-visible">
          <div
            ref={setNodeRef}
            className="divide-border/40 flex min-h-full flex-col divide-y p-0"
          >
            <SortableContext
              items={tasks.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              {showPlaceholder && <BoardPlaceholder />}
              {tasks.map((task) => (
                <BoardCard key={task._id} task={task} />
              ))}
            </SortableContext>

            {tasks.length === 0 && (
              <div className="border-border/60 text-muted-foreground/70 m-3 flex items-center justify-center rounded-lg border border-dashed py-8 text-xs">
                {tasksText.list.noTasks}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
