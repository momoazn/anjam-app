import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskListGroup } from "@/components/task/task-list-group";
import { MyTasksEmptyState } from "@/components/task/my-tasks-empty-state";
import { MyTasksSkeleton } from "@/components/task/my-tasks-skeleton";
import { myTasks as myTasksText, tasks } from "@/constants";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/status-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export type MyTasksTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
  isLoading: boolean;
  stats: {
    active: number;
    completed: number;
  };
  activeGrouped: Record<TasksStatusOptions, TaskWithProject[]>;
  completedGrouped: Record<TasksStatusOptions, TaskWithProject[]>;
  categorizedActive: TaskWithProject[];
  categorizedCompleted: TaskWithProject[];
  tasksByProject: Array<{
    projectId: string;
    projectName: string;
    tasks: TaskWithProject[];
  }>;
  selectionMode: boolean;
  selectedTasks: string[];
  onSelectionChange: (taskIds: string[]) => void;
  onProjectTaskClick: (projectId: string, taskId: string) => void;
};

export function MyTasksTabs({
  activeTab,
  onTabChange,
  isLoading,
  stats,
  activeGrouped,
  completedGrouped,
  categorizedActive,
  categorizedCompleted,
  tasksByProject,
  selectionMode,
  selectedTasks,
  onSelectionChange,
  onProjectTaskClick,
}: MyTasksTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
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

      <TabsContent value="active" className="space-y-6">
        {isLoading ? (
          <MyTasksSkeleton />
        ) : categorizedActive.length === 0 ? (
          <MyTasksEmptyState
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
                onSelectionChange={onSelectionChange}
              />
            );
          })
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-6">
        {isLoading ? (
          <MyTasksSkeleton />
        ) : categorizedCompleted.length === 0 ? (
          <MyTasksEmptyState
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
                onSelectionChange={onSelectionChange}
              />
            );
          })
        )}
      </TabsContent>

      <TabsContent value="by-project" className="space-y-6">
        {isLoading ? (
          <MyTasksSkeleton />
        ) : tasksByProject.length === 0 ? (
          <MyTasksEmptyState
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
                        onProjectTaskClick(project.projectId, task.id)
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
  );
}
