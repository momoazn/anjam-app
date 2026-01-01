import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/40 bg-muted/30 w-fit",
  {
    variants: {
      status: {
        backlog: "text-muted-foreground",
        todo: "text-foreground/80",
        "in-progress": "text-orange-500 border-orange-500/20 bg-orange-500/5",
        done: "text-green-500 border-green-500/20 bg-green-500/5",
        canceled: "text-muted-foreground/50 border-muted-foreground/10",
      },
    },
    defaultVariants: {
      status: "todo",
    },
  },
);

const dotVariants = cva("size-1.5 rounded-full", {
  variants: {
    status: {
      backlog: "bg-muted-foreground/40",
      todo: "bg-foreground/40",
      "in-progress": "bg-orange-500",
      done: "bg-green-500",
      canceled: "bg-muted-foreground/20",
    },
  },
  defaultVariants: {
    status: "todo",
  },
});

export interface StatusBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  label: string;
}

export function StatusBadge({
  className,
  status,
  label,
  ...props
}: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ status, className }))} {...props}>
      <div className={cn(dotVariants({ status }))} />
      <span className="text-[10px] font-medium text-inherit opacity-90">
        {label}
      </span>
    </div>
  );
}
