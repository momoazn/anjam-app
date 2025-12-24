import { ReactNode } from "react";
import { Icon as TablerIcon, IconStack2 } from "@tabler/icons-react";
import { LucideIcon } from "lucide-react";
import { app } from "@/constants";

type PageHeaderProps = {
  title: string;
  description: string;
  icon: TablerIcon | LucideIcon;
  nodeId: string;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  nodeId,
  actions,
}: PageHeaderProps) {
  return (
    <div className="border-border/40 bg-card relative mb-8 overflow-hidden rounded-none border p-8 shadow-xl">
      {/* Blueprint Grid Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5 text-right">
          <div className="border-primary/20 bg-primary/10 text-primary flex size-14 items-center justify-center rounded-none border">
            <Icon className="size-7" />
          </div>
          <div>
            <div className="text-primary flex items-center justify-end gap-2">
              <span className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                {app.name} / {nodeId}
              </span>
              <IconStack2 className="size-3" />
            </div>
            <h1 className="mt-1 text-right text-3xl font-black tracking-tight uppercase md:text-4xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 text-right text-sm leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>

        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
