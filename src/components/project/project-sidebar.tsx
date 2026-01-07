import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconList, IconUsers } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { projects } from "@/constants";

type ProjectSidebarProps = {
  tasksLoading: boolean;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  onViewTasks: () => void;
  onViewUsers: () => void;
};

export function ProjectSidebar({
  tasksLoading,
  totalTasks,
  completedTasks,
  inProgressTasks,
  onViewTasks,
  onViewUsers,
}: ProjectSidebarProps) {
  return (
    <div className="space-y-4" data-animate-stagger>
      <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
        {tasksLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-7 w-full rounded-lg" />
            <Skeleton className="h-7 w-full rounded-lg" />
            <Skeleton className="h-7 w-full rounded-lg" />
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {[
              {
                label: projects.details.totalTasks,
                value: digitsEnToFa(totalTasks),
              },
              {
                label: projects.details.completedTasks,
                value: digitsEnToFa(completedTasks),
              },
              {
                label: projects.details.inProgressTasks,
                value: digitsEnToFa(inProgressTasks),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-muted-foreground text-xs font-semibold">
                  {item.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
        <div className="grid grid-cols-2 gap-px bg-border/40 p-px">
          <Button
            variant="ghost"
            className="bg-background/20 hover:bg-muted/30 h-9 justify-center gap-2 rounded-lg text-xs font-semibold"
            onClick={onViewTasks}
          >
            <IconList className="size-4 opacity-70" />
            {projects.list.viewTasks}
          </Button>
          <Button
            variant="ghost"
            className="bg-background/20 hover:bg-muted/30 h-9 justify-center gap-2 rounded-lg text-xs font-semibold"
            onClick={onViewUsers}
          >
            <IconUsers className="size-4 opacity-70" />
            {projects.users.title}
          </Button>
        </div>
      </div>
    </div>
  );
}
