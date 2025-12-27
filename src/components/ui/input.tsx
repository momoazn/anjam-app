import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      data-token="input"
      className={cn(
        "border-input bg-background flex w-full min-w-0 border px-3 py-2 text-sm transition-colors outline-none",
        "h-[var(--ds-sizing-inputHeight)] rounded-[var(--ds-radius-input)]",
        "placeholder:text-muted-foreground",
        "focus-visible:ring-ring focus-visible:ring-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
