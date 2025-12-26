import React from "react";
import { cn } from "@/lib/utils";

interface SpringCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverScale?: boolean;
  hoverRotate?: boolean;
  activeScale?: boolean;
  springVariant?: "fast" | "normal" | "slow";
  glowOnHover?: boolean;
}

/**
 * Card component with spring physics and micro-interactions
 * Consistent Industrial Editorial interactive elements
 */
export function SpringCard({
  hoverScale = true,
  hoverRotate = false,
  activeScale = true,
  springVariant = "normal",
  glowOnHover = true,
  className,
  children,
  ...props
}: SpringCardProps) {
  const springClasses = {
    fast: "transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
    normal: "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
    slow: "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  };

  const hoverClasses = cn(
    "group relative",
    hoverScale && "hover:scale-[1.02]",
    hoverRotate && "hover:rotate-[1deg]",
    glowOnHover && "hover:shadow-primary/20",
    springClasses[springVariant],
  );

  const activeClasses = activeScale ? "active:scale-[0.98]" : "";

  return (
    <div className={cn(hoverClasses, activeClasses, className)} {...props}>
      {children}
      {/* Subtle glow effect */}
      {glowOnHover && (
        <div className="from-primary/0 via-primary/0 to-primary/5 absolute inset-0 -z-10 rounded-none bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );
}

interface SpringButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  springVariant?: "fast" | "normal" | "slow";
}

/**
 * Button component with consistent spring physics
 */
export function SpringButton({
  variant = "default",
  size = "md",
  springVariant = "normal",
  className,
  children,
  ...props
}: SpringButtonProps) {
  const springClasses = {
    fast: "transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
    normal: "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
    slow: "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-10 px-6 text-base gap-2",
  };

  const variantClasses = {
    default:
      "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 border-primary/20 hover:border-primary/40 border",
    ghost:
      "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
    outline:
      "border-border/50 bg-background hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-none font-black whitespace-nowrap",
        "disabled:pointer-events-none disabled:opacity-50",
        '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
        "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
        "active:translate-y-[1px]",
        springClasses[springVariant],
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
