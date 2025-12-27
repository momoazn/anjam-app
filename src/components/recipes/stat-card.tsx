import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { IconBox, type IconBoxTone } from "@/components/recipes/icon-box";
import { cn } from "@/lib/utils";

type StatCardProps = React.ComponentProps<"div"> & {
  icon: LucideIcon;
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: IconBoxTone;
  /**
   * Extra content rendered next to the value (e.g. a dot indicator).
   */
  valueSuffix?: React.ReactNode;
};

export function StatCard({
  icon,
  label,
  value,
  tone = "muted",
  valueSuffix,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      className={cn("flex items-center justify-between gap-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
          {label}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {valueSuffix}
        </div>
      </div>

      <IconBox icon={icon} size="sm" tone={tone} className="shrink-0" />
    </div>
  );
}

export type { StatCardProps };
