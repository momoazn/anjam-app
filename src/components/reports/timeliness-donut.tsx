import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  on_time: {
    label: "به‌موقع",
    color: "#10b981",
  },
  overdue: {
    label: "گذشته مهلت",
    color: "#ef4444",
  },
  no_deadline: {
    label: "بدون مهلت",
    color: "#6b7280",
  },
};

type Props = {
  data: Array<{
    name: string;
    value: number;
    key: "on_time" | "overdue" | "no_deadline";
  }>;
  onSliceClick?: (key: "on_time" | "overdue" | "no_deadline") => void;
};

export function TimelinessDonut({ data, onSliceClick }: Props) {
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
