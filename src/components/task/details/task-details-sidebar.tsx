import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconActivity, IconTag } from "@tabler/icons-react";

import { TagChip } from "@/components/task/task-meta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { tasks } from "@/constants";
import { formatTaskDate } from "@/lib/date-utils";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { Task } from "@/types/tasks";

interface TaskWithDetails extends Task {
  tagsData?: Array<{
    _id: string;
    name: string;
    color?: string;
  }>;
}

type TaskDetailsSidebarProps = {
  task: TaskWithDetails;
};

export function TaskDetailsSidebar({ task }: TaskDetailsSidebarProps) {
  const StatusIcon =
    taskStatusIcons[task.status as keyof typeof taskStatusIcons] ||
    taskStatusIcons.todo;
  const PriorityIcon =
    priorityIcons[task.priority as keyof typeof priorityIcons] ||
    priorityIcons.medium;
  const tags = task.tagsData || [];

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
          <CardContent className="relative z-10 space-y-5 p-5">
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
                {tasks.status[task.status as keyof typeof tasks.status]}
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
                  priorityColors[task.priority as keyof typeof priorityColors],
                )}
              >
                <PriorityIcon className="ms-1.5 h-3.5 w-3.5" />
                {tasks.priority[task.priority as keyof typeof tasks.priority]}
              </Badge>
            </div>

            {tags.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <IconTag className="size-3" /> {tasks.details.tags}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <TagChip key={tag._id} name={tag.name} color={tag.color} />
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
                  {digitsEnToFa(
                    formatTaskDate(task.createdAt ?? task._creationTime),
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  {tasks.details.updatedLabel}
                </span>
                <span className="font-bold">
                  {digitsEnToFa(
                    formatTaskDate(
                      task.updatedAt ?? task.createdAt ?? task._creationTime,
                    ),
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
