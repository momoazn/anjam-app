import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type IconBoxSize = "xs" | "sm" | "md" | "lg";
type IconBoxTone = "primary" | "primarySolid" | "muted" | "accent" | "custom";

const iconClassBySize: Record<IconBoxSize, string> = {
  xs: "size-5",
  sm: "size-6",
  md: "size-7",
  lg: "size-8",
};

const boxClassBySize: Record<IconBoxSize, string> = {
  xs: "h-10 w-10",
  sm: "h-12 w-12",
  md: "h-14 w-14",
  lg: "h-16 w-16",
};

const toneClassByTone: Record<IconBoxTone, string> = {
  primary: "bg-primary/10 text-primary",
  primarySolid:
    "bg-primary text-primary-foreground shadow-primary/20 shadow-lg",
  muted: "bg-muted/50 text-muted-foreground",
  accent: "bg-accent text-accent-foreground",
  custom: "",
};

type IconBoxProps = React.ComponentProps<"div"> & {
  icon?: LucideIcon;
  size?: IconBoxSize;
  tone?: IconBoxTone;
  iconClassName?: string;
};

export function IconBox({
  icon: Icon,
  size = "lg",
  tone = "primary",
  className,
  iconClassName,
  children,
  ...props
}: IconBoxProps) {
  return (
    <div
      data-slot="icon-box"
      data-size={size}
      data-tone={tone}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl",
        "transition-all duration-300 ease-out will-change-transform",
        boxClassBySize[size],
        toneClassByTone[tone],
        className,
      )}
      {...props}
    >
      {Icon ? (
        <Icon className={cn(iconClassBySize[size], iconClassName)} />
      ) : (
        children
      )}
    </div>
  );
}

export type { IconBoxProps, IconBoxSize, IconBoxTone };
