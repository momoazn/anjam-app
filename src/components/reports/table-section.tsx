import { IconTable, IconTerminal } from "@tabler/icons-react";
import { Suspense } from "react";

import { EmployeePerformanceTable } from "@/components/reports/employee-performance-table";
import { Skeleton } from "@/components/ui/skeleton";
import { reports } from "@/constants";
import type { EmployeeSummary } from "@/lib/reports";
import type { ConvexUser } from "@/lib/reports/types";

type TableSectionProps = {
  summaries: EmployeeSummary[];
  users: ConvexUser[] | undefined;
  onSelectEmployee: (userId: string) => void;
  onDrilldown: (
    title: string,
    predicate: (task: { assignee: string }) => boolean,
  ) => void;
};

export function TableSection({
  summaries,
  users,
  onSelectEmployee,
  onDrilldown,
}: TableSectionProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <IconTable className="text-primary/60 size-4" />
          <h3 className="text-sm font-bold tracking-tight">
            {reports.charts.employee.performanceTable.title}
          </h3>
        </div>
        <div className="bg-border/20 h-px flex-1" />
        <IconTerminal className="text-muted-foreground/20 size-3.5" />
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <EmployeePerformanceTable
          summaries={summaries}
          onRowClick={(userId) => {
            onSelectEmployee(userId);
            const user = users?.find((u) => (u._id || u.id) === userId);
            if (user) {
              const userName =
                (user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : null) ||
                (user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : null) ||
                user.username ||
                "";
              onDrilldown(
                reports.charts.employee.performanceTable.drilldownTitle.replace(
                  "{name}",
                  userName,
                ),
                (task) => task.assignee === userId,
              );
            }
          }}
        />
      </Suspense>
    </div>
  );
}
