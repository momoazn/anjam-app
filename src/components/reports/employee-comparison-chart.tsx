import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fa } from "@/constants/text";
import type { EmployeeSummary } from "@/lib/reports-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

type Props = {
  selectedEmployee: EmployeeSummary | null;
  teamAverages: {
    averageCompleted: number;
    averageCompletionRate: number;
    averageOnTimeRate: number;
  };
};

const chartConfig = {
  employee: {
    label: fa.reports.charts.employee.comparisonChart.vsTeam,
    color: "hsl(var(--chart-1))",
  },
  team: {
    label: fa.reports.charts.employee.comparisonChart.vsTeam,
    color: "hsl(var(--chart-2))",
  },
};

export function EmployeeComparisonChart({
  selectedEmployee,
  teamAverages,
}: Props) {
  const hasData = selectedEmployee && teamAverages;

  const chartData = hasData
    ? [
        {
          metric: fa.reports.charts.employee.overviewCards.completed,
          employee: selectedEmployee.completed,
          team: teamAverages.averageCompleted,
        },
        {
          metric: fa.reports.charts.employee.overviewCards.efficiencyScore,
          employee: Math.round(selectedEmployee.efficiencyScore * 100),
          team: Math.round(teamAverages.averageCompletionRate * 100),
        },
        {
          metric: fa.reports.charts.employee.overviewCards.onTimeRate,
          employee: Math.round(selectedEmployee.onTimeRate * 100),
          team: Math.round(teamAverages.averageOnTimeRate * 100),
        },
      ]
    : [];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold md:text-lg">
          {fa.reports.charts.employee.comparisonChart.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 w-full p-4 pt-0">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full"
          >
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, props) => {
                      const metric = props?.payload?.metric;
                      const shouldAddPercent =
                        metric ===
                          fa.reports.charts.employee.overviewCards
                            .efficiencyScore ||
                        metric ===
                          fa.reports.charts.employee.overviewCards.onTimeRate;
                      return [
                        `${value}${shouldAddPercent ? "%" : ""}`,
                        props?.payload?.metric || _name,
                      ];
                    }}
                  />
                }
              />
              <Bar
                dataKey="employee"
                fill="var(--color-employee)"
                name={selectedEmployee.name}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="team"
                fill="var(--color-team)"
                name={fa.reports.charts.employee.comparisonChart.vsTeam}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm">
            {fa.reports.charts.employee.comparisonChart.noData}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
