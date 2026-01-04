import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { reports, tasks } from "@/constants";
import type { TasksPriorityOptions } from "@/lib/pocketbase-types";

const chartConfig = {
  urgent: {
    label: tasks.priority.urgent,
    color: "var(--chart-1)",
  },
  high: {
    label: reports.high,
    color: "var(--chart-3)",
  },
  medium: {
    label: reports.medium,
    color: "var(--chart-4)",
  },
  low: {
    label: reports.low,
    color: "var(--chart-2)",
  },
};

type Props = {
  data: Array<{
    name: string;
    value: number;
    key: TasksPriorityOptions;
  }>;
  onSliceClick?: (key: TasksPriorityOptions) => void;
};

export function PriorityDistribution({ data, onSliceClick }: Props) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={2}
          labelLine={false}
          label={({ percent }) => {
            const percentage = digitsEnToFa(((percent || 0) * 100).toFixed(0));
            return `${percentage}%`;
          }}
          fontSize={12}
          fill="var(--foreground)"
          onClick={(entry) => onSliceClick?.(entry.key)}
          style={{ cursor: onSliceClick ? "pointer" : "default" }}
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={chartConfig[entry.key].color} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(
                _value: string | number,
                name: string | number,
                item: { payload?: { value?: number } },
              ) => {
                const total = data.reduce((a, b) => a + b.value, 0) || 1;
                const pct = Math.round(
                  ((item.payload?.value ?? 0) / total) * 100,
                );
                return [
                  `${digitsEnToFa(item.payload?.value ?? 0)} (${digitsEnToFa(pct)}%)`,
                  name,
                ];
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent className="text-xs" />} />
      </PieChart>
    </ChartContainer>
  );
}
