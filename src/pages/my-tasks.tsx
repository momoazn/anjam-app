import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BulkActionsBar } from "@/components/task/bulk-actions-bar";
import { MyTasksHeader } from "@/components/task/my-tasks-header";
import { MyTasksStats } from "@/components/task/my-tasks-stats";
import { MyTasksTabs } from "@/components/task/my-tasks-tabs";
import { PageTransition } from "@/components/page-transition";
import { common } from "@/constants";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import { useBulkDeleteTasks, useBulkUpdateTasks } from "@/hooks/tasks";
import type { TaskWithProject } from "@/lib/pocketbase";
import type {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import {
  isTaskCanceled,
  isTaskCompleted,
  TASK_STATUS_CONFIG,
} from "@/lib/status-utils";
import { useAuthUser } from "@/store/auth-store";

export default function MyTasks() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("active");

  const { tasks: allTasks, users, isLoadingTasks } = useTasksPageData();

  const bulkUpdate = useBulkUpdateTasks();
  const bulkDelete = useBulkDeleteTasks();

  const myTasksData = useMemo(() => {
    if (!user) return [];
    return allTasks.filter(
      (task) => task.assignee === user.id && !task.deleted_at,
    );
  }, [allTasks, user]);

  const categorizedTasks = useMemo(() => {
    const active: TaskWithProject[] = [];
    const completed: TaskWithProject[] = [];
    const canceled: TaskWithProject[] = [];

    myTasksData.forEach((task) => {
      if (isTaskCompleted(task)) {
        completed.push(task);
      } else if (isTaskCanceled(task)) {
        canceled.push(task);
      } else {
        active.push(task);
      }
    });

    return { active, completed, canceled };
  }, [myTasksData]);

  const groupTasksByStatus = (tasks: TaskWithProject[]) => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<TasksStatusOptions, TaskWithProject[]>,
    );
  };

  const activeGrouped = useMemo(
    () => groupTasksByStatus(categorizedTasks.active),
    [categorizedTasks.active],
  );

  const completedGrouped = useMemo(
    () => groupTasksByStatus(categorizedTasks.completed),
    [categorizedTasks.completed],
  );

  const tasksByProject = useMemo(() => {
    const grouped = new Map<
      string,
      { projectName: string; tasks: TaskWithProject[] }
    >();

    myTasksData.forEach((task) => {
      if (!task.expand?.project) return;

      const projectId = task.project;
      const projectName = task.expand.project.name || common.messages.noName;

      if (!grouped.has(projectId)) {
        grouped.set(projectId, { projectName, tasks: [] });
      }

      grouped.get(projectId)!.tasks.push(task);
    });

    return Array.from(grouped.entries()).map(([projectId, data]) => ({
      projectId,
      projectName: data.projectName,
      tasks: data.tasks,
    }));
  }, [myTasksData]);

  const stats = useMemo(() => {
    return {
      total: myTasksData.length,
      active: categorizedTasks.active.length,
      completed: categorizedTasks.completed.length,
      canceled: categorizedTasks.canceled.length,
      overdue: categorizedTasks.active.filter((task) => {
        if (!task.deadline) return false;
        return new Date(task.deadline) < new Date();
      }).length,
    };
  }, [myTasksData, categorizedTasks]);

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedTasks);
    setSelectedTasks([]);
    setSelectionMode(false);
  };

  const handleBulkAssign = async (assigneeId: string) => {
    await bulkUpdate.mutateAsync({
      ids: selectedTasks,
      updates: { assignee: assigneeId },
    });
    setSelectedTasks([]);
  };

  const handleBulkStatus = async (status: TasksStatusOptions) => {
    await bulkUpdate.mutateAsync({
      ids: selectedTasks,
      updates: { status },
    });
    setSelectedTasks([]);
  };

  const handleBulkPriority = async (priority: TasksPriorityOptions) => {
    await bulkUpdate.mutateAsync({
      ids: selectedTasks,
      updates: { priority },
    });
    setSelectedTasks([]);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTasks([]);
  };

  const handleSelectionChange = (taskIds: string[]) => {
    setSelectedTasks(taskIds);
  };

  const availableStatuses: Array<{ value: TasksStatusOptions; label: string }> =
    Object.values(TASK_STATUS_CONFIG).map((config) => ({
      value: config.key,
      label: config.name,
    }));

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <MyTasksHeader
        selectionMode={selectionMode}
        onToggleSelection={toggleSelectionMode}
        onCreateTask={() => navigate("/tasks/new")}
      />

      <MyTasksStats stats={stats} />

      <MyTasksTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoadingTasks}
        stats={stats}
        activeGrouped={activeGrouped}
        completedGrouped={completedGrouped}
        categorizedActive={categorizedTasks.active}
        categorizedCompleted={categorizedTasks.completed}
        tasksByProject={tasksByProject}
        selectionMode={selectionMode}
        selectedTasks={selectedTasks}
        onSelectionChange={handleSelectionChange}
        onProjectTaskClick={(projectId, taskId) =>
          navigate(`/projects/${projectId}/tasks/${taskId}`)
        }
      />

      {selectionMode && selectedTasks.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTasks.length}
          onClearSelection={() => setSelectedTasks([])}
          onBulkDelete={handleBulkDelete}
          onBulkAssign={handleBulkAssign}
          onBulkStatus={handleBulkStatus}
          onBulkPriority={handleBulkPriority}
          users={users || []}
          availableStatuses={availableStatuses}
        />
      )}
    </PageTransition>
  );
}
