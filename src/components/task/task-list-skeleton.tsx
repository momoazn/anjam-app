import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { statusOrder } from "@/lib/status-utils";

export function TaskListSkeleton() {
  return (
    <div className="space-y-4" data-animate-stagger>
      {statusOrder?.map((status) => (
        <Card key={status} className="overflow-hidden">
          <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-6 rounded" />
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <div className="space-y-2 p-2" data-animate-stagger>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md p-2"
              >
                <div className="flex flex-1 items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
