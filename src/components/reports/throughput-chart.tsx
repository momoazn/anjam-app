import { fa } from "@/constants/text";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  completed: {
    label: fa.reports.completedTasks,
    color: "var(--chart-1)",
  },
};

type Props = {
  data: Array<{ key: string; label: string; count: number }>;
  bucket?: "daily" | "weekly";
  onBarClick?: (key: string, label: string) => void;
};

export function ThroughputChart({ data, onBarClick }: Props) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--muted)"
        />
        <XAxis
          dataKey="label"
          angle={-45}
          textAnchor="end"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          height={80}
          tickFormatter={(label) => digitsEnToFa(label as string)}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(value) => digitsEnToFa(value)}
        />
        <ChartLegend
          payload={[
            {
              value: chartConfig.completed.label,
              color: chartConfig.completed.color,
              type: "square",
              id: "completed",
            },
          ]}
          content={<ChartLegendContent />}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [
                digitsEnToFa(value as number),
                chartConfig.completed.label,
              ]}
              labelFormatter={(label) => `${fa.charts.dateLabel} ${label}`}
            />
          }
        />
        <Bar
          dataKey="count"
          fill={chartConfig.completed.color}
          radius={[4, 4, 0, 0]}
          onClick={(entry) => onBarClick?.(entry.key, entry.label)}
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        />
      </BarChart>
    </ChartContainer>
  );
}
