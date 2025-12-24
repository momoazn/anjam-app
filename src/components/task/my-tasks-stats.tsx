import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconActivity,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconCircleX,
} from "@tabler/icons-react";

import { common, myTasks as myTasksText } from "@/constants";
import { cn } from "@/lib/utils";

export type MyTasksStatsValues = {
  total: number;
  active: number;
  completed: number;
  canceled: number;
  overdue: number;
};

type MyTasksStatsProps = {
  stats: MyTasksStatsValues;
};

export function MyTasksStats({ stats }: MyTasksStatsProps) {
  const statItems = [
    {
      label: common.total,
      value: stats.total,
      icon: IconActivity,
      color: "text-primary",
    },
    {
      label: myTasksText.stats.active,
      value: stats.active,
      icon: IconClock,
      color: "text-blue-500",
    },
    {
      label: myTasksText.stats.completed,
      value: stats.completed,
      icon: IconCircleCheck,
      color: "text-emerald-500",
    },
    {
      label: myTasksText.stats.overdue,
      value: stats.overdue,
      icon: IconAlertTriangle,
      color: "text-rose-500",
    },
    {
      label: myTasksText.stats.canceled,
      value: stats.canceled,
      icon: IconCircleX,
      color: "text-muted-foreground/40",
    },
  ];

  return (
    <div
      className="bg-border/40 border-border/40 mb-8 grid grid-cols-2 gap-px border sm:grid-cols-3 md:grid-cols-5"
      data-animate-stagger
    >
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-card hover:bg-muted/10 group relative overflow-hidden p-6 text-right transition-colors"
        >
          <div className="mb-2 flex items-center justify-end gap-3">
            <span className="text-muted-foreground/40 text-[10px] font-black tracking-widest uppercase">
              {stat.label}
            </span>
            <stat.icon
              className={cn(
                "size-4 opacity-40 transition-opacity group-hover:opacity-100",
                stat.color,
              )}
            />
          </div>
          <div className="text-3xl font-black tracking-tighter">
            {digitsEnToFa(stat.value)}
          </div>
          <div className="bg-primary absolute right-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
        </div>
      ))}
    </div>
  );
}
