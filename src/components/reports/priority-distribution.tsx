import { fa } from "@/constants/text";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TasksPriorityOptions } from "@/lib/pocketbase-types";

const chartConfig = {
  urgent: {
    label: fa.tasks.priority.urgent,
    color: "var(--chart-1)",
  },
  high: {
    label: fa.reports.high,
    color: "var(--chart-3)",
  },
  medium: {
    label: fa.reports.medium,
    color: "var(--chart-4)",
  },
  low: {
    label: fa.reports.low,
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
  const legendPayload = data.map((d) => ({
    value: chartConfig[d.key].label,
    color: chartConfig[d.key].color,
    type: "square" as const,
    id: d.key,
    dataKey: d.key,
  }));
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
            const percentage = digitsEnToFa((percent * 100).toFixed(0));
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
              formatter={(_value, name, item) => {
                const total = data.reduce((a, b) => a + b.value, 0) || 1;
                const pct = Math.round(((item?.value as number) / total) * 100);
                return [
                  `${digitsEnToFa(item?.value as number)} (${digitsEnToFa(pct)}%)`,
                  name,
                ];
              }}
            />
          }
        />
        <ChartLegend
          payload={legendPayload}
          content={<ChartLegendContent className="text-xs" />}
        />
      </PieChart>
    </ChartContainer>
  );
}
