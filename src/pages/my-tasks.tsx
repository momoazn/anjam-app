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
import { text } from "@/constants/text";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import { useBulkUpdateTasks, useBulkDeleteTasks } from "@/hooks/tasks";
import { useAuthUser } from "@/store/auth-store";
import type { TaskWithProject } from "@/lib/pocketbase";
import type {
  TasksStatusOptions,
  TasksPriorityOptions,
} from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";
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
  const myTasks = useMemo(() => {
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

    myTasks.forEach((task) => {
      if (isTaskCompleted(task)) {
        completed.push(task);
      } else if (isTaskCanceled(task)) {
        canceled.push(task);
      } else {
        active.push(task);
      }
    });

    return { active, completed, canceled };
  }, [myTasks]);

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

    myTasks.forEach((task) => {
      if (!task.expand?.project) return;

      const projectId = task.project;
      const projectName =
        task.expand.project.title || fa.common.messages.noName;

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
  }, [myTasks]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: myTasks.length,
      active: categorizedTasks.active.length,
      completed: categorizedTasks.completed.length,
      canceled: categorizedTasks.canceled.length,
      overdue: categorizedTasks.active.filter((task) => {
        if (!task.deadline) return false;
        return new Date(task.deadline) < new Date();
      }).length,
    };
  }, [myTasks, categorizedTasks]);

  // Bulk operation handlers
  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedTasks);
    setSelectedTasks([]);
    setSelectionMode(false);
  };

  const handleBulkAssign = async (assigneeId: string) => {
    await bulkUpdate.mutateAsync({
      taskIds: selectedTasks,
      updates: { assignee: assigneeId },
    });
    setSelectedTasks([]);
  };

  const handleBulkStatus = async (status: TasksStatusOptions) => {
    await bulkUpdate.mutateAsync({
      taskIds: selectedTasks,
      updates: { status },
    });
    setSelectedTasks([]);
  };

  const handleBulkPriority = async (priority: TasksPriorityOptions) => {
    await bulkUpdate.mutateAsync({
      taskIds: selectedTasks,
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
    [
      { value: "todo", label: text.tasks.status.todo },
      { value: "in_progress", label: text.tasks.status.in_progress },
      { value: "pending", label: text.tasks.status.pending },
      { value: "review", label: text.tasks.status.review },
      { value: "testing", label: text.tasks.status.testing },
      { value: "ready", label: text.tasks.status.ready },
      { value: "blocked", label: text.tasks.status.blocked },
      { value: "on_hold", label: text.tasks.status.on_hold },
      { value: "done", label: text.tasks.status.done },
      { value: "canceled", label: text.tasks.status.canceled },
    ];

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <User className="h-5 w-5 md:h-6 md:w-6" />
            {text.myTasks.title || "تسک‌های من"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {text.myTasks.description || "همه تسک‌های اختصاص داده شده به شما"}
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
              ? fa.common.buttons.cancelSelection
              : fa.common.buttons.multiSelect}
          </Button>
          <Button
            className="gap-2"
            size="lg"
            onClick={() => navigate("/tasks/new")}
          >
            <Plus className="h-4 w-4" />
            {text.tasks.addTask.buttons.newTask}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {text.common.total || "کل"}
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {text.myTasks.stats.active || "فعال"}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {text.myTasks.stats.completed || "انجام شده"}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {text.myTasks.stats.overdue || "گذشته‌موعد"}
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              {text.myTasks.stats.canceled || "لغو شده"}
            </div>
            <div className="text-muted-foreground text-2xl font-bold">
              {stats.canceled}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            {text.myTasks.tabs.active || "فعال"}
            <Badge variant="secondary" className="ml-2">
              {stats.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            {text.myTasks.tabs.completed || "انجام شده"}
            <Badge variant="secondary" className="ml-2">
              {stats.completed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="by-project">
            {text.myTasks.tabs.byProject || "بر اساس پروژه"}
          </TabsTrigger>
        </TabsList>

        {/* Active Tasks Tab */}
        <TabsContent value="active" className="space-y-6">
          {isLoadingTasks ? (
            <MyTasksSkeleton />
          ) : categorizedTasks.active.length === 0 ? (
            <EmptyState
              message={text.myTasks.empty.noActiveTasks || "تسک فعالی ندارید"}
              description={
                text.myTasks.empty.noActiveTasksDescription ||
                "همه تسک‌های شما انجام شده یا لغو شده‌اند"
              }
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
              message={
                text.myTasks.empty.noCompletedTasks ||
                "هنوز تسکی را تکمیل نکرده‌اید"
              }
              description={
                text.myTasks.empty.noCompletedTasksDescription ||
                "تسک‌های تکمیل شده در اینجا نمایش داده می‌شوند"
              }
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
              message={text.myTasks.empty.noTasks || "تسکی ندارید"}
              description={
                text.myTasks.empty.noTasksDescription ||
                "هیچ تسکی به شما اختصاص داده نشده است"
              }
            />
          ) : (
            tasksByProject.map((project) => (
              <Card key={project.projectId}>
                <div className="bg-muted/30 border-b px-4 py-3">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span>{project.projectName}</span>
                    <Badge variant="secondary">{project.tasks.length}</Badge>
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
                                {text.common.deadline}:{" "}
                                {new Date(task.deadline).toLocaleDateString(
                                  "fa-IR",
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {text.tasks.priority[task.priority]}
                            </Badge>
                            <Badge variant="outline">
                              {text.tasks.status[task.status]}
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
