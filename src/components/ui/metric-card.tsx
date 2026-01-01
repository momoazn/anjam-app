import { digitsEnToFa } from "@persian-tools/persian-tools";
import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "./card";
import { TechnicalLabel } from "./technical-label";

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
  valueColor = "text-4xl font-black tracking-tighter",
  formatNumber = true,
  suffix = "",
}: MetricCardProps) {
  const displayValue =
    typeof value === "number" && formatNumber
      ? `${digitsEnToFa(value)}${suffix}`
      : `${value}${suffix}`;

  return (
    <Card className="rounded-2xl border-border/40 shadow-sm" beveled>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <TechnicalLabel className="text-[10px] font-black">
          {title}
        </TechnicalLabel>
        <div className="bg-primary/5 flex size-8 items-center justify-center rounded-lg border border-primary/10">
          <Icon className="text-primary size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={valueColor}>{displayValue}</div>
      </CardContent>
    </Card>
  );
}
