import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageTransitionProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  disableStagger?: boolean;
}

export function PageTransition({
  children,
  className,
  disableStagger = false,
  ...props
}: PageTransitionProps) {
  return (
    <div
      {...props}
      data-page-transition
      {...(!disableStagger && { "data-animate-stagger": "" })}
      className={cn("page-transition", className)}
    >
      {children}
    </div>
  );
}
