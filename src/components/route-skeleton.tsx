import { Skeleton } from "@/components/ui/skeleton";

export function RouteSkeleton({ routeKey }: { routeKey?: string }) {
  switch (routeKey) {
    case "dashboard":
      return (
        <div className="space-y-4 p-4 md:p-[var(--ds-spacing-cardPadding)]">
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      );
    case "projects":
      return (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-[var(--ds-spacing-cardPadding)] lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      );
    case "tasks":
    case "projectTasks":
      return (
        <div className="space-y-3 p-4 md:p-[var(--ds-spacing-cardPadding)]">
          <Skeleton className="h-8 w-64" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      );
    case "users":
    case "projectUsers":
      return (
        <div className="space-y-3 p-4 md:p-[var(--ds-spacing-cardPadding)]">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="space-y-3 p-4 md:p-[var(--ds-spacing-cardPadding)]">
          <Skeleton className="h-8 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      );
  }
}
