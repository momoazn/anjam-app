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
  taskStatusIcons,
  getStatusColorVariant,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconTerminal, IconHash } from "@tabler/icons-react";

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
  const iconColor = getStatusColorVariant(
    status.key as TasksStatusOptions,
    "icon",
  );
  const borderColor = getStatusColorVariant(
    status.key as TasksStatusOptions,
    "border",
  )
    .replace("border-", "border-t-")
    .replace("/20", "");

  return (
    <div className="bg-muted/5 border-border/40 flex h-full w-[300px] min-w-[300px] flex-col rounded-none border transition-all">
      {/* Column Protocol Header */}
      <div
        className={cn(
          "border-border/40 bg-muted/10 flex flex-col border-b p-4 text-right",
          borderColor,
          "border-t-4",
        )}
      >
        <div className="mb-3 flex items-center justify-between opacity-40">
          <div className="flex items-center gap-1.5">
            <IconHash className="size-3" />
            <span className="text-[10px] font-black tabular-nums">
              {digitsEnToFa(tasks.length)}
            </span>
          </div>
          <IconTerminal className="text-primary size-3" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <span className="text-foreground text-xs font-black tracking-widest uppercase">
            {status.name}
          </span>
          {Icon && <Icon className={cn("size-4", iconColor)} />}
        </div>
      </div>

      {/* Droppable Area */}
      <ScrollArea className="scrollbar-none flex-1">
        <div
          ref={setNodeRef}
          className="bg-border/10 flex min-h-[200px] flex-col gap-px p-0"
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <BoardCard key={task.id} task={task} />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 opacity-10 grayscale">
              <IconHash className="size-8 stroke-[1]" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Column Footer Protocol */}
      <div className="bg-muted/5 border-border/20 flex items-center justify-between border-t px-4 py-1.5 opacity-30">
        <span className="text-[7px] font-black tracking-[0.3em] uppercase">
          Sector_Active
        </span>
        <div className="bg-foreground size-1 rounded-full" />
      </div>
    </div>
  );
}
