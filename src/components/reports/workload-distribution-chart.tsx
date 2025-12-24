import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/constants";
import type { WorkloadDistribution } from "@/lib/reports-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

type Props = {
  data: WorkloadDistribution[];
};

const chartConfig = {
  capacityUtilization: {
    label: reports.charts.employee.overtimeAnalysis.columns.capacityUtilization,
    color: "hsl(var(--chart-1))",
  },
};

export function WorkloadDistributionChart({ data }: Props) {
  const hasData = data.length > 0;

  const chartData = data.slice(0, 10).map((item) => ({
    name:
      item.name.length > 12 ? item.name.substring(0, 12) + "..." : item.name,
    capacityUtilization: Math.round(item.capacityUtilization),
    workloadLevel: item.workloadLevel,
  }));

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold md:text-lg">
          {reports.charts.employee.overtimeAnalysis.workloadChartTitle}
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
                bottom: 60,
              }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => {
                      const workloadLevel = props?.payload?.workloadLevel as
                        | "low"
                        | "medium"
                        | "high"
                        | "critical";
                      const levelLabel =
                        reports.charts.employee.overtimeAnalysis.workloadLevels[
                          workloadLevel
                        ] || workloadLevel;
                      return [`${value}% (${levelLabel})`, name];
                    }}
                  />
                }
              />
              <Bar
                dataKey="capacityUtilization"
                fill="var(--color-capacityUtilization)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm">
            {reports.charts.employee.overtimeAnalysis.noData}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
