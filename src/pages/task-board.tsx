import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconHash,
  IconLayoutGrid,
  IconList,
  IconPlus,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { BoardCard } from "@/components/task/board/board-card";
import { BoardColumn } from "@/components/task/board/board-column";
import { Button } from "@/components/ui/button";
import { common, tasks as tasksText } from "@/constants";
import { queryKeys } from "@/hooks/query-keys";
import { logError } from "@/lib/logger";
import { TaskWithProject, pb } from "@/lib/pocketbase";
import {
  ProjectsResponse,
  TasksRecord,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { TASK_STATUS_CONFIG, TASK_STATUS_ORDER } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";

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

  const visibleStatusKeys = useMemo(() => {
    if (!isProductMode) return TASK_STATUS_ORDER;

    const coreStatuses = new Set<TasksStatusOptions>([
      TasksStatusOptions.todo,
      TasksStatusOptions.in_progress,
      TasksStatusOptions.done,
    ]);

    return TASK_STATUS_ORDER.filter((statusKey) => {
      if (coreStatuses.has(statusKey as TasksStatusOptions)) return true;
      return (columns[statusKey]?.length ?? 0) > 0;
    });
  }, [columns, isProductMode]);

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
    // Optimistic update for instant UI feedback
    onMutate: async ({ id, status, order }) => {
      // Cancel any outgoing refetches
      const queryKey = projectId
        ? [...queryKeys.tasks.all, "project", projectId]
        : queryKeys.tasks.all;
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousTasks =
        queryClient.getQueryData<TaskWithProject[]>(queryKey);

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<TaskWithProject[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((task) => {
            if (task.id === id) {
              return {
                ...task,
                status: status ?? task.status,
                order: order ?? task.order,
              };
            }
            return task;
          });
        });
      }

      // Return a context object with the snapshotted value
      return { previousTasks, queryKey };
    },
    onError: (err, _variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousTasks) {
        queryClient.setQueryData(context.queryKey, context.previousTasks);
      }
      toast.error("Failed to update task position");
      logError("Failed to update task position", err);
    },
    onSettled: (_data, _error, _variables, context) => {
      // Always refetch after error or success
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
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

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={() =>
          navigate(projectId ? `/projects/${projectId}/tasks` : "/tasks")
        }
        className={cn(
          "font-bold",
          isProductMode
            ? "h-8 rounded-lg px-3 text-xs font-semibold"
            : "h-11 px-6",
        )}
      >
        <IconList className="ms-2 size-4" />
        {common.buttons.view}
      </Button>

      <Button
        onClick={() =>
          navigate(
            projectId ? `/projects/${projectId}/tasks/new` : "/tasks/new",
          )
        }
        className={cn(
          "font-bold shadow-sm",
          isProductMode
            ? "h-8 rounded-lg px-3 text-xs font-semibold"
            : "h-11 px-6",
        )}
      >
        <IconPlus className={cn("ms-2 size-5", isProductMode && "size-4")} />
        {tasksText.addTask.buttons.newTask}
      </Button>
    </div>
  );

  return (
    <PageTransition className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "border-b",
          isProductMode
            ? "border-border/40 bg-transparent"
            : "bg-card border-border",
        )}
      >
        <div
          className={cn(
            isProductMode
              ? "w-full px-3"
              : "container mx-auto max-w-7xl px-4 md:px-6",
            isProductMode ? "py-3" : "py-4",
          )}
        >
          <PageHeader
            title={projectId ? project?.name : tasksText.board.title}
            subtitle={
              isProductMode
                ? undefined
                : tasksText.header.tasksFound.replace(
                    "{count}",
                    digitsEnToFa(tasksData.length).toString(),
                  )
            }
            icon={IconLayoutGrid}
            eyebrow={
              isProductMode ? undefined : (
                <div className="text-muted-foreground flex items-center gap-2">
                  <IconHash className="size-4" />
                  <span className="text-xs font-bold tracking-tight">
                    {projectId ? project?.code : common.buttons.all} /{" "}
                    {tasksText.board.title}
                  </span>
                </div>
              )
            }
            actions={headerActions}
            className="mb-0"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          className={cn(
            "scrollbar-none flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden",
            isProductMode
              ? "bg-transparent gap-3 p-3"
              : "bg-muted/30 gap-4 p-4",
          )}
        >
          {visibleStatusKeys.map((statusKey) => (
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
              <div
                className={cn(
                  "border-primary/20 bg-card overflow-hidden rounded-xl border opacity-90 shadow-2xl",
                  isProductMode ? "w-[280px]" : "w-[320px]",
                )}
              >
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
