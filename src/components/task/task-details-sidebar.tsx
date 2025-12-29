import {
  IconPencil,
  IconTrash,
  IconInfoCircle,
  IconActivity,
  IconSettings,
  IconTag,
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
  const tags = task.expand?.tags || [];

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

        <Card className="relative overflow-hidden p-0">
          <CardContent className="relative z-10 space-y-6 p-6">
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

            {tags.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-bold tracking-tight">
                  <IconTag className="size-3" /> Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{
                        backgroundColor: tag.color,
                        color: "#FFFFFF",
                        border: "none",
                      }}
                      className="px-2 py-0 text-[9px] font-bold"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
          </CardContent>
        </Card>
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

        <Card className="relative overflow-hidden p-0">
          <CardContent className="relative z-10 space-y-2 p-4">
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
          </CardContent>
        </Card>
      </section>

      {/* Info Block */}
      <Card className="bg-muted/30 border-dashed p-0">
        <CardContent className="flex flex-col items-center gap-3 p-6">
          <IconInfoCircle className="text-muted-foreground size-6" />
          <div className="space-y-1 text-center">
            <p className="text-muted-foreground text-[10px] font-bold tracking-tight">
              {tasks.details.displayIdLabel}
            </p>
            <p className="font-mono text-xs font-bold">
              {digitsEnToFa(task.display_id)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
