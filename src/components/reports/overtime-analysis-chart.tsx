import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fa } from "@/constants/text";
import type { OvertimeAnalysis } from "@/lib/reports-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

type Props = {
  data: OvertimeAnalysis[];
};

const chartConfig = {
  workloadScore: {
    label: fa.reports.charts.employee.overtimeAnalysis.columns.workloadScore,
    color: "hsl(var(--chart-1))",
  },
  overtimeIndicator: {
    label:
      fa.reports.charts.employee.overtimeAnalysis.columns.overtimeIndicator,
    color: "hsl(var(--chart-2))",
  },
};

export function OvertimeAnalysisChart({ data }: Props) {
  const hasData = data.length > 0;

  const chartData = data.slice(0, 10).map((item) => ({
    name:
      item.name.length > 12 ? item.name.substring(0, 12) + "..." : item.name,
    workloadScore: Math.round(item.workloadScore),
    overtimeIndicator: Math.round(item.overtimeIndicator),
  }));

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold md:text-lg">
          {fa.reports.charts.employee.overtimeAnalysis.chartTitle}
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
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `${value}${name === fa.reports.charts.employee.overtimeAnalysis.columns.workloadScore ? "%" : "h"}`,
                      name,
                    ]}
                  />
                }
              />
              <Bar
                dataKey="workloadScore"
                fill="var(--color-workloadScore)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="overtimeIndicator"
                fill="var(--color-overtimeIndicator)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm">
            {fa.reports.charts.employee.overtimeAnalysis.noData}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
