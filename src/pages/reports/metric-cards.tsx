import { cn } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { reports } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconActivity,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface MetricCard {
  id: string;
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  suffix: string;
}

export function ReportsMetricCards({
  totalTasks,
  completedTasks,
  wip,
  overdue,
  onTimeRate,
}: {
  totalTasks: number;
  completedTasks: number;
  wip: number;
  overdue: number;
  onTimeRate: number;
}) {
  const cards: MetricCard[] = [
    {
      id: "total",
      label: reports.totalTasksCard,
      value: totalTasks,
      icon: IconActivity,
      color: "text-primary",
      suffix: "",
    },
    {
      id: "completed",
      label: reports.completedTasks,
      value: completedTasks,
      icon: IconCircleCheck,
      color: "text-green-500",
      suffix: "",
    },
    {
      id: "wip",
      label: reports.inProgress,
      value: wip,
      icon: IconClock,
      color: "text-blue-500",
      suffix: "",
    },
    {
      id: "overdue",
      label: reports.overdue,
      value: overdue,
      icon: IconAlertTriangle,
      color: "text-red-500",
      suffix: "",
    },
    {
      id: "onTime",
      label: reports.onTimeRate,
      value: onTimeRate,
      icon: IconCircleCheck,
      color: "text-green-500",
      suffix: "%",
    },
  ];

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
      data-animate-stagger
    >
      {cards.map((card) => (
        <Card
          key={card.id}
          className="border-border/40 overflow-hidden rounded-2xl shadow-sm transition-all hover:scale-[1.02]"
        >
          <CardContent className="bg-border/40 bg-card flex items-center justify-between p-8">
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs font-medium tracking-tight">
                {card.label}
              </p>
              <p className={cn("text-3xl font-bold", card.color)}>
                {digitsEnToFa(card.value.toString())}
                {card.suffix}
              </p>
            </div>
            <card.icon className={cn("size-10 stroke-1", card.color)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
