import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconActivity,
  IconChartBar,
  IconCircleCheck,
  IconClock,
  IconList,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { common, projects } from "@/constants";
import { formatTimeSpent } from "@/lib/time-utils";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";

  if (isProductMode) {
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
                {
                  label: projects.details.totalTimeSpent,
                  value: digitsEnToFa(formatTimeSpent(totalTimeSpent)),
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

  return (
    <div className="space-y-8" data-animate-stagger>
      {/* Project Status */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-lg">
            <IconActivity className="size-4" />
          </div>
          <span className="text-primary text-[10px] font-bold tracking-wider">
            {projects.details.statistics}
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="relative overflow-hidden p-0">
          <CardContent className="relative z-10 p-0">
            {tasksLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : (
              <div className="divide-border/10 divide-y">
                {[
                  {
                    label: projects.details.totalTasks,
                    value: digitsEnToFa(totalTasks),
                    icon: IconActivity,
                    color: "text-primary",
                  },
                  {
                    label: projects.details.completedTasks,
                    value: digitsEnToFa(completedTasks),
                    icon: IconCircleCheck,
                    color: "text-emerald-500",
                  },
                  {
                    label: projects.details.inProgressTasks,
                    value: digitsEnToFa(inProgressTasks),
                    icon: IconClock,
                    color: "text-amber-500",
                  },
                  {
                    label: projects.details.totalTimeSpent,
                    value: digitsEnToFa(formatTimeSpent(totalTimeSpent)),
                    icon: IconChartBar,
                    color: "text-primary",
                    highlight: true,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "group hover:bg-muted/30 flex items-center justify-between p-4 transition-all",
                      item.highlight && "bg-muted/10",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "size-4 opacity-40 transition-colors group-hover:opacity-100",
                          item.color,
                        )}
                      />
                      <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-right text-xl font-bold tabular-nums",
                        item.highlight ? "text-primary" : "text-foreground",
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Access */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-lg">
            <IconSettings className="size-4" />
          </div>
          <span className="text-primary text-[10px] font-bold tracking-wider">
            {common.messages.quickActions}
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="relative overflow-hidden p-2">
          <CardContent className="relative z-10 space-y-1 p-0">
            <Button
              variant="ghost"
              className="hover:bg-primary hover:text-primary-foreground h-12 w-full justify-end gap-3 rounded-xl text-[11px] font-bold tracking-tight transition-all"
              onClick={onViewTasks}
            >
              {projects.list.viewTasks}
              <IconList className="size-4 opacity-40" />
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-primary hover:text-primary-foreground h-12 w-full justify-end gap-3 rounded-xl text-[11px] font-bold tracking-tight transition-all"
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
