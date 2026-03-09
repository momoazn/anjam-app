import type * as React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ToolbarProps = React.ComponentProps<"div"> & {
  variant?: "muted" | "transparent";
};

const variantClassByVariant: Record<
  NonNullable<ToolbarProps["variant"]>,
  string
> = {
  muted: "bg-muted/30",
  transparent: "",
};

export function Toolbar({
  variant = "muted",
  className,
  ...props
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      data-slot="toolbar"
      data-variant={variant}
      className={cn(
        "flex flex-wrap items-center rounded-2xl p-1.5",
        variantClassByVariant[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="toolbar-separator"
      orientation="vertical"
      className={cn("bg-border/40 mx-1 h-6 w-px", className)}
      {...props}
    />
  );
}
