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
import { useNavigate, useParams } from "react-router-dom";

import { BoardColumn } from "@/components/task/board/board-column";
import { BoardCard } from "@/components/task/board/board-card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { pb, TaskWithProject } from "@/lib/pocketbase";
import { queryKeys } from "@/hooks/query-keys";
import { TASK_STATUS_ORDER, TASK_STATUS_CONFIG } from "@/lib/status-utils";
import { tasks as tasksText } from "@/constants";
import {
  TasksStatusOptions,
  TasksRecord,
  ProjectsResponse,
} from "@/lib/pocketbase-types";
import {
  IconLayoutGrid,
  IconPlus,
  IconList,
  IconHash,
} from "@tabler/icons-react";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const [activeTask, setActiveTask] = useState<TaskWithProject | null>(null);

  // Fetch project details if in project mode
  const { data: project } = useQuery<ProjectsResponse>({
    queryKey: queryKeys.projects.detail(projectId || ""),
    queryFn: () => pb.collection("projects").getOne(projectId || ""),
    enabled: !!projectId,
  });

  // Fetch tasks
  const { data: tasksData = [], isLoading } = useQuery<TaskWithProject[]>({
    queryKey: projectId
      ? [...queryKeys.tasks.all, "project", projectId]
      : queryKeys.tasks.all,
    queryFn: async () => {
      const filter = projectId ? `project = "${projectId}"` : "";
      return await pb.collection("tasks").getFullList({
        sort: "+order,-updated",
        expand: "project,assignee",
        filter,
      });
    },
  });

  const columns = useMemo(() => {
    const cols: Record<string, TaskWithProject[]> = {};
    TASK_STATUS_ORDER.forEach((status) => {
      cols[status] = [];
    });

    tasksData.forEach((task) => {
      const status = task.status || TasksStatusOptions.todo;
      if (cols[status]) {
        cols[status].push(task);
      } else {
        if (!cols[TasksStatusOptions.todo]) cols[TasksStatusOptions.todo] = [];
        cols[TasksStatusOptions.todo].push(task);
      }
    });

    return cols;
  }, [tasksData]);

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

    if (overData?.type === "Column") {
      const targetStatus = overData.status as TasksStatusOptions;
      newStatus = targetStatus;
      const targetTasks = columns[targetStatus] || [];
      if (targetTasks.length > 0) {
        const lastTask = targetTasks[targetTasks.length - 1];
        newOrder = (lastTask.order || 0) + 10000;
      } else {
        newOrder = 10000;
      }
    } else if (overData?.type === "Task") {
      const targetTask = overData.task as TaskWithProject;
      newStatus = targetTask.status;
      const targetTasks = columns[newStatus] || [];
      const overIndex = targetTasks.findIndex((t) => t.id === targetTask.id);
      if (overIndex === -1) return;
      const prevTask = overIndex > 0 ? targetTasks[overIndex - 1] : null;
      const nextTask = targetTask;
      const prevOrder = prevTask
        ? prevTask.order || 0
        : (nextTask.order || 0) - 10000;
      const nextOrder = nextTask.order || 0;
      newOrder = (prevOrder + nextOrder) / 2;
    }

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
      <div className="flex flex-1 items-center justify-center p-24">
        <IconLayoutGrid className="text-primary/20 size-12 animate-pulse" />
      </div>
    );
  }

  return (
    <PageTransition className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Minimal Header */}
      <div className="bg-card border-border border-b">
        <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2">
              <IconHash className="size-4" />
              <span className="text-xs font-bold tracking-tight">
                {projectId ? project?.code : "GLOBAL"} / BOARD
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              {projectId ? project?.name : tasksText.board.title}
            </h1>

            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-5 items-center justify-center rounded-md">
                <IconLayoutGrid className="size-3.5" />
              </div>
              <span className="text-muted-foreground text-xs font-medium">
                {tasksText.header.tasksFound.replace(
                  "{count}",
                  digitsEnToFa(tasksData.length).toString(),
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                navigate(projectId ? `/projects/${projectId}/tasks` : "/tasks")
              }
              className="h-11 px-6 font-bold"
            >
              <IconList className="ms-2 size-4" />
              List View
            </Button>

            <Button
              onClick={() =>
                navigate(
                  projectId ? `/projects/${projectId}/tasks/new` : "/tasks/new",
                )
              }
              className="h-11 px-6 font-bold shadow-sm"
            >
              <IconPlus className="ms-2 size-5" />
              {tasksText.addTask.buttons.newTask}
            </Button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="scrollbar-none bg-muted/30 flex flex-1 gap-4 overflow-x-auto overflow-y-hidden p-4">
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
              <div className="border-primary/20 bg-card w-[320px] overflow-hidden rounded-xl border opacity-90 shadow-2xl">
                <BoardCard task={activeTask} />
              </div>
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </PageTransition>
  );
}
