import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { statusOrder } from "@/lib/status-utils";

export function MyTasksSkeleton() {
  return (
    <div className="space-y-4">
      {statusOrder.slice(0, 3).map((status) => (
        <Card key={status} className="overflow-hidden">
          <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-6 rounded" />
            </div>
          </div>
          <div className="space-y-2 p-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
