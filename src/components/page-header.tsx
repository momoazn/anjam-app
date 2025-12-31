import { Icon as TablerIcon } from "@tabler/icons-react";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { IconBox } from "@/components/recipes/icon-box";
import { Card, CardContent } from "@/components/ui/card";

type PageHeaderProps = {
  title: string;
  description: string;
  icon: TablerIcon | LucideIcon;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: PageHeaderProps) {
  return (
    <Card className="border-border bg-card relative mb-8 overflow-hidden rounded-xl border shadow-sm">
      <CardContent className="p-6">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5 text-right">
            <IconBox size="md" tone="primary">
              <Icon className="size-7" strokeWidth={1.5} />
            </IconBox>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {title}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed font-medium">
                {description}
              </p>
            </div>
          </div>

          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
