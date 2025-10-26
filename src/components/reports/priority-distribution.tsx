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
    label: "فوری",
    color: "#ef4444",
  },
  high: {
    label: "اولویت بالا",
    color: "#f97316",
  },
  medium: {
    label: "اولویت متوسط",
    color: "#f59e0b",
  },
  low: {
    label: "اولویت پایین",
    color: "#10b981",
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
    <ChartContainer config={chartConfig}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={2}
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${digitsEnToFa((percent * 100).toFixed(0))}%`
          }
          onClick={(data) => onSliceClick?.(data.key)}
          style={{ cursor: onSliceClick ? "pointer" : "default" }}
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={chartConfig[entry.key].color} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [digitsEnToFa(value as number), "تسک‌ها"]}
            />
          }
        />
        <ChartLegend
          content={
            <ChartLegendContent className="text-muted-foreground text-xs" />
          }
        />
      </PieChart>
    </ChartContainer>
  );
}
