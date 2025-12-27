import { digitsEnToFa } from "@persian-tools/persian-tools";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/constants";
import type { EmployeeSummary } from "@/lib/reports-utils";

type Props = {
  summaries: EmployeeSummary[];
  onCardClick?: (userId: string) => void;
};

export function EmployeeOverviewCards({ summaries, onCardClick }: Props) {
  if (summaries.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center rounded-xl border border-dashed text-sm">
        {reports.charts.employee.emptyStates.noEmployees}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {summaries.map((summary) => (
        <Card
          key={summary.userId}
          className={onCardClick ? "hover:bg-muted/50 cursor-pointer" : ""}
          onClick={() => onCardClick?.(summary.userId)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {summary.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {reports.charts.employee.overviewCards.totalAssigned}
                </span>
                <span className="font-medium">
                  {digitsEnToFa(summary.totalAssigned)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {reports.charts.employee.overviewCards.completed}
                </span>
                <span className="font-medium">
                  {digitsEnToFa(summary.completed)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {reports.charts.employee.overviewCards.inProgress}
                </span>
                <span className="font-medium">
                  {digitsEnToFa(summary.inProgress)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {reports.charts.employee.overviewCards.efficiencyScore}
                </span>
                <span className="font-medium">
                  {digitsEnToFa(Math.round(summary.efficiencyScore * 100))}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
