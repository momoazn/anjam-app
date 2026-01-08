import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash } from "@tabler/icons-react";

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
    <div className="relative flex h-full flex-col transition-all w-[280px] min-w-[280px] overflow-hidden rounded-xl border border-border/40 bg-background/30">
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

          <span className="bg-muted/30 text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums">
            <IconHash className="size-3 opacity-60" />
            {digitsEnToFa(tasks.length)}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="scrollbar-none h-full [&>div]:overflow-auto [&>div]:!overflow-visible">
          <div
            ref={setNodeRef}
            className="flex min-h-full flex-col p-0 divide-y divide-border/40"
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
              <div className="flex flex-col items-center justify-center opacity-10 grayscale py-16">
                <IconHash className="size-12 stroke-1" />
                <p className="mt-4 text-xs font-bold">
                  {tasksText.list.noTasks}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
