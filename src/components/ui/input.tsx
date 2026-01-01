import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      data-token="input"
      className={cn(
        "border-border/40 bg-card/30 flex w-full min-w-0 border px-3 py-2 text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none",
        "h-9 rounded-xl",
        "placeholder:text-muted-foreground/50",
        "focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-4",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
