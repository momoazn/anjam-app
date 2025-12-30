import {
  IconPencil,
  IconTrash,
  IconChevronRight,
  IconHash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tasks } from "@/constants";
import { formatTaskDate } from "@/lib/date-utils";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

export type TaskDetailsHeaderProps = {
  task: TaskWithProject;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

export function TaskDetailsHeader({
  task,
  onBack,
  onEdit,
  onDelete,
  isDeleting,
}: TaskDetailsHeaderProps) {
  const StatusIcon = taskStatusIcons[task.status];
  const PriorityIcon = priorityIcons[task.priority];

  return (
    <Card className="relative mb-8 overflow-hidden p-0">
      <CardContent className="relative z-10 p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 gap-2 rounded-lg px-4 text-xs font-bold transition-all"
          >
            <IconChevronRight className="size-4" />
            {tasks.details.backToList}
          </Button>

          <div className="flex items-center gap-2">
            <div className="bg-muted/50 flex items-center gap-1 rounded-lg border p-1 backdrop-blur-sm">
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

              <div className="bg-border mx-1 h-3 w-px" />

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
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="text-primary/60 flex items-center gap-2">
              <IconHash className="size-4" />
              <span className="text-[10px] font-bold tracking-wider">
                {digitsEnToFa(task.display_id || "TASK-ID")}
              </span>
            </div>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {task.title}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-wider opacity-60">
                  {tasks.details.createdBy}
                </span>
                <span className="text-foreground text-xs font-bold">
                  {task.expand?.creator
                    ? formatUserName(
                        task.expand.creator.first_name,
                        task.expand.creator.last_name,
                        task.expand.creator.username,
                      )
                    : tasks.details.system}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-wider opacity-60">
                  {tasks.details.timestamp}
                </span>
                <span className="text-foreground text-xs font-bold tabular-nums">
                  {digitsEnToFa(formatTaskDate(task.created))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 md:pt-0">
            <Button
              variant="outline"
              onClick={onEdit}
              className="h-11 rounded-lg px-6 text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <IconPencil className="ms-1.5 size-4" />
              {tasks.details.editButton}
            </Button>

            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive hover:bg-destructive/10 h-11 rounded-lg px-6 text-xs font-bold"
            >
              <IconTrash className="ms-1.5 size-4" />
              {isDeleting
                ? tasks.details.buttons.deleting
                : tasks.details.buttons.delete}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
