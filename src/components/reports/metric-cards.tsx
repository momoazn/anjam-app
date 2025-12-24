import { CheckCircle, Clock, ListTodo, TrendingUp } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { reports } from "@/constants";

type Props = {
  totals: {
    total: number;
    completed: number;
    wip: number;
    overdue: number;
    onTimeRate: number;
  };
};

export function MetricCards({ totals }: Props) {
  const onTimeRatePercent = Math.round(totals.onTimeRate * 100);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      <MetricCard
        title={reports.totalTasksCard}
        value={totals.total}
        icon={ListTodo}
      />

      <MetricCard
        title={reports.taskCompleted}
        value={totals.completed}
        icon={CheckCircle}
      />

      <MetricCard
        title={reports.inProgressTasks}
        value={totals.wip}
        icon={Clock}
      />

      <MetricCard title={reports.overdue} value={totals.overdue} icon={Clock} />

      <MetricCard
        title={reports.onTimeRate}
        value={onTimeRatePercent}
        icon={TrendingUp}
        suffix="%"
      />
    </div>
  );
}
