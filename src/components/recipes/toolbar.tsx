import type * as React from "react";

import { Separator } from "@/components/ui/separator";
import { tokens } from "@/design/tokens";
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
  style,
  ...props
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      data-slot="toolbar"
      data-variant={variant}
      className={cn(
        "flex flex-wrap items-center",
        variantClassByVariant[variant],
        className,
      )}
      style={{
        borderRadius: tokens.radius.toolbar,
        padding: tokens.spacing.toolbarPadding,
        ...style,
      }}
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

export type { ToolbarProps };
