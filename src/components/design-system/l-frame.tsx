import React from "react";
import { cn } from "@/lib/utils";

interface LFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "corners" | "border" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * L-Frame component for consistent angular design
 * Provides the Industrial Editorial aesthetic with sharp corners
 */
export function LFrame({
  variant = "corners",
  size = "md",
  className,
  children,
  ...props
}: LFrameProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const borderClasses = {
    sm: "border-t-[1px] border-l-[1px]",
    md: "border-t-2 border-l-2",
    lg: "border-t-[3px] border-l-[3px]",
  };

  if (variant === "border") {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          variant === "border" && "border-border/15 border-b-2 border-l-2",
          className,
        )}
        {...props}
      >
        {children}
        {/* Top border accent */}
        <div className="via-primary/20 absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent to-transparent" />
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-none",
          "border-border/15 border-b-2 border-l-2",
          className,
        )}
        {...props}
      >
        {children}
        {/* L-Frame corners */}
        <div
          className={cn(
            "absolute top-0 left-0",
            sizeClasses[size],
            borderClasses[size],
            "border-primary/20",
          )}
        />
        <div
          className={cn(
            "absolute top-0 right-0",
            sizeClasses[size],
            "border-t-2 border-r-2",
            "border-primary/20",
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-0",
            sizeClasses[size],
            "border-b-2 border-l-2",
            "border-primary/20",
          )}
        />
        <div
          className={cn(
            "absolute right-0 bottom-0",
            sizeClasses[size],
            "border-r-2 border-b-2",
            "border-primary/20",
          )}
        />
        {/* Top border accent */}
        <div className="via-primary/20 absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-none", className)}
      {...props}
    >
      {children}
      {/* L-Frame corners - hover only */}
      <div
        className={cn(
          "absolute top-0 left-0",
          sizeClasses[size],
          borderClasses[size],
          "border-primary/20 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute top-0 right-0",
          sizeClasses[size],
          "border-t-2 border-r-2",
          "border-primary/20 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0",
          sizeClasses[size],
          "border-b-2 border-l-2",
          "border-primary/20 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute right-0 bottom-0",
          sizeClasses[size],
          "border-r-2 border-b-2",
          "border-primary/20 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
    </div>
  );
}
