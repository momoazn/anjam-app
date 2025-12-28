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
    <div className="border-border/20 bg-muted/5 relative flex h-full w-[320px] min-w-[320px] flex-col border-e transition-all">
      {/* Column Header */}
      <div
        className={cn(
          "border-border/40 bg-card relative overflow-hidden border-b p-6 text-right",
          borderColor,
          "border-t-2",
        )}
      >
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-2">
              <IconHash className="size-4" />
              <span className="text-sm font-bold tabular-nums">
                {digitsEnToFa(tasks.length)}
              </span>
            </div>
            <IconTerminal className="text-primary size-4" />
          </div>

          <div className="flex items-center justify-end gap-4">
            <span className="text-lg font-bold">{status.name}</span>
            {Icon && <Icon className={cn("size-6", iconColor)} />}
          </div>
        </div>
      </div>

      {/* Droppable Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="scrollbar-none h-full">
          <div
            ref={setNodeRef}
            className="bg-border/10 flex min-h-full flex-col gap-px p-0"
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
              <div className="flex flex-col items-center justify-center py-24 opacity-10 grayscale">
                <IconHash className="size-12 stroke-1" />
                <p className="mt-4 text-xs font-bold">خالی</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Column Footer */}
      <div className="border-border/20 bg-card flex items-center justify-between border-t px-6 py-3 opacity-40">
        <div className="flex items-center gap-2">
          <div className="bg-primary size-2 animate-pulse rounded-full" />
          <span className="text-[10px] font-bold">فعال</span>
        </div>
        <span className="text-[10px] font-bold">{status.key.slice(0, 8)}</span>
      </div>
    </div>
  );
}
