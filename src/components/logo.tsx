import React from "react";

import { app } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
        <title>{app.name}</title>
        <defs>
          <pattern
            id={`grid-heavy-${isDark ? "dark" : "light"}`}
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke={isDark ? "white" : "oklch(0.12 0.01 240)"}
              strokeWidth="1"
              strokeOpacity="0.08"
            />
          </pattern>
        </defs>

        {/* Background */}
        <rect
          width="512"
          height="512"
          rx="112"
          fill={isDark ? "oklch(0.12 0.01 240)" : "oklch(0.96 0.01 240)"}
        />
        <rect
          width="512"
          height="512"
          rx="112"
          fill={`url(#grid-heavy-${isDark ? "dark" : "light"})`}
        />

        {/* Outer Frame */}
        <rect
          x="10"
          y="10"
          width="492"
          height="492"
          rx="102"
          stroke={isDark ? "white" : "oklch(0.12 0.01 240)"}
          strokeWidth="6"
          strokeOpacity={isDark ? "0.05" : "0.1"}
        />

        {/* Blueprint technical frame */}
        <rect
          x="60"
          y="60"
          width="392"
          height="392"
          rx="40"
          stroke={isDark ? "oklch(0.65 0.15 255)" : "oklch(0.55 0.18 255)"}
          strokeWidth="3"
          strokeDasharray="12 8"
          strokeOpacity={isDark ? "0.4" : "0.8"}
        />

        {/* Monolith A - MAXIMIZED SCALE */}
        <path
          d="M70 430L256 50L442 430"
          stroke={isDark ? "oklch(0.65 0.15 255)" : "oklch(0.12 0.01 240)"}
          strokeWidth="72"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cross-bar */}
        <path
          d="M145 325H367"
          stroke={isDark ? "white" : "oklch(0.55 0.18 255)"}
          strokeWidth="48"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Industrial Nodes */}
        <circle
          cx="256"
          cy="50"
          r="28"
          fill={isDark ? "white" : "oklch(0.55 0.18 255)"}
        />
        <rect
          x="50"
          y="50"
          width="24"
          height="24"
          rx="5"
          fill={isDark ? "oklch(0.65 0.15 255)" : "oklch(0.12 0.01 240)"}
        />
        <rect
          x="438"
          y="50"
          width="24"
          height="24"
          rx="5"
          fill={isDark ? "oklch(0.65 0.15 255)" : "oklch(0.12 0.01 240)"}
        />
        <rect
          x="50"
          y="438"
          width="24"
          height="24"
          rx="5"
          fill={isDark ? "oklch(0.65 0.15 255)" : "oklch(0.12 0.01 240)"}
        />
        <rect
          x="438"
          y="438"
          width="24"
          height="24"
          rx="5"
          fill={isDark ? "oklch(0.65 0.15 255)" : "oklch(0.12 0.01 240)"}
        />
      </svg>
      {showText && (
        <span className="text-foreground text-xl font-bold tracking-tight">
          {app.name}
        </span>
      )}
      {showTelemetry && (
        <span className="text-muted-foreground text-xs opacity-60">
          {app.systemReady}
        </span>
      )}
    </div>
  );
};
