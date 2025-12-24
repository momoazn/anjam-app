import type { ReactNode } from "react";
import { IconStack2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type HelpArticleProps = {
  title: string;
  children: ReactNode;
  titleClassName?: string;
};

export function HelpArticle({
  title,
  children,
  titleClassName,
}: HelpArticleProps) {
  return (
    <div className="space-y-4">
      <div className="border-border/10 flex items-center justify-end gap-3 border-b pb-2">
        <h3
          className={cn(
            "text-sm font-black tracking-widest uppercase",
            titleClassName,
          )}
        >
          {title}
        </h3>
        <IconStack2 className="text-primary/40 size-3" />
      </div>
      <div className="text-right">{children}</div>
    </div>
  );
}
