import { ArrowLeft, Loader2 } from "lucide-react";

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
import { formatUserName } from "@/lib/utils";
import type { TaskWithProject } from "@/lib/pocketbase";

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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>Created</span>
            <span>{formatTaskDate(task.created)}</span>
            {task.expand?.creator && (
              <>
                <span>•</span>
                <span>by</span>
                <span>
                  {formatUserName(
                    task.expand.creator.first_name,
                    task.expand.creator.last_name,
                    task.expand.creator.username,
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="default"
          className={getStatusColorVariant(task.status, "badge")}
        >
          <StatusIcon className="mr-1 h-3 w-3" />
          {tasks.status[task.status]}
        </Badge>
        <Badge
          variant="outline"
          className={`${priorityColors[task.priority]} border-current`}
        >
          <PriorityIcon className="mr-1 h-3 w-3" />
          {tasks.priority[task.priority]}
        </Badge>
        <Button size="sm" variant="outline" onClick={onEdit}>
          {tasks.details.editButton}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isDeleting
            ? tasks.details.buttons.deleting
            : tasks.details.buttons.delete}
        </Button>
      </div>
    </div>
  );
}
