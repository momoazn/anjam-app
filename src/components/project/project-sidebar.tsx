import {
  IconChartBar,
  IconList,
  IconUsers,
  IconClock,
  IconActivity,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { projects } from "@/constants";
import { formatTimeSpent } from "@/lib/time-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";

import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-10" data-animate-stagger>
      {/* Project Status */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            Project_Status
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
          <CardContent className="p-0">
            {tasksLoading ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-12 w-full rounded-none" />
                <Skeleton className="h-12 w-full rounded-none" />
                <Skeleton className="h-12 w-full rounded-none" />
              </div>
            ) : (
              <div
                className="divide-border/10 grid grid-cols-1 divide-y"
                data-animate-stagger
              >
                <div className="hover:bg-muted/30 group flex items-center justify-between p-4 transition-all">
                  <div className="flex items-center gap-3">
                    <IconActivity className="text-primary/40 group-hover:text-primary size-4 transition-colors" />
                    <span className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                      {projects.details.totalTasks}
                    </span>
                  </div>
                  <span className="text-right text-xl font-black tabular-nums">
                    {digitsEnToFa(totalTasks)}
                  </span>
                </div>

                <div className="hover:bg-muted/30 group flex items-center justify-between p-4 text-right transition-all">
                  <div className="flex items-center gap-3">
                    <IconCircleCheck className="size-4 text-emerald-500/40 transition-colors group-hover:text-emerald-500" />
                    <span className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                      {projects.details.completedTasks}
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-500/80 tabular-nums">
                    {digitsEnToFa(completedTasks)}
                  </span>
                </div>

                <div className="hover:bg-muted/30 group flex items-center justify-between p-4 text-right transition-all">
                  <div className="flex items-center gap-3">
                    <IconClock className="size-4 text-amber-500/40 transition-colors group-hover:text-amber-500" />
                    <span className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                      {projects.details.inProgressTasks}
                    </span>
                  </div>
                  <span className="text-xl font-black text-amber-500/80 tabular-nums">
                    {digitsEnToFa(inProgressTasks)}
                  </span>
                </div>

                <div className="bg-muted/5 group flex items-center justify-between p-4 text-right">
                  <div className="flex items-center gap-3">
                    <IconChartBar className="text-primary/40 group-hover:text-primary size-4 transition-colors" />
                    <span className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                      {projects.details.totalTimeSpent}
                    </span>
                  </div>
                  <span className="text-primary/80 text-sm font-black tabular-nums">
                    {digitsEnToFa(formatTimeSpent(totalTimeSpent))}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Access */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            _Access
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
          <CardContent className="bg-muted/10 space-y-2 p-4">
            <Button
              variant="ghost"
              className="text-muted-foreground/60 hover:bg-muted/30 h-11 w-full justify-end gap-3 rounded-none text-[10px] font-black tracking-tight uppercase"
              onClick={onViewTasks}
            >
              {projects.list.viewTasks}
              <IconList className="size-4 opacity-40" />
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground/60 hover:bg-muted/30 h-11 w-full justify-end gap-3 rounded-none text-[10px] font-black tracking-tight uppercase"
              onClick={onViewUsers}
            >
              {projects.users.title}
              <IconUsers className="size-4 opacity-40" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
