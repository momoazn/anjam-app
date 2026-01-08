import { Suspense } from "react";

import { RouteSkeleton } from "@/components/route-skeleton";

export function RouteSuspense({
  routeKey,
  children,
}: {
  routeKey?: string;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<RouteSkeleton routeKey={routeKey} />}>
      {children}
    </Suspense>
  );
}
