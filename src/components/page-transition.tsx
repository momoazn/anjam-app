import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  disableStagger?: boolean;
}

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
