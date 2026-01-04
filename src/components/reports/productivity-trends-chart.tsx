import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { reports } from "@/constants";

type Props = {
  historical: Array<{ key: string; label: string; count: number }>;
  trend: "increasing" | "decreasing" | "stable";
  projectedNextPeriod: number;
};

const chartConfig = {
  count: {
    label: reports.completedTasksCount,
    color: "hsl(var(--chart-1))",
  },
  projected: {
    label: reports.charts.employee.productivityTrends.projectedNextPeriod,
    color: "hsl(var(--chart-2))",
  },
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "increasing":
      return "hsl(var(--success))";
    case "decreasing":
      return "hsl(var(--destructive))";
    case "stable":
      return "hsl(var(--warning))";
    default:
      return "hsl(var(--muted))";
  }
};

export function ProductivityTrendsChart({
  historical,
  trend,
  projectedNextPeriod,
}: Props) {
  const hasData = historical.length > 0;

  // Add projected point to the data
  const chartData = [
    ...historical,
    {
      key: "projected",
      label: reports.charts.employee.productivityTrends.projectedNextPeriod,
      count: projectedNextPeriod,
      isProjected: true,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold md:text-lg">
          {reports.charts.employee.productivityTrends.chartTitle}
          <Badge
            variant="outline"
            className="text-xs"
            style={{ borderColor: getTrendColor(trend) }}
          >
            {reports.charts.employee.productivityTrends.trendLabels[trend]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 w-full p-4 pt-0">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(
                      value: string | number,
                      name: string | number,
                      item: { payload?: { isProjected?: boolean } },
                    ) => {
                      return [
                        value,
                        item.payload?.isProjected
                          ? reports.charts.employee.productivityTrends
                              .projectedNextPeriod
                          : name,
                      ];
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={{ fill: "var(--color-count)", strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              {projectedNextPeriod > 0 && (
                <ReferenceLine
                  x={
                    reports.charts.employee.productivityTrends
                      .projectedNextPeriod
                  }
                  stroke="var(--color-projected)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center rounded-xl border border-dashed text-sm">
            {reports.charts.employee.productivityTrends.noData}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
