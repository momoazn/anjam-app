import { IconPencil, IconTrash, IconInfoCircle } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tasks } from "@/constants";
import { formatTaskDate } from "@/lib/date-utils";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

export type TaskDetailsSidebarProps = {
  task: TaskWithProject;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

export function TaskDetailsSidebar({
  task,
  onEdit,
  onDelete,
  isDeleting,
}: TaskDetailsSidebarProps) {
  const StatusIcon = taskStatusIcons[task.status];
  const PriorityIcon = priorityIcons[task.priority];

  return (
    <div className="space-y-10">
      {/* Quick Status Block */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
            04_Signal_Status
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="bg-card border-border/40 space-y-6 border p-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground/40 text-[10px] font-black tracking-widest uppercase">
              {tasks.details.statusLabel}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-none border-transparent text-[10px] font-black tracking-widest uppercase",
                getStatusColorVariant(task.status, "badge"),
              )}
            >
              <StatusIcon className="ml-1.5 h-3.5 w-3.5" />
              {tasks.status[task.status]}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground/40 text-[10px] font-black tracking-widest uppercase">
              {tasks.details.priorityLabel}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-none border-transparent text-[10px] font-black tracking-widest uppercase",
                priorityColors[task.priority],
              )}
            >
              <PriorityIcon className="ml-1.5 h-3.5 w-3.5" />
              {tasks.priority[task.priority]}
            </Badge>
          </div>

          <div className="bg-border/10 h-px" />

          <div className="space-y-3 text-right">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground/40 mb-1 text-[8px] leading-none font-black tracking-[0.2em] uppercase">
                {tasks.details.createdLabel}
              </span>
              <span className="text-xs font-black tabular-nums">
                {digitsEnToFa(formatTaskDate(task.created))}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground/40 mb-1 text-[8px] leading-none font-black tracking-[0.2em] uppercase">
                {tasks.details.updatedLabel}
              </span>
              <span className="text-xs font-black tabular-nums">
                {digitsEnToFa(formatTaskDate(task.updated))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Operator Actions Block */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
            05_Operator_Actions
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="bg-muted/10 border-border/40 space-y-2 border p-4">
          <Button
            variant="ghost"
            className="text-muted-foreground/60 hover:bg-muted/30 h-11 w-full justify-end gap-3 rounded-none text-[10px] font-black tracking-widest uppercase"
            onClick={onEdit}
          >
            {tasks.details.editTaskButton}
            <IconPencil className="size-4 opacity-40" />
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full justify-end gap-3 rounded-none text-[10px] font-black tracking-widest text-rose-500/60 uppercase hover:bg-rose-500/10 hover:text-rose-500"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {tasks.details.deleteTaskButton}
            <IconTrash className="size-4 opacity-40" />
          </Button>
        </div>
      </section>

      {/* System Integrity Block */}
      <div className="bg-muted/20 border-border/20 flex flex-col items-center gap-3 border-2 border-dashed p-6 opacity-30 grayscale">
        <IconInfoCircle className="size-8 stroke-[1]" />
        <p className="text-center text-[9px] font-black tracking-[0.3em] uppercase">
          Data_Grid :: Integrity_Verified
        </p>
      </div>
    </div>
  );
}
