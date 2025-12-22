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
  valueColor = "text-2xl font-bold",
  formatNumber = true,
  suffix = "",
}: MetricCardProps) {
  const displayValue =
    typeof value === "number" && formatNumber
      ? `${digitsEnToFa(value)}${suffix}`
      : `${value}${suffix}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className={valueColor}>{displayValue}</div>
      </CardContent>
    </Card>
  );
}
