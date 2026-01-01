import { digitsEnToFa } from "@persian-tools/persian-tools";
import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "./card";

type MetricCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  valueColor?: string;
  formatNumber?: boolean;
  suffix?: string;
};

/**
 * Reusable metric card component for displaying KPIs and statistics
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  valueColor = "text-3xl font-bold tracking-tight",
  formatNumber = true,
  suffix = "",
}: MetricCardProps) {
  const displayValue =
    typeof value === "number" && formatNumber
      ? `${digitsEnToFa(value)}${suffix}`
      : `${value}${suffix}`;

  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={valueColor}>{displayValue}</div>
      </CardContent>
    </Card>
  );
}
