import {
  IconChartBar,
  IconList,
  IconUsers,
  IconClock,
  IconActivity,
  IconCircleCheck,
  IconSettings,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { projects } from "@/constants";
import { formatTimeSpent } from "@/lib/time-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";

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
    <div className="space-y-8" data-animate-stagger>
      {/* Project Status */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center">
            <IconActivity className="size-3.5" />
          </div>
          <span className="text-primary text-[9px] font-black tracking-[0.2em] uppercase">
            Project_Status
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="border-border/40 bg-card relative overflow-hidden border-2">
          <BlueprintPattern variant="technical" className="opacity-[0.02]" />
          <div className="relative z-10">
            {tasksLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-10 w-full rounded-none" />
                <Skeleton className="h-10 w-full rounded-none" />
                <Skeleton className="h-10 w-full rounded-none" />
              </div>
            ) : (
              <div className="divide-border/10 divide-y-2">
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
                      <span className="text-muted-foreground/60 text-[9px] font-black tracking-widest uppercase">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-right text-xl font-black tabular-nums",
                        item.highlight ? "text-primary" : "text-foreground",
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Access */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center">
            <IconSettings className="size-3.5" />
          </div>
          <span className="text-primary text-[9px] font-black tracking-[0.2em] uppercase">
            Operator_Access
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="border-border/40 bg-card relative overflow-hidden border-2 p-1.5">
          <BlueprintPattern variant="cross" className="opacity-[0.02]" />
          <div className="relative z-10 space-y-0.5">
            <Button
              variant="ghost"
              className="hover:bg-primary hover:text-primary-foreground h-12 w-full justify-end gap-3 rounded-none text-[9px] font-black tracking-widest uppercase transition-all"
              onClick={onViewTasks}
            >
              {projects.list.viewTasks}
              <IconList className="size-4 opacity-40" />
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-primary hover:text-primary-foreground h-12 w-full justify-end gap-3 rounded-none text-[9px] font-black tracking-widest uppercase transition-all"
              onClick={onViewUsers}
            >
              {projects.users.title}
              <IconUsers className="size-4 opacity-40" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { cn } from "@/lib/utils";
