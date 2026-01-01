import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border/40 bg-card/30 placeholder:text-muted-foreground/50 flex min-h-24 w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-primary/50 focus:ring-primary/20 focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
