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
        custom: "",
      },
      size: {
        xs: "size-10 rounded-xl [&_svg]:size-5",
        sm: "size-12 rounded-2xl [&_svg]:size-6",
        md: "size-14 rounded-2xl [&_svg]:size-7",
        lg: "size-16 rounded-3xl [&_svg]:size-8",
        // Legacy sizes mapped
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type IconBoxSize = "xs" | "sm" | "md" | "lg";
export type IconBoxTone =
  | "primary"
  | "primarySolid"
  | "muted"
  | "accent"
  | "custom";

export interface IconBoxProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof iconBoxVariants>, "variant" | "size"> {
  asChild?: boolean;
  variant?: IconBoxTone | "default" | "ghost"; // Allow legacy + new
  size?: IconBoxSize; // Allow legacy
  // Support recipe props for compatibility
  tone?: IconBoxTone;
}

export function IconBox({
  className,
  variant,
  tone,
  size,
  ...props
}: IconBoxProps) {
  // Map 'tone' to 'variant' if provided
  const activeVariant = (tone || variant) as VariantProps<
    typeof iconBoxVariants
  >["variant"];

  return (
    <div
      className={cn(
        iconBoxVariants({ variant: activeVariant, size, className }),
      )}
      {...props}
    />
  );
}
