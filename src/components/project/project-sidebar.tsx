import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { common, projects } from "@/constants";
import { formatTimeSpent } from "@/lib/time-utils";

type ProjectSidebarProps = {
  tasksLoading: boolean;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalTimeSpent: number;
  onViewTasks: () => void;
  onViewUsers: () => void;
};

export function ProjectSidebar({
  tasksLoading,
  totalTasks,
  completedTasks,
  inProgressTasks,
  totalTimeSpent,
  onViewTasks,
  onViewUsers,
}: ProjectSidebarProps) {
  return (
    <div className="space-y-6" data-animate-stagger>
      <Card>
        <CardHeader>
          <CardTitle>{projects.details.statistics}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasksLoading ? (
            <div className="space-y-3" data-animate-stagger>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <>
              <div
                className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                data-interactive-item
              >
                <span className="text-sm font-medium">
                  {projects.details.totalTasks}
                </span>
                <span className="text-2xl font-bold">{totalTasks}</span>
              </div>
              <div
                className="flex items-center justify-between rounded-lg bg-green-500/10 p-3"
                data-interactive-item
              >
                <span className="text-sm font-medium">
                  {projects.details.completedTasks}
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedTasks}
                </span>
              </div>
              <div
                className="flex items-center justify-between rounded-lg bg-blue-500/10 p-3"
                data-interactive-item
              >
                <span className="text-sm font-medium">
                  {projects.details.inProgressTasks}
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {inProgressTasks}
                </span>
              </div>
              <div
                className="flex items-center justify-between rounded-lg bg-purple-500/10 p-3"
                data-interactive-item
              >
                <span className="text-sm font-medium">
                  {projects.details.totalTimeSpent}
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {formatTimeSpent(totalTimeSpent)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{common.messages.quickActions}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2" data-animate-stagger>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onViewTasks}
          >
            {projects.list.viewTasks}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onViewUsers}
          >
            {projects.users.title}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
