import React from "react";

import { cn } from "@/lib/utils";

interface LFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "corners" | "border" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * L-Frame component for consistent design
 * Provides a subtle frame with rounded corners
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
    sm: "border-t-[1px] border-l-[1px] rounded-tl-sm",
    md: "border-t-2 border-l-2 rounded-tl-md",
    lg: "border-t-[3px] border-l-[3px] rounded-tl-lg",
  };

  if (variant === "border") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          variant === "border" && "border-border/10 border",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border-border/10 border",
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
            "border-primary/10",
          )}
        />
        <div
          className={cn(
            "absolute top-0 right-0",
            sizeClasses[size],
            "rounded-tr-md border-t-2 border-r-2",
            "border-primary/10",
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-0",
            sizeClasses[size],
            "rounded-bl-md border-b-2 border-l-2",
            "border-primary/10",
          )}
        />
        <div
          className={cn(
            "absolute right-0 bottom-0",
            sizeClasses[size],
            "rounded-br-md border-r-2 border-b-2",
            "border-primary/10",
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl", className)}
      {...props}
    >
      {children}
      {/* L-Frame corners - hover only */}
      <div
        className={cn(
          "absolute top-0 left-0",
          sizeClasses[size],
          borderClasses[size],
          "border-primary/10 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute top-0 right-0",
          sizeClasses[size],
          "rounded-tr-md border-t-2 border-r-2",
          "border-primary/10 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0",
          sizeClasses[size],
          "rounded-bl-md border-b-2 border-l-2",
          "border-primary/10 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute right-0 bottom-0",
          sizeClasses[size],
          "rounded-br-md border-r-2 border-b-2",
          "border-primary/10 opacity-0 transition-opacity hover:opacity-100",
        )}
      />
    </div>
  );
}
