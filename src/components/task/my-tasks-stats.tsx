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
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="border-border/40 mb-8 overflow-hidden rounded-2xl shadow-sm">
      <CardContent
        className="grid grid-cols-2 gap-px p-0 sm:grid-cols-3 md:grid-cols-5"
        data-animate-stagger
      >
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="bg-card hover:bg-muted/10 group relative overflow-hidden p-6 text-right transition-colors"
          >
            <div className="mb-2 flex items-center justify-end gap-3">
              <span className="text-muted-foreground/40 text-[10px] font-bold tracking-tight">
                {stat.label}
              </span>
              <stat.icon
                className={cn(
                  "size-4 opacity-40 transition-opacity group-hover:opacity-100",
                  stat.color,
                )}
              />
            </div>
            <div className="text-3xl font-bold tracking-tighter">
              {digitsEnToFa(stat.value)}
            </div>
            <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
