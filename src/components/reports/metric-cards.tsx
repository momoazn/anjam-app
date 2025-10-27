import { digitsEnToFa } from "@persian-tools/persian-tools";
import { CheckCircle, Clock, ListTodo, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fa } from "@/constants/text";

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {fa.reports.totalTasksCard}
          </CardTitle>
          <ListTodo className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{digitsEnToFa(totals.total)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {fa.reports.taskCompleted}
          </CardTitle>
          <CheckCircle className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {digitsEnToFa(totals.completed)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {fa.reports.inProgressTasks}
          </CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{digitsEnToFa(totals.wip)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {fa.reports.overdue}
          </CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {digitsEnToFa(totals.overdue)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {fa.reports.onTimeRate}
          </CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {digitsEnToFa(onTimeRatePercent)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
