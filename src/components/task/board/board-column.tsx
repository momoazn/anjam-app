import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash, IconTerminal } from "@tabler/icons-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { common, tasks as tasksText } from "@/constants";
import { TaskWithProject } from "@/lib/pocketbase";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import {
  TaskStatusConfig,
  getStatusColorVariant,
  taskStatusIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

import { BoardCard } from "./board-card";

interface BoardColumnProps {
  status: TaskStatusConfig;
  tasks: TaskWithProject[];
}

export function BoardColumn({ status, tasks }: BoardColumnProps) {
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
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
    <div
      className={cn(
        "relative flex h-full flex-col transition-all",
        isProductMode
          ? "w-[280px] min-w-[280px] overflow-hidden rounded-xl border border-border/40 bg-background/30"
          : "border-border/20 bg-muted/5 w-[320px] min-w-[320px] border-e",
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          "border-border/40 relative overflow-hidden border-b text-right",
          borderColor,
          "border-t-2",
          isProductMode ? "bg-transparent p-3" : "bg-card p-6",
        )}
      >
        {isProductMode ? (
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
        ) : (
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

            <div className="flex items-center justify-end gap-3">
              <span className="text-lg font-bold">{status.name}</span>
              {Icon && <Icon className={cn("size-6", iconColor)} />}
            </div>
          </div>
        )}
      </div>

      {/* Droppable Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="scrollbar-none h-full">
          <div
            ref={setNodeRef}
            className={cn(
              "flex min-h-full flex-col p-0",
              isProductMode
                ? "divide-y divide-border/40"
                : "bg-border/10 gap-px",
            )}
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
              <div
                className={cn(
                  "flex flex-col items-center justify-center opacity-10 grayscale",
                  isProductMode ? "py-16" : "py-24",
                )}
              >
                <IconHash className="size-12 stroke-1" />
                <p className="mt-4 text-xs font-bold">
                  {tasksText.list.noTasks}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Column Footer */}
      {isProductMode ? null : (
        <div className="border-border/20 bg-card flex items-center justify-between border-t px-6 py-3 opacity-40">
          <div className="flex items-center gap-2">
            <div className="bg-primary size-2 animate-pulse rounded-full" />
            <span className="text-[10px] font-bold">
              {common.states.active}
            </span>
          </div>
          <span className="text-[10px] font-bold">
            {status.key.slice(0, 8)}
          </span>
        </div>
      )}
    </div>
  );
}
