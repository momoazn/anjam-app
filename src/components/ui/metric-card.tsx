import { digitsEnToFa } from "@persian-tools/persian-tools";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

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
 * Eliminates duplicate Card structures across the codebase
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
    <Card className="border-border rounded-xl border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-xs font-bold">
          {title}
        </CardTitle>
        <Icon className="text-primary/40 h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className={valueColor}>{displayValue}</div>
      </CardContent>
    </Card>
  );
}
