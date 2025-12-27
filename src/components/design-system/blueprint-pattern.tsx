import React from "react";
import { cn } from "@/lib/utils";

interface BlueprintPatternProps {
  opacity?: number;
  variant?: "grid" | "dots" | "lines" | "technical" | "cross";
  className?: string;
}

/**
 * Blueprint pattern background for technical aesthetic
 */
export function BlueprintPattern({
  opacity = 0.05,
  variant = "grid",
  className,
}: BlueprintPatternProps) {
  const getPatternStyle = () => {
    const baseStyle = {
      opacity: opacity.toString(),
      position: "absolute" as const,
      inset: 0,
      zIndex: 0,
    };

    switch (variant) {
      case "grid":
        return {
          ...baseStyle,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 1px),
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 20px 20px, 20px 20px",
        };

      case "dots":
        return {
          ...baseStyle,
          backgroundImage: `radial-gradient(circle, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "25px 25px",
          backgroundPosition: "0 0",
        };

      case "lines":
        return {
          ...baseStyle,
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 10px, var(--primary) 10px, var(--primary) 11px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, var(--primary) 10px, var(--primary) 11px)
          `,
          backgroundSize: "20px 20px",
        };

      case "technical":
        return {
          ...baseStyle,
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px),
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
          backgroundPosition: "0 0, 0 0, 0 0, 0 0",
        };

      case "cross":
        return {
          ...baseStyle,
          backgroundImage: `
            linear-gradient(to right, var(--primary) 2px, transparent 2px),
            linear-gradient(to bottom, var(--primary) 2px, transparent 2px)
          `,
          backgroundSize: "40px 40px",
          backgroundPosition: "-1px -1px",
        };

      default:
        return baseStyle;
    }
  };

  return (
    <div
      className={cn("pointer-events-none", className)}
      style={getPatternStyle()}
    />
  );
}

interface TechnicalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

/**
 * Technical header component with blueprint background
 */
export function TechnicalHeader({
  title,
  subtitle,
  icon,
  className,
  ...props
}: TechnicalHeaderProps) {
  return (
    <div
      className={cn(
        "border-border/15 relative overflow-hidden rounded-2xl border",
        "bg-card/95 backdrop-blur-sm",
        "px-6 py-4 shadow-sm",
        className,
      )}
      {...props}
    >
      <BlueprintPattern variant="dots" opacity={0.02} />

      <div className="relative z-10 flex items-center gap-4">
        {icon && (
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-sm">
            {icon}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
