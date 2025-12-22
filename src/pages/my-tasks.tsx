import { useMemo, useState } from "react";
import { User, Plus, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TaskListGroup } from "@/components/task/task-list-group";
import { BulkActionsBar } from "@/components/task/bulk-actions-bar";
import { common, myTasks as myTasksText, tasks } from "@/constants";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import { useBulkUpdateTasks, useBulkDeleteTasks } from "@/hooks/tasks";
import { useAuthUser } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import type { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksStatusOptions,
  TasksPriorityOptions,
} from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/status-utils";
import { TASK_STATUS_CONFIG } from "@/lib/status-utils";
import { isTaskCompleted, isTaskCanceled } from "@/lib/status-utils";

// Loading skeleton
const MyTasksSkeleton = () => (
  <div className="space-y-4">
    {statusOrder.slice(0, 3).map((status) => (
      <Card key={status} className="overflow-hidden">
        <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-6 rounded" />
          </div>
        </div>
        <div className="space-y-2 p-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded" />
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// Empty state
const EmptyState = ({
  message,
  description,
}: {
  message: string;
  description: string;
}) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <User className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="mb-2 text-lg font-semibold">{message}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </CardContent>
  </Card>
);

export default function MyTasks() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("active");

  const { tasks: allTasks, users, isLoadingTasks } = useTasksPageData();

  const bulkUpdate = useBulkUpdateTasks();
  const bulkDelete = useBulkDeleteTasks();

  // Filter tasks assigned to current user
  const myTasksData = useMemo(() => {
    if (!allTasks || !user) return [];
    return allTasks.filter(
      (task) => task.assignee === user.id && !task.deleted_at,
    );
  }, [allTasks, user]);

  // Categorize tasks
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

  // Group tasks by status
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

  // Group by project for alternative view
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

  // Statistics
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

  // Bulk operation handlers
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

  // Generate available statuses from centralized configuration
  const availableStatuses: Array<{ value: TasksStatusOptions; label: string }> =
    Object.values(TASK_STATUS_CONFIG).map((config) => ({
      value: config.key,
      label: config.name,
    }));

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <User className="h-5 w-5 md:h-6 md:w-6" />
            {myTasksText.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {myTasksText.description}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectionMode ? "secondary" : "outline"}
            size="lg"
            onClick={toggleSelectionMode}
            className="gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {selectionMode
              ? common.buttons.cancelSelection
              : common.buttons.multiSelect}
          </Button>
          <Button
            className="gap-2"
            size="lg"
            onClick={() => navigate("/tasks/new")}
          >
            <Plus className="h-4 w-4" />
            {tasks.addTask.buttons.newTask}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">{common.total}</div>
            <div className="text-2xl font-bold">
              {digitsEnToFa(stats.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {myTasksText.stats.active}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {digitsEnToFa(stats.active)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {myTasksText.stats.completed}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {digitsEnToFa(stats.completed)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {myTasksText.stats.overdue}
            </div>
            <div className="text-2xl font-bold text-red-600">
              {digitsEnToFa(stats.overdue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {myTasksText.stats.canceled}
            </div>
            <div className="text-muted-foreground text-2xl font-bold">
              {digitsEnToFa(stats.canceled)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            {myTasksText.tabs.active}
            <Badge variant="secondary" className="ml-2">
              {digitsEnToFa(stats.active)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            {myTasksText.tabs.completed}
            <Badge variant="secondary" className="ml-2">
              {digitsEnToFa(stats.completed)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="by-project">
            {myTasksText.tabs.byProject}
          </TabsTrigger>
        </TabsList>

        {/* Active Tasks Tab */}
        <TabsContent value="active" className="space-y-6">
          {isLoadingTasks ? (
            <MyTasksSkeleton />
          ) : categorizedTasks.active.length === 0 ? (
            <EmptyState
              message={myTasksText.empty.noActiveTasks}
              description={myTasksText.empty.noActiveTasksDescription}
            />
          ) : (
            statusOrder.map((status) => {
              const tasksInGroup = activeGrouped[status] || [];
              if (tasksInGroup.length === 0) return null;

              return (
                <TaskListGroup
                  key={status}
                  taskCount={tasksInGroup.length}
                  status={status}
                  tasks={tasksInGroup}
                  showProject={true}
                  enableSelection={selectionMode}
                  selectedTasks={selectedTasks}
                  onSelectionChange={handleSelectionChange}
                />
              );
            })
          )}
        </TabsContent>

        {/* Completed Tasks Tab */}
        <TabsContent value="completed" className="space-y-6">
          {isLoadingTasks ? (
            <MyTasksSkeleton />
          ) : categorizedTasks.completed.length === 0 ? (
            <EmptyState
              message={myTasksText.empty.noCompletedTasks}
              description={myTasksText.empty.noCompletedTasksDescription}
            />
          ) : (
            statusOrder.map((status) => {
              const tasksInGroup = completedGrouped[status] || [];
              if (tasksInGroup.length === 0) return null;

              return (
                <TaskListGroup
                  key={status}
                  taskCount={tasksInGroup.length}
                  status={status}
                  tasks={tasksInGroup}
                  showProject={true}
                  enableSelection={selectionMode}
                  selectedTasks={selectedTasks}
                  onSelectionChange={handleSelectionChange}
                />
              );
            })
          )}
        </TabsContent>

        {/* By Project Tab */}
        <TabsContent value="by-project" className="space-y-6">
          {isLoadingTasks ? (
            <MyTasksSkeleton />
          ) : tasksByProject.length === 0 ? (
            <EmptyState
              message={myTasksText.empty.noTasks}
              description={myTasksText.empty.noTasksDescription}
            />
          ) : (
            tasksByProject.map((project) => (
              <Card key={project.projectId}>
                <div className="bg-muted/30 border-b px-4 py-3">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span>{project.projectName}</span>
                    <Badge variant="secondary">
                      {digitsEnToFa(project.tasks.length)}
                    </Badge>
                  </h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="hover:bg-muted/50 cursor-pointer p-4 transition-colors"
                        onClick={() =>
                          navigate(
                            `/projects/${project.projectId}/tasks/${task.id}`,
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            {task.deadline && (
                              <p className="text-muted-foreground mt-1 text-sm">
                                {tasks.addTask.deadline}:{" "}
                                {new Date(task.deadline).toLocaleDateString(
                                  "fa-IR",
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {tasks.priority[task.priority]}
                            </Badge>
                            <Badge variant="outline">
                              {tasks.status[task.status]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Bulk Actions Bar */}
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
