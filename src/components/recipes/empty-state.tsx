import type * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { tokens } from "@/design/tokens";
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
        className="flex flex-col items-center justify-center text-center"
        data-animate-stagger
        style={{
          paddingTop: tokens.spacing.emptyStatePaddingY,
          paddingBottom: tokens.spacing.emptyStatePaddingY,
        }}
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
