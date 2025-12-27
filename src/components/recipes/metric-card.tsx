import { digitsEnToFa } from "@persian-tools/persian-tools";
import type { LucideIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tokens } from "@/design/tokens";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  formatNumber?: boolean;
  suffix?: string;
  progress?: number;
  className?: string;
  valueClassName?: string;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  formatNumber = true,
  suffix = "",
  progress,
  className,
  valueClassName = "text-3xl font-bold tracking-tight",
}: MetricCardProps) {
  const displayValue =
    typeof value === "number" && formatNumber
      ? `${digitsEnToFa(value)}${suffix}`
      : `${value}${suffix}`;

  return (
    <Card
      className={cn("border-border border shadow-sm", className)}
      style={{ borderRadius: tokens.radius.button }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-xs font-bold">
          {label}
        </CardTitle>
        <Icon className="text-primary/40 h-4 w-4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={cn(valueClassName)}>{displayValue}</div>
        {typeof progress === "number" ? (
          <Progress value={progress} className="h-1.5" />
        ) : null}
      </CardContent>
    </Card>
  );
}

export type { MetricCardProps };
