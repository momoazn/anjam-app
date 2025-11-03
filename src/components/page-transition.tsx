import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  disableStagger?: boolean;
}

/**
 * Provides a consistent entry animation for all pages and optionally staggers
 * direct child sections. The animation is implemented with CSS to avoid adding
 * heavy runtime dependencies while still supporting prefers-reduced-motion.
 */
export function PageTransition({
  children,
  className,
  disableStagger = false,
}: PageTransitionProps) {
  return (
    <div
      data-page-transition
      {...(!disableStagger && { "data-animate-stagger": "" })}
      className={cn("page-transition", className)}
    >
      {children}
    </div>
  );
}
