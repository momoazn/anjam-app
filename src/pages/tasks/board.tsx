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
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { BoardCard } from "@/components/task/board/board-card";
import { BoardColumn } from "@/components/task/board/board-column";
import { Button } from "@/components/ui/button";
import { common, tasks as tasksText } from "@/constants";
import { useAllTasks, useProject, useReorderTask } from "@/hooks";
import { TASK_STATUS_CONFIG, TASK_STATUS_ORDER } from "@/lib/status-utils";
import { useOpenModal } from "@/store/modal-store";
import type { TaskStatus, TaskWithProject } from "@/types/tasks";

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
const statusKeySet = new Set<TaskStatus>(statusKeys);

const buildTaskIdsByStatus = (tasks: TaskWithProject[]) => {
  const buckets: Record<TaskStatus, TaskWithProject[]> = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
    cancelled: [],
  };
  statusKeys.forEach((status) => {
    buckets[status] = [];
  });

  tasks.forEach((task) => {
    const candidate = task.status ?? "todo";
    const status = statusKeySet.has(candidate) ? candidate : "todo";
    buckets[status].push(task);
  });

  const result: Record<TaskStatus, string[]> = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
    cancelled: [],
  };
  statusKeys.forEach((status) => {
    const sorted = [...buckets[status]].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
    result[status] = sorted.map((task) => task._id);
  });

  return result;
};

const insertAt = <T,>(items: T[], index: number, item: T) => {
  const next = [...items];
  next.splice(index, 0, item);
  return next;
};

export function TaskBoardPage() {
  const navigate = useNavigate();
  const openModal = useOpenModal();
  const { id: projectId } = useParams<{ id: string }>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [taskIdsByStatus, setTaskIdsByStatus] = useState<
    Record<TaskStatus, string[]>
  >(() => buildTaskIdsByStatus([]));
  const lastOverIdRef = useRef<string | null>(null);
  const lastSyncedTasksKeyRef = useRef<string | null>(null);

  const { data: project } = useProject({
    id: projectId,
    enabled: !!projectId,
  });

  const { data: tasksData = [], isLoading } = useAllTasks({
    projectId,
    enabled: true,
  });

  const tasksDataKey = useMemo(() => {
    if (!tasksData || tasksData.length === 0) return "empty";
    // Only include fields that affect board rendering/order.
    return tasksData
      .map((t) => `${t._id}:${t.status ?? ""}:${t.order ?? ""}`)
      .sort()
      .join("|");
  }, [tasksData]);

  useEffect(() => {
    if (isDragging) return;
    if (lastSyncedTasksKeyRef.current === tasksDataKey) return;

    lastSyncedTasksKeyRef.current = tasksDataKey;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTaskIdsByStatus(buildTaskIdsByStatus(tasksData));
  }, [tasksData, tasksDataKey, isDragging]);

  const tasksById = useMemo(() => {
    const map: Record<string, (typeof tasksData)[number]> = {};
    tasksData.forEach((task) => {
      map[task._id] = task;
    });
    return map;
  }, [tasksData]);
  const initialTaskIdsByStatus = useMemo(
    () => buildTaskIdsByStatus(tasksData),
    [tasksData],
  );

  const taskIdToStatus = useMemo(() => {
    const map: Record<string, TaskStatus> = {};
    Object.entries(taskIdsByStatus).forEach(([status, ids]) => {
      ids.forEach((id) => {
        map[id] = status as TaskStatus;
      });
    });
    return map;
  }, [taskIdsByStatus]);

  const activeTask = activeId ? tasksById[activeId] : null;

  const getStatusForId = (id: string | null): TaskStatus | null => {
    if (!id) return null;
    if (statusKeySet.has(id as TaskStatus)) return id as TaskStatus;
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

  const { mutate: updateTaskPosition } = useReorderTask();

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
    setIsDragging(true);
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
      if (statusKeySet.has(overId as TaskStatus)) return;
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

      const nextActiveItems = activeItems.filter(
        (id: string) => id !== activeIdValue,
      );
      const cleanedOverItems = overItems.filter(
        (id: string) => id !== activeIdValue,
      );
      const overIndex = cleanedOverItems.indexOf(overId);
      const newIndex =
        statusKeySet.has(overId as TaskStatus) || overIndex === -1
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
    setIsDragging(false);
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
      updateTaskPosition({
        taskId: originalTask.id ?? originalTask._id,
        status: currentStatus,
        order: newOrder,
      });
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
    setIsDragging(false);
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
          openModal("create-task", projectId ? { projectId } : undefined)
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
                className="border-primary/20 bg-card w-70 overflow-hidden rounded-xl border shadow-2xl"
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

export default TaskBoardPage;
