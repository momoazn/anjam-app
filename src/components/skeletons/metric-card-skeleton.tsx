import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-6">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
