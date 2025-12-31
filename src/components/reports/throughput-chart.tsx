/* eslint-disable @typescript-eslint/no-explicit-any */
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { charts, reports } from "@/constants";

const chartConfig = {
  completed: {
    label: reports.completedTasks,
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
    <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
          height={100}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(value) => digitsEnToFa(value)}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value: any) => [
                digitsEnToFa(value as number),
                chartConfig.completed.label,
              ]}
              labelFormatter={(label: any) => `${charts.dateLabel} ${label}`}
            />
          }
        />
        <Bar
          dataKey="count"
          fill={chartConfig.completed.color}
          radius={[4, 4, 0, 0]}
          onClick={(entry: any) => onBarClick?.(entry.key, entry.label)}
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        />
      </BarChart>
    </ChartContainer>
  );
}
