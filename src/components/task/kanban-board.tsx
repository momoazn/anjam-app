import { useMemo, useState } from "react";
import type { TasksResponse } from "@/lib/pocketbase-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTaskStatus } from "@/lib/status-utils";
import { formatTimeSpent } from "@/lib/time-utils";
import { formatUserName } from "@/lib/utils";
import { text } from "@/constants/text";
import { Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanBoardProps {
  tasks: TasksResponse<{
    assignee?: {
      first_name: string;
      last_name: string;
      username: string;
    };
  }>[];
  projectId?: string;
  onTaskReorder?: (
    taskId: string,
    newOrder: number,
    statusKey: string,
  ) => Promise<void>;
}

interface KanbanColumn {
  key: string;
  name: string;
  color: string;
  tasks: TasksResponse<{
    assignee?: {
      first_name: string;
      last_name: string;
      username: string;
    };
  }>[];
}

export function KanbanBoard({
  tasks,
  projectId,
  onTaskReorder,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch
        tolerance: 8,
      },
    }),
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    // Find which column the task belongs to
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const status = getTaskStatus(activeTask);
    const column = columns.find((c) => c.key === status.key);
    if (!column) return;

    // Find the new order based on position in the column
    const oldIndex = column.tasks.findIndex((t) => t.id === active.id);
    const newIndex = column.tasks.findIndex((t) => t.id === over.id);

    if (oldIndex === newIndex) return;

    // Calculate new order value
    // We'll use a simple approach: set order to the index position
    const newOrder = newIndex;

    // Call the callback if provided
    if (onTaskReorder) {
      await onTaskReorder(active.id as string, newOrder, status.key);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
                  <SortableContext
                    items={column.tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 pr-4">
                      {column.tasks.map((task) => (
                        <SortableKanbanCard
                          key={task.id}
                          task={task}
                          projectId={projectId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <KanbanCard task={activeTask} projectId={projectId} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableKanbanCardProps {
  task: TasksResponse<{
    assignee?: {
      first_name: string;
      last_name: string;
      username: string;
    };
  }>;
  projectId?: string;
}

function SortableKanbanCard({ task, projectId }: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard task={task} projectId={projectId} />
    </div>
  );
}

interface KanbanCardProps {
  task: TasksResponse<{
    assignee?: {
      first_name: string;
      last_name: string;
      username: string;
    };
  }>;
  projectId?: string;
  isDragOverlay?: boolean;
}

function KanbanCard({ task, projectId, isDragOverlay }: KanbanCardProps) {
  const taskUrl = projectId
    ? `/projects/${projectId}/tasks/${task.id}`
    : `/tasks/${task.id}`;

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const cardContent = (
    <Card
      className={`transition-shadow ${!isDragOverlay ? "cursor-grab hover:shadow-md active:cursor-grabbing" : "shadow-lg"}`}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Task ID and Priority */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-mono text-xs">
              {task.display_id}
            </span>
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {text.tasks.priority[task.priority]}
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
  );

  // If it's a drag overlay, just return the card without Link
  if (isDragOverlay) {
    return cardContent;
  }

  // Otherwise, wrap in Link for navigation
  return <Link to={taskUrl}>{cardContent}</Link>;
}
