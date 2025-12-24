import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reports } from "@/constants";
import type { EmployeeBucket } from "@/lib/reports-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

type Props = {
  buckets: EmployeeBucket[];
  bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  onBucketChange: (
    bucket: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
  ) => void;
  onBarClick?: (key: string, label: string) => void;
};

const chartConfig = {
  count: {
    label: reports.completedTasksCount,
    color: "hsl(var(--chart-1))",
  },
};

export function EmployeeProductivityChart({
  buckets,
  bucket,
  onBucketChange,
  onBarClick,
}: Props) {
  const hasData = buckets.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold md:text-lg">
          {reports.charts.employee.productivityChart.title}
        </CardTitle>
        <Select value={bucket} onValueChange={onBucketChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">
              {reports.charts.employee.productivityChart.periods.daily}
            </SelectItem>
            <SelectItem value="weekly">
              {reports.charts.employee.productivityChart.periods.weekly}
            </SelectItem>
            <SelectItem value="monthly">
              {reports.charts.employee.productivityChart.periods.monthly}
            </SelectItem>
            <SelectItem value="quarterly">
              {reports.charts.employee.productivityChart.periods.quarterly}
            </SelectItem>
            <SelectItem value="annual">
              {reports.charts.employee.productivityChart.periods.annual}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-80 w-full p-4 pt-0">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full"
          >
            <BarChart
              data={buckets}
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
                    formatter={(value, name) => [
                      `${value} ${reports.completedTasks}`,
                      name,
                    ]}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                onClick={(entry) => onBarClick?.(entry.key, entry.label)}
                style={{ cursor: onBarClick ? "pointer" : "default" }}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm">
            {reports.charts.employee.productivityChart.noData}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
