import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  completed: {
    label: "تسک‌های تکمیل شده",
    color: "#3b82f6",
  },
};

type Props = {
  data: Array<{ date: string; count: number }>;
  bucket?: "daily" | "weekly";
  onBarClick?: (date: string) => void;
};

export function ThroughputChart({ data, onBarClick }: Props) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-muted/20"
        />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          tick={{ fontSize: 10 }}
          height={60}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => digitsEnToFa(value)}
          className="text-muted-foreground"
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [
                digitsEnToFa(value as number),
                "تسک‌های تکمیل شده",
              ]}
              labelFormatter={(label) => `تاریخ: ${label}`}
            />
          }
        />
        <Bar
          dataKey="count"
          name="تسک‌های تکمیل شده"
          fill={chartConfig.completed.color}
          radius={[4, 4, 0, 0]}
          onClick={(data) => onBarClick?.(data.date)}
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        />
      </BarChart>
    </ChartContainer>
  );
}
