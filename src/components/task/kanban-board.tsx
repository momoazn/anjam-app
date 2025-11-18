import { useMemo } from "react";
import type {
  TasksResponse,
  StatusConfigsResponse,
} from "@/lib/pocketbase-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTaskStatus } from "@/lib/status-utils";
import { formatTimeSpent } from "@/lib/time-utils";
import { formatUserName } from "@/lib/utils";
import { text } from "@/constants/text";
import { Link } from "react-router-dom";

interface KanbanBoardProps {
  tasks: TasksResponse<{
    status_config?: StatusConfigsResponse;
    assignee?: {
      first_name: string;
      last_name: string;
      username: string;
    };
  }>[];
  projectId?: string;
}

interface KanbanColumn {
  key: string;
  name: string;
  color: string;
  tasks: TasksResponse<{
    status_config?: StatusConfigsResponse;
    assignee?: {
      first_name: string;
      last_name: string;
      username: string;
    };
  }>[];
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const columns = useMemo(() => {
    // Group tasks by status
    const statusMap = new Map<string, KanbanColumn>();

    tasks.forEach((task) => {
      const status = getTaskStatus(task);

      if (!statusMap.has(status.key)) {
        statusMap.set(status.key, {
          key: status.key,
          name: status.name,
          color: status.color,
          tasks: [],
        });
      }

      statusMap.get(status.key)!.tasks.push(task);
    });

    // Sort tasks within each column by order
    statusMap.forEach((column) => {
      column.tasks.sort((a, b) => a.order - b.order);
    });

    return Array.from(statusMap.values());
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">{text.task.noTasks}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.key} className="min-w-[300px] flex-shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {column.name}
                </CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {column.tasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2 pr-4">
                  {column.tasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      projectId={projectId}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

interface KanbanCardProps {
  task: TasksResponse<{
    status_config?: StatusConfigsResponse;
    assignee?: {
      first_name: string;
      last_name: string;
      username: string;
    };
  }>;
  projectId?: string;
}

function KanbanCard({ task, projectId }: KanbanCardProps) {
  const taskUrl = projectId
    ? `/projects/${projectId}/tasks/${task.id}`
    : `/tasks/${task.id}`;

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <Link to={taskUrl}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Task ID and Priority */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-mono text-xs">
                {task.display_id}
              </span>
              <Badge
                variant="outline"
                className={priorityColors[task.priority]}
              >
                {text.priority[task.priority]}
              </Badge>
            </div>

            {/* Task Title */}
            <h4 className="line-clamp-2 text-sm leading-tight font-medium">
              {task.title}
            </h4>

            {/* Task Meta */}
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              {task.expand?.assignee && (
                <span className="truncate">
                  {formatUserName(
                    task.expand.assignee.first_name,
                    task.expand.assignee.last_name,
                    task.expand.assignee.username,
                  )}
                </span>
              )}
              {task.time_spent_minutes > 0 && (
                <>
                  <span>•</span>
                  <span>{formatTimeSpent(task.time_spent_minutes)}</span>
                </>
              )}
            </div>

            {/* Deadline */}
            {task.deadline && (
              <div className="text-muted-foreground text-xs">
                {text.common.deadline}:{" "}
                {new Date(task.deadline).toLocaleDateString("fa-IR")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
