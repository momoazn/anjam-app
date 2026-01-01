import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const lFrameVariants = cva(
  "relative overflow-hidden border border-border/40 bg-card/30 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "",
        corners: "group/lframe",
        border: "border-border/60",
        full: "after:opacity-100",
      },
      radius: {
        default: "rounded-2xl",
        xl: "rounded-xl",
        lg: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "default",
    },
  },
);

export interface LFrameProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof lFrameVariants> {
  showCorners?: boolean;
}

export function LFrame({
  className,
  variant,
  radius,
  showCorners = true,
  children,
  ...props
}: LFrameProps) {
  return (
    <div
      className={cn(lFrameVariants({ variant, radius, className }))}
      {...props}
    >
      {showCorners && (
        <>
          {/* Top Left */}
          <div className="absolute left-0 top-0 size-3 border-l-2 border-t-2 border-primary/40 transition-all group-hover/lframe:border-primary" />
          {/* Top Right */}
          <div className="absolute right-0 top-0 size-3 border-r-2 border-t-2 border-primary/40 transition-all group-hover/lframe:border-primary" />
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-primary/40 transition-all group-hover/lframe:border-primary" />
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 size-3 border-b-2 border-r-2 border-primary/40 transition-all group-hover/lframe:border-primary" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
