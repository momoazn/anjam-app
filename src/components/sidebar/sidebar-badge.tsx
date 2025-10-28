import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SidebarBadgeProps = {
  count: number;
  variant?: "default" | "overdue" | "info";
  className?: string;
};

export function SidebarBadge({
  count,
  variant = "default",
  className,
}: SidebarBadgeProps) {
  if (count <= 0) return null;

  const variantClasses = {
    default: "bg-primary/10 text-primary hover:bg-primary/20",
    overdue: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    info: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "ml-auto h-5 min-w-5 px-1.5 text-xs font-medium group-data-[collapsible=icon]:hidden",
        variantClasses[variant],
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
