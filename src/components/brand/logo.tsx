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
  size = 32,
  showText = false,
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
        {/* Modern Geometric Logo */}
        <rect
          x="64"
          y="64"
          width="384"
          height="384"
          rx="80"
          fill="currentColor"
          className="text-primary"
        />
        <path
          d="M160 256L224 320L352 192"
          stroke="white"
          strokeWidth="48"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="text-foreground text-xl font-bold tracking-tight">
          ANJAM
        </span>
      )}
    </div>
  );
};
