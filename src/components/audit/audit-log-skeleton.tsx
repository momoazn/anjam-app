import { Skeleton } from "@/components/ui/skeleton";

export function AuditLogSkeleton() {
  return (
    <div className="divide-border/10 divide-y">
      {[...Array(10)].map((_, i) => (
        <div
          key={window.crypto.randomUUID?.() || i}
          className="bg-card flex flex-col text-right"
        >
          <div className="relative grid grid-cols-12 overflow-hidden">
            {/* Timestamp */}
            <div className="border-border/10 col-span-2 flex items-center justify-end border-s p-4">
              <Skeleton className="h-3 w-24" />
            </div>
            {/* Actor */}
            <div className="border-border/10 col-span-2 flex flex-col items-end justify-center border-s p-4">
              <Skeleton className="mb-1 h-3 w-20" />
              <Skeleton className="h-2 w-12" />
            </div>
            {/* Action */}
            <div className="border-border/10 col-span-1 flex items-center justify-center border-s p-4">
              <Skeleton className="h-4 w-12 rounded-lg" />
            </div>
            {/* Resource */}
            <div className="border-border/10 col-span-2 flex flex-col items-end justify-center border-s p-4">
              <Skeleton className="mb-1 h-3 w-16" />
              <Skeleton className="h-2 w-10" />
            </div>
            {/* Client */}
            <div className="border-border/10 col-span-1 flex items-center justify-center border-s p-4">
              <Skeleton className="h-3 w-8" />
            </div>
            {/* Message */}
            <div className="col-span-4 flex items-center justify-end p-4">
              <Skeleton className="h-3 w-full max-w-[200px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
