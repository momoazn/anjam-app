import * as React from "react";

import { cn } from "@/lib/utils";

export interface TechnicalLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function TechnicalLabel({
  children,
  className,
  ...props
}: TechnicalLabelProps) {
  return (
    <span
      className={cn("text-technical text-muted-foreground", className)}
      {...props}
    >
      {children}
    </span>
  );
}
