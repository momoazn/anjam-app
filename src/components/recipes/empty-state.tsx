import type * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("rounded-xl border-dashed shadow-none", className)}>
      <CardContent
        className="flex flex-col items-center justify-center py-16 text-center"
        data-animate-stagger
      >
        <div className="text-muted-foreground/40 mb-6 h-16 w-16">{icon}</div>
        <h3 className="mb-2 text-xl font-bold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
        {action}
      </CardContent>
    </Card>
  );
}

export type { EmptyStateProps };
