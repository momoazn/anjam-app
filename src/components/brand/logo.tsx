import React from "react";

import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  showText?: boolean;
  showTelemetry?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 40,
  showText = false,
  showTelemetry = false,
  ...props
}) => {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* Definitions for gradients */}
        <defs>
          <linearGradient
            id="logo-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="oklch(0.65 0.15 255)" />
            <stop offset="100%" stopColor="oklch(0.55 0.18 255)" />
          </linearGradient>
        </defs>

        {/* Main geometric shape - Hexagon-inspired container (fills most of canvas) */}
        <path
          d="M 256 24 L 472 148 L 472 364 L 256 488 L 40 364 L 40 148 Z"
          fill="url(#logo-gradient)"
          opacity="0.95"
        />

        {/* Inner geometric pattern - Connected task nodes (larger) */}
        <g transform="translate(256, 256)">
          {/* Center node - Main hub (larger) */}
          <circle cx="0" cy="0" r="72" fill="white" opacity="0.95" />

          {/* Connected nodes - Tasks (larger) */}
          <circle
            cx="-110"
            cy="-80"
            r="42"
            fill="oklch(0.75 0.12 255)"
            opacity="0.8"
          />
          <circle
            cx="110"
            cy="-80"
            r="42"
            fill="oklch(0.75 0.12 255)"
            opacity="0.8"
          />
          <circle
            cx="0"
            cy="130"
            r="42"
            fill="oklch(0.75 0.12 255)"
            opacity="0.8"
          />

          {/* Connection lines (thicker) */}
          <line
            x1="-110"
            y1="-80"
            x2="0"
            y2="0"
            stroke="white"
            strokeWidth="6"
            opacity="0.6"
          />
          <line
            x1="110"
            y1="-80"
            x2="0"
            y2="0"
            stroke="white"
            strokeWidth="6"
            opacity="0.6"
          />
          <line
            x1="0"
            y1="130"
            x2="0"
            y2="0"
            stroke="white"
            strokeWidth="6"
            opacity="0.6"
          />

          {/* Checkmark in center - Task completion (larger) */}
          <path
            d="M -28 0 L -8 24 L 28 -16"
            stroke="oklch(0.55 0.18 255)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
      {showText && (
        <span className="text-foreground text-xl font-bold tracking-tight">
          ANJAM
        </span>
      )}
      {showTelemetry && (
        <span className="text-muted-foreground font-mono text-xs tracking-wide opacity-60">
          SYS_READY
        </span>
      )}
    </div>
  );
};
