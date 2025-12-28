import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { tokens } from "@/design/tokens";
import { cn } from "@/lib/utils";

type IconBoxSize = "xs" | "sm" | "md" | "lg";
type IconBoxTone = "primary" | "primarySolid" | "muted" | "accent" | "custom";

const iconClassBySize: Record<IconBoxSize, string> = {
  xs: "size-5",
  sm: "size-6",
  md: "size-7",
  lg: "size-8",
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
  radius?: string;
};

export function IconBox({
  icon: Icon,
  size = "lg",
  tone = "primary",
  radius = tokens.radius.iconBox,
  className,
  iconClassName,
  style,
  children,
  ...props
}: IconBoxProps) {
  return (
    <div
      data-slot="icon-box"
      data-size={size}
      data-tone={tone}
      className={cn(
        "inline-flex items-center justify-center",
        "transition-all will-change-transform",
        "duration-[var(--ds-motion-durationNormal)] ease-[var(--ds-motion-easingSpring)]",
        toneClassByTone[tone],
        className,
      )}
      style={{
        width: tokens.sizing.iconBox[size],
        height: tokens.sizing.iconBox[size],
        borderRadius: radius,
        ...style,
      }}
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
