import type * as React from "react";

import { cn } from "@/lib/utils";

type CardSectionBorder = "none" | "top" | "bottom";

type CardSectionProps = React.ComponentProps<"div"> & {
  border?: CardSectionBorder;
};

const borderClassByBorder: Record<CardSectionBorder, string> = {
  none: "",
  top: "border-border/40 border-t",
  bottom: "border-border/40 border-b",
};

export function CardSection({
  border = "bottom",
  className,
  ...props
}: CardSectionProps) {
  return (
    <div
      data-slot="card-section"
      data-border={border}
      className={cn(
        borderClassByBorder[border],
        "p-[var(--ds-spacing-cardPadding)]",
        className,
      )}
      {...props}
    />
  );
}

export type { CardSectionProps, CardSectionBorder };
