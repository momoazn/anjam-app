import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  IconHash,
  IconLayoutGrid,
  IconList,
  IconPlus,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
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

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
  duration: 200,
};

const orderStep = 10000;
const statusKeys = TASK_STATUS_ORDER;
const statusKeySet = new Set(statusKeys as string[]);

const buildTaskIdsByStatus = (tasks: TaskWithProject[]) => {
  const buckets: Record<string, TaskWithProject[]> = {};
  statusKeys.forEach((status) => {
    buckets[status] = [];
  });

  tasks.forEach((task) => {
    const status = statusKeySet.has(task.status || "")
      ? (task.status as TasksStatusOptions)
      : TasksStatusOptions.todo;
    buckets[status].push(task);
  });

  const result: Record<string, string[]> = {};
  statusKeys.forEach((status) => {
    const sorted = [...buckets[status]].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
    result[status] = sorted.map((task) => task.id);
  });

  return result;
};

const insertAt = <T,>(items: T[], index: number, item: T) => {
  const next = [...items];
  next.splice(index, 0, item);
  return next;
};

export function TaskBoardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [taskIdsByStatus, setTaskIdsByStatus] = useState<
    Record<string, string[]>
  >(() => buildTaskIdsByStatus([]));
  const lastOverIdRef = useRef<string | null>(null);

  const taskQueryKey = useMemo(
    () =>
      projectId
        ? [...queryKeys.tasks.all, "project", projectId]
        : queryKeys.tasks.all,
    [projectId],
  );

  const { data: project } = useQuery<ProjectsResponse>({
    queryKey: queryKeys.projects.detail(projectId || ""),
    queryFn: () => pb.collection("projects").getOne(projectId || ""),
    enabled: !!projectId,
  });

  const { data: tasksData = [], isLoading } = useQuery<TaskWithProject[]>({
    queryKey: taskQueryKey,
    queryFn: async () => {
      const filter = projectId ? `project = "${projectId}"` : "";
      return await pb.collection("tasks").getFullList({
        sort: "+order,-updated",
        expand: "project,assignee",
        filter,
      });
    },
  });

  const tasksById = useMemo(() => {
    const map: Record<string, TaskWithProject> = {};
    tasksData.forEach((task) => {
      map[task.id] = task;
    });
    return map;
  }, [tasksData]);

  const initialTaskIdsByStatus = useMemo(
    () => buildTaskIdsByStatus(tasksData),
    [tasksData],
  );

  const taskIdToStatus = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(taskIdsByStatus).forEach(([status, ids]) => {
      ids.forEach((id) => {
        map[id] = status;
      });
    });
    return map;
  }, [taskIdsByStatus]);

  const activeTask = activeId ? tasksById[activeId] : null;

  const getStatusForId = (id: string | null) => {
    if (!id) return null;
    if (statusKeySet.has(id)) return id;
    return taskIdToStatus[id] ?? null;
  };

  const getOrderForIndex = (ids: string[], index: number) => {
    const prevId = ids[index - 1];
    const nextId = ids[index + 1];
    const prevOrder = prevId ? tasksById[prevId]?.order : null;
    const nextOrder = nextId ? tasksById[nextId]?.order : null;

    if (prevOrder !== null && nextOrder !== null) {
      if (prevOrder === nextOrder) {
        return prevOrder + orderStep;
      }
      return (prevOrder + nextOrder) / 2;
    }
    if (prevOrder !== null) return prevOrder + orderStep;
    if (nextOrder !== null) return nextOrder - orderStep;
    return orderStep;
  };

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
    onMutate: async ({ id, status, order }) => {
      await queryClient.cancelQueries({ queryKey: taskQueryKey });
      const previousTasks =
        queryClient.getQueryData<TaskWithProject[]>(taskQueryKey);

      if (previousTasks) {
        queryClient.setQueryData<TaskWithProject[]>(taskQueryKey, (old) => {
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

      return { previousTasks };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskQueryKey, context.previousTasks);
      }
      toast.error("Failed to update task position");
      logError("Failed to update task position", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKey });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id ? String(over.id) : null;
    if (!overId) return;

    lastOverIdRef.current = overId;

    const activeIdValue = String(active.id);
    if (activeIdValue === overId) return;

    const activeStatus = getStatusForId(activeIdValue);
    const overStatus = getStatusForId(overId);
    if (!activeStatus || !overStatus) return;

    if (activeStatus === overStatus) {
      if (statusKeySet.has(overId)) return;
      setTaskIdsByStatus((prev) => {
        const columnIds = prev[activeStatus];
        const oldIndex = columnIds.indexOf(activeIdValue);
        const newIndex = columnIds.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return {
          ...prev,
          [activeStatus]: arrayMove(columnIds, oldIndex, newIndex),
        };
      });
      return;
    }

    setTaskIdsByStatus((prev) => {
      const activeItems = prev[activeStatus] ?? [];
      const overItems = prev[overStatus] ?? [];
      const activeIndex = activeItems.indexOf(activeIdValue);
      if (activeIndex === -1) return prev;

      const nextActiveItems = activeItems.filter((id) => id !== activeIdValue);
      const cleanedOverItems = overItems.filter((id) => id !== activeIdValue);
      const overIndex = cleanedOverItems.indexOf(overId);
      const newIndex =
        statusKeySet.has(overId) || overIndex === -1
          ? cleanedOverItems.length
          : overIndex;

      return {
        ...prev,
        [activeStatus]: nextActiveItems,
        [overStatus]: insertAt(cleanedOverItems, newIndex, activeIdValue),
      };
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeIdValue = String(active.id);
    const overId = over?.id ? String(over.id) : lastOverIdRef.current;

    setActiveId(null);
    lastOverIdRef.current = null;

    if (!overId) {
      setTaskIdsByStatus(initialTaskIdsByStatus);
      return;
    }

    const currentStatus = getStatusForId(activeIdValue);
    if (!currentStatus) return;

    const currentIds = taskIdsByStatus[currentStatus] || [];
    const newIndex = currentIds.indexOf(activeIdValue);
    if (newIndex === -1) return;

    const originalTask = tasksById[activeIdValue];
    if (!originalTask) return;

    const newOrder = getOrderForIndex(currentIds, newIndex);
    const needsUpdate =
      currentStatus !== originalTask.status ||
      Math.abs(newOrder - (originalTask.order || 0)) > 0.0001;

    if (needsUpdate) {
      updateTaskPosition.mutate({
        id: originalTask.id,
        status: currentStatus as TasksStatusOptions,
        order: newOrder,
      });
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
    lastOverIdRef.current = null;
    setTaskIdsByStatus(initialTaskIdsByStatus);
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
        className="h-8 rounded-lg px-3 text-xs font-semibold"
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
        className="h-8 rounded-lg px-3 text-xs font-semibold shadow-sm"
      >
        <IconPlus className="ms-2 size-4" />
        {tasksText.addTask.buttons.newTask}
      </Button>
    </div>
  );

  return (
    <PageTransition className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border/40 bg-transparent">
        <div className="w-full px-3 py-3">
          <PageHeader
            title={projectId ? project?.name : tasksText.board.title}
            subtitle={undefined}
            icon={IconLayoutGrid}
            eyebrow={
              <div className="text-muted-foreground flex items-center gap-2">
                <IconHash className="size-4" />
                <span className="text-xs font-bold tracking-tight">
                  {projectId ? project?.code : common.buttons.all} /{" "}
                  {tasksText.board.title}
                </span>
              </div>
            }
            actions={headerActions}
            className="mb-0"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="scrollbar-none flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden bg-transparent p-3">
          {statusKeys.map((statusKey) => {
            const taskIds = taskIdsByStatus[statusKey] || [];
            const tasks = taskIds.map((id) => tasksById[id]).filter(Boolean);

            return (
              <BoardColumn
                key={statusKey}
                status={TASK_STATUS_CONFIG[statusKey]}
                tasks={tasks}
              />
            );
          })}
        </div>

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <div
                className="border-primary/20 bg-card w-[280px] overflow-hidden rounded-xl border shadow-2xl"
                style={{
                  opacity: 0.95,
                  viewTransitionName: `task-${activeTask.id}`,
                }}
              >
                <BoardCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </PageTransition>
  );
}
