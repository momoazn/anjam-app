import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";
import {
  IconBox,
  type IconBoxSize,
  type IconBoxTone,
} from "@/components/recipes/icon-box";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type HeroHeaderProps = React.ComponentProps<"div"> & {
  icon: LucideIcon;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
  iconSize?: IconBoxSize;
  iconTone?: IconBoxTone;
  /**
   * Optional decorative background. If omitted, a subtle default BlueprintPattern is used.
   */
  background?: React.ReactNode;
};

export function HeroHeader({
  icon,
  title,
  subtitle,
  eyebrow,
  action,
  iconSize = "lg",
  iconTone = "primary",
  background,
  children,
  className,
  style,
  ...props
}: HeroHeaderProps) {
  return (
    <Card
      data-slot="hero-header"
      className={cn(
        "border-border/10 relative mb-12 overflow-hidden border shadow-sm",
        "rounded-3xl",
        className,
      )}
      style={style}
      {...props}
    >
      {background ?? (
        <BlueprintPattern variant="dots" className="opacity-[0.02]" />
      )}

      <CardContent className="relative z-10 flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between lg:p-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <IconBox icon={icon} size={iconSize} tone={iconTone} />
            <div className="flex flex-col">
              {eyebrow}
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                {title}
              </h1>
            </div>
          </div>

          {subtitle && (
            <p className="text-muted-foreground/60 max-w-md text-sm leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {action ? <div>{action}</div> : null}

        {children}
      </CardContent>
    </Card>
  );
}

export type { HeroHeaderProps };
