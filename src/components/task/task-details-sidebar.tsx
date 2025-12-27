import {
  IconPencil,
  IconTrash,
  IconInfoCircle,
  IconActivity,
  IconSettings,
} from "@tabler/icons-react";

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
    <div className="space-y-8">
      {/* Quick Status Block */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <IconActivity className="size-4" />
          </div>
          <span className="text-xs font-bold tracking-tight">
            {tasks.details.quickInfoCardTitle}
          </span>
        </div>

        <div className="bg-card relative overflow-hidden rounded-xl border p-6 shadow-sm">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {tasks.details.statusLabel}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md border-transparent px-2.5 py-0.5 text-xs font-bold",
                  getStatusColorVariant(task.status, "badge"),
                )}
              >
                <StatusIcon className="ms-1.5 h-3.5 w-3.5" />
                {tasks.status[task.status]}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {tasks.details.priorityLabel}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md border-transparent px-2.5 py-0.5 text-xs font-bold",
                  priorityColors[task.priority],
                )}
              >
                <PriorityIcon className="ms-1.5 h-3.5 w-3.5" />
                {tasks.priority[task.priority]}
              </Badge>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  {tasks.details.createdLabel}
                </span>
                <span className="font-bold">
                  {digitsEnToFa(formatTaskDate(task.created))}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  {tasks.details.updatedLabel}
                </span>
                <span className="text-primary font-bold">
                  {digitsEnToFa(formatTaskDate(task.updated))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operator Actions Block */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <IconSettings className="size-4" />
          </div>
          <span className="text-xs font-bold tracking-tight">
            {tasks.details.actionsCardTitle}
          </span>
        </div>

        <div className="bg-card relative overflow-hidden rounded-xl border p-4 shadow-sm">
          <div className="relative z-10 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg text-xs font-bold transition-all"
              onClick={onEdit}
            >
              <IconPencil className="size-4" />
              {tasks.details.editTaskButton}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3 rounded-lg text-xs font-bold transition-all"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <IconTrash className="size-4" />
              {isDeleting
                ? tasks.details.buttons.deleting
                : tasks.details.buttons.delete}
            </Button>
          </div>
        </div>
      </section>

      {/* Info Block */}
      <div className="bg-muted/30 rounded-xl border border-dashed p-6">
        <div className="flex flex-col items-center gap-3">
          <IconInfoCircle className="text-muted-foreground size-6" />
          <div className="space-y-1 text-center">
            <p className="text-muted-foreground text-[10px] font-bold tracking-tight">
              {tasks.details.displayIdLabel}
            </p>
            <p className="font-mono text-xs font-bold">
              {digitsEnToFa(task.display_id)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
