import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { BoardColumn } from "@/components/task/board/board-column";
import { BoardCard } from "@/components/task/board/board-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pb, TaskWithProject } from "@/lib/pocketbase";
import { queryKeys } from "@/hooks/query-keys";
import { TASK_STATUS_ORDER, TASK_STATUS_CONFIG } from "@/lib/status-utils";
import { fa } from "@/constants/text";
import { TasksStatusOptions, TasksRecord } from "@/lib/pocketbase-types";
import { Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";

// Custom drop animation
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export function TaskBoardPage() {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<TaskWithProject | null>(null);

  // Fetch all tasks with specific order sort priority
  const { data: tasks = [], isLoading } = useQuery<TaskWithProject[]>({
    queryKey: queryKeys.tasks.all,
    queryFn: async () => {
      // Sort by order ascending, then updated descending (as fallback)
      return await pb.collection("tasks").getFullList({
        sort: "+order,-updated",
        expand: "project,assignee",
      });
    },
  });

  // Organize tasks by status
  const columns = useMemo(() => {
    const cols: Record<string, TaskWithProject[]> = {};
    TASK_STATUS_ORDER.forEach((status) => {
      cols[status] = [];
    });

    tasks.forEach((task) => {
      const status = task.status || TasksStatusOptions.todo;
      if (cols[status]) {
        cols[status].push(task);
      } else {
        if (!cols[TasksStatusOptions.todo]) cols[TasksStatusOptions.todo] = [];
        cols[TasksStatusOptions.todo].push(task);
      }
    });

    return cols;
  }, [tasks]);

  const updateTaskPosition = useMutation({
    mutationFn: async ({
      id,
      status,
      order,
    }: {
      id: string;
      status?: TasksStatusOptions;
      order?: number;
    }) => {
      const data: Partial<TasksRecord> = {};
      if (status) data.status = status;
      if (order !== undefined) data.order = order;
      return await pb.collection("tasks").update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      // ToAvoid spamming toast on every drag, maybe disable or use a subtle indicator?
      // Keeping it for now for feedback.
      // toast.success("Task updated");
    },
    onError: (err) => {
      toast.error("Failed to update task position");
      console.error(err);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;
    if (active.id === over.id) return;

    const activeTaskData = active.data.current?.task as TaskWithProject;
    const overData = over.data.current;

    let newStatus = activeTaskData.status;
    let newOrder = activeTaskData.order || 0;

    // Logic to calculate new Order
    if (overData?.type === "Column") {
      // Dropped on a column (empty space or specifically the column container)
      const targetStatus = overData.status as TasksStatusOptions;
      newStatus = targetStatus;

      const targetTasks = columns[targetStatus] || [];
      if (targetTasks.length > 0) {
        // Append to end
        const lastTask = targetTasks[targetTasks.length - 1];
        // Use a gap of 10000 to allow future insertions
        newOrder = (lastTask.order || 0) + 10000;
      } else {
        // Empty column, start fresh
        newOrder = 10000;
      }
    } else if (overData?.type === "Task") {
      // Dropped on another task
      const targetTask = overData.task as TaskWithProject;
      newStatus = targetTask.status;

      const targetTasks = columns[newStatus] || [];
      const overIndex = targetTasks.findIndex((t) => t.id === targetTask.id);

      if (overIndex === -1) return; // Should not happen

      // Determine if we are placing BEFORE or AFTER the target
      // This is tricky without rects from DragEndEvent, but generally dropping "on" a sortable item
      // usually implies taking its position (inserting before).
      // However, if we come from "above", we might want to be "after".
      // A simple heuristic: Insert BEFORE targetTask.

      const prevTask = overIndex > 0 ? targetTasks[overIndex - 1] : null;
      const nextTask = targetTask;

      // If we are moving within the same column and moving DOWN,
      // 'active' is visually before 'over', so if we drop 'over', we want to be AFTER 'over'.
      // But standard implementation: Always insert between prev and next.
      // If same column:
      if (activeTaskData.status === newStatus) {
        // This is complex because 'tasks' still has old order.
        // Let's rely on simple average logic assuming insertion at 'overIndex'.
        // If activeIndex < overIndex (moving down), we probably want to place after.
        // But let's simplify: Always place relative to target.
      }

      // Calculation:
      const prevOrder = prevTask
        ? prevTask.order || 0
        : (nextTask.order || 0) - 10000;
      const nextOrder = nextTask.order || 0;

      newOrder = (prevOrder + nextOrder) / 2;
    }

    // Only update if changed
    if (
      newStatus !== activeTaskData.status ||
      Math.abs(newOrder - (activeTaskData.order || 0)) > 0.0001
    ) {
      updateTaskPosition.mutate({
        id: activeTaskData.id,
        status: newStatus,
        order: newOrder,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {fa.tasks.board.title}
          </h1>
          <Badge variant="outline" className="hidden sm:flex">
            {tasks.length} {fa.common.total}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              {fa.tasks.addTask.buttons.newTask}
            </Link>
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto p-4 lg:p-6">
          {TASK_STATUS_ORDER.map((statusKey) => (
            <BoardColumn
              key={statusKey}
              status={TASK_STATUS_CONFIG[statusKey]}
              tasks={columns[statusKey] || []}
            />
          ))}
        </div>

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask && (
              <div className="w-[280px]">
                <BoardCard task={activeTask} />
              </div>
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );
}
