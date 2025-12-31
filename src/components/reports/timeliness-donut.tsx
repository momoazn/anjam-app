import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { reports } from "@/constants";

const chartConfig = {
  on_time: {
    label: reports.onTime,
    color: "var(--chart-2)",
  },
  overdue: {
    label: reports.overdue,
    color: "var(--chart-1)",
  },
  no_deadline: {
    label: reports.noDeadline,
    color: "var(--chart-5)",
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
          onClick={(entry: any) => onSliceClick?.(entry.key)}
          style={{ cursor: onSliceClick ? "pointer" : "default" }}
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={chartConfig[entry.key].color} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(_value: any, name: any, item: any) => {
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
        <ChartLegend content={<ChartLegendContent className="text-xs" />} />
      </PieChart>
    </ChartContainer>
  );
}
