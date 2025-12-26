import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskListGroup } from "@/components/task/task-list-group";
import { MyTasksEmptyState } from "@/components/task/my-tasks-empty-state";
import { MyTasksSkeleton } from "@/components/task/my-tasks-skeleton";
import { myTasks as myTasksText, tasks } from "@/constants";
import type { TaskWithProject } from "@/lib/pocketbase";
import type { TasksStatusOptions } from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/status-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";
import { Activity, Layout, Layers } from "lucide-react";

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
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-10 inline-flex h-16 w-full items-stretch justify-start gap-4 bg-transparent p-0">
        <TabsTrigger
          value="active"
          className={cn(
            "data-[state=active]:border-primary/30 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-primary/5 relative flex flex-1 items-center justify-center gap-3 rounded-none border transition-all duration-300 data-[state=active]:shadow-sm lg:flex-none lg:px-10",
            "hover:bg-muted/50",
          )}
        >
          <Activity className="size-4" />
          <span className="font-black tracking-tight uppercase">
            {myTasksText.tabs.active}
          </span>
          <div className="bg-muted group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground flex h-6 items-center justify-center rounded-none px-2 text-[10px] font-black">
            {digitsEnToFa(stats.active)}
          </div>
          {activeTab === "active" && (
            <div className="bg-primary absolute -bottom-2 h-1 w-12 rounded-full" />
          )}
        </TabsTrigger>

        <TabsTrigger
          value="completed"
          className={cn(
            "data-[state=active]:border-primary/30 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-primary/5 relative flex flex-1 items-center justify-center gap-3 rounded-none border transition-all duration-300 data-[state=active]:shadow-sm lg:flex-none lg:px-10",
            "hover:bg-muted/50",
          )}
        >
          <Layout className="size-4" />
          <span className="font-black tracking-tight uppercase">
            {myTasksText.tabs.completed}
          </span>
          <div className="bg-muted group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground flex h-6 items-center justify-center rounded-none px-2 text-[10px] font-black">
            {digitsEnToFa(stats.completed)}
          </div>
          {activeTab === "completed" && (
            <div className="bg-primary absolute -bottom-2 h-1 w-12 rounded-full" />
          )}
        </TabsTrigger>

        <TabsTrigger
          value="by-project"
          className={cn(
            "data-[state=active]:border-primary/30 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-primary/5 relative flex flex-1 items-center justify-center gap-3 rounded-none border transition-all duration-300 data-[state=active]:shadow-sm lg:flex-none lg:px-10",
            "hover:bg-muted/50",
          )}
        >
          <Layers className="size-4" />
          <span className="font-black tracking-tight uppercase">
            {myTasksText.tabs.byProject}
          </span>
          {activeTab === "by-project" && (
            <div className="bg-primary absolute -bottom-2 h-1 w-12 rounded-full" />
          )}
        </TabsTrigger>
      </TabsList>

      <div className="relative">
        {/* Sidebar vertical line accent */}
        <div className="bg-border/40 absolute -end-6 top-0 bottom-0 w-px" />

        <TabsContent value="active" className="mt-0 space-y-8 outline-none">
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

        <TabsContent value="completed" className="mt-0 space-y-8 outline-none">
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

        <TabsContent value="by-project" className="mt-0 space-y-8 outline-none">
          {isLoading ? (
            <MyTasksSkeleton />
          ) : tasksByProject.length === 0 ? (
            <MyTasksEmptyState
              message={myTasksText.empty.noTasks}
              description={myTasksText.empty.noTasksDescription}
            />
          ) : (
            tasksByProject.map((project) => (
              <Card
                key={project.projectId}
                className="overflow-hidden rounded-none shadow-sm"
              >
                <div className="bg-muted/20 border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-3 text-lg font-black tracking-tight">
                      <Layers className="text-primary size-5" />
                      {project.projectName}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="rounded-none font-black"
                    >
                      {digitsEnToFa(project.tasks.length)}{" "}
                      {tasks.list.noTasks === "تسکی وجود ندارد"
                        ? "تسک"
                        : "tasks"}
                    </Badge>
                  </div>
                </div>
                <div className="divide-border/40 divide-y">
                  {project.tasks.map((task) => (
                    <Button
                      key={task.id}
                      variant="ghost"
                      className="group hover:bg-muted/30 flex h-auto w-full cursor-pointer items-center justify-between rounded-none p-6 text-right transition-colors focus-visible:ring-0"
                      onClick={() =>
                        onProjectTaskClick(project.projectId, task.id)
                      }
                    >
                      <div className="flex-1 text-right">
                        <h4 className="group-hover:text-primary text-base font-bold tracking-tight transition-colors">
                          {task.title}
                        </h4>
                        {task.deadline && (
                          <div className="mt-2 flex items-center justify-end gap-2">
                            <span className="text-muted-foreground/40 text-[10px] font-black tracking-tight uppercase">
                              {tasks.addTask.deadline}
                            </span>
                            <span className="text-muted-foreground text-xs font-bold">
                              {digitsEnToFa(
                                new Date(task.deadline).toLocaleDateString(
                                  "fa-IR",
                                ),
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="border-primary/20 bg-primary/5 text-primary rounded-none text-[10px] font-black tracking-wider uppercase"
                        >
                          {tasks.priority[task.priority]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-border/60 bg-muted/50 text-muted-foreground rounded-none text-[10px] font-black tracking-wider uppercase"
                        >
                          {tasks.status[task.status]}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
