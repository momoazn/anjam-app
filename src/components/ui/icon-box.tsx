import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const iconBoxVariants = cva(
  "inline-flex items-center justify-center shrink-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  {
    variants: {
      variant: {
        default: "bg-muted/50 text-muted-foreground border border-border/40",
        primary: "bg-primary/10 text-primary border border-primary/20",
        primarySolid: "bg-primary text-primary-foreground shadow-sm",
        accent: "bg-accent/10 text-accent border border-accent/20",
        muted: "bg-muted/30 text-muted-foreground/70",
        ghost: "bg-transparent text-muted-foreground hover:bg-muted/50",
      },
      size: {
        xs: "size-6 rounded-md",
        sm: "size-8 rounded-lg",
        md: "size-10 rounded-xl",
        lg: "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface IconBoxProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconBoxVariants> {
  asChild?: boolean;
}

export function IconBox({ className, variant, size, ...props }: IconBoxProps) {
  return (
    <div
      className={cn(
        iconBoxVariants({ variant, size, className }),
        "product-beveled",
      )}
      {...props}
    />
  );
}
