import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { tasks } from "@/constants";
import { formatTaskDate } from "@/lib/date-utils";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import type { TaskWithProject } from "@/lib/pocketbase";

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tasks.details.quickInfoCardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {tasks.details.statusLabel}
            </span>
            <Badge
              variant="default"
              className={getStatusColorVariant(task.status, "badge")}
            >
              <StatusIcon className="mr-1 h-3 w-3" />
              {tasks.status[task.status]}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {tasks.details.priorityLabel}
            </span>
            <Badge
              variant="outline"
              className={`${priorityColors[task.priority]} border-current`}
            >
              <PriorityIcon className="mr-1 h-3 w-3" />
              {tasks.priority[task.priority]}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {tasks.details.createdLabel}
            </span>
            <span>{formatTaskDate(task.created)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {tasks.details.updatedLabel}
            </span>
            <span>{formatTaskDate(task.updated)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tasks.details.actionsCardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onEdit}
          >
            <Pencil className="ml-2 h-4 w-4" />
            {tasks.details.editTaskButton}
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground w-full justify-start"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="ml-2 h-4 w-4" />
            {tasks.details.deleteTaskButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
